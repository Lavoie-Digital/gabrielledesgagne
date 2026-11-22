import "server-only";

import type { Adresse } from "@/lib/billetterie";
import { CONFIG } from "@/lib/donnees";

/**
 * Tout ce qui touche le reçu fiscal, commun aux dons et aux billets :
 * la lecture du choix Personnel / Corporatif, et le bloc du courriel qui
 * rappelle que le reçu est transmis après la soirée, avec les coordonnées
 * qui y figureront.
 */

export type TypeDonateur = "personnel" | "corporatif";

export type Donateur = { type: TypeDonateur; entreprise: string; poste: string };

/* Lu depuis le formulaire (composant ChoixDonateur) ; null si incomplet */
export function lireDonateur(form: FormData): Donateur | null {
  const type: TypeDonateur = form.get("type") === "corporatif" ? "corporatif" : "personnel";
  if (type === "personnel") return { type, entreprise: "", poste: "" };
  const champ = (cle: string) => String(form.get(cle) ?? "").trim().slice(0, 120);
  const entreprise = champ("entreprise");
  const poste = champ("poste");
  return entreprise && poste ? { type, entreprise, poste } : null;
}

export const MESSAGE_CORPORATIF_INCOMPLET =
  "En corporatif, indiquez le nom de l’entreprise et votre poste.";

/* « 12 novembre 2027 » */
export const dateSoiree = () => CONFIG.evenement.date.replace(/^\S+\s/, "");

const echapper = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* Le bloc « reçu fiscal » du courriel, en texte et en HTML */
export function blocRecu(p: {
  montant: string; // déjà formaté, ex. « 150 $ »
  precision?: string; // ex. « 60 $ par billet + votre don »
  nom: string;
  entreprise: string;
  poste: string;
  adresse: Adresse | null;
}) {
  const titre = "Votre reçu fiscal sera transmis après la soirée";
  const texte = `Le reçu fiscal de ${p.montant}${p.precision ? ` (${p.precision})` : ""} est émis par la Fondation En Cœur après la soirée du ${dateSoiree()}, une fois les fonds remis. Vous ne le recevrez donc pas tout de suite : vous n’avez rien d’autre à faire d’ici là.`;
  const verif = "Il sera fait aux coordonnées suivantes. Si une information est inexacte, répondez à ce courriel pour la corriger :";
  const a = p.adresse;
  const coordonnees = [
    p.nom,
    p.entreprise ? [p.poste, p.entreprise].filter(Boolean).join(", ") : "",
    a?.ligne1 ?? "",
    a?.ligne2 ?? "",
    [a?.ville, a?.province, a?.codePostal].filter(Boolean).join(", "),
  ].filter(Boolean);

  return {
    texte: [titre.toUpperCase(), texte, "", verif, ...coordonnees.map((l) => `  ${l}`)],
    html: `<div style="margin:0 0 14px;background:#F5EFE5;border-radius:10px;padding:14px 16px;">
            <p style="margin:0 0 8px;font-weight:700;color:#2E3A34;">${echapper(titre)}</p>
            <p style="margin:0 0 10px;">${echapper(texte)}</p>
            <p style="margin:0 0 6px;font-size:13px;">${echapper(verif)}</p>
            <p style="margin:0;font-size:13px;color:#2E3A34;">${coordonnees.map(echapper).join("<br>")}</p>
          </div>`,
  };
}
