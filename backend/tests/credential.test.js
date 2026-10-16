import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  canonicalizeCredential,
  computeCredentialHash,
  computeCredentialIdHash,
  generateCredentialId,
} from '../src/utils/hash.js';
import {
  registerCredential,
  getCredentialById,
  verifyCredential,
  revokeCredential,
} from '../src/controllers/credentialController.js';
import pool from '../src/config/database.js';

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

describe('Milestone 3: Backend & Integration Tests', () => {
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
      assert.match(res.body.message, /student\/reference identifier is required/i);
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
          institution_id,
          credential_hash,
          status,
          issue_date,
          transaction_hash,
          payload_json
        ) VALUES (?, ?, ?, ?, 'ISSUED', '2026-06-01', '0xmocktxhash1234567890abcdef', ?)`,
        [testCredId, studentRef, instId, credHash, JSON.stringify(canonical)]
      );

      // Test retrieval
      const getReq = { params: { id: testCredId } };
      const getRes = createMockRes();
      await getCredentialById(getReq, getRes);

      assert.strictEqual(getRes.statusCode, 200);
      assert.strictEqual(getRes.body.status, 'success');
      assert.strictEqual(getRes.body.data.credential_id, testCredId);
      assert.strictEqual(getRes.body.data.credential_hash, credHash);
      assert.strictEqual(getRes.body.data.student_identifier, studentRef);
      assert.strictEqual(getRes.body.data.institution_id, instId);

      // Clean up test record
      await pool.query('DELETE FROM credentials WHERE credential_id = ?', [testCredId]);
    });
  });
});
