import "server-only";

import { randomUUID } from "crypto";
import type Stripe from "stripe";
import { CONFIG } from "@/lib/donnees";
import { db } from "@/lib/firebase-admin";

/**
 * La billetterie en ligne : les commandes, enregistrées dans Firestore.
 *
 *   commandes/{id}            une commande (un passage à la caisse Stripe)
 *   parametres/billetterie    le prochain numéro de billet à attribuer
 *
 * Le parcours d’une commande :
 *   1. « en_attente » : la personne est partie payer chez Stripe. Ses places
 *      sont mises de côté pendant 30 minutes, pour ne jamais dépasser la limite.
 *   2. « payee » : Stripe confirme le paiement (webhook, ou retour sur la page
 *      de remerciement). On attribue alors les numéros de billets : L101, L102…
 *   3. « expiree » : la personne n’a pas payé ; ses places sont libérées.
 *
 * « en_traitement » couvre les rares paiements différés (virement, débit) :
 *   les places restent réservées jusqu’à la réponse de la banque.
 */

export type Statut = "en_attente" | "en_traitement" | "payee" | "expiree";

export type Adresse = {
  ligne1: string;
  ligne2: string;
  ville: string;
  province: string;
  codePostal: string;
  pays: string;
};

export type Commande = {
  id: string;
  statut: Statut;
  qte: number;
  donExtra: number; // en dollars
  recu: boolean; // la personne veut un reçu fiscal
  montantRecu: number; // 90 $ par billet + don supplémentaire, si reçu demandé
  total: number; // en dollars
  creeLe: number; // millisecondes
  expireA: number;
  payeeLe: number | null;
  sessionId: string;
  paiementId: string;
  nom: string; // prénom et nom, pour l’affichage
  prenom: string;
  nomFamille: string;
  courriel: string;
  telephone: string;
  adresse: Adresse | null;
  allergies: string;
  numeros: string[];
  courrielEnvoyeLe: number | null; // billets envoyés par courriel (SendGrid)
  courrielErreur: string;
};

const COMMANDES = "commandes";
const PARAMETRES = "parametres/billetterie";

/* Durée pendant laquelle les places restent de côté : 30 minutes chez
   Stripe (le minimum permis), plus une petite marge */
export const DUREE_RESERVATION_MS = 30 * 60 * 1000;
const MARGE_MS = 2 * 60 * 1000;

/* ----------------------------------------------------------------------
   Calculs
   ---------------------------------------------------------------------- */

export function montantRecu(qte: number, donExtra: number, recu: boolean): number {
  return recu ? qte * CONFIG.billet.montantRecuParBillet + donExtra : 0;
}

export const numeroBillet = (n: number) => `${CONFIG.billet.prefixeNumero}${n}`;

/* Une commande qui occupe des places : payée, en traitement, ou en attente
   de paiement et pas encore expirée */
function occupe(d: FirebaseFirestore.DocumentData, maintenant: number): number {
  const qte = typeof d.qte === "number" ? d.qte : 0;
  if (d.statut === "payee" || d.statut === "en_traitement") return qte;
  if (d.statut === "en_attente" && typeof d.expireA === "number" && d.expireA > maintenant) return qte;
  return 0;
}

/* ----------------------------------------------------------------------
   Conversions Firestore → objets simples
   ---------------------------------------------------------------------- */

const texte = (v: unknown) => (typeof v === "string" ? v : "");
const nombre = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : 0);

function versCommande(id: string, d: FirebaseFirestore.DocumentData): Commande {
  const a = d.adresse as Partial<Adresse> | null | undefined;
  return {
    id,
    statut: (["en_attente", "en_traitement", "payee", "expiree"].includes(d.statut) ? d.statut : "expiree") as Statut,
    qte: nombre(d.qte),
    donExtra: nombre(d.donExtra),
    recu: d.recu === true,
    montantRecu: nombre(d.montantRecu),
    total: nombre(d.total),
    creeLe: nombre(d.creeLe),
    expireA: nombre(d.expireA),
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
    allergies: texte(d.allergies),
    numeros: Array.isArray(d.numeros) ? d.numeros.filter((n: unknown) => typeof n === "string") : [],
    courrielEnvoyeLe: typeof d.courrielEnvoyeLe === "number" ? d.courrielEnvoyeLe : null,
    courrielErreur: texte(d.courrielErreur),
  };
}

