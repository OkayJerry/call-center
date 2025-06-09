import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

export const verifyWebhook = (req: Request, res: Response, next: NextFunction): void => {
  const ELEVENLABS_WEBHOOK_SECRET = process.env.ELEVENLABS_WEBHOOK_SECRET;

  if (!ELEVENLABS_WEBHOOK_SECRET) {
      console.error("Server Error: Webhook secret not configured.");
      res.status(500).send("Webhook secret not configured.");
      return;
  }
  
  const signatureHeader = req.headers['elevenlabs-signature'] as string;
  if (!signatureHeader) {
    console.error("Webhook Error: Missing 'elevenlabs-signature' header.");
    res.status(401).send("Signature missing.");
    return;
  }

  const parts = signatureHeader.split(',');
  const timestampStr = parts.find(part => part.startsWith('t='))?.substring(2);
  const signature = parts.find(part => part.startsWith('v0='))?.substring(3);

  if (!timestampStr || !signature) {
    console.error("Webhook Error: Malformed signature header.");
    res.status(401).send("Malformed signature header.");
    return;
  }
  
  const requestTimestamp = parseInt(timestampStr, 10) * 1000;
  const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
  if (requestTimestamp < thirtyMinutesAgo) {
    console.error("Webhook Error: Request timestamp has expired.");
    res.status(403).send('Request expired.');
    return;
  }

  if (!req.body || typeof req.body.length === 'undefined') {
    console.error("Webhook Error: Raw body not available for verification.");
    res.status(400).send("Could not verify request.");
    return;
  }
  
  const messageToSign = `${timestampStr}.${req.body.toString()}`;
  const hmac = crypto.createHmac('sha256', ELEVENLABS_WEBHOOK_SECRET);
  hmac.update(messageToSign);
  const computedSignature = hmac.digest('hex');

  const isSignatureValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );

  if (!isSignatureValid) {
    console.error("Webhook Error: Invalid signature.");
    res.status(401).send("Invalid signature.");
    return;
  }
  next();
};
