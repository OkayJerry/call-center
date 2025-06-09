import express, { Router } from 'express';
import { handleElevenLabsWebhook } from '../controllers/webhook.controller';
import { verifyWebhook } from '../../middleware/verifyWebhook';

const router = Router();

// Middleware to get raw body for webhook verification, applied only to this route
const rawBodyMiddleware = express.raw({ type: 'application/json' });

router.post('/elevenlabs', rawBodyMiddleware, verifyWebhook, handleElevenLabsWebhook);

export default router;
