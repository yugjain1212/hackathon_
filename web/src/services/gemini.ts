import axios from 'axios';
import { User } from 'firebase/auth';

export async function analyzeWithGemini(user: User, prompt: string): Promise<string> {
  const token = await user.getIdToken();
  const resp = await axios.post('/api/analyze', { prompt }, { headers: { Authorization: `Bearer ${token}` } });
  // Extract plain text from response candidates
  const text = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(resp.data);
  return text;
}
