export type DisasterType = 'earthquake' | 'wildfire' | 'storm' | 'volcano' | 'flood' | 'other';

export interface PublicEvent {
  id: string;
  type: DisasterType;
  title: string;
  latitude: number;
  longitude: number;
  magnitude?: number;
  severity?: string;
  source: 'getambee' | 'usgs' | 'eonet' | 'other';
  occurredAt: string; // ISO
  metadata?: Record<string, unknown>;
}

export interface SafeZoneDoc {
  userId: string;
  zoneName: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  geoHash?: string;
}
