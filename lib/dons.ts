import "server-only";

import { randomUUID } from "crypto";
import type Stripe from "stripe";
import { coordonnees, type Adresse } from "@/lib/billetterie";
import { db } from "@/lib/firebase-admin";
import type { Donateur, TypeDonateur } from "@/lib/recu-fiscal";

/**
 * Les dons faits en ligne depuis la page « Faire un don » (paiement Stripe),
 * enregistrés dans Firestore, collection « dons ».
 *
 * Distincts des billets : pas de numéro, pas de limite de places, pas
 * d’allergies. Le reçu fiscal, si demandé, porte sur le montant complet du
 * don et est émis par la Fondation En Cœur après la soirée.
 */

export type StatutDon = "en_attente" | "payee" | "expiree";

export type Don = {
  id: string;
  statut: StatutDon;
  montant: number; // en dollars
  recu: boolean;
  typeDonateur: TypeDonateur;
  entreprise: string; // dons corporatifs seulement
  poste: string;
  creeLe: number;
  payeeLe: number | null;
  sessionId: string;
  paiementId: string;
  nom: string;
  prenom: string;
  nomFamille: string;
  courriel: string;
  telephone: string;
  adresse: Adresse | null;
  courrielEnvoyeLe: number | null;
  courrielErreur: string;
};

const DONS = "dons";

const texte = (v: unknown) => (typeof v === "string" ? v : "");
const nombre = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : 0);

function versDon(id: string, d: FirebaseFirestore.DocumentData): Don {
  const a = d.adresse as Partial<Adresse> | null | undefined;
  return {
    id,
    statut: (["en_attente", "payee", "expiree"].includes(d.statut) ? d.statut : "expiree") as StatutDon,
    montant: nombre(d.montant),
    recu: d.recu === true,
    typeDonateur: d.typeDonateur === "corporatif" ? "corporatif" : "personnel",
    entreprise: texte(d.entreprise),
    poste: texte(d.poste),
    creeLe: nombre(d.creeLe),
    payeeLe: typeof d.payeeLe === "number" ? d.payeeLe : null,
    sessionId: texte(d.sessionId),
    paiementId: texte(d.paiementId),
    nom: texte(d.nom),
    prenom: texte(d.prenom),
    nomFamille: texte(d.nomFamille),
    courriel: texte(d.courriel),
    telephone: texte(d.telephone),
    adresse: a
      ? {
          ligne1: texte(a.ligne1),
          ligne2: texte(a.ligne2),
          ville: texte(a.ville),
          province: texte(a.province),
          codePostal: texte(a.codePostal),
          pays: texte(a.pays),
        }
      : null,
    courrielEnvoyeLe: typeof d.courrielEnvoyeLe === "number" ? d.courrielEnvoyeLe : null,
    courrielErreur: texte(d.courrielErreur),
  };
}

export async function lireDons(): Promise<Don[]> {
  const snap = await db().collection(DONS).get();
  return snap.docs.map((d) => versDon(d.id, d.data())).sort((a, b) => a.creeLe - b.creeLe);
}

export async function lireDon(id: string): Promise<Don | null> {
  if (!id || id.includes("/")) return null;
  const d = await db().collection(DONS).doc(id).get();
  return d.exists ? versDon(d.id, d.data()!) : null;
}

export async function creerDon(
  montant: number,
  recu: boolean,
  donateur: Donateur,
): Promise<string> {
  const id = randomUUID();
  await db().collection(DONS).doc(id).set({
    statut: "en_attente",
    montant,
    recu,
    typeDonateur: donateur.type,
    entreprise: donateur.entreprise,
    poste: donateur.poste,
    creeLe: Date.now(),
    payeeLe: null,
  });
  return id;
}

export async function attacherSessionDon(id: string, sessionId: string) {
  await db().collection(DONS).doc(id).update({ sessionId });
}

export async function expirerDon(id: string) {
  const ref = db().collection(DONS).doc(id);
  await db().runTransaction(async (t) => {
    const d = await t.get(ref);
    if (d.exists && d.data()!.statut === "en_attente") t.update(ref, { statut: "expiree" });
  });
}

/* Paiement confirmé (webhook ou page de remerciement) : une seule fois */
export async function confirmerDon(session: Stripe.Checkout.Session): Promise<Don | null> {
  const id = session.client_reference_id;
  if (!id) return null;
  const ref = db().collection(DONS).doc(id);
  await db().runTransaction(async (t) => {
    const d = await t.get(ref);
    if (!d.exists || d.data()!.statut === "payee") return;
    // Seules les coordonnées utiles au don : pas d’allergies
    const { allergies: _allergies, ...infos } = coordonnees(session);
    void _allergies;
    t.update(ref, {
      ...infos,
      statut: "payee",
      payeeLe: Date.now(),
      montant: (session.amount_total ?? 0) / 100,
    });
  });
  return lireDon(id);
}

/* Envoi du courriel de remerciement : une seule personne à la fois */
const DELAI_TENTATIVE_MS = 2 * 60 * 1000;

export async function reserverEnvoiDon(id: string, forcer = false): Promise<Don | null> {
  const ref = db().collection(DONS).doc(id);
  return db().runTransaction(async (t) => {
    const d = await t.get(ref);
    if (!d.exists) return null;
    const don = versDon(d.id, d.data()!);
    if (don.statut !== "payee" || !don.courriel) return null;
    const tentative = nombre(d.data()!.courrielTentative);
    if (!forcer && (don.courrielEnvoyeLe || Date.now() - tentative < DELAI_TENTATIVE_MS)) return null;
    t.update(ref, { courrielTentative: Date.now() });
    return don;
  });
}

export async function noterEnvoiDon(id: string, erreur?: string) {
  await db()
    .collection(DONS)
    .doc(id)
    .update(
      erreur
        ? { courrielErreur: erreur.slice(0, 500), courrielTentative: 0 }
        : { courrielEnvoyeLe: Date.now(), courrielErreur: "" },
    );
}
