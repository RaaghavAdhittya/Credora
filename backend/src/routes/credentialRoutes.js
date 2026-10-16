import { Router } from 'express';
import {
  registerCredential,
  getCredentialById,
  verifyCredential,
  revokeCredential,
} from '../controllers/credentialController.js';

const router = Router();

// Credential registration, retrieval, and revocation
router.post('/credentials', registerCredential);
router.get('/credentials/:id', getCredentialById);
router.post('/credentials/:id/revoke', revokeCredential);

// Public verification route
router.get('/verify/:id', verifyCredential);

export default router;
