import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authAdmin, courrielsAdmin, firebaseConfigure } from "@/lib/firebase-admin";

/**
 * La session de l’espace privé.
 *
 * Après la connexion Firebase dans le navigateur, le serveur vérifie le jeton,
 * contrôle que l’adresse figure dans ADMIN_COURRIELS, puis remplace le jeton
 * par un cookie de session signé par Firebase, illisible depuis JavaScript.
 * Chaque page et chaque action de l’espace privé revérifient ce cookie.
 */

export const COOKIE_SESSION = "__session";
export const DUREE_SESSION_MS = 5 * 24 * 60 * 60 * 1000; // 5 jours

export type Admin = { uid: string; courriel: string };

export function estAutorise(courriel?: string | null): boolean {
  return Boolean(courriel) && courrielsAdmin().includes(courriel!.toLowerCase());
}

export async function adminConnecte(): Promise<Admin | null> {
  if (!firebaseConfigure) return null;
  const jeton = (await cookies()).get(COOKIE_SESSION)?.value;
  if (!jeton) return null;
  try {
    // true : refuse aussi une session révoquée (déconnexion, compte désactivé)
    const d = await authAdmin().verifySessionCookie(jeton, true);
    if (!estAutorise(d.email)) return null;
    return { uid: d.uid, courriel: d.email! };
  } catch {
    return null;
  }
}

/* À appeler en tête de chaque page et action privée */
export async function exigerAdmin(): Promise<Admin> {
  const admin = await adminConnecte();
  if (!admin) redirect("/admin/connexion");
  return admin;
}
