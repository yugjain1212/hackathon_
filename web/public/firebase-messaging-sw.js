/* global importScripts, firebase */
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: self?.env?.VITE_FIREBASE_API_KEY,
  authDomain: self?.env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: self?.env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: self?.env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: self?.env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: self?.env?.VITE_FIREBASE_APP_ID,
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'TerraAlert';
  const body = payload.notification?.body || '';
  self.registration.showNotification(title, { body });
});
