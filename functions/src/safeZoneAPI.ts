import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import { db } from './admin.js';
import { SafeZoneDoc } from './types.js';
import axios from 'axios';

async function authenticate(req: functions.https.Request): Promise<admin.auth.DecodedIdToken> {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) throw new functions.https.HttpsError('unauthenticated', 'Missing token');
  const idToken = auth.substring(7);
  try {
    return await admin.auth().verifyIdToken(idToken);
  } catch {
    throw new functions.https.HttpsError('unauthenticated', 'Invalid token');
  }
}

export const safeZoneAPI = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).send('');

  let user: admin.auth.DecodedIdToken;
  try {
    user = await authenticate(req);
  } catch (e: any) {
    return res.status(401).json({ error: e.message || 'unauthenticated' });
  }

  try {
    if (req.method === 'GET' && req.path === '/safezones') {
      const snap = await db.collection('safeZones').where('userId', '==', user.uid).get();
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.json(items);
    }

    if (req.method === 'POST' && req.path === '/safezones') {
      const body = req.body as Partial<SafeZoneDoc>;
      if (!body || body.userId !== user.uid) {
        return res.status(400).json({ error: 'userId must match authenticated user' });
      }
      if (
        typeof body.zoneName !== 'string' ||
        typeof body.latitude !== 'number' ||
        typeof body.longitude !== 'number' ||
        typeof body.radiusKm !== 'number'
      ) {
        return res.status(400).json({ error: 'Invalid zone payload' });
      }
      const doc = await db.collection('safeZones').add(body as SafeZoneDoc);
      const saved = await doc.get();
      return res.status(201).json({ id: doc.id, ...saved.data() });
    }

    if (req.method === 'DELETE' && req.path.startsWith('/safezones/')) {
      const id = req.path.split('/').pop();
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const ref = db.collection('safeZones').doc(id);
      const snapshot = await ref.get();
      if (!snapshot.exists) return res.status(404).json({ error: 'Not found' });
      const data = snapshot.data() as SafeZoneDoc;
      if (data.userId !== user.uid) return res.status(403).json({ error: 'Forbidden' });
      await ref.delete();
      return res.status(204).send('');
    }

    if (req.method === 'POST' && req.path === '/analyze') {
      // Minimal Gemini analysis proxy. Frontend sends a prompt + optional event.
      const { prompt } = req.body as { prompt?: string };
      if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
      // Example with Generative Language API (Gemini 1.5). Adjust endpoint/model as needed.
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
      const resp = await axios.post(`${url}?key=${apiKey}`, { contents: [{ parts: [{ text: prompt }] }] });
      return res.json(resp.data);
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Internal error' });
  }
});
