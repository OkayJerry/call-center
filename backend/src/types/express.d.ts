import { DecodedIdToken } from 'firebase-admin/auth';

// --- Extend Express Request type to include a user property ---
// This allows us to attach the decoded Firebase token to the request object
// in a type-safe way.
declare global {
  namespace Express {
    export interface Request {
      user?: DecodedIdToken;
    }
  }
}
