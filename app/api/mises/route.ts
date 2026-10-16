import { CONFIG, LOTS } from "@/lib/donnees";

/**
 * Fournit les montants des mises à la page d’affichage /direct.
 *
 * Deux cas :
 *   - « sourceMises » est vide  → on renvoie les montants de lib/donnees.ts
 *   - « sourceMises » est remplie → on va lire la feuille Google (ou l’API)
 *
 * La lecture se fait ici, côté serveur, et non dans le navigateur : ça évite
 * les blocages CORS de Google et ça permet de décoder le CSV proprement.
 */

export const dynamic = "force-dynamic"; // jamais de cache : c’est du direct

export type LigneMise = {
  titre: string;
  mise: number;
  nbMises: number;
  categorie?: string;
  donateur?: string;
  valeur?: number;
  miseDepart?: number;
  connu: boolean; // true si le titre correspond à un lot de lib/donnees.ts
};

// Marques d'accent laissees par normalize("NFD") : plage U+0300 a U+036F.
// Construite depuis une chaine ASCII pour rester lisible dans le fichier.
const ACCENTS = new RegExp("[\\u0300-\\u036f]", "g");

/* Compare deux titres sans tenir compte des accents, de la casse ni des espaces */
function normaliser(s: string): string {
  return s
    .normalize("NFD")
    .replace(ACCENTS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/* Convertit « 1 250,50 $ » ou « 1,250.50 » en nombre */
function nombre(brut: string): number {
  if (!brut) return 0;
  // On ne garde que les chiffres et les separateurs. Tout le reste saute :
  // espaces normaux ou insecables, signe de dollar, texte parasite.
  let s = String(brut).replace(/[^0-9.,-]/g, "");
  if (!s) return 0;
  // Si on a une virgule ET un point, le dernier des deux est la decimale
  const dVirgule = s.lastIndexOf(",");
  const dPoint = s.lastIndexOf(".");
  if (dVirgule > -1 && dPoint > -1) {
    s = dVirgule > dPoint
      ? s.replace(/\./g, "").replace(",", ".")
      : s.replace(/,/g, "");
  } else if (dVirgule > -1) {
    // Virgule seule : decimale en francais, sauf si elle separe les milliers
    s = /,\d{3}$/.test(s) ? s.replace(",", "") : s.replace(",", ".");
  }
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
}

/* Découpe un CSV en tenant compte des guillemets et des retours de ligne */
function lireCSV(texte: string): string[][] {
  const lignes: string[][] = [];
  let champ = "";
  let ligne: string[] = [];
  let dansGuillemets = false;

  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (dansGuillemets) {
      if (c === '"') {
        if (texte[i + 1] === '"') { champ += '"'; i++; }
        else dansGuillemets = false;
      } else champ += c;
      continue;
    }
    if (c === '"') { dansGuillemets = true; continue; }
    if (c === ",") { ligne.push(champ); champ = ""; continue; }
    if (c === "\r") continue;
    if (c === "\n") { ligne.push(champ); lignes.push(ligne); ligne = []; champ = ""; continue; }
    champ += c;
  }
  if (champ !== "" || ligne.length) { ligne.push(champ); lignes.push(ligne); }
  return lignes.filter((l) => l.some((v) => v.trim() !== ""));
}

/* Retrouve l’index d’une colonne à partir de plusieurs noms possibles */
function colonne(entetes: string[], noms: string[]): number {
  const norm = entetes.map(normaliser);
  for (const nom of noms) {
    const i = norm.findIndex((h) => h === normaliser(nom));
    if (i > -1) return i;
  }
  // Deuxième passage plus souple : la colonne contient le mot
  for (const nom of noms) {
    const i = norm.findIndex((h) => h.includes(normaliser(nom)));
    if (i > -1) return i;
  }
  return -1;
}

/* Les montants tels qu’écrits dans lib/donnees.ts */
function depuisLeFichier(): LigneMise[] {
  return LOTS.map((l) => ({
    titre: l.titre,
    mise: l.miseActuelle,
    nbMises: l.nbMises,
    categorie: l.categorie,
    donateur: l.donateur,
    valeur: l.valeur,
    miseDepart: l.miseDepart,
    connu: true,
  }));
}

/* Complète une ligne externe avec les informations du lot correspondant */
function enrichir(titre: string, mise: number, nbMises: number): LigneMise {
  const lot = LOTS.find((l) => normaliser(l.titre) === normaliser(titre));
  if (!lot) return { titre, mise, nbMises, connu: false };
  return {
    titre: lot.titre,
    mise,
    nbMises,
    categorie: lot.categorie,
    donateur: lot.donateur,
    valeur: lot.valeur,
    miseDepart: lot.miseDepart,
    connu: true,
  };
}

export async function GET() {
  const source = CONFIG.encan.sourceMises;

  if (!source) {
    return Response.json({
      source: "fichier",
      maj: new Date().toISOString(),
      lots: depuisLeFichier(),
    });
  }

  try {
    const reponse = await fetch(source, {
      cache: "no-store",
      headers: { "User-Agent": "PourClement/1.0" },
    });

    if (!reponse.ok) {
      throw new Error(`la source a répondu ${reponse.status}`);
    }

    const type = reponse.headers.get("content-type") || "";
    const texte = await reponse.text();
    let lots: LigneMise[];

    if (type.includes("json") || texte.trimStart().startsWith("[") || texte.trimStart().startsWith("{")) {
      const donnees = JSON.parse(texte);
      const tableau: Record<string, unknown>[] = Array.isArray(donnees)
        ? donnees
        : Array.isArray((donnees as Record<string, unknown>).lots)
          ? ((donnees as Record<string, unknown>).lots as Record<string, unknown>[])
          : [];
      lots = tableau.map((o) =>
        enrichir(
          String(o.titre ?? o.lot ?? ""),
          nombre(String(o.mise ?? o.miseActuelle ?? 0)),
          Math.round(nombre(String(o.nbMises ?? o.mises ?? 0)))
        )
      );
    } else {
      const lignes = lireCSV(texte);
      if (!lignes.length) throw new Error("la feuille est vide");
      const entetes = lignes[0];
      const iTitre = colonne(entetes, ["titre", "lot", "nom", "description"]);
      const iMise = colonne(entetes, ["mise actuelle", "mise", "montant"]);
      const iNb = colonne(entetes, ["nombre de mises", "nb mises", "mises", "nombre"]);

      if (iTitre === -1 || iMise === -1) {
        throw new Error(
          "colonnes introuvables : il faut au moins une colonne « Titre » et une colonne « Mise »"
        );
      }

      lots = lignes.slice(1).map((l) =>
        enrichir(
          (l[iTitre] || "").trim(),
          nombre(l[iMise] || "0"),
          iNb > -1 ? Math.round(nombre(l[iNb] || "0")) : 0
        )
      ).filter((l) => l.titre !== "");
    }

    return Response.json({
      source: "externe",
      maj: new Date().toISOString(),
      lots,
    });
  } catch (e) {
    // On renvoie quand même les montants du fichier pour que l’écran ne se
    // vide pas au milieu de la soirée, avec l’erreur pour pouvoir la corriger.
    return Response.json({
      source: "fichier",
      maj: new Date().toISOString(),
      erreur: e instanceof Error ? e.message : "source illisible",
      lots: depuisLeFichier(),
    });
  }
}
