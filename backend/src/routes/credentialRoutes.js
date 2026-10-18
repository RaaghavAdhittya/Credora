import { Router } from 'express';
import {
  registerCredential,
  getCredentialById,
  verifyCredential,
  revokeCredential,
  getStudentTimeline,
  getBlockchainTransactions,
} from '../controllers/credentialController.js';

const router = Router();

// Credential registration, retrieval, and revocation
router.post('/credentials', registerCredential);
router.get('/credentials/:id', getCredentialById);
router.post('/credentials/:id/revoke', revokeCredential);

// Public verification route
router.get('/verify/:id', verifyCredential);

// Lifelong student academic timeline linked to APAAR identity
router.get('/students/:apaarId/timeline', getStudentTimeline);

// Read-only on-chain blockchain explorer
router.get('/blockchain/transactions', getBlockchainTransactions);

export default router;

