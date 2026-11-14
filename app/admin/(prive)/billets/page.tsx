import { lireCommandes, placesEnCoursDePaiement, type Adresse, type Commande } from "@/lib/billetterie";
import { CONFIG, argent } from "@/lib/donnees";
import { stripeConfigure } from "@/lib/stripe";

export const metadata = { title: "Billets et reçus" };
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
  let erreur = "";
  try {
    commandes = await lireCommandes();
  } catch (e) {
    erreur = e instanceof Error ? e.message.split("\n")[0] : String(e);
  }

  const payees = commandes.filter((c) => c.statut === "payee");
  const vendus = payees.reduce((s, c) => s + c.qte, 0);
  const reserves = placesEnCoursDePaiement(commandes);
  const revenus = payees.reduce((s, c) => s + c.total, 0);
  const dons = payees.filter((c) => c.donExtra > 0);
  const totalDons = dons.reduce((s, c) => s + c.donExtra, 0);
  const recus = payees.filter((c) => c.recu);
  const totalRecus = recus.reduce((s, c) => s + c.montantRecu, 0);

  return (
    <>
      <div className="adm-titre">
        <h1>Billets et reçus</h1>
        {payees.length > 0 && (
          <div className="adm-rangee" style={{ marginTop: 0 }}>
            <a className="adm-btn" href="/admin/export?quoi=billets">Exporter les billets (CSV)</a>
            <a className="adm-btn adm-btn--plein" href="/admin/export?quoi=recus">Exporter les reçus (CSV)</a>
          </div>
        )}
      </div>

      {!stripeConfigure && (
        <div className="adm-alerte" style={{ marginBottom: "1.2rem" }}>
          <p><b>Stripe n’est pas encore branché.</b> La billetterie affiche « bientôt ouverte » tant
            que STRIPE_SECRET_KEY et STRIPE_WEBHOOK_SECRET ne sont pas configurés.</p>
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
        <div><b>{argent(revenus)}</b><span>encaissé en ligne</span></div>
        <div><b>{dons.length}</b><span>dons supplémentaires · {argent(totalDons)}</span></div>
        <div><b>{recus.length}</b><span>reçus fiscaux à émettre · {argent(totalRecus)}</span></div>
      </div>

      <section className="adm-section">
        <h2>Reçus fiscaux à faire émettre par la Fondation</h2>
        <p className="adm-discret" style={{ maxWidth: "70ch" }}>
          Montant du reçu : {argent(CONFIG.billet.montantRecuParBillet)} par billet, plus le don
          supplémentaire. À transmettre à la Fondation En Cœur après la soirée, avec la remise des fonds.
        </p>
        {recus.length === 0 ? (
          <p className="adm-discret">Aucune demande de reçu pour l’instant.</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Adresse</th>
                <th className="nb">Billets</th>
                <th className="nb">Don extra</th>
                <th className="nb">Montant du reçu</th>
              </tr>
            </thead>
            <tbody>
              {recus.map((c) => (
                <tr key={c.id}>
                  <td>{c.nom}<small>{c.courriel}</small></td>
                  <td>{adresse(c.adresse)}</td>
                  <td className="nb">{c.qte}</td>
                  <td className="nb">{c.donExtra ? argent(c.donExtra) : "—"}</td>
                  <td className="nb"><b>{argent(c.montantRecu)}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="adm-section">
        <h2>Dons supplémentaires</h2>
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
              </tr>
            </thead>
            <tbody>
              {payees.map((c) => (
                <tr key={c.id}>
                  <td><b>{c.numeros.join(", ")}</b><small>{date(c.payeeLe)}</small></td>
                  <td>{c.nom}<small>{c.courriel}{c.telephone ? ` · ${c.telephone}` : ""}</small></td>
                  <td>{c.allergies || "—"}</td>
                  <td className="nb">{c.qte}</td>
                  <td className="nb">{argent(c.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