/* ----------------------------------------------------------------------
   Lecture
   ---------------------------------------------------------------------- */

export async function lireCommandes(): Promise<Commande[]> {
  const snap = await db().collection(COMMANDES).get();
  return snap.docs.map((d) => versCommande(d.id, d.data())).sort((a, b) => a.creeLe - b.creeLe);
}

/* Places mises de côté par des personnes en train de payer */
export function placesEnCoursDePaiement(commandes: Commande[]): number {
  const maintenant = Date.now();
  return commandes.reduce((s, c) => s + (c.statut === "payee" ? 0 : occupe(c, maintenant)), 0);
}

export async function lireCommande(id: string): Promise<Commande | null> {
  if (!id || id.includes("/")) return null;
  const d = await db().collection(COMMANDES).doc(id).get();
  return d.exists ? versCommande(d.id, d.data()!) : null;
}

export async function placesRestantes(): Promise<number> {
  const snap = await db().collection(COMMANDES).where("statut", "in", ["payee", "en_traitement", "en_attente"]).get();
  const maintenant = Date.now();
  const prises = snap.docs.reduce((s, d) => s + occupe(d.data(), maintenant), 0);
  return Math.max(0, CONFIG.billet.limite - prises);
}

/* ----------------------------------------------------------------------
   1. Mettre des places de côté avant d’envoyer la personne chez Stripe
   ---------------------------------------------------------------------- */

export type Reservation =
  | { ok: true; id: string; expireA: number }
  | { ok: false; restantes: number };

export async function reserver(qte: number, donExtra: number, recu: boolean): Promise<Reservation> {
  const base = db();
  const parametres = base.doc(PARAMETRES);
  const ouvertes = base.collection(COMMANDES).where("statut", "in", ["payee", "en_traitement", "en_attente"]);

  return base.runTransaction(async (t) => {
    // Lire puis écrire le document « parametres » dans chaque réservation
    // force Firestore à les traiter une à la fois : deux personnes qui
    // prennent les dernières places au même instant ne passent pas toutes les deux.
    await t.get(parametres);
    const snap = await t.get(ouvertes);
    const maintenant = Date.now();
    const prises = snap.docs.reduce((s, d) => s + occupe(d.data(), maintenant), 0);
    const restantes = Math.max(0, CONFIG.billet.limite - prises);
    if (qte > restantes) return { ok: false, restantes } as const;

    const id = randomUUID();
    const expireA = maintenant + DUREE_RESERVATION_MS + MARGE_MS;
    t.set(parametres, { derniereReservation: maintenant }, { merge: true });
    t.set(base.collection(COMMANDES).doc(id), {
      statut: "en_attente",
      qte,
      donExtra,
      recu,
      montantRecu: montantRecu(qte, donExtra, recu),
      total: qte * CONFIG.billet.prix + donExtra,
      creeLe: maintenant,
      expireA,
      payeeLe: null,
      numeros: [],
    });
    return { ok: true, id, expireA } as const;
  });
}

export async function attacherSession(id: string, sessionId: string) {
  await db().collection(COMMANDES).doc(id).update({ sessionId });
}

/* La personne n’a pas payé (session expirée, paiement refusé, erreur) */
export async function liberer(id: string) {
  const ref = db().collection(COMMANDES).doc(id);
  await db().runTransaction(async (t) => {
    const d = await t.get(ref);
    if (!d.exists) return;
    const statut = d.data()!.statut;
    if (statut === "en_attente" || statut === "en_traitement") t.update(ref, { statut: "expiree" });
  });
}

/* ----------------------------------------------------------------------
   2. Paiement confirmé par Stripe : attribuer les numéros de billets
   Appelée par le webhook ET par la page de remerciement : elle ne fait
   le travail qu’une seule fois, peu importe laquelle arrive en premier.
   ---------------------------------------------------------------------- */

