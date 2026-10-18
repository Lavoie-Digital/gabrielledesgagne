"use server";

import { randomUUID } from "crypto";
import { getDownloadURL } from "firebase-admin/storage";
import { revalidatePath, updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PALIERS, TAG_CATALOGUE, type Palier } from "@/lib/catalogue";
import { CATEGORIES, COMMANDITAIRES, LOTS } from "@/lib/donnees";
import { authAdmin, db, stockage } from "@/lib/firebase-admin";
import {
  COOKIE_SESSION,
  DUREE_SESSION_MS,
  adminConnecte,
  estAutorise,
  exigerAdmin,
} from "@/lib/session";

export type Retour = { ok: boolean; message: string } | null;

/* ======================================================================
   CONNEXION
   ====================================================================== */

/* Petite vérification avant d’envoyer un lien de connexion par courriel :
   inutile d’en expédier à une adresse qui n’aura de toute façon pas accès. */
export async function courrielAccepte(courriel: string): Promise<boolean> {
  return estAutorise(courriel.trim());
}

export async function ouvrirSession(idToken: string): Promise<Retour> {
  try {
    const d = await authAdmin().verifyIdToken(idToken, true);

    if (!estAutorise(d.email) || !d.email_verified) {
      return { ok: false, message: "Cette adresse n’a pas accès à l’espace privé." };
    }
    // Firebase recommande de n’accepter qu’une connexion toute récente
    if (Date.now() / 1000 - d.auth_time > 5 * 60) {
      return { ok: false, message: "Connexion trop ancienne. Recommencez, s’il vous plaît." };
    }

    const session = await authAdmin().createSessionCookie(idToken, { expiresIn: DUREE_SESSION_MS });
    (await cookies()).set(COOKIE_SESSION, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: DUREE_SESSION_MS / 1000,
    });
    return { ok: true, message: "Connectée." };
  } catch {
    return { ok: false, message: "La connexion n’a pas pu être vérifiée. Réessayez." };
  }
}

export async function fermerSession() {
  const admin = await adminConnecte();
  if (admin) {
    // Invalide aussi la session sur les autres appareils
    await authAdmin().revokeRefreshTokens(admin.uid).catch(() => {});
  }
  (await cookies()).delete(COOKIE_SESSION);
  redirect("/admin/connexion");
}

/* ======================================================================
   OUTILS
   ====================================================================== */

/* Le site public relit le catalogue tout de suite après un changement */
function publier() {
  updateTag(TAG_CATALOGUE);
  revalidatePath("/", "layout");
}

const champ = (f: FormData, nom: string) => String(f.get(nom) ?? "").trim();

function montant(f: FormData, nom: string): number {
  const n = Number(champ(f, nom).replace(/\s/g, "").replace(",", "."));
  return isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : NaN;
}

function lienValide(url: string): boolean {
  if (!url) return true;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

const TYPES_IMAGE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};
const TAILLE_MAX = 8 * 1024 * 1024;

/* Envoie une image dans Firebase Storage et renvoie son adresse publique */
async function televerser(fichier: File, dossier: string): Promise<string> {
  const ext = TYPES_IMAGE[fichier.type];
  if (!ext) throw new Error("Format d’image non accepté (JPG, PNG, WebP, AVIF ou SVG).");
  if (fichier.size > TAILLE_MAX) throw new Error("Image trop lourde : 8 Mo au maximum.");

  const objet = stockage().file(`${dossier}/${randomUUID()}.${ext}`);
  try {
    await objet.save(Buffer.from(await fichier.arrayBuffer()), {
      resumable: false,
      contentType: fichier.type,
      metadata: { cacheControl: "public, max-age=31536000, immutable" },
    });
  } catch {
    throw new Error(
      "L’image n’a pas pu être envoyée : Firebase Storage n’est peut-être pas encore activé pour ce projet."
    );
  }
  return getDownloadURL(objet);
}

/* Supprime une ancienne image si elle vient de notre espace de stockage */
async function effacerImage(url: string) {
  const m = url.match(/\/o\/([^?]+)/);
  if (!m || !url.includes(stockage().name)) return;
  await stockage().file(decodeURIComponent(m[1])).delete().catch(() => {});
}

