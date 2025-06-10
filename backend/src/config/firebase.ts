import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import { colors } from '../utils/colors';

// Call config() at the top of this module. This ensures that whenever
// this file is imported, the environment variables are loaded immediately.
dotenv.config();

const serviceAccountKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;

if (!serviceAccountKeyPath) {
  // Now, this check will correctly find the environment variable or fail with a clear error.
  throw new Error(`Missing required environment variable: ${colors.red}FIREBASE_SERVICE_ACCOUNT_KEY_PATH${colors.reset}`);
}

// Check if a Firebase app has already been initialized.
// This prevents the "app already exists" error in development environments.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKeyPath)
  });
}

// Export the initialized services to be used in other parts of the application
export const db = admin.firestore();
export const auth = admin.auth();
