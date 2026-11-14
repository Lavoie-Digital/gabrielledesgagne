import { lireCommandes, type Commande } from "@/lib/billetterie";
import { adminConnecte } from "@/lib/session";

/**
 * Export CSV pour l’espace privé (ouvrable dans Excel ou Google Sheets) :
 *   /admin/export?quoi=recus     les reçus fiscaux à transmettre à la Fondation
 *   /admin/export?quoi=billets   toutes les commandes payées
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

export async function GET(request: Request) {
  if (!(await adminConnecte())) return new Response("Accès refusé", { status: 401 });

  const quoi = new URL(request.url).searchParams.get("quoi") === "recus" ? "recus" : "billets";
  const payees = (await lireCommandes()).filter((c) => c.statut === "payee");
  const a = (c: Commande) => c.adresse ?? { ligne1: "", ligne2: "", ville: "", province: "", codePostal: "", pays: "" };

  const lignes =
    quoi === "recus"
      ? [
          ligne(["Nom", "Courriel", "Adresse", "Adresse (suite)", "Ville", "Province", "Code postal", "Pays", "Billets", "Don supplémentaire", "Montant du reçu", "Date du paiement", "Numéros de billets"]),
          ...payees
            .filter((c) => c.recu)
            .map((c) =>
              ligne([c.nom, c.courriel, a(c).ligne1, a(c).ligne2, a(c).ville, a(c).province, a(c).codePostal, a(c).pays, c.qte, c.donExtra, c.montantRecu, date(c.payeeLe), c.numeros.join(" ")]),
            ),
        ]
      : [
          ligne(["Numéros de billets", "Nom", "Courriel", "Téléphone", "Billets", "Don supplémentaire", "Total payé", "Reçu demandé", "Montant du reçu", "Allergies", "Date du paiement", "Paiement Stripe"]),
          ...payees.map((c) =>
            ligne([c.numeros.join(" "), c.nom, c.courriel, c.telephone, c.qte, c.donExtra, c.total, c.recu ? "Oui" : "Non", c.montantRecu, c.allergies, date(c.payeeLe), c.paiementId]),
          ),
        ];

  // Le BOM (﻿) fait reconnaître les accents par Excel
  return new Response("﻿" + lignes.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pour-clement-${quoi}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