/* Gère le champ « image » d’un formulaire : nouvelle image, retrait, ou rien */
async function imageDuFormulaire(
  f: FormData,
  nomChamp: string,
  ancienne: string,
  dossier: string
): Promise<string> {
  const fichier = f.get(nomChamp);
  if (fichier instanceof File && fichier.size > 0) {
    const url = await televerser(fichier, dossier);
    if (ancienne) await effacerImage(ancienne);
    return url;
  }
  if (f.get(`${nomChamp}-retirer`) === "on") {
    if (ancienne) await effacerImage(ancienne);
    return "";
  }
  return ancienne;
}

/* Prochaine position libre, pour ranger un nouvel élément à la fin */
async function prochainOrdre(collection: string): Promise<number> {
  const snap = await db().collection(collection).orderBy("ordre", "desc").limit(1).get();
  return snap.empty ? 1 : Number(snap.docs[0].get("ordre") || 0) + 1;
}

/* ======================================================================
   LOTS
   ====================================================================== */

export async function enregistrerLot(_: Retour, f: FormData): Promise<Retour> {
  await exigerAdmin();

  const id = champ(f, "id");
  const lot = {
    titre: champ(f, "titre"),
    categorie: champ(f, "categorie"),
    donateur: champ(f, "donateur"),
    description: champ(f, "description"),
    valeur: montant(f, "valeur"),
    miseDepart: montant(f, "miseDepart"),
    miseActuelle: montant(f, "miseActuelle"),
    nbMises: Math.round(montant(f, "nbMises")),
    lienMise: champ(f, "lienMise"),
    cadrage: champ(f, "cadrage") === "remplir" ? "remplir" : "entier",
    ordre: montant(f, "ordre"),
  };

  if (!lot.titre) return { ok: false, message: "Le lot a besoin d’un titre." };
  if (!CATEGORIES.includes(lot.categorie)) return { ok: false, message: "Choisissez une catégorie." };
  for (const [cle, nom] of [
    ["valeur", "La valeur"],
    ["miseDepart", "La mise de départ"],
    ["miseActuelle", "La mise actuelle"],
    ["nbMises", "Le nombre de mises"],
    ["ordre", "La position"],
  ] as const) {
    if (Number.isNaN(lot[cle])) return { ok: false, message: `${nom} doit être un nombre positif.` };
  }
  if (!lienValide(lot.lienMise)) {
    return { ok: false, message: "Le lien pour miser doit commencer par https://" };
  }
  // Tant que personne n’a misé, la mise actuelle suit la mise de départ
  if (lot.nbMises === 0 && lot.miseActuelle < lot.miseDepart) lot.miseActuelle = lot.miseDepart;

  const ref = id ? db().collection("lots").doc(id) : db().collection("lots").doc();
  try {
    const avant = id ? await ref.get() : null;
    if (id && !avant?.exists) return { ok: false, message: "Ce lot n’existe plus." };
    const image = await imageDuFormulaire(f, "image", String(avant?.get("image") ?? ""), `lots/${ref.id}`);
    if (!id && !lot.ordre) lot.ordre = await prochainOrdre("lots");
    await ref.set({ ...lot, image, majLe: new Date() }, { merge: true });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Enregistrement impossible." };
  }

  publier();
  if (!id) redirect(`/admin/lots/${ref.id}?cree=1`);
  return { ok: true, message: "Lot enregistré. Le site est à jour." };
}

export async function supprimerLot(f: FormData) {
  await exigerAdmin();
  const ref = db().collection("lots").doc(champ(f, "id"));
  const d = await ref.get();
  if (d.exists) {
    const image = String(d.get("image") ?? "");
    if (image) await effacerImage(image);
    await ref.delete();
    publier();
  }
  redirect("/admin/lots");
}

/* Mise à jour rapide des mises, pour le soir de l’encan */
export async function majMise(_: Retour, f: FormData): Promise<Retour> {
  await exigerAdmin();
  const miseActuelle = montant(f, "miseActuelle");
  const nbMises = Math.round(montant(f, "nbMises"));
  if (Number.isNaN(miseActuelle) || Number.isNaN(nbMises)) {
    return { ok: false, message: "Nombres invalides." };
  }
  await db().collection("lots").doc(champ(f, "id")).update({ miseActuelle, nbMises, majLe: new Date() });
  publier();
  return { ok: true, message: "Enregistré" };
}

