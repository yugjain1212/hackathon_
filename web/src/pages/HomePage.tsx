import MainMap from '../sections/MainMap';
import EventFilter from '../sections/EventFilter';

export default function HomePage() {
  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <MainMap />
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>
        <EventFilter />
      </div>
    </div>
  );
}
