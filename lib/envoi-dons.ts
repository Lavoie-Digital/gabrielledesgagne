import "server-only";

import { courrielConfigure, envoyerCourriel } from "@/lib/courriel";
import { CONFIG, argent } from "@/lib/donnees";
import { noterEnvoiDon, reserverEnvoiDon, type Don } from "@/lib/dons";

/**
 * Le courriel de remerciement envoyé après un don en ligne.
 * Même fonctionnement que l’envoi des billets (lib/envoi-billets.ts).
 */
export async function envoyerRemerciementDon(
  id: string,
  forcer = false,
): Promise<"envoye" | "rien-a-faire" | "non-configure"> {
  if (!courrielConfigure) return "non-configure";
  const don = await reserverEnvoiDon(id, forcer);
  if (!don) return "rien-a-faire";

  try {
    await envoyerCourriel({ a: don.courriel, nom: don.nom, ...courrielDon(don) });
  } catch (e) {
    await noterEnvoiDon(id, e instanceof Error ? e.message : String(e)).catch(() => {});
    throw e;
  }
  await noterEnvoiDon(id);
  return "envoye";
}

const echapper = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function courrielDon(d: Don) {
  const { contact } = CONFIG;
  const prenom = d.prenom || (d.nom.trim().split(/\s+/)[0] ?? "");
  const sujet = `Merci pour votre don de ${argent(d.montant)} en mémoire de Clément`;
  const recu = d.recu
    ? `Votre reçu fiscal de ${argent(d.montant)} sera émis par la Fondation En Cœur après la soirée du 12 novembre, une fois les fonds remis, au nom et à l’adresse indiqués lors du paiement.`
    : "";

  const texte = [
    `Bonjour${prenom ? ` ${prenom}` : ""},`,
    "",
    `Merci du fond du cœur pour votre don de ${argent(d.montant)} à la Fondation En Cœur, en mémoire de Clément.`,
    "",
    "Votre geste aide des familles qui, en ce moment même, veillent au chevet d’un enfant au cœur fragile : un peu de répit, un peu de chaleur, et la certitude qu’elles ne portent pas cela seules.",
    ...(recu ? ["", recu] : []),
    "",
    `Une question ? Répondez simplement à ce courriel, ou écrivez à ${contact.courriel}.`,
    "",
    `${contact.nom}, maman de Clément`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="fr-CA">
<body style="margin:0;padding:0;background:#F5EFE5;font-family:Georgia,'Times New Roman',serif;color:#2E3A34;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5EFE5;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #E7E1D7;">
        <tr><td style="background:#3E4C45;color:#ffffff;text-align:center;padding:32px 24px;">
          <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#A3B5A8;font-weight:700;">En mémoire de Clément</div>
          <div style="font-size:40px;line-height:1.2;margin:14px 0 8px;">${echapper(argent(d.montant))}</div>
          <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#A3B5A8;font-weight:700;">Don à la Fondation En Cœur</div>
        </td></tr>
        <tr><td style="padding:28px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#4A4B45;">
          <p style="margin:0 0 14px;">Bonjour${prenom ? ` ${echapper(prenom)}` : ""},</p>
          <p style="margin:0 0 14px;">Merci du fond du cœur pour votre don, en mémoire de Clément.</p>
          <p style="margin:0 0 14px;">Votre geste aide des familles qui, en ce moment même, veillent au chevet d’un enfant au cœur fragile : un peu de répit, un peu de chaleur, et la certitude qu’elles ne portent pas cela seules.</p>
          ${recu ? `<p style="margin:0 0 14px;background:#F5EFE5;border-radius:10px;padding:12px 14px;">${echapper(recu)}</p>` : ""}
          <p style="margin:0 0 14px;">Une question ? Répondez simplement à ce courriel, ou écrivez à <a href="mailto:${echapper(contact.courriel)}" style="color:#9E6547;">${echapper(contact.courriel)}</a>.</p>
          <p style="margin:0;font-family:Georgia,serif;font-style:italic;color:#2E3A34;">${echapper(contact.nom)}, maman de Clément</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { sujet, html, texte };
}
