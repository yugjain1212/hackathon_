import SafeZoneManager from '../sections/SafeZoneManager';

export default function DashboardPage() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SafeZoneManager />
    </div>
  );
}
