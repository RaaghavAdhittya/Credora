const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || '/api';

/**
 * Fetch health status of backend API.
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error(`Health check returned status ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

/**
 * Verifies a credential on-chain and against database records.
 * GET /api/verify/:id
 */
export async function verifyCredentialApi(credentialId) {
  const cleanId = encodeURIComponent(String(credentialId || '').trim());
  const res = await fetch(`${API_BASE_URL}/verify/${cleanId}`);
  const data = await res.json();
  if (!res.ok && res.status !== 404) {
    throw new Error(data.message || 'Verification service error');
  }
  return data;
}

/**
 * Retrieves credential metadata from registry.
 * GET /api/credentials/:id
 */
export async function getCredentialApi(credentialId) {
  const cleanId = encodeURIComponent(String(credentialId || '').trim());
  const res = await fetch(`${API_BASE_URL}/credentials/${cleanId}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch credential');
  }
  return data;
}

/**
 * Issues a new credential onto Ethereum Sepolia and saves metadata in database.
 * POST /api/credentials
 */
export async function registerCredentialApi(credentialData) {
  const res = await fetch(`${API_BASE_URL}/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentialData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to register credential on blockchain');
  }
  return data;
}

/**
 * Revokes a credential on Ethereum Sepolia and updates database status.
 * POST /api/credentials/:id/revoke
 */
export async function revokeCredentialApi(credentialId) {
  const cleanId = encodeURIComponent(String(credentialId || '').trim());
  const res = await fetch(`${API_BASE_URL}/credentials/${cleanId}/revoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to revoke credential on blockchain');
  }
  return data;
}

/**
 * Retrieves lifelong academic timeline for a student by 12-digit APAAR ID or student reference.
 * GET /api/students/:apaarId/timeline
 */
export async function getStudentTimelineApi(apaarId) {
  const cleanId = encodeURIComponent(String(apaarId || '').trim());
  const res = await fetch(`${API_BASE_URL}/students/${cleanId}/timeline`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to retrieve academic timeline');
  }
  return data;
}

/**
 * Retrieves on-chain transactions recorded on Ethereum Sepolia.
 * GET /api/blockchain/transactions
 */
export async function getBlockchainTransactionsApi(limit = 25) {
  const res = await fetch(`${API_BASE_URL}/blockchain/transactions?limit=${limit}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to retrieve blockchain transactions');
  }
  return data;
}

