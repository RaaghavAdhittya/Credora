import pool from '../config/database.js';
import {
  getContractAddress,
  registerCredentialOnChain,
  revokeCredentialOnChain,
  verifyCredentialOnChain,
  sanitizeError,
} from '../config/blockchain.js';
import {
  canonicalizeCredential,
  computeCredentialHash,
  computeCredentialIdHash,
  generateCredentialId,
  validateApaarId,
  computeProtectedApaarReference,
  SUPPORTED_RECORD_TYPES,
} from '../utils/hash.js';

/**
 * Register a new academic credential.
 * POST /api/credentials
 */
export async function registerCredential(req, res) {
  try {
    const {
      studentIdentifier,
      student_identifier,
      studentId,
      apaarId,
      apaar_id,
      institutionId,
      institution_id,
      recordType,
      record_type,
      title,
      academicYear,
      academic_year,
      documentHash,
      document_hash,
      issueDate,
      issue_date,
      credentialData,
      data,
      payload,
    } = req.body;

    const rawApaar = apaarId || apaar_id;
    let studentRef = studentIdentifier || student_identifier || studentId;

    // Handle APAAR ID if explicitly provided or passed as studentIdentifier
    if (rawApaar !== undefined && rawApaar !== null) {
      if (!validateApaarId(rawApaar)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid APAAR ID: must be exactly 12 numeric digits.',
        });
      }
      studentRef = computeProtectedApaarReference(rawApaar);

      // Register protected identity reference in student_profiles
      await pool.query(
        'INSERT IGNORE INTO student_profiles (apaar_reference) VALUES (?)',
        [studentRef]
      );
    } else if (studentRef && /^\d{12}$/.test(String(studentRef).trim())) {
      // If studentIdentifier is formatted as 12-digit APAAR ID, automatically protect it
      const originalDigits = String(studentRef).trim();
      studentRef = computeProtectedApaarReference(originalDigits);

      await pool.query(
        'INSERT IGNORE INTO student_profiles (apaar_reference) VALUES (?)',
        [studentRef]
      );
    }

    const instId = institutionId || institution_id;
    const docData = credentialData || data || payload || {};
    const issuedOn = issueDate || issue_date || new Date().toISOString().split('T')[0];

    if (!studentRef || typeof studentRef !== 'string' || !studentRef.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid student/reference identifier or 12-digit APAAR ID is required.',
      });
    }

    if (!instId || typeof instId !== 'string' || !instId.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid institution identifier is required.',
      });
    }

    // Validate record_type if provided; default to UG_DEGREE for full backward compatibility
    let recType = (recordType || record_type || 'UG_DEGREE').toUpperCase().trim();
    if (!SUPPORTED_RECORD_TYPES.includes(recType)) {
      return res.status(400).json({
        status: 'error',
        message: `Unsupported record_type '${recType}'. Supported types: ${SUPPORTED_RECORD_TYPES.join(', ')}`,
      });
    }

    const recordTitle = (title || '').trim() || null;
    const acadYear = (academicYear || academic_year || '').trim() || null;
    const docHash = (documentHash || document_hash || '').trim() || null;

    if (docHash && !/^0x[0-9a-fA-F]{64}$/.test(docHash)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid document_hash format: must be a 0x-prefixed 64-character hex hash.',
      });
    }

    const credentialId = (req.body.credentialId || req.body.credential_id || generateCredentialId()).trim();
    const credentialIdHash = computeCredentialIdHash(credentialId);

    // Check if credential ID already exists in DB
    const [existing] = await pool.query(
      'SELECT id FROM credentials WHERE credential_id = ? LIMIT 1',
      [credentialId]
    );

    if (existing && existing.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: `Credential with ID ${credentialId} already exists in database.`,
      });
    }

    // Construct canonical document payload and compute hash
    const fullPayload = {
      studentIdentifier: studentRef.trim(),
      institutionId: instId.trim(),
      recordType: recType,
      title: recordTitle,
      academicYear: acadYear,
      documentHash: docHash,
      issueDate: issuedOn,
      ...docData,
    };

    const canonicalPayload = canonicalizeCredential(fullPayload);
    const credentialHash = computeCredentialHash(canonicalPayload);

    // Insert record with PENDING status
    await pool.query(
      `INSERT INTO credentials (
        credential_id,
        student_identifier,
        record_type,
        title,
        institution_id,
        credential_hash,
        document_hash,
        status,
        issue_date,
        academic_year,
        payload_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?)`,
      [
        credentialId,
        studentRef.trim(),
        recType,
        recordTitle,
        instId.trim(),
        credentialHash,
        docHash,
        issuedOn,
        acadYear,
        JSON.stringify(canonicalPayload),
      ]
    );

    // Submit transaction to Sepolia blockchain
    let onChainReceipt;
    try {
      onChainReceipt = await registerCredentialOnChain(
        credentialIdHash,
        credentialHash,
        instId.trim()
      );
    } catch (blockchainErr) {
      // Mark as FAILED in DB if on-chain registration failed
      await pool.query(
        'UPDATE credentials SET status = "FAILED" WHERE credential_id = ?',
        [credentialId]
      );

      const cleanMsg = sanitizeError(blockchainErr.message);
      const statusCode = cleanMsg.includes('AccessControl')
        ? 403
        : cleanMsg.includes('CredentialAlreadyExists')
        ? 409
        : 502;

      return res.status(statusCode).json({
        status: 'error',
        message: 'Blockchain registration failed: ' + cleanMsg,
      });
    }

    // Update with mined transaction hash and ISSUED status
    await pool.query(
      'UPDATE credentials SET status = "ISSUED", transaction_hash = ? WHERE credential_id = ?',
      [onChainReceipt.transactionHash, credentialId]
    );

    return res.status(201).json({
      status: 'success',
      data: {
        credentialId,
        studentIdentifier: studentRef.trim(),
        recordType: recType,
        title: recordTitle,
        institutionId: instId.trim(),
        credentialHash,
        documentHash: docHash,
        status: 'ISSUED',
        issueDate: issuedOn,
        academicYear: acadYear,
        transactionHash: onChainReceipt.transactionHash,
        blockchain: {
          network: 'sepolia',
          contractAddress: getContractAddress(),
          blockNumber: onChainReceipt.blockNumber,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process credential registration: ' + sanitizeError(error.message),
    });
  }
}

