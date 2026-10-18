"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * Firebase dans le navigateur. Il ne sert qu’à une chose : se connecter à
 * l’espace privé. Toutes les lectures et écritures passent par le serveur.
 * Ces valeurs sont publiques par nature (elles identifient le projet, rien de plus).
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function authNavigateur() {
  const app = getApps().length ? getApp() : initializeApp(config);
  return getAuth(app);
}
