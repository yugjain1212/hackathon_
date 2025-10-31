import { useState } from 'react';
import { useAuth } from '../services/auth';
import { analyzeWithGemini } from '../services/gemini';

export default function SafetyTips({ type, title }: { type: string; title?: string }) {
  const basics: Record<string, string[]> = {
    earthquake: ['Drop, Cover, and Hold On', 'Stay away from windows', 'After shaking, evacuate safely'],
    wildfire: ['Prepare to evacuate', 'Close windows and doors', 'Wear N95 mask if outdoors'],
    storm: ['Seek shelter indoors', 'Avoid flooded areas', 'Secure loose outdoor items'],
    volcano: ['Follow evacuation orders', 'Wear mask for ashfall', 'Avoid river valleys'],
    flood: ['Move to higher ground', 'Avoid driving in water', 'Disconnect electrical appliances'],
    other: ['Follow local authority guidance', 'Prepare emergency kit', 'Check alerts frequently'],
  };
  const tips = basics[type] || basics.other;

  const { user } = useAuth();
  const [ai, setAi] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getAI = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const prompt = `Provide concise safety tips for a ${type} event titled: ${title || ''}. Max 5 bullets.`;
      const text = await analyzeWithGemini(user, prompt);
      setAi(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>Safety Tips</div>
      <ul style={{ margin: 0, paddingLeft: 16 }}>
        {tips.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      {user && (
        <div style={{ marginTop: 8 }}>
          <button onClick={getAI} disabled={loading}>{loading ? 'Analyzing…' : 'AI Tips (Gemini)'}</button>
          {ai && <div style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{ai}</div>}
        </div>
      )}
    </div>
  );
}
