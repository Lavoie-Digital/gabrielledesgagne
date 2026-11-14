import "server-only";

import { CONFIG } from "@/lib/donnees";

/**
 * L’envoi de courriels par SendGrid (API v3), côté serveur seulement.
 *
 *   SENDGRID_API_KEY       la clé d’API (SG.…), droit « Mail Send » suffisant
 *   SENDGRID_FROM          l’adresse d’expédition, vérifiée dans SendGrid
 *                          (Settings > Sender Authentication)
 *   SENDGRID_FROM_NOM      le nom affiché (facultatif, « Pour Clément » par défaut)
 *
 * Les réponses des personnes arrivent à l’adresse de contact de lib/donnees.ts.
 */

const CLE = process.env.SENDGRID_API_KEY?.trim();
const DE = process.env.SENDGRID_FROM?.trim();
const DE_NOM = process.env.SENDGRID_FROM_NOM?.trim() || "Pour Clément";

export const courrielConfigure = Boolean(CLE && DE);

export async function envoyerCourriel(m: {
  a: string;
  nom?: string;
  sujet: string;
  html: string;
  texte: string;
}): Promise<void> {
  if (!CLE || !DE) throw new Error("SendGrid n’est pas configuré : SENDGRID_API_KEY et SENDGRID_FROM.");

  const reponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${CLE}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: m.a, ...(m.nom ? { name: m.nom } : {}) }] }],
      from: { email: DE, name: DE_NOM },
      reply_to: { email: CONFIG.contact.courriel, name: CONFIG.contact.nom },
      subject: m.sujet,
      content: [
        { type: "text/plain", value: m.texte },
        { type: "text/html", value: m.html },
      ],
      // Courriel transactionnel : pas de pixel de suivi ni de liens réécrits
      tracking_settings: {
        click_tracking: { enable: false, enable_text: false },
        open_tracking: { enable: false },
      },
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!reponse.ok) {
    const detail = await reponse.text().catch(() => "");
    throw new Error(`SendGrid a refusé l’envoi (${reponse.status}) ${detail.slice(0, 300)}`);
  }
}
