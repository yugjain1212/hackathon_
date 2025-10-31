import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth';

export default function Header() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <header style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid #eee' }}>
      <div style={{ fontWeight: 700, fontSize: 18 }}>TerraAlert</div>
      <nav style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
        <Link to="/">Home</Link>
        {user ? (
          <>
            <button onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button onClick={signOut}>Logout ({user.displayName || user.email})</button>
          </>
        ) : (
          <button onClick={signInWithGoogle}>Login</button>
        )}
      </nav>
    </header>
  );
}
