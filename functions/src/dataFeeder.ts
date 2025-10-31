import * as functions from 'firebase-functions';
import axios from 'axios';
import { storage } from './admin.js';
import { CONFIG } from './config.js';
import { PublicEvent } from './types.js';

async function fetchGetAmbee(): Promise<PublicEvent[]> {
  if (!CONFIG.getambeeApiKey) return [];
  // Example endpoint for disasters (GetAmbee varies by product). Replace with correct URL as needed.
  const url = 'https://api.ambeedata.com/disasters/latest';
  const resp = await axios.get(url, { headers: { 'x-api-key': CONFIG.getambeeApiKey } });
  const items = resp.data?.data || resp.data?.items || [];
  const nowIso = new Date().toISOString();
  const normalized: PublicEvent[] = items.map((it: any) => {
    const lat = it.latitude ?? it.lat ?? it.geometry?.coordinates?.[1];
    const lon = it.longitude ?? it.lon ?? it.geometry?.coordinates?.[0];
    return {
      id: String(it.id || it.event_id || `${lat},${lon},${nowIso}`),
      type: (it.type?.toLowerCase() || 'other') as PublicEvent['type'],
      title: it.title || it.name || 'Disaster Event',
      latitude: Number(lat),
      longitude: Number(lon),
      magnitude: it.magnitude || it.mag,
      severity: it.severity,
      source: 'getambee',
      occurredAt: it.occurredAt || it.time || it.date || nowIso,
      metadata: it,
    } as PublicEvent;
  }).filter((e: PublicEvent) => Number.isFinite(e.latitude) && Number.isFinite(e.longitude));
  return normalized;
}

async function writeToPublic(json: unknown): Promise<void> {
  const bucket = storage.bucket();
  const file = bucket.file(CONFIG.publicEventsFilename);
  const buffer = Buffer.from(JSON.stringify(json));
  await file.save(buffer, { contentType: 'application/json', public: true });
}

export const dataFeeder = functions.pubsub.schedule('every 5 minutes').onRun(async () => {
  const events = await fetchGetAmbee();
  await writeToPublic({ generatedAt: new Date().toISOString(), events });
});
