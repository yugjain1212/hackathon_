export const CONFIG = {
  getambeeApiKey: process.env.GETAMBEE_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  publicEventsFilename: 'public-events.json',
  recentWindowMinutes: parseInt(process.env.RECENT_WINDOW_MINUTES || '2', 10),
};
