import "server-only";

import { applicationDefault, cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/**
 * Accès à Firebase depuis le serveur. Ce fichier ne part jamais dans le
 * navigateur (import "server-only").
 *
 * Deux façons de s’identifier auprès de Firebase :
 *   1. la clé de service des variables FIREBASE_* (en local, fichier .env) ;
 *   2. l’identité propre du serveur sur Firebase App Hosting / Google Cloud,
 *      fournie automatiquement, sans aucun secret à recopier.
 * On essaie la clé d’abord ; si elle est absente ou illisible et qu’on tourne
 * sur Google Cloud, on passe à l’identité du serveur.
 */

const PROJET =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.GCLOUD_PROJECT ||
  "gabrielle-488d0";
const COMPTE = process.env.FIREBASE_CLIENT_EMAIL?.trim();
const BUCKET = process.env.FIREBASE_STORAGE_BUCKET || `${PROJET}.firebasestorage.app`;

/* Sur App Hosting / Cloud Run, Google fournit ces variables lui-même */
const SUR_GOOGLE_CLOUD = Boolean(process.env.K_SERVICE || process.env.FIREBASE_CONFIG);

/**
 * Remet la clé privée en forme, quelle que soit la façon dont elle a été
 * collée : avec ou sans guillemets, avec des \n écrits en toutes lettres,
 * avec des espaces à la place des retours de ligne…
 */
function nettoyerCle(brute?: string): string | undefined {
  if (!brute) return undefined;
  const s = brute.trim().replace(/^["']|["']$/g, "").replace(/\\n/g, "\n");
  const m = s.match(/-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----/);
  if (!m) return undefined;
  const corps = m[1].replace(/\s+/g, "");
  const lignes = corps.match(/.{1,64}/g) ?? [];
  return `-----BEGIN PRIVATE KEY-----\n${lignes.join("\n")}\n-----END PRIVATE KEY-----\n`;
}

const CLE = nettoyerCle(process.env.FIREBASE_PRIVATE_KEY);

/* Vrai quand le serveur a un moyen de joindre Firebase ; sinon le site
   affiche le contenu de repli de lib/donnees.ts */
export const firebaseConfigure = Boolean((COMPTE && CLE) || SUR_GOOGLE_CLOUD);

/* Pour le diagnostic du tableau de bord */
export let modeConnexion: "clé de service" | "identité du serveur (App Hosting)" | "aucun" = "aucun";

function app(): App {
  const existante = getApps()[0];
  if (existante) return existante;

  if (COMPTE && CLE) {
    try {
      const a = initializeApp({
        credential: cert({ projectId: PROJET, clientEmail: COMPTE, privateKey: CLE }),
        projectId: PROJET,
        storageBucket: BUCKET,
      });
      modeConnexion = "clé de service";
      return a;
    } catch (e) {
      if (!SUR_GOOGLE_CLOUD) throw e;
      console.warn("[firebase] Clé de service illisible, on utilise l’identité du serveur.");
    }
  }

  if (SUR_GOOGLE_CLOUD) {
    modeConnexion = "identité du serveur (App Hosting)";
    return initializeApp({ credential: applicationDefault(), projectId: PROJET, storageBucket: BUCKET });
  }

  throw new Error("Firebase n’est pas configuré : vérifiez les variables FIREBASE_* du fichier .env.");
}

export const db = () => getFirestore(app());
export const authAdmin = () => getAuth(app());
export const stockage = () => getStorage(app()).bucket();

/* Les adresses qui ont accès à l’espace privé, en minuscules */
export function courrielsAdmin(): string[] {
  return (process.env.ADMIN_COURRIELS ?? "xavier@lavoiedigital.ca,gabrielle@lavoiedigital.ca")
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);
}
