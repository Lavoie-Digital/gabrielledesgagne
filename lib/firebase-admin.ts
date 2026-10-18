import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/**
 * Accès à Firebase depuis le serveur, avec la clé de service rangée dans .env.
 * Ce fichier ne part jamais dans le navigateur (import "server-only").
 */

const PROJET = process.env.FIREBASE_PROJECT_ID;
const COMPTE = process.env.FIREBASE_CLIENT_EMAIL;
// La clé est écrite sur une seule ligne dans .env, avec des \n littéraux
const CLE = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const BUCKET = process.env.FIREBASE_STORAGE_BUCKET;

/* Vrai quand la clé de service est présente : sinon le site lit lib/donnees.ts */
export const firebaseConfigure = Boolean(PROJET && COMPTE && CLE);

function app(): App {
  if (!firebaseConfigure) {
    throw new Error("Firebase n’est pas configuré : vérifiez les variables FIREBASE_* du fichier .env.");
  }
  return (
    getApps()[0] ??
    initializeApp({
      credential: cert({ projectId: PROJET, clientEmail: COMPTE, privateKey: CLE }),
      storageBucket: BUCKET,
    })
  );
}

export const db = () => getFirestore(app());
export const authAdmin = () => getAuth(app());
export const stockage = () => getStorage(app()).bucket();

/* Les adresses qui ont accès à l’espace privé, en minuscules */
export function courrielsAdmin(): string[] {
  return (process.env.ADMIN_COURRIELS ?? "")
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);
}
