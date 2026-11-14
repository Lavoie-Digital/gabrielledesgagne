import "server-only";

import { noterEnvoi, reserverEnvoi, type Commande } from "@/lib/billetterie";
import { courrielConfigure, envoyerCourriel } from "@/lib/courriel";
import { CONFIG, argent } from "@/lib/donnees";

/**
 * Le courriel « Vos billets » envoyé dès que le paiement est confirmé.
 *
 * Renvoie :
 *   "envoye"         le courriel est parti
 *   "rien-a-faire"   déjà envoyé, envoi en cours ailleurs, ou commande non payée
 *   "non-configure"  SendGrid n’est pas encore branché
 * Lance une erreur si SendGrid refuse l’envoi (l’erreur est aussi notée
 * sur la commande, visible dans l’espace privé).
 */
export async function envoyerBillets(id: string, forcer = false): Promise<"envoye" | "rien-a-faire" | "non-configure"> {
  if (!courrielConfigure) return "non-configure";
  const commande = await reserverEnvoi(id, forcer);
  if (!commande) return "rien-a-faire";

  try {
    await envoyerCourriel({ a: commande.courriel, nom: commande.nom, ...courrielBillets(commande) });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await noterEnvoi(id, message).catch(() => {});
    throw e;
  }
  await noterEnvoi(id);
  return "envoye";
}

/* ----------------------------------------------------------------------
   Le contenu du courriel
   ---------------------------------------------------------------------- */

const echapper = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function courrielBillets(c: Commande) {
  const { evenement, contact, billet } = CONFIG;
  const n = c.qte;
  const prenom = c.prenom || (c.nom.trim().split(/\s+/)[0] ?? "");
  const sujet = `Vos ${n > 1 ? `${n} billets` : "billet"} pour la soirée Pour Clément (${c.numeros.join(", ")})`;
  const recu = c.recu
    ? `Votre reçu fiscal de ${argent(c.montantRecu)} (${argent(billet.montantRecuParBillet)} par billet${c.donExtra > 0 ? " + votre don" : ""}) sera émis par la Fondation En Cœur après la soirée, une fois les fonds remis, au nom et à l’adresse indiqués lors du paiement.`
    : "";

  const details: [string, string][] = [
    ["Date", evenement.date],
    ["Heure", evenement.heure],
    ["Lieu", evenement.lieu],
    ["Adresse", evenement.adresse],
    ["Tenue", evenement.tenue],
    ["Total payé", argent(c.total)],
    ...(c.donExtra > 0 ? ([["Dont don supplémentaire", argent(c.donExtra)]] as [string, string][]) : []),
  ];

  const texte = [
    `Bonjour${prenom ? ` ${prenom}` : ""},`,
    "",
    `Merci ! ${n > 1 ? `Vos ${n} billets sont confirmés` : "Votre billet est confirmé"} pour la soirée-bénéfice Pour Clément.`,
    "",
    `Numéro${n > 1 ? "s" : ""} de billet : ${c.numeros.join(", ")}`,
    "",
    ...details.map(([k, v]) => `${k} : ${v}`),
    "",
    "À l’accueil, il suffit de donner votre nom ou un numéro de billet.",
    ...(recu ? ["", recu] : []),
    "",
    `Une question ? Répondez simplement à ce courriel, ou écrivez à ${contact.courriel}.`,
    "",
    "Merci d’être là pour Clément, et pour toutes ces familles.",
    `${contact.nom}, maman de Clément`,
  ].join("\n");

  const lignes = details
    .map(
      ([k, v]) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #E7E1D7;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#69756E;font-weight:700;">${echapper(k)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #E7E1D7;text-align:right;font-weight:700;color:#2E3A34;">${echapper(v)}</td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="fr-CA">
<body style="margin:0;padding:0;background:#F5EFE5;font-family:Georgia,'Times New Roman',serif;color:#2E3A34;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5EFE5;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E7E1D7;">
        <tr><td style="background:#3E4C45;color:#ffffff;text-align:center;padding:32px 24px;">
          <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#A3B5A8;font-weight:700;">Soirée-bénéfice Pour Clément</div>
          <div style="font-size:34px;line-height:1.25;margin:14px 0 10px;">${c.numeros.map(echapper).join(" &nbsp; ")}</div>
          <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#A3B5A8;font-weight:700;">${n} ${n > 1 ? "billets" : "billet"} · ${echapper(c.nom)}</div>
        </td></tr>
        <tr><td style="padding:28px 28px 8px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;">
          <p style="margin:0 0 14px;">Bonjour${prenom ? ` ${echapper(prenom)}` : ""},</p>
          <p style="margin:0 0 14px;">Merci ! ${n > 1 ? `Vos ${n} billets sont confirmés` : "Votre billet est confirmé"}. À l’accueil, il suffit de donner votre nom ou un numéro de billet.</p>
        </td></tr>
        <tr><td style="padding:0 28px;font-family:Arial,sans-serif;font-size:14px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${lignes}</table>
        </td></tr>
        <tr><td style="padding:20px 28px 28px;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#4A4B45;">
          ${recu ? `<p style="margin:0 0 14px;background:#F5EFE5;border-radius:10px;padding:12px 14px;">${echapper(recu)}</p>` : ""}
          <p style="margin:0 0 14px;">Une question ? Répondez simplement à ce courriel, ou écrivez à <a href="mailto:${echapper(contact.courriel)}" style="color:#9E6547;">${echapper(contact.courriel)}</a>.</p>
          <p style="margin:0;font-family:Georgia,serif;font-style:italic;">Merci d’être là pour Clément, et pour toutes ces familles.<br>${echapper(contact.nom)}, maman de Clément</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { sujet, html, texte };
}
