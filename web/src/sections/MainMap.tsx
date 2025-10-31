import { useEffect, useMemo, useState } from 'react';
import { GoogleMap, Marker, Circle, useLoadScript } from '@react-google-maps/api';
import axios from 'axios';
import { useAuth } from '../services/auth';

interface PublicEvent {
  id: string;
  type: string;
  title: string;
  latitude: number;
  longitude: number;
  magnitude?: number;
  occurredAt: string;
}

interface SafeZone {
  id: string;
  userId: string;
  zoneName: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export default function MainMap() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [zones, setZones] = useState<SafeZone[]>([]);
  const { user } = useAuth();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  useEffect(() => {
    (async () => {
      try {
        // Public file written by dataFeeder function in default bucket root.
        const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string;
        const url = `https://storage.googleapis.com/${storageBucket}/public-events.json`;
        const resp = await axios.get(url, { validateStatus: () => true });
        setEvents(resp.data?.events || []);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!user) return setZones([]);
      try {
        const token = await user.getIdToken();
        const resp = await axios.get('/api/safezones', { headers: { Authorization: `Bearer ${token}` } });
        setZones(resp.data || []);
      } catch {
        setZones([]);
      }
    })();
  }, [user]);

  const center = useMemo(() => ({ lat: 20, lng: 0 }), []);

  if (!isLoaded) return null;

  return (
    <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={center} zoom={2} options={{ streetViewControl: false }}>
      {events.map((e) => (
        <Marker key={e.id} position={{ lat: e.latitude, lng: e.longitude }} title={e.title} />
      ))}
      {zones.map((z) => (
        <Circle
          key={z.id}
          center={{ lat: z.latitude, lng: z.longitude }}
          radius={z.radiusKm * 1000}
          options={{ strokeColor: '#0ea5e9', fillColor: '#0ea5e955' }}
        />
      ))}
    </GoogleMap>
  );
}