/* ======================================================================
   COMMANDITAIRES
   ====================================================================== */

export async function enregistrerCommanditaire(_: Retour, f: FormData): Promise<Retour> {
  await exigerAdmin();

  const id = champ(f, "id");
  const c = {
    nom: champ(f, "nom"),
    palier: champ(f, "palier") as Palier,
    url: champ(f, "url"),
    mot: champ(f, "mot"),
    ordre: montant(f, "ordre"),
  };

  if (!c.nom) return { ok: false, message: "Le commanditaire a besoin d’un nom." };
  if (!PALIERS.includes(c.palier)) return { ok: false, message: "Choisissez un niveau de commandite." };
  if (!lienValide(c.url)) return { ok: false, message: "Le site web doit commencer par https://" };
  if (Number.isNaN(c.ordre)) return { ok: false, message: "La position doit être un nombre positif." };

  const ref = id ? db().collection("commanditaires").doc(id) : db().collection("commanditaires").doc();
  try {
    const avant = id ? await ref.get() : null;
    if (id && !avant?.exists) return { ok: false, message: "Ce commanditaire n’existe plus." };
    const logo = await imageDuFormulaire(f, "logo", String(avant?.get("logo") ?? ""), `commanditaires/${ref.id}`);
    if (!id && !c.ordre) c.ordre = await prochainOrdre("commanditaires");
    await ref.set({ ...c, logo, majLe: new Date() }, { merge: true });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Enregistrement impossible." };
  }

  publier();
  if (!id) redirect(`/admin/commanditaires/${ref.id}?cree=1`);
  return { ok: true, message: "Commanditaire enregistré. Le site est à jour." };
}

export async function supprimerCommanditaire(f: FormData) {
  await exigerAdmin();
  const ref = db().collection("commanditaires").doc(champ(f, "id"));
  const d = await ref.get();
  if (d.exists) {
    const logo = String(d.get("logo") ?? "");
    if (logo) await effacerImage(logo);
    await ref.delete();
    publier();
  }
  redirect("/admin/commanditaires");
}

/* ======================================================================
   IMPORT DES EXEMPLES
   Copie les lots et commanditaires de lib/donnees.ts dans Firestore,
   seulement si les collections sont vides. Ne remplace jamais rien.
   ====================================================================== */

export async function importerExemples(): Promise<Retour> {
  await exigerAdmin();
  try {
    const [lots, comms] = await Promise.all([
      db().collection("lots").limit(1).get(),
      db().collection("commanditaires").limit(1).get(),
    ]);
    const lot = db().batch();
    let n = 0;

    if (lots.empty) {
      LOTS.forEach((l, i) => {
        lot.set(db().collection("lots").doc(), { ...l, ordre: i + 1, majLe: new Date() });
        n++;
      });
    }
    if (comms.empty) {
      const avecPalier: [Palier, typeof COMMANDITAIRES.principal][] = [
        ["or", COMMANDITAIRES.principal],
        ...COMMANDITAIRES.secondaires.map((c) => ["argent", c] as [Palier, typeof c]),
        ...COMMANDITAIRES.bronze.map((c) => ["bronze", c] as [Palier, typeof c]),
        ...COMMANDITAIRES.dons.map((c) => ["don", c] as [Palier, typeof c]),
      ];
      avecPalier.forEach(([palier, c], i) => {
        lot.set(db().collection("commanditaires").doc(), {
          nom: c.nom, logo: c.logo, url: c.url, mot: c.mot ?? "", palier, ordre: i + 1, majLe: new Date(),
        });
        n++;
      });
    }

    if (!n) return { ok: false, message: "Les collections contiennent déjà des données : rien n’a été importé." };
    await lot.commit();
    publier();
    return { ok: true, message: `${n} fiches importées. Vous pouvez maintenant les modifier.` };
  } catch (e) {
    return {
      ok: false,
      message: "Import impossible : " + (e instanceof Error ? e.message.split("\n")[0] : "Firestore injoignable."),
    };
  }
}
