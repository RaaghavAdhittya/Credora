import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  canonicalizeCredential,
  computeCredentialHash,
  computeCredentialIdHash,
  generateCredentialId,
  validateApaarId,
  computeProtectedApaarReference,
  SUPPORTED_RECORD_TYPES,
} from '../src/utils/hash.js';
import {
  registerCredential,
  getCredentialById,
  verifyCredential,
  revokeCredential,
  getStudentTimeline,
} from '../src/controllers/credentialController.js';
import pool from '../src/config/database.js';

// Ensure test environment has APAAR_ID_SECRET initialized
if (!process.env.APAAR_ID_SECRET) {
  process.env.APAAR_ID_SECRET = 'TEST_SUITE_APAAR_ID_SECRET_SALT_V1';
}

// Helper to create mock Express response object
function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
}

describe('Credora Backend Test Suite', () => {
  after(async () => {
    // Close database pool after tests complete
    await pool.end();
  });

  describe('1. Hash Generation & Canonicalization', () => {
    test('should produce deterministic canonical object regardless of key insertion order', () => {
      const obj1 = {
        degree: 'Bachelor of Technology',
        studentIdentifier: 'STU-2026-001',
        institutionId: 'INST-U-0123',
        issueDate: '2026-05-15',
        gpa: 3.85,
      };

      const obj2 = {
        gpa: 3.85,
        institutionId: 'INST-U-0123',
        issueDate: '2026-05-15',
        degree: 'Bachelor of Technology',
        studentIdentifier: 'STU-2026-001',
      };

      const canonical1 = canonicalizeCredential(obj1);
      const canonical2 = canonicalizeCredential(obj2);

      assert.deepStrictEqual(canonical1, canonical2);
      assert.strictEqual(JSON.stringify(canonical1), JSON.stringify(canonical2));
    });

    test('should generate identical Keccak-256 hash for identical payloads with different key orders', () => {
      const payloadA = {
        studentIdentifier: 'STU-999',
        institutionId: 'INST-001',
        score: 95,
      };

      const payloadB = {
        score: 95,
        institutionId: 'INST-001',
        studentIdentifier: 'STU-999',
      };

      const hashA = computeCredentialHash(payloadA);
      const hashB = computeCredentialHash(payloadB);

      assert.strictEqual(hashA, hashB);
      assert.match(hashA, /^0x[0-9a-fA-F]{64}$/);
    });

    test('should exclude transient fields (id, status, transaction_hash) from hash calculation', () => {
      const cleanPayload = {
        studentIdentifier: 'STU-888',
        institutionId: 'INST-002',
      };

      const payloadWithTransient = {
        studentIdentifier: 'STU-888',
        institutionId: 'INST-002',
        status: 'ISSUED',
        transaction_hash: '0x1234567890abcdef',
        id: 42,
      };

      const hash1 = computeCredentialHash(cleanPayload);
      const hash2 = computeCredentialHash(payloadWithTransient);

      assert.strictEqual(hash1, hash2);
    });

    test('should produce distinct hashes for different inputs', () => {
      const hash1 = computeCredentialHash({ student: 'Alice', score: 90 });
      const hash2 = computeCredentialHash({ student: 'Bob', score: 90 });

      assert.notStrictEqual(hash1, hash2);
    });

    test('computeCredentialIdHash should return normalized 32-byte hex hash', () => {
      const credId = 'CRED-TEST-12345';
      const idHash = computeCredentialIdHash(credId);

      assert.match(idHash, /^0x[0-9a-fA-F]{64}$/);
    });

    test('generateCredentialId should generate unique prefixed IDs', () => {
      const id1 = generateCredentialId('TEST');
      const id2 = generateCredentialId('TEST');

      assert.match(id1, /^TEST-[0-9A-Z]+-[0-9A-F]+$/);
      assert.notStrictEqual(id1, id2);
    });
  });

  describe('2. Credential Creation Input Validation', () => {
    test('should reject registration if studentIdentifier is missing', async () => {
      const req = {
        body: {
          institutionId: 'INST_001',
          issueDate: '2026-01-01',
        },
      };
      const res = createMockRes();

      await registerCredential(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.status, 'error');
      assert.match(res.body.message, /student\/reference identifier or 12-digit APAAR ID is required/i);
    });

    test('should reject registration if institutionId is missing', async () => {
      const req = {
        body: {
          studentIdentifier: 'STU_123',
          issueDate: '2026-01-01',
        },
      };
      const res = createMockRes();

      await registerCredential(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.status, 'error');
      assert.match(res.body.message, /institution identifier is required/i);
    });

    test('should reject registration if fields are empty whitespace', async () => {
      const req = {
        body: {
          studentIdentifier: '   ',
          institutionId: '   ',
        },
      };
      const res = createMockRes();

      await registerCredential(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.status, 'error');
    });

    test('should reject registration if record_type is invalid', async () => {
      const req = {
        body: {
          studentIdentifier: 'STU_VALID_123',
          institutionId: 'INST_001',
          recordType: 'INVALID_RECORD_CATEGORY',
        },
      };
      const res = createMockRes();

      await registerCredential(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.status, 'error');
      assert.match(res.body.message, /unsupported record_type/i);
    });
  });

  describe('3. Non-existent & Invalid Credential Handling', () => {
    test('getCredentialById should return 404 for non-existent credential ID', async () => {
      const req = {
        params: { id: 'NON_EXISTENT_CREDENTIAL_ID_99999' },
      };
      const res = createMockRes();

      await getCredentialById(req, res);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.body.status, 'error');
      assert.match(res.body.message, /not found/i);
    });

    test('verifyCredential should return 404 and NOT_FOUND result for non-existent credential', async () => {
      const req = {
        params: { id: 'NON_EXISTENT_CREDENTIAL_ID_88888' },
        ip: '127.0.0.1',
      };
      const res = createMockRes();

      await verifyCredential(req, res);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.body.status, 'error');
      assert.strictEqual(res.body.verificationResult, 'NOT_FOUND');
    });

    test('revokeCredential should return 404 for non-existent credential', async () => {
      const req = {
        params: { id: 'NON_EXISTENT_CREDENTIAL_ID_77777' },
      };
      const res = createMockRes();

      await revokeCredential(req, res);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.body.status, 'error');
      assert.match(res.body.message, /does not exist/i);
    });
  });

  describe('4. Verification Response & Database Integration', () => {
    const testCredId = `TEST-VERIFY-${Date.now()}`;
    const studentRef = 'STU-VERIFY-REF-001';
    const instId = 'INST-VERIFY-001';
    const payload = {
      studentIdentifier: studentRef,
      institutionId: instId,
      issueDate: '2026-06-01',
      major: 'Computer Science',
    };
    const canonical = canonicalizeCredential(payload);
    const credHash = computeCredentialHash(canonical);

    test('should insert and verify credential metadata in MySQL database', async () => {
      // Direct insertion into MySQL to test retrieval and hash verification
      await pool.query(
        `INSERT INTO credentials (
          credential_id,
          student_identifier,
          record_type,
          title,
          institution_id,
          credential_hash,
          status,
          issue_date,
          transaction_hash,
          payload_json
        ) VALUES (?, ?, 'UG_DEGREE', 'B.Tech CSE', ?, ?, 'ISSUED', '2026-06-01', '0xmocktxhash1234567890abcdef', ?)`,
        [testCredId, studentRef, instId, credHash, JSON.stringify(canonical)]
      );

      // Test retrieval
      const getReq = { params: { id: testCredId } };
      const getRes = createMockRes();
      await getCredentialById(getReq, getRes);

      assert.strictEqual(getRes.statusCode, 200);
      assert.strictEqual(getRes.body.status, 'success');
      assert.strictEqual(getRes.body.data.credential_id, testCredId);
      assert.strictEqual(getRes.body.data.record_type, 'UG_DEGREE');
      assert.strictEqual(getRes.body.data.title, 'B.Tech CSE');
      assert.strictEqual(getRes.body.data.credential_hash, credHash);
      assert.strictEqual(getRes.body.data.student_identifier, studentRef);
      assert.strictEqual(getRes.body.data.institution_id, instId);

      // Clean up test record
      await pool.query('DELETE FROM credentials WHERE credential_id = ?', [testCredId]);
    });
  });

  describe('5. Phase 1 Lifelong APAAR Academic Records & Timeline', () => {
    const validApaarId = '987654321098'; // Exactly 12 digits
    const expectedReference = computeProtectedApaarReference(validApaarId);

    test('validateApaarId should strictly validate 12-digit numeric constraint', () => {
      assert.strictEqual(validateApaarId('987654321098'), true);
      assert.strictEqual(validateApaarId(987654321098), true);

      // Invalid lengths
      assert.strictEqual(validateApaarId('12345678901'), false); // 11 digits
      assert.strictEqual(validateApaarId('1234567890123'), false); // 13 digits
      assert.strictEqual(validateApaarId(''), false);

      // Non-numeric characters
      assert.strictEqual(validateApaarId('12345678901A'), false);
      assert.strictEqual(validateApaarId('1234-5678-9012'), false);
      assert.strictEqual(validateApaarId(null), false);
      assert.strictEqual(validateApaarId(undefined), false);
    });

    test('computeProtectedApaarReference should fail clearly if APAAR_ID_SECRET is missing or empty', () => {
      const originalSecret = process.env.APAAR_ID_SECRET;
      try {
        delete process.env.APAAR_ID_SECRET;
        assert.throws(
          () => computeProtectedApaarReference(validApaarId),
          /APAAR_ID_SECRET environment variable is missing or empty/i
        );

        process.env.APAAR_ID_SECRET = '   ';
        assert.throws(
          () => computeProtectedApaarReference(validApaarId),
          /APAAR_ID_SECRET environment variable is missing or empty/i
        );
      } finally {
        process.env.APAAR_ID_SECRET = originalSecret;
      }
    });

    test('computeProtectedApaarReference should create deterministic 64-char hex hash without leaking raw APAAR ID or secret', () => {
      const ref1 = computeProtectedApaarReference(validApaarId);
      const ref2 = computeProtectedApaarReference(validApaarId);

      assert.strictEqual(ref1, ref2);
      assert.match(ref1, /^0x[0-9a-fA-F]{64}$/);
      assert.strictEqual(ref1.includes(validApaarId), false); // Zero raw data in reference
      assert.strictEqual(ref1.includes(process.env.APAAR_ID_SECRET), false); // Secret not exposed

      // Different APAAR IDs must produce distinct references
      const refOther = computeProtectedApaarReference('111222333444');
      assert.notStrictEqual(ref1, refOther);
    });

    test('computeProtectedApaarReference should generate distinct references when APAAR_ID_SECRET changes', () => {
      const originalSecret = process.env.APAAR_ID_SECRET;
      try {
        const refA = computeProtectedApaarReference(validApaarId);

        process.env.APAAR_ID_SECRET = 'DIFFERENT_SALT_KEY_999';
        const refB = computeProtectedApaarReference(validApaarId);

        assert.notStrictEqual(refA, refB);
        assert.match(refB, /^0x[0-9a-fA-F]{64}$/);

        // Deterministic on second call with the new secret
        const refB2 = computeProtectedApaarReference(validApaarId);
        assert.strictEqual(refB, refB2);
      } finally {
        process.env.APAAR_ID_SECRET = originalSecret;
      }
    });

    test('should reject invalid APAAR ID in registration request', async () => {
      const req = {
        body: {
          apaarId: '12345', // Invalid length
          institutionId: 'VIT-001',
          issueDate: '2026-01-01',
        },
      };
      const res = createMockRes();

      await registerCredential(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.status, 'error');
      assert.match(res.body.message, /exactly 12 numeric digits/i);
    });

    test('should reject invalid APAAR ID format in timeline request', async () => {
      const req = {
        params: { apaarId: '123456789' }, // 9 digits (invalid)
      };
      const res = createMockRes();

      await getStudentTimeline(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.status, 'error');
      assert.match(res.body.message, /exactly 12 numeric digits/i);
    });

    test('should return lifelong academic timeline across multiple institutions and record types', async () => {
      const timestamp = Date.now();
      const cred1 = `CRED-BOARD-${timestamp}`;
      const cred2 = `CRED-UG-${timestamp}`;
      const cred3 = `CRED-PHD-${timestamp}`;

      // Insert 3 multi-type credentials for the same protected APAAR identity
      await pool.query(
        `INSERT INTO credentials (credential_id, student_identifier, record_type, title, institution_id, credential_hash, status, issue_date, academic_year)
         VALUES 
         (?, ?, 'BOARD_RESULT_10', 'Secondary School Examination', 'CBSE-BOARD', ?, 'ISSUED', '2018-05-20', '2017-2018'),
         (?, ?, 'UG_DEGREE', 'B.Tech in Computer Science and Engineering', 'VIT-UNIVERSITY', ?, 'ISSUED', '2022-06-15', '2018-2022'),
         (?, ?, 'PHD_MILESTONE', 'Doctoral Proposal & Comprehensive Exam', 'IISC-BANGALORE', ?, 'ISSUED', '2025-11-10', '2025-2026')`,
        [
          cred1, expectedReference, computeCredentialIdHash(cred1),
          cred2, expectedReference, computeCredentialIdHash(cred2),
          cred3, expectedReference, computeCredentialIdHash(cred3),
        ]
      );

      // Query timeline using the raw 12-digit APAAR ID
      const req = { params: { apaarId: validApaarId } };
      const res = createMockRes();

      await getStudentTimeline(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.status, 'success');
      assert.strictEqual(res.body.data.studentReference, expectedReference);
      assert.strictEqual(res.body.data.totalRecords, 3);

      // Institutions attended summary check
      const institutions = res.body.data.institutionsAttended.map(i => i.institutionId);
      assert.ok(institutions.includes('CBSE-BOARD'));
      assert.ok(institutions.includes('VIT-UNIVERSITY'));
      assert.ok(institutions.includes('IISC-BANGALORE'));

      // Chronological milestones check
      const timeline = res.body.data.timeline;
      assert.strictEqual(timeline.length, 3);
      assert.strictEqual(timeline[0].recordType, 'BOARD_RESULT_10');
      assert.strictEqual(timeline[0].title, 'Secondary School Examination');
      assert.strictEqual(timeline[1].recordType, 'UG_DEGREE');
      assert.strictEqual(timeline[1].institutionId, 'VIT-UNIVERSITY');
      assert.strictEqual(timeline[2].recordType, 'PHD_MILESTONE');
      assert.strictEqual(timeline[2].institutionId, 'IISC-BANGALORE');

      // Clean up test records
      await pool.query(
        'DELETE FROM credentials WHERE credential_id IN (?, ?, ?)',
        [cred1, cred2, cred3]
      );
    });
  });
});
