import { lireCommandes, type Adresse } from "@/lib/billetterie";
import { lireDons } from "@/lib/dons";
import { adminConnecte } from "@/lib/session";

/**
 * Export CSV pour l’espace privé (ouvrable dans Excel ou Google Sheets) :
 *   /admin/export?quoi=recus     les reçus fiscaux à transmettre à la Fondation
 *                                (billets et dons en ligne)
 *   /admin/export?quoi=billets   toutes les commandes de billets payées
 *   /admin/export?quoi=dons      tous les dons en ligne payés
 */

export const dynamic = "force-dynamic";

const cellule = (v: string | number) => {
  const s = String(v);
  // Neutralise les formules (=, +, -, @) qu’un tableur exécuterait
  const sur = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${sur.replace(/"/g, '""')}"`;
};

const ligne = (vals: (string | number)[]) => vals.map(cellule).join(";");

const date = (ms: number | null) => (ms ? new Date(ms).toISOString().slice(0, 10) : "");

const VIDE: Adresse = { ligne1: "", ligne2: "", ville: "", province: "", codePostal: "", pays: "" };

export async function GET(request: Request) {
  if (!(await adminConnecte())) return new Response("Accès refusé", { status: 401 });

  const demande = new URL(request.url).searchParams.get("quoi");
  const quoi = demande === "recus" || demande === "dons" ? demande : "billets";
  const [commandes, dons] = await Promise.all([lireCommandes(), lireDons()]);
  const payees = commandes.filter((c) => c.statut === "payee");
  const donsPayes = dons.filter((d) => d.statut === "payee");

  let lignes: string[];

  if (quoi === "recus") {
    const recus = [
      ...payees.filter((c) => c.recu).map((c) => ({
        prenom: c.prenom || c.nom, nom: c.nomFamille, courriel: c.courriel, a: c.adresse ?? VIDE,
        provenance: "Billets", billets: c.qte, don: c.donExtra, montant: c.montantRecu, le: c.payeeLe,
        reference: c.numeros.join(" "),
      })),
      ...donsPayes.filter((d) => d.recu).map((d) => ({
        prenom: d.prenom || d.nom, nom: d.nomFamille, courriel: d.courriel, a: d.adresse ?? VIDE,
        provenance: "Don en ligne", billets: 0, don: d.montant, montant: d.montant, le: d.payeeLe,
        reference: d.paiementId,
      })),
    ].sort((x, y) => (x.le ?? 0) - (y.le ?? 0));

    lignes = [
      ligne(["Prénom", "Nom", "Courriel", "Adresse", "Adresse (suite)", "Ville", "Province", "Code postal", "Pays", "Provenance", "Billets", "Don", "Montant du reçu", "Date du paiement", "Référence"]),
      ...recus.map((r) =>
        ligne([r.prenom, r.nom, r.courriel, r.a.ligne1, r.a.ligne2, r.a.ville, r.a.province, r.a.codePostal, r.a.pays, r.provenance, r.billets, r.don, r.montant, date(r.le), r.reference]),
      ),
    ];
  } else if (quoi === "dons") {
    lignes = [
      ligne(["Prénom", "Nom", "Courriel", "Don", "Reçu demandé", "Date du paiement", "Paiement Stripe"]),
      ...donsPayes.map((d) =>
        ligne([d.prenom || d.nom, d.nomFamille, d.courriel, d.montant, d.recu ? "Oui" : "Non", date(d.payeeLe), d.paiementId]),
      ),
    ];
  } else {
    lignes = [
      ligne(["Numéros de billets", "Prénom", "Nom", "Courriel", "Téléphone", "Billets", "Don supplémentaire", "Total payé", "Reçu demandé", "Montant du reçu", "Allergies", "Date du paiement", "Paiement Stripe"]),
      ...payees.map((c) =>
        ligne([c.numeros.join(" "), c.prenom || c.nom, c.nomFamille, c.courriel, c.telephone, c.qte, c.donExtra, c.total, c.recu ? "Oui" : "Non", c.montantRecu, c.allergies, date(c.payeeLe), c.paiementId]),
      ),
    ];
  }

  // Le BOM (﻿) fait reconnaître les accents par Excel
  return new Response("﻿" + lignes.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pour-clement-${quoi}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
