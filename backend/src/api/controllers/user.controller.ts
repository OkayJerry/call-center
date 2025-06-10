import { Request, Response } from 'express';
import { db } from '../../config/firebase';

export const getUserCalls = async (req: Request, res: Response): Promise<void> => {
    const clientId = req.user!.uid; // `req.user` is populated by the middleware
    const callsSnapshot = await db.collection('clients').doc(clientId).collection('calls').get();

    const calls = callsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    res.status(200).json(calls);
};
