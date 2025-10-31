# TerraAlert - Real-Time Disaster Alert System

A hackathon-ready, fully serverless web app for real-time disaster visualization and personalized alerts.

## Tech Stack
- Frontend: React + Vite + TypeScript, `@react-google-maps/api`
- Backend: Firebase Functions (Node.js 20)
- Auth: Firebase Auth (Google)
- DB: Firestore
- Alerts: Firebase Cloud Messaging (FCM)
- Storage: Firebase Storage (public JSON feed)
- AI: Google Gemini API (via Functions proxy)
- Data Provider: GetAmbee (disasters)

## Structure
- `web/` – SPA frontend
- `functions/` – Firebase Cloud Functions
- `firebase.json` – Hosting and function rewrites

## Prerequisites
- Node 20+
- Firebase CLI (`npm i -g firebase-tools`)
- A Firebase project with Firestore, Storage, Authentication, and Cloud Messaging enabled
- GetAmbee API key
- Google Gemini API key
- Google Maps API key

## Local Setup
1. Clone and install deps:
   ```bash
   cd /Users/yugjain/Desktop/JEC_HACKATHON
   cd functions && npm install && cd ..
   cd web && npm install && cd ..
   ```

2. Configure Firebase project:
   ```bash
   # set your project id
   # edit .firebaserc and set YOUR_FIREBASE_PROJECT_ID
   ```

3. Set Functions env vars (replace placeholders):
   ```bash
   cd functions
   firebase functions:config:set getambee.key="YOUR_GETAMBEE_API_KEY" gemini.key="YOUR_GEMINI_API_KEY"
   # also export for local builds
   export GETAMBEE_API_KEY="YOUR_GETAMBEE_API_KEY"
   export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   cd ..
   ```

4. Create `web/.env` with:
   ```bash
   VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT
   VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
   VITE_FIREBASE_APP_ID=YOUR_APP_ID
   VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
   VITE_VAPID_KEY=YOUR_WEB_PUSH_VAPID_KEY
   ```
   - Enable Google as a sign-in provider in Firebase Console.
   - Set FCM Web Push certificates to generate a VAPID key.

5. Update rules:
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```

6. Emulate locally (optional):
   ```bash
   cd functions && npm run build && cd ..
   firebase emulators:start --only functions,hosting,firestore,storage
   ```

## Deploy
```bash
cd functions && npm run deploy
cd ../web && npm run build
firebase deploy --only hosting
```

## How It Works
- `dataFeeder`: every 5 minutes, pulls latest disasters from GetAmbee and writes `public-events.json` into Storage.
- `alertProcessor`: every 2 minutes, fetches recent events, checks user safe zones, and sends FCM notifications.
- `safeZoneAPI`: HTTP endpoints for CRUD on user safe zones (`/api/safezones`).
- Frontend loads `public-events.json` directly from Storage for fast map render and overlays user zones.
- Gemini analysis proxied by `/api/analyze` for AI safety tips.

## API
- `GET /api/safezones` – list current user zones
- `POST /api/safezones` – create zone `{ userId, zoneName, latitude, longitude, radiusKm }`
- `DELETE /api/safezones/:id` – delete zone
- `POST /api/analyze` – `{ prompt }` → Gemini response (requires auth)

## Notes
- Update `functions/src/dataFeeder.ts` and `alertProcessor.ts` with the correct GetAmbee endpoints/shape if needed.
- For production scale, consider geohash indexing instead of full scan matching in `alertProcessor`.
- Ensure your default Storage bucket is public-readable for `public-events.json` or serve via Hosting proxy.