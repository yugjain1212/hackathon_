import * as functions from 'firebase-functions';
import axios from 'axios';
import { db, messaging } from './admin.js';
import { CONFIG } from './config.js';
import { isWithinRadiusKm } from './geo.js';
import { SafeZoneDoc } from './types.js';

async function fetchRecentGetAmbeeEvents(): Promise<Array<{ id: string; title: string; lat: number; lon: number; type: string }>> {
  if (!CONFIG.getambeeApiKey) return [];
  const url = 'https://api.ambeedata.com/disasters/recent'; // hypothetical recent endpoint; adjust to actual
  const resp = await axios.get(url, { headers: { 'x-api-key': CONFIG.getambeeApiKey }, params: { minutes: CONFIG.recentWindowMinutes } });
  const items = resp.data?.data || resp.data?.items || [];
  return items.map((it: any) => ({
    id: String(it.id || `${it.lat},${it.lon}`),
    title: it.title || it.name || 'New Event',
    lat: Number(it.latitude ?? it.lat ?? it.geometry?.coordinates?.[1]),
    lon: Number(it.longitude ?? it.lon ?? it.geometry?.coordinates?.[0]),
    type: String(it.type || 'event'),
  })).filter((e: any) => Number.isFinite(e.lat) && Number.isFinite(e.lon));
}

export const alertProcessor = functions.pubsub.schedule('every 2 minutes').onRun(async () => {
  const recent = await fetchRecentGetAmbeeEvents();
  if (recent.length === 0) return;

  // Fetch all safe zones in one go (hackathon-scale). For larger scale, shard or index by geohash.
  const zonesSnap = await db.collection('safeZones').get();
  const zones = zonesSnap.docs.map((d) => ({ id: d.id, ...(d.data() as SafeZoneDoc) }));

  for (const ev of recent) {
    const impacted = zones.filter((z) => isWithinRadiusKm(ev.lat, ev.lon, z.latitude, z.longitude, z.radiusKm));
    const userToZones = new Map<string, SafeZoneDoc[]>();
    for (const zone of impacted) {
      const arr = userToZones.get(zone.userId) || [];
      arr.push(zone);
      userToZones.set(zone.userId, arr);
    }

    for (const [userId, userZones] of userToZones.entries()) {
      const userDoc = await db.collection('users').doc(userId).get();
      const tokens: string[] = (userDoc.data()?.fcmTokens as string[]) || [];
      if (!tokens.length) continue;

      const zoneNames = userZones.map((z) => `'${z.zoneName}'`).join(', ');
      const title = `ALERT: ${ev.type.toUpperCase()} near your zone(s)`;
      const body = `${ev.title} detected near ${zoneNames}`;

      await messaging.sendEachForMulticast({
        tokens,
        notification: { title, body },
        data: {
          eventId: ev.id,
          lat: String(ev.lat),
          lon: String(ev.lon),
          type: ev.type,
        },
      });
    }
  }
});