/**
 * Retrieve credential by identifier.
 * GET /api/credentials/:id
 */
export async function getCredentialById(req, res) {
  try {
    const credentialId = (req.params.id || '').trim();
    if (!credentialId) {
      return res.status(400).json({
        status: 'error',
        message: 'Credential ID parameter is required.',
      });
    }

    const [rows] = await pool.query(
      `SELECT
        credential_id,
        student_identifier,
        record_type,
        title,
        institution_id,
        credential_hash,
        document_hash,
        status,
        issue_date,
        academic_year,
        transaction_hash,
        created_at,
        updated_at
      FROM credentials
      WHERE credential_id = ?
      LIMIT 1`,
      [credentialId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Credential with ID ${credentialId} not found.`,
      });
    }

    return res.status(200).json({
      status: 'success',
      data: rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Database retrieval error: ' + sanitizeError(error.message),
    });
  }
}

/**
 * Verify credential on-chain and against database records.
 * GET /api/verify/:id
 */
export async function verifyCredential(req, res) {
  const credentialId = (req.params.id || '').trim();
  const verifierIp = req.ip || req.connection?.remoteAddress || null;

  if (!credentialId) {
    return res.status(400).json({
      status: 'error',
      verificationResult: 'INVALID',
      message: 'Credential ID parameter is required for verification.',
    });
  }

  try {
    const [rows] = await pool.query(
      `SELECT
        credential_id,
        student_identifier,
        record_type,
        title,
        institution_id,
        credential_hash,
        document_hash,
        status,
        issue_date,
        academic_year,
        transaction_hash,
        payload_json
      FROM credentials
      WHERE credential_id = ?
      LIMIT 1`,
      [credentialId]
    );

    if (!rows || rows.length === 0) {
      // Record failed verification attempt
      await pool.query(
        'INSERT INTO verifications (credential_id, verification_result, blockchain_verified, verifier_ip, notes) VALUES (?, "NOT_FOUND", false, ?, "Credential ID not found in database")',
        [credentialId, verifierIp]
      );

      return res.status(404).json({
        status: 'error',
        verificationResult: 'NOT_FOUND',
        message: `Credential ${credentialId} not found in database.`,
      });
    }

    const credential = rows[0];

    // Recompute credential hash from stored payload
    let computedHash = credential.credential_hash;
    if (credential.payload_json) {
      const parsedPayload =
        typeof credential.payload_json === 'string'
          ? JSON.parse(credential.payload_json)
          : credential.payload_json;
      computedHash = computeCredentialHash(parsedPayload);
    }

    // Query on-chain smart contract
    const credentialIdHash = computeCredentialIdHash(credential.credential_id);
    let onChain;

    try {
      onChain = await verifyCredentialOnChain(credentialIdHash);
    } catch (bcError) {
      await pool.query(
        'INSERT INTO verifications (credential_id, verification_result, blockchain_verified, verifier_ip, notes) VALUES (?, "BLOCKCHAIN_ERROR", false, ?, ?)',
        [credentialId, verifierIp, sanitizeError(bcError.message)]
      );

      return res.status(502).json({
        status: 'error',
        verificationResult: 'INVALID',
        message: 'Failed to query blockchain: ' + sanitizeError(bcError.message),
      });
    }

    const hashesMatch =
      onChain.credentialHash.toLowerCase() === computedHash.toLowerCase() &&
      onChain.credentialHash.toLowerCase() === credential.credential_hash.toLowerCase();

    let result = 'INVALID';
    let isValid = false;

    if (credential.status === 'REVOKED' || !onChain.valid) {
      result = 'REVOKED';
      isValid = false;
    } else if (onChain.valid && hashesMatch && credential.status === 'ISSUED') {
      result = 'VERIFIED';
      isValid = true;
    } else {
      result = 'INVALID';
      isValid = false;
    }

    // Log verification in MySQL
    await pool.query(
      'INSERT INTO verifications (credential_id, verification_result, blockchain_verified, verifier_ip, notes) VALUES (?, ?, ?, ?, ?)',
      [
        credentialId,
        result,
        isValid,
        verifierIp,
        `Result: ${result}. Hash match: ${hashesMatch}. On-chain valid: ${onChain.valid}`,
      ]
    );

    return res.status(200).json({
      status: 'success',
      verificationResult: result,
      isValid,
      data: {
        credentialId: credential.credential_id,
        recordType: credential.record_type,
        title: credential.title,
        institutionId: credential.institution_id,
        issueDate: credential.issue_date,
        academicYear: credential.academic_year,
        dbStatus: credential.status,
        hashMatch: hashesMatch,
        computedHash,
        documentHash: credential.document_hash,
        blockchain: {
          valid: onChain.valid,
          onChainHash: onChain.credentialHash,
          onChainInstitutionId: onChain.institutionId,
          issuedAt: onChain.issuedAt,
          contractAddress: getContractAddress(),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      verificationResult: 'INVALID',
      message: 'Verification processing failed: ' + sanitizeError(error.message),
    });
  }
}

/**
 * Revoke an existing credential.
 * POST /api/credentials/:id/revoke
 */
export async function revokeCredential(req, res) {
  const credentialId = (req.params.id || '').trim();

  if (!credentialId) {
    return res.status(400).json({
      status: 'error',
      message: 'Credential ID parameter is required.',
    });
  }

  try {
    const [rows] = await pool.query(
      'SELECT credential_id, status FROM credentials WHERE credential_id = ? LIMIT 1',
      [credentialId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Credential ${credentialId} does not exist.`,
      });
    }

    if (rows[0].status === 'REVOKED') {
      return res.status(400).json({
        status: 'error',
        message: `Credential ${credentialId} has already been revoked.`,
      });
    }

    const credentialIdHash = computeCredentialIdHash(credentialId);

    // Call contract revoke function
    let onChainReceipt;
    try {
      onChainReceipt = await revokeCredentialOnChain(credentialIdHash);
    } catch (bcError) {
      const cleanMsg = sanitizeError(bcError.message);
      const statusCode = cleanMsg.includes('AccessControl')
        ? 403
        : cleanMsg.includes('CredentialAlreadyRevoked')
        ? 400
        : cleanMsg.includes('CredentialNotFound')
        ? 404
        : 502;

      return res.status(statusCode).json({
        status: 'error',
        message: 'On-chain revocation failed: ' + cleanMsg,
      });
    }

    // Update database status
    await pool.query(
      'UPDATE credentials SET status = "REVOKED" WHERE credential_id = ?',
      [credentialId]
    );

    return res.status(200).json({
      status: 'success',
      message: 'Credential revoked successfully on blockchain and database.',
      data: {
        credentialId,
        status: 'REVOKED',
        transactionHash: onChainReceipt.transactionHash,
        blockNumber: onChainReceipt.blockNumber,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Revocation processing failed: ' + sanitizeError(error.message),
    });
  }
}

