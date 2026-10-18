import "server-only";

import { unstable_cache } from "next/cache";
import { COMMANDITAIRES, LOTS, type Commanditaire, type Lot } from "@/lib/donnees";
import { db, firebaseConfigure } from "@/lib/firebase-admin";

/**
 * Le catalogue de l’encan : les lots et les commanditaires, rangés dans
 * Firestore et modifiés depuis l’espace privé (/admin).
 *
 * Les pages publiques lisent une copie en cache, renouvelée dès qu’on
 * enregistre quelque chose dans l’espace privé (étiquette TAG_CATALOGUE).
 * Si Firestore est vide ou injoignable, on affiche les exemples de
 * lib/donnees.ts : le site ne se retrouve jamais vide.
 */

export const TAG_CATALOGUE = "catalogue";

export const PALIERS = ["or", "argent", "bronze", "don"] as const;
export type Palier = (typeof PALIERS)[number];

export const NOM_PALIER: Record<Palier, string> = {
  or: "Partenaire Or (présentateur)",
  argent: "Partenaire Argent",
  bronze: "Partenaire Bronze",
  don: "Don matériel",
};

export type LotFiche = Lot & { id: string; ordre: number };
export type CommanditaireFiche = Commanditaire & { id: string; palier: Palier; ordre: number };

export type Commanditaires = {
  principal: Commanditaire;
  secondaires: Commanditaire[];
  bronze: Commanditaire[];
  dons: Commanditaire[];
};

/* ----------------------------------------------------------------------
   Conversions Firestore → objets simples (sans dates, sérialisables)
   ---------------------------------------------------------------------- */

const texte = (v: unknown) => (typeof v === "string" ? v : "");
const nombre = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : 0);

function versLot(id: string, d: Record<string, unknown>): LotFiche {
  return {
    id,
    titre: texte(d.titre),
    categorie: texte(d.categorie),
    donateur: texte(d.donateur),
    description: texte(d.description),
    valeur: nombre(d.valeur),
    miseDepart: nombre(d.miseDepart),
    miseActuelle: nombre(d.miseActuelle),
    nbMises: nombre(d.nbMises),
    image: texte(d.image),
    cadrage: d.cadrage === "remplir" ? "remplir" : "entier",
    lienMise: texte(d.lienMise),
    ordre: nombre(d.ordre),
  };
}

function versCommanditaire(id: string, d: Record<string, unknown>): CommanditaireFiche {
  const palier = PALIERS.includes(d.palier as Palier) ? (d.palier as Palier) : "bronze";
  return {
    id,
    nom: texte(d.nom),
    logo: texte(d.logo),
    url: texte(d.url),
    mot: texte(d.mot) || undefined,
    palier,
    ordre: nombre(d.ordre),
  };
}

/* ----------------------------------------------------------------------
   Lecture directe de Firestore (espace privé, page /direct)
   Lance une erreur si Firestore est injoignable : à l’appelant de décider.
   ---------------------------------------------------------------------- */

export async function lireLots(): Promise<LotFiche[]> {
  const snap = await db().collection("lots").orderBy("ordre").get();
  return snap.docs.map((d) => versLot(d.id, d.data()));
}

export async function lireLot(id: string): Promise<LotFiche | null> {
  const d = await db().collection("lots").doc(id).get();
  return d.exists ? versLot(d.id, d.data()!) : null;
}

export async function lireCommanditaires(): Promise<CommanditaireFiche[]> {
  const snap = await db().collection("commanditaires").orderBy("ordre").get();
  return snap.docs.map((d) => versCommanditaire(d.id, d.data()));
}

export async function lireCommanditaire(id: string): Promise<CommanditaireFiche | null> {
  const d = await db().collection("commanditaires").doc(id).get();
  return d.exists ? versCommanditaire(d.id, d.data()!) : null;
}

/* ----------------------------------------------------------------------
   Lecture pour le public, avec repli sur les exemples
   ---------------------------------------------------------------------- */

function avertir(quoi: string, e: unknown) {
  console.warn(
    `[catalogue] ${quoi} : Firestore injoignable, on affiche les exemples de lib/donnees.ts.`,
    e instanceof Error ? e.message.split("\n")[0] : e
  );
}

/* Les lots, sans cache : sert à la page /direct, qui doit être à la seconde
   près. « firestore » indique si les montants viennent bien de Firestore. */
export async function lotsEnDirect(): Promise<{ lots: Lot[]; firestore: boolean }> {
  if (!firebaseConfigure) return { lots: LOTS, firestore: false };
  try {
    const lots = await lireLots();
    return lots.length ? { lots, firestore: true } : { lots: LOTS, firestore: false };
  } catch (e) {
    avertir("lots", e);
    return { lots: LOTS, firestore: false };
  }
}

export const lotsPublics = unstable_cache(async () => (await lotsEnDirect()).lots, ["lots-publics"], {
  tags: [TAG_CATALOGUE],
  revalidate: 300,
});

async function commanditairesFrais(): Promise<Commanditaires> {
  if (!firebaseConfigure) return COMMANDITAIRES;
  try {
    const liste = await lireCommanditaires();
    if (!liste.length) return COMMANDITAIRES;
    const du = (p: Palier) => liste.filter((c) => c.palier === p);
    return {
      // Sans partenaire Or, on garde la place « Votre entreprise ici »
      principal: du("or")[0] ?? COMMANDITAIRES.principal,
      secondaires: du("argent"),
      bronze: du("bronze"),
      dons: du("don"),
    };
  } catch (e) {
    avertir("commanditaires", e);
    return COMMANDITAIRES;
  }
}

export const commanditairesPublics = unstable_cache(commanditairesFrais, ["commanditaires-publics"], {
  tags: [TAG_CATALOGUE],
  revalidate: 300,
});
