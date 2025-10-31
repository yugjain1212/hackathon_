import { useEffect } from 'react';
import { requestFcmToken } from '../services/firebase';
import { useAuth } from '../services/auth';

export default function FCMSetup() {
  const { user, addFcmToken } = useAuth();

  useEffect(() => {
    (async () => {
      if (!user) return;
      const key = import.meta.env.VITE_VAPID_KEY as string;
      if (!key) return;
      const token = await requestFcmToken(key);
      if (token) await addFcmToken(token);
    })();
  }, [user]);

  return null;
}
