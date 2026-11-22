import { basculerBilletterie } from "@/app/admin/(prive)/billets/actions";
import { billetterieOuverte, lireCommandes, placesEnCoursDePaiement, type Adresse, type Commande } from "@/lib/billetterie";
import { lireDons, type Don } from "@/lib/dons";
import { CONFIG, argent } from "@/lib/donnees";
import BoutonRenvoyer from "@/components/admin/BoutonRenvoyer";
import { courrielConfigure } from "@/lib/courriel";
import { stripeConfigure } from "@/lib/stripe";

export const metadata = { title: "Billets, dons et reçus" };
export const dynamic = "force-dynamic";

const date = (ms: number | null) =>
  ms
    ? new Date(ms).toLocaleString("fr-CA", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Toronto",
      })
    : "";

const adresse = (a: Adresse | null) =>
  a ? [a.ligne1, a.ligne2, `${a.ville} ${a.province} ${a.codePostal}`.trim(), a.pays === "CA" ? "" : a.pays].filter(Boolean).join(", ") : "";

export default async function Billets() {
  let commandes: Commande[] = [];
  let donsEnLigne: Don[] = [];
  let ouverte = false;
  let erreur = "";
  try {
    [commandes, donsEnLigne, ouverte] = await Promise.all([lireCommandes(), lireDons(), billetterieOuverte()]);
  } catch (e) {
    erreur = e instanceof Error ? e.message.split("\n")[0] : String(e);
  }

  const payees = commandes.filter((c) => c.statut === "payee");
  const vendus = payees.reduce((s, c) => s + c.qte, 0);
  const reserves = placesEnCoursDePaiement(commandes);
  const revenus = payees.reduce((s, c) => s + c.total, 0);
  const dons = payees.filter((c) => c.donExtra > 0);
  const totalDons = dons.reduce((s, c) => s + c.donExtra, 0);
  const donsPayes = donsEnLigne.filter((d) => d.statut === "payee");
  const totalDonsEnLigne = donsPayes.reduce((s, d) => s + d.montant, 0);

  // Tous les reçus à faire émettre : billets (montant par billet + don) et dons en ligne
  const recus = [
    ...payees.filter((c) => c.recu).map((c) => ({
      id: c.id, provenance: "Billets", nom: c.entreprise ? `${c.nom} (${c.entreprise})` : c.nom, courriel: c.courriel, adresse: c.adresse,
      detail: `${c.qte} billet${c.qte > 1 ? "s" : ""}${c.donExtra ? ` + don ${argent(c.donExtra)}` : ""}`,
      montant: c.montantRecu, le: c.payeeLe ?? 0,
    })),
    ...donsPayes.filter((d) => d.recu).map((d) => ({
      id: d.id, provenance: "Don", nom: d.entreprise ? `${d.nom} (${d.entreprise})` : d.nom, courriel: d.courriel, adresse: d.adresse,
      detail: "Don en ligne", montant: d.montant, le: d.payeeLe ?? 0,
    })),
  ].sort((a, b) => a.le - b.le);
  const totalRecus = recus.reduce((s, r) => s + r.montant, 0);

  return (
    <>
      <div className="adm-titre">
        <h1>Billets, dons et reçus</h1>
        {(payees.length > 0 || donsPayes.length > 0) && (
          <div className="adm-rangee" style={{ marginTop: 0 }}>
            <a className="adm-btn" href="/admin/export?quoi=billets">Exporter les billets (CSV)</a>
            <a className="adm-btn" href="/admin/export?quoi=dons">Exporter les dons (CSV)</a>
            <a className="adm-btn adm-btn--plein" href="/admin/export?quoi=recus">Exporter les reçus (CSV)</a>
          </div>
        )}
      </div>

      <section className="adm-carte" style={{ marginBottom: "1.2rem", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <h2 style={{ margin: 0 }}>
            Billetterie :{" "}
            <span style={{ color: ouverte ? "#2F5A3B" : "#9A3B2E" }}>{ouverte ? "ouverte" : "fermée"}</span>
          </h2>
          <p className="adm-discret" style={{ margin: ".3rem 0 0" }}>
            {ouverte
              ? "Le public peut acheter des billets sur /billets."
              : "Le public voit « Billetterie bientôt ouverte » et ne peut rien acheter. Les dons restent possibles."}
          </p>
        </div>
        <form action={basculerBilletterie}>
          <input type="hidden" name="ouverte" value={ouverte ? "non" : "oui"} />
          <button type="submit" className={ouverte ? "adm-btn adm-btn--danger" : "adm-btn adm-btn--plein"} disabled={Boolean(erreur)}>
            {ouverte ? "Fermer la billetterie" : "Ouvrir la billetterie"}
          </button>
        </form>
      </section>

      {!stripeConfigure && (
        <div className="adm-alerte" style={{ marginBottom: "1.2rem" }}>
          <p><b>Stripe n’est pas encore branché.</b> La billetterie affiche « bientôt ouverte » tant
            que STRIPE_SECRET_KEY et STRIPE_WEBHOOK_SECRET ne sont pas configurés.</p>
        </div>
      )}
      {!courrielConfigure && (
        <div className="adm-alerte" style={{ marginBottom: "1.2rem" }}>
          <p><b>SendGrid n’est pas encore branché.</b> Les numéros de billets s’affichent à
            l’écran après le paiement, mais aucun courriel n’est envoyé tant que
            SENDGRID_API_KEY et SENDGRID_FROM ne sont pas configurés.</p>
        </div>
      )}
      {erreur && (
        <div className="adm-alerte" style={{ marginBottom: "1.2rem" }}>
          <p><b>Firestore ne répond pas.</b> {erreur}</p>
        </div>
      )}

      <div className="adm-chiffres">
        <div><b>{vendus} / {CONFIG.billet.limite}</b><span>billets vendus en ligne</span></div>
        <div><b>{reserves}</b><span>places en cours de paiement</span></div>
        <div><b>{argent(revenus + totalDonsEnLigne)}</b><span>encaissé en ligne (billets et dons)</span></div>
        <div><b>{donsPayes.length}</b><span>dons en ligne · {argent(totalDonsEnLigne)}</span></div>
        <div><b>{dons.length}</b><span>dons ajoutés aux billets · {argent(totalDons)}</span></div>
        <div><b>{recus.length}</b><span>reçus fiscaux à émettre · {argent(totalRecus)}</span></div>
      </div>

      <section className="adm-section">
        <h2>Reçus fiscaux à faire émettre par la Fondation</h2>
        <p className="adm-discret" style={{ maxWidth: "70ch" }}>
          Billets : {argent(CONFIG.billet.montantRecuParBillet)} par billet, plus le don ajouté.
          Dons en ligne : le montant complet du don. À transmettre à la Fondation En Cœur après la soirée, avec la remise des fonds.
        </p>
        {recus.length === 0 ? (
          <p className="adm-discret">Aucune demande de reçu pour l’instant.</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Adresse</th>
                <th>Provenance</th>
                <th className="nb">Montant du reçu</th>
              </tr>
            </thead>
            <tbody>
              {recus.map((r) => (
                <tr key={r.id}>
                  <td>{r.nom}<small>{r.courriel}</small></td>
                  <td>{adresse(r.adresse)}</td>
                  <td>{r.provenance}<small>{r.detail}</small></td>
                  <td className="nb"><b>{argent(r.montant)}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="adm-section">
        <h2>Dons en ligne (page « Faire un don »)</h2>
        {donsPayes.length === 0 ? (
          <p className="adm-discret">Aucun don en ligne pour l’instant.</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Courriel</th>
                <th>Reçu demandé</th>
                <th className="nb">Don</th>
                <th>Courriel de remerciement</th>
              </tr>
            </thead>
            <tbody>
              {donsPayes.map((d) => (
                <tr key={d.id}>
                  <td>
                    {d.nom}
                    {d.typeDonateur === "corporatif" && (
                      <small>{[d.poste, d.entreprise].filter(Boolean).join(", ")}</small>
                    )}
                    <small>{date(d.payeeLe)}</small>
                  </td>
                  <td>{d.courriel}{d.telephone && <small>{d.telephone}</small>}</td>
                  <td>{d.recu ? "Oui" : "Non"}</td>
                  <td className="nb">{argent(d.montant)}</td>
                  <td>
                    {d.courrielEnvoyeLe ? (
                      <small>Envoyé {date(d.courrielEnvoyeLe)}</small>
                    ) : d.courrielErreur ? (
                      <small style={{ color: "#7A3226" }} title={d.courrielErreur}>Échec de l’envoi</small>
                    ) : (
                      <small>Pas encore envoyé</small>
                    )}
                    {courrielConfigure && <BoutonRenvoyer id={d.id} type="don" dejaEnvoye={Boolean(d.courrielEnvoyeLe)} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="adm-section">
        <h2>Dons ajoutés aux billets</h2>
        {dons.length === 0 ? (
          <p className="adm-discret">Aucun don supplémentaire pour l’instant.</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Courriel</th>
                <th>Reçu demandé</th>
                <th className="nb">Don</th>
              </tr>
            </thead>
            <tbody>
              {dons.map((c) => (
                <tr key={c.id}>
                  <td>{c.nom}</td>
                  <td>{c.courriel}</td>
                  <td>{c.recu ? "Oui" : "Non"}</td>
                  <td className="nb">{argent(c.donExtra)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="adm-section">
        <h2>Toutes les commandes payées</h2>
        {payees.length === 0 ? (
          <p className="adm-discret">Aucun billet vendu pour l’instant.</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Numéros</th>
                <th>Nom</th>
                <th>Allergies</th>
                <th className="nb">Billets</th>
                <th className="nb">Payé</th>
                <th>Courriel des billets</th>
              </tr>
            </thead>
            <tbody>
              {payees.map((c) => (
                <tr key={c.id}>
                  <td><b>{c.numeros.join(", ")}</b><small>{date(c.payeeLe)}</small></td>
                  <td>
                    {c.nom}
                    {c.typeAcheteur === "corporatif" && (
                      <small>{[c.poste, c.entreprise].filter(Boolean).join(", ")}</small>
                    )}
                    <small>{c.courriel}{c.telephone ? ` · ${c.telephone}` : ""}</small>
                  </td>
                  <td>{c.allergies || "—"}</td>
                  <td className="nb">{c.qte}</td>
                  <td className="nb">{argent(c.total)}</td>
                  <td>
                    {c.courrielEnvoyeLe ? (
                      <small>Envoyé {date(c.courrielEnvoyeLe)}</small>
                    ) : c.courrielErreur ? (
                      <small style={{ color: "#7A3226" }} title={c.courrielErreur}>Échec de l’envoi</small>
                    ) : (
                      <small>Pas encore envoyé</small>
                    )}
                    {courrielConfigure && <BoutonRenvoyer id={c.id} dejaEnvoye={Boolean(c.courrielEnvoyeLe)} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
