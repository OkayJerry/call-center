import { Request, Response } from 'express';
import { auth, db } from '../../config/firebase';
import * as admin from 'firebase-admin';
import { signupSchema } from '../../utils/validation';
import { ZodError } from 'zod';

export const signupUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // Step 1: Validate the incoming request body against the schema
        const validatedBody = signupSchema.parse(req.body);
        const { email, password } = validatedBody;

        // Step 2: If validation passes, create the user in Firebase Auth
        const userRecord = await auth.createUser({ email, password });

        // Step 3: Create a corresponding document in the 'clients' collection
        await db.collection('clients').doc(userRecord.uid).set({
            email: userRecord.email,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Successfully created new user: ${userRecord.uid}`);
        res.status(201).json({ uid: userRecord.uid, email: userRecord.email });

    } catch (error) {
        // Step 4: Handle validation errors from Zod
        if (error instanceof ZodError) {
            console.error('Validation error:', error.errors);
            res.status(400).json({ 
                error: "Invalid input", 
                details: error.flatten().fieldErrors 
            });
            return;
        }

        // Step 5: Handle other errors (e.g., from Firebase)
        console.error('Error creating new user:', error);

        // Check if the error is a Firebase Auth error with a 'code' property
        if (typeof error === 'object' && error !== null && 'code' in error) {
            const firebaseError = error as { code: string; message: string };
            if (firebaseError.code === 'auth/email-already-exists') {
                 res.status(409).json({ error: 'The email address is already in use by another account.' });
                 return;
            }
        }
        
        // Fallback for any other type of error
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
};
