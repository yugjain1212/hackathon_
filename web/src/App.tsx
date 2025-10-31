import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import FCMSetup from './sections/FCMSetup';

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <FCMSetup />
      <div style={{ flex: 1, minHeight: 0 }}>
        <Outlet />
      </div>
    </div>
  );
}
