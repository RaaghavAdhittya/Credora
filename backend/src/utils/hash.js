import { ethers } from 'ethers';
import crypto from 'crypto';

/**
 * Deterministically sorts object keys recursively to produce a canonical structure.
 * Strips out internal metadata and transient properties before hashing.
 *
 * @param {*} data - Raw credential document or field
 * @returns {*} Deterministically ordered canonical structure
 */
export function canonicalizeCredential(data) {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(canonicalizeCredential);
  }

  const excludedKeys = new Set([
    'id',
    '_id',
    'status',
    'transaction_hash',
    'transactionHash',
    'created_at',
    'updated_at',
    'createdAt',
    'updatedAt',
  ]);

  const sortedKeys = Object.keys(data).sort();
  const canonical = {};

  for (const key of sortedKeys) {
    if (!excludedKeys.has(key) && data[key] !== undefined) {
      canonical[key] = canonicalizeCredential(data[key]);
    }
  }

  return canonical;
}

/**
 * Generates a deterministic Keccak-256 hash from a canonical credential payload.
 *
 * @param {object} payload - Credential payload object
 * @returns {string} 0x-prefixed 64-character hexadecimal Keccak-256 digest
 */
export function computeCredentialHash(payload) {
  const canonical = canonicalizeCredential(payload);
  const jsonString = JSON.stringify(canonical);
  return ethers.keccak256(ethers.toUtf8Bytes(jsonString));
}

/**
 * Computes a deterministic bytes32 identifier hash for on-chain indexing.
 * If the input is already a valid 32-byte hex string, it is normalized and returned.
 * Otherwise, computes Keccak-256 hash of the credentialId string.
 *
 * @param {string} credentialId - Human-readable or UUID-based credential identifier
 * @returns {string} 0x-prefixed 64-character hexadecimal bytes32 hash
 */
export function computeCredentialIdHash(credentialId) {
  const trimmed = String(credentialId || '').trim();
  if (/^0x[0-9a-fA-F]{64}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return ethers.keccak256(ethers.toUtf8Bytes(trimmed));
}

/**
 * Generates a unique, standardized credential ID.
 *
 * @param {string} [prefix='CRED'] - Optional identifier prefix
 * @returns {string} Unique credential identifier
 */
export function generateCredentialId(prefix = 'CRED') {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${randomHex}`;
}