/**
 * Retrieve lifelong academic timeline for a student by 12-digit APAAR ID or protected identity reference.
 * GET /api/students/:apaarId/timeline
 */
export async function getStudentTimeline(req, res) {
  try {
    const rawParam = (req.params.apaarId || '').trim();

    if (!rawParam) {
      return res.status(400).json({
        status: 'error',
        message: 'APAAR ID parameter is required.',
      });
    }

    let protectedRef;

    // Check if input is a 12-digit numeric APAAR ID
    if (/^\d{12}$/.test(rawParam)) {
      protectedRef = computeProtectedApaarReference(rawParam);
    } else if (/^0x[0-9a-fA-F]{64}$/.test(rawParam)) {
      // Direct protected reference hash
      protectedRef = rawParam.toLowerCase();
    } else if (/^\d+$/.test(rawParam)) {
      // Numeric but not 12 digits
      return res.status(400).json({
        status: 'error',
        message: 'Invalid APAAR ID: must be exactly 12 numeric digits.',
      });
    } else {
      // Fallback for general student identifiers (e.g. DEMO-STUDENT-001)
      protectedRef = rawParam;
    }

    const [rows] = await pool.query(
      `SELECT
        credential_id,
        student_identifier,
        record_type,
        title,
        institution_id,
        credential_hash,
        document_hash,
        status,
        issue_date,
        academic_year,
        transaction_hash,
        payload_json,
        created_at
      FROM credentials
      WHERE student_identifier = ?
      ORDER BY issue_date ASC, created_at ASC`,
      [protectedRef]
    );

    // Extract unique institutions attended
    const institutionsSet = new Set();
    const institutionsCount = {};

    rows.forEach((r) => {
      if (r.institution_id) {
        institutionsSet.add(r.institution_id);
        institutionsCount[r.institution_id] = (institutionsCount[r.institution_id] || 0) + 1;
      }
    });

    const institutionsAttended = Array.from(institutionsSet).map((instId) => ({
      institutionId: instId,
      credentialsCount: institutionsCount[instId],
    }));

    const timeline = rows.map((r) => {
      let parsedPayload = null;
      if (r.payload_json) {
        try {
          parsedPayload =
            typeof r.payload_json === 'string'
              ? JSON.parse(r.payload_json)
              : r.payload_json;
        } catch {
          parsedPayload = null;
        }
      }

      return {
        credentialId: r.credential_id,
        recordType: r.record_type,
        title: r.title,
        institutionId: r.institution_id,
        status: r.status,
        issueDate: r.issue_date,
        academicYear: r.academic_year,
        credentialHash: r.credential_hash,
        documentHash: r.document_hash,
        transactionHash: r.transaction_hash,
        payload: parsedPayload,
        createdAt: r.created_at,
      };
    });

    return res.status(200).json({
      status: 'success',
      data: {
        studentReference: protectedRef,
        totalRecords: timeline.length,
        institutionsAttended,
        timeline,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve student timeline: ' + sanitizeError(error.message),
    });
  }
}