export function coordonnees(session: Stripe.Checkout.Session) {
  const c = session.customer_details;
  const a = c?.address;
  const champ = (cle: string) =>
    (session.custom_fields?.find((f) => f.key === cle)?.text?.value ?? "").trim();
  const prenom = champ("prenom");
  const nomFamille = champ("nom");
  return {
    // Le prénom et le nom saisis ; à défaut, le nom inscrit sur la carte
    nom: [prenom, nomFamille].filter(Boolean).join(" ") || (c?.name ?? ""),
    prenom,
    nomFamille,
    courriel: c?.email ?? "",
    telephone: c?.phone ?? "",
    adresse: a
      ? {
          ligne1: a.line1 ?? "",
          ligne2: a.line2 ?? "",
          ville: a.city ?? "",
          province: a.state ?? "",
          codePostal: a.postal_code ?? "",
          pays: a.country ?? "",
        }
      : null,
    allergies: champ("allergies"),
    sessionId: session.id,
    paiementId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? "",
  };
}

export async function confirmerPaiement(session: Stripe.Checkout.Session): Promise<Commande | null> {
  const id = session.client_reference_id;
  if (!id) return null;
  const base = db();
  const ref = base.collection(COMMANDES).doc(id);
  const parametres = base.doc(PARAMETRES);

  await base.runTransaction(async (t) => {
    const [d, p] = await Promise.all([t.get(ref), t.get(parametres)]);
    if (!d.exists) return;
    const commande = d.data()!;
    if (commande.statut === "payee") return; // déjà fait

    const qte = nombre(commande.qte);
    const premier = Math.max(nombre(p.data()?.prochainNumero), CONFIG.billet.premierNumero);
    const numeros = Array.from({ length: qte }, (_, i) => numeroBillet(premier + i));

    t.set(parametres, { prochainNumero: premier + qte }, { merge: true });
    t.update(ref, {
      ...coordonnees(session),
      statut: "payee",
      payeeLe: Date.now(),
      total: (session.amount_total ?? 0) / 100,
      numeros,
    });
  });

  return lireCommande(id);
}

/* Paiement différé : la commande est passée, l’argent pas encore reçu */
export async function marquerEnTraitement(session: Stripe.Checkout.Session) {
  const id = session.client_reference_id;
  if (!id) return;
  const ref = db().collection(COMMANDES).doc(id);
  await db().runTransaction(async (t) => {
    const d = await t.get(ref);
    if (!d.exists || d.data()!.statut !== "en_attente") return;
    t.update(ref, { ...coordonnees(session), statut: "en_traitement" });
  });
}

/* ----------------------------------------------------------------------
   3. Envoi des billets par courriel
   Une seule personne « réserve » l’envoi à la fois : le webhook et la page
   de remerciement peuvent arriver ensemble sans envoyer deux courriels.
   ---------------------------------------------------------------------- */

const DELAI_TENTATIVE_MS = 2 * 60 * 1000;

/* Renvoie la commande si c’est à nous d’envoyer le courriel, sinon null */
export async function reserverEnvoi(id: string, forcer = false): Promise<Commande | null> {
  const ref = db().collection(COMMANDES).doc(id);
  return db().runTransaction(async (t) => {
    const d = await t.get(ref);
    if (!d.exists) return null;
    const c = versCommande(d.id, d.data()!);
    if (c.statut !== "payee" || !c.courriel) return null;
    const tentative = nombre(d.data()!.courrielTentative);
    if (!forcer && (c.courrielEnvoyeLe || Date.now() - tentative < DELAI_TENTATIVE_MS)) return null;
    t.update(ref, { courrielTentative: Date.now() });
    return c;
  });
}

export async function noterEnvoi(id: string, erreur?: string) {
  const ref = db().collection(COMMANDES).doc(id);
  await ref.update(
    erreur
      ? { courrielErreur: erreur.slice(0, 500), courrielTentative: 0 }
      : { courrielEnvoyeLe: Date.now(), courrielErreur: "" },
  );
}
