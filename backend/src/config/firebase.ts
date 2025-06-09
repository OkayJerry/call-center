import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import { colors } from '../utils/colors';

// Load environment variables at the very beginning
dotenv.config();

const serviceAccountKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;

if (!serviceAccountKeyPath) {
  throw new Error(`Missing required environment variable: ${colors.red}FIREBASE_SERVICE_ACCOUNT_KEY_PATH${colors.reset}`);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKeyPath)
});

// Export the initialized services to be used in other parts of the application
export const db = admin.firestore();
export const auth = admin.auth();
