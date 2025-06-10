import { Request, Response } from 'express';
import { db } from '../../config/firebase';
import * as admin from 'firebase-admin';
import { colors } from '../../utils/colors';

export const handleElevenLabsWebhook = async (req: Request, res: Response): Promise<void> => {
    console.log(`${colors.yellow}--- Received and Verified Webhook Event ---${colors.reset}`);
    
    const eventData = JSON.parse(req.body.toString());
  
    if (eventData.type === 'post_call_transcription') {
      console.log(`${colors.green}Processing post_call_transcription event...${colors.reset}`);
      
      const { agent_number } = eventData.data.metadata.phone_call;
      const { conversation_id, transcript, metadata, analysis } = eventData.data;
  
      const mapDocRef = db.collection('phoneClientMap').doc(agent_number);
      const mapDoc = await mapDocRef.get();
  
      if (!mapDoc.exists) {
        console.error(`${colors.red}Error: No client found for phone number ${agent_number}.${colors.reset}`);
        res.status(200).send('Event received, but no client mapping found.');
        return;
      }
      
      const clientId = mapDoc.data()?.clientId;
  
      if (!clientId) {
        console.error(`${colors.red}Error: Client mapping document for ${agent_number} is missing 'clientId' field.${colors.reset}`);
        res.status(200).send('Event received, but client document is malformed.');
        return;
      }
  
      console.log(`Found mapping: Phone [${agent_number}] ==> Client [${clientId}]`);
      
      const callRecord = {
        ...eventData.data,
        receivedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const callDocRef = db.collection('clients').doc(clientId).collection('calls').doc(conversation_id);
      await callDocRef.set(callRecord);
  
      console.log(`${colors.green}Successfully saved call ${conversation_id} for client ${clientId} to Firestore.${colors.reset}`);
    }
  
    res.status(200).send('Event received');
};
