import { ethers } from 'ethers';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

export const SUPPORTED_RECORD_TYPES = Object.freeze([
  'BOARD_RESULT_10',
  'BOARD_RESULT_12',
  'CERTIFICATE',
  'DIPLOMA',
  'UG_DEGREE',
  'PG_DEGREE',
  'TRANSCRIPT',
  'PHD_MILESTONE',
]);

/**
 * Validates that an APAAR ID conforms to the official 12-digit numeric specification.
 *
 * @param {string|number} apaarId - Candidate APAAR ID
 * @returns {boolean} True if exactly 12 numeric digits
 */
export function validateApaarId(apaarId) {
  if (typeof apaarId !== 'string' && typeof apaarId !== 'number') {
    return false;
  }
  const str = String(apaarId).trim();
  return /^\d{12}$/.test(str);
}

/**
 * Generates a protected, one-way cryptographic server-side identity reference from an APAAR ID.
 * Prevents raw APAAR ID or personal data from ever being stored in plain text or leaked.
 *
 * @param {string|number} apaarId - 12-digit APAAR ID
 * @returns {string} 0x-prefixed 64-character hexadecimal reference hash
 */
export function computeProtectedApaarReference(apaarId) {
  if (!validateApaarId(apaarId)) {
    throw new Error('Invalid APAAR ID: must be exactly 12 numeric digits.');
  }

  const secret = process.env.APAAR_ID_SECRET;
  if (!secret || typeof secret !== 'string' || !secret.trim()) {
    throw new Error('APAAR_ID_SECRET environment variable is missing or empty. Cannot compute protected identity reference.');
  }

  const cleanId = String(apaarId).trim();
  const salt = secret.trim();
  const separator = salt.endsWith(':') ? '' : ':';
  return ethers.keccak256(ethers.toUtf8Bytes(`${salt}${separator}${cleanId}`));
}

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
