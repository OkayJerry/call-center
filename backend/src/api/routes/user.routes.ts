import { Router } from 'express';
import { getUserCalls } from '../controllers/user.controller';
import { verifyFirebaseToken } from '../../middleware/verifyFirebaseToken';

const router = Router();

// This route is protected. Only authenticated users can access it.
router.get('/me/calls', verifyFirebaseToken, getUserCalls);

export default router;
