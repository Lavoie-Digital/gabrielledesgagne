import type { Metadata } from "next";
import Link from "next/link";
import BoutonImprimer from "@/components/BoutonImprimer";
import Footer from "@/components/Footer";
import { confirmerPaiement, lireCommande, type Commande } from "@/lib/billetterie";
import { CONFIG, argent } from "@/lib/donnees";
import { envoyerBillets } from "@/lib/envoi-billets";
import { dateSoiree } from "@/lib/recu-fiscal";
import { stripe, stripeConfigure } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Merci, vos billets",
  robots: { index: false, follow: false },
};

/**
 * La page de retour après le paiement Stripe. On redemande la session à
 * Stripe (impossible à falsifier) : si le paiement est fait mais que le
 * webhook n’est pas encore arrivé, on attribue les numéros ici même.
 */
async function trouverCommande(sessionId: string): Promise<{ commande: Commande | null; enCours: boolean }> {
  if (!stripeConfigure || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return { commande: null, enCours: false };
  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    const id = session.client_reference_id ?? "";
    if (session.payment_status === "paid") {
      const commande = await confirmerPaiement(session);
      // Si le webhook n’est pas encore passé, on envoie le courriel d’ici
      if (commande) {
        await envoyerBillets(commande.id).catch((e) => console.error("[billets] courriel", e));
      }
      return { commande: commande ? await lireCommande(commande.id) : null, enCours: false };
    }
    return { commande: await lireCommande(id), enCours: session.status === "complete" };
  } catch {
    return { commande: null, enCours: false };
  }
}

export default async function Merci({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const { session = "" } = await searchParams;
  const { commande, enCours } = await trouverCommande(session);
  const { evenement, contact } = CONFIG;

  if (!commande || commande.statut !== "payee") {
    return (
      <>
        <section className="section">
          <div className="wrap center" style={{ maxWidth: 620, paddingTop: "4rem" }}>
            <h1>{enCours ? "Paiement en traitement" : "Commande introuvable"}</h1>
            <p className="lead" style={{ marginTop: "1rem" }}>
              {enCours
                ? "Votre banque confirme le paiement. Vos numéros de billets apparaîtront ici dès que ce sera fait : rafraîchissez la page dans quelques minutes."
                : "Nous ne trouvons pas de billets associés à ce lien. Si vous avez été débité, écrivez-nous et nous réglerons ça rapidement."}
            </p>
            <p style={{ marginTop: "1.4rem" }}>
              <a href={`mailto:${contact.courriel}`}>{contact.courriel}</a>
            </p>
            <Link className="btn btn--primary" href="/billets" style={{ marginTop: "1.4rem" }}>
              Retour à la billetterie
            </Link>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  const n = commande.qte;

  return (
    <>
      <section className="section">
        <div className="wrap" style={{ maxWidth: 720, paddingTop: "3rem" }}>
          <p className="surtitre">Paiement reçu</p>
          <h1>Merci{commande.prenom ? `, ${commande.prenom}` : ""} !</h1>
          <p className="lead" style={{ marginTop: "1rem" }}>
            {n > 1 ? `Vos ${n} billets sont confirmés.` : "Votre billet est confirmé."} Gardez cette
            page ou imprimez-la : à l’accueil, il suffit de donner votre nom ou un numéro de
            billet.{" "}
            {commande.courrielEnvoyeLe
              ? `Vos billets vous ont aussi été envoyés par courriel à ${commande.courriel}.`
              : `Un reçu de paiement vous est envoyé par courriel${commande.courriel ? ` à ${commande.courriel}` : ""}.`}
          </p>

          <div className="ticket" style={{ marginTop: "2rem" }}>
            <div className="ticket__head">
              <div className="ticket__per">Soirée-bénéfice Pour Clément</div>
              <div className="billets-numeros">
                {commande.numeros.map((num) => (
                  <span key={num}>{num}</span>
                ))}
              </div>
              <div className="ticket__per">
                {n} {n > 1 ? "billets" : "billet"} · {commande.nom}
                {commande.typeAcheteur === "corporatif" && commande.entreprise ? ` · ${commande.entreprise}` : ""}
              </div>
            </div>
            <div className="ticket__body">
              <dl className="dl">
                <div><dt>Date</dt><dd>{evenement.date}</dd></div>
                <div><dt>Heure</dt><dd>{evenement.heure}</dd></div>
                <div><dt>Lieu</dt><dd>{evenement.lieu}</dd></div>
                <div><dt>Adresse</dt><dd>{evenement.adresse}</dd></div>
                <div><dt>Payé</dt><dd>{argent(commande.total)}</dd></div>
                {commande.donExtra > 0 && (
                  <div><dt>Dont don supplémentaire</dt><dd>{argent(commande.donExtra)}</dd></div>
                )}
                {commande.recu && (
                  <div><dt>Reçu fiscal</dt><dd>Montant du reçu à venir</dd></div>
                )}
              </dl>
            </div>
          </div>

          {commande.recu && (
            <p className="don-merci-note">
              <b>Votre reçu fiscal sera transmis après la soirée.</b> Le montant du reçu est à venir. Le reçu est émis par la Fondation En Cœur une
              fois les fonds remis, après la soirée du {dateSoiree()}
              {commande.typeAcheteur === "corporatif" && commande.entreprise ? `, au nom de ${commande.entreprise}` : ""}.
              Vous n’avez rien d’autre à faire d’ici là.
            </p>
          )}
          {commande.courrielEnvoyeLe && (
            <p className="don-merci-note">
              <b>Vous ne trouvez pas le courriel avec vos billets ?</b> Vérifiez votre dossier de
              courriers indésirables (pourriels) et indiquez qu’il ne s’agit pas d’un pourriel.
            </p>
          )}

          <div className="btn-row" style={{ marginTop: "1.6rem" }}>
            <BoutonImprimer />
            <Link className="btn btn--primary" href="/prix">Voir les lots de l’encan</Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
