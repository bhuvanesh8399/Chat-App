import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
let once = false;

export async function initMessaging() {
  if (once) return; once = true;
  const supported = await isSupported().catch(() => false);
  if (!supported) return;

  const app = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  });
  const messaging = getMessaging(app);

  try {
    const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });
    console.debug("FCM token:", token);
  } catch (e) { console.debug("FCM permission skipped:", e?.message); }

  onMessage(messaging, (p) => console.debug("FCM foreground:", p));
}
