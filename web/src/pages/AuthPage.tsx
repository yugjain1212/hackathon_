import { useAuth } from '../services/auth';

export default function AuthPage() {
  const { signInWithGoogle } = useAuth();
  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={signInWithGoogle} style={{ padding: '12px 16px' }}>Sign in with Google</button>
    </div>
  );
}
