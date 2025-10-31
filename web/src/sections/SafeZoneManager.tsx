import { useEffect, useRef, useState } from 'react';
import { GoogleMap, Marker, Circle, useLoadScript } from '@react-google-maps/api';
import axios from 'axios';
import { useAuth } from '../services/auth';

interface SafeZone {
  id?: string;
  userId: string;
  zoneName: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export default function SafeZoneManager() {
  const { user } = useAuth();
  const [zones, setZones] = useState<SafeZone[]>([]);
  const [draft, setDraft] = useState<SafeZone | null>(null);
  const { isLoaded } = useLoadScript({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY });
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    (async () => {
      if (!user) return setZones([]);
      const token = await user.getIdToken();
      const resp = await axios.get('/api/safezones', { headers: { Authorization: `Bearer ${token}` } });
      setZones(resp.data || []);
    })();
  }, [user]);

  const onMapClick = (e: google.maps.MapMouseEvent) => {
    if (!user || !e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setDraft({ userId: user.uid, zoneName: 'My Zone', latitude: lat, longitude: lng, radiusKm: 50 });
  };

  const saveZone = async () => {
    if (!user || !draft) return;
    const token = await user.getIdToken();
    const resp = await axios.post('/api/safezones', draft, { headers: { Authorization: `Bearer ${token}` } });
    setZones((z) => [...z, resp.data]);
    setDraft(null);
  };

  const deleteZone = async (id: string) => {
    if (!user) return;
    const token = await user.getIdToken();
    await axios.delete(`/api/safezones/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setZones((z) => z.filter((i) => i.id !== id));
  };

  if (!isLoaded)
    return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', height: '100%' }}>
      <div style={{ borderRight: '1px solid #eee', padding: 12, overflow: 'auto' }}>
        <h2>Safe Zones</h2>
        <ul>
          {zones.map((z) => (
            <li key={z.id} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>{z.zoneName}</div>
              <div>{z.radiusKm} km</div>
              <button onClick={() => deleteZone(z.id!)}>Delete</button>
            </li>
          ))}
        </ul>
        {draft && (
          <div style={{ marginTop: 12 }}>
            <h3>New Zone</h3>
            <input
              value={draft.zoneName}
              onChange={(e) => setDraft({ ...draft, zoneName: e.target.value })}
              placeholder="Zone name"
            />
            <input
              type="number"
              value={draft.radiusKm}
              onChange={(e) => setDraft({ ...draft, radiusKm: Number(e.target.value) })}
              placeholder="Radius (km)"
            />
            <button onClick={saveZone}>Save</button>
          </div>
        )}
        {!draft && <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>Tip: Click on the map to drop a pin.</div>}
      </div>
      <div>
        <GoogleMap
          onLoad={(m) => (mapRef.current = m)}
          onClick={onMapClick}
          center={{ lat: 20, lng: 0 }}
          zoom={2}
          mapContainerStyle={{ width: '100%', height: '100%' }}
        >
          {zones.map((z) => (
            <Circle key={z.id} center={{ lat: z.latitude, lng: z.longitude }} radius={z.radiusKm * 1000} options={{ strokeColor: '#16a34a', fillColor: '#16a34a55' }} />
          ))}
          {draft && (
            <>
              <Marker position={{ lat: draft.latitude, lng: draft.longitude }} />
              <Circle center={{ lat: draft.latitude, lng: draft.longitude }} radius={draft.radiusKm * 1000} options={{ strokeColor: '#f59e0b', fillColor: '#f59e0b55' }} />
            </>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
