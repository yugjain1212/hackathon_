import { useState } from 'react';

export default function EventFilter() {
  const [filters, setFilters] = useState({ earthquake: true, wildfire: true, storm: true, volcano: true, flood: true });
  // For brevity, this component currently does not connect to map filtering.
  return (
    <div style={{ background: 'white', borderRadius: 8, padding: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Filters</div>
      {Object.entries(filters).map(([k, v]) => (
        <label key={k} style={{ display: 'block', fontSize: 14 }}>
          <input type="checkbox" checked={v} onChange={() => setFilters((f) => ({ ...f, [k]: !f[k as keyof typeof f] }))} /> {k}
        </label>
      ))}
    </div>
  );
}
