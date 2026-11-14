import type { Metadata } from "next";
import Link from "next/link";
import BoutonImprimer from "@/components/BoutonImprimer";
import Footer from "@/components/Footer";
import { confirmerPaiement, lireCommande, type Commande } from "@/lib/billetterie";
import { CONFIG, argent } from "@/lib/donnees";
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
      return { commande: await confirmerPaiement(session), enCours: false };
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
          <h1>Merci{commande.nom ? `, ${commande.nom.split(" ")[0]}` : ""} !</h1>
          <p className="lead" style={{ marginTop: "1rem" }}>
            {n > 1 ? `Vos ${n} billets sont confirmés.` : "Votre billet est confirmé."} Gardez cette
            page ou imprimez-la : à l’accueil, il suffit de donner votre nom ou un numéro de
            billet. Un reçu de paiement vous est aussi envoyé par courriel
            {commande.courriel ? ` à ${commande.courriel}` : ""}.
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
                  <div><dt>Reçu fiscal à venir</dt><dd>{argent(commande.montantRecu)}</dd></div>
                )}
              </dl>
              {commande.recu && (
                <p className="adm-discret" style={{ marginTop: "1rem" }}>
                  Votre reçu fiscal sera émis par la Fondation En Cœur après la soirée, une fois
                  les fonds remis, au nom et à l’adresse indiqués lors du paiement.
                </p>
              )}
            </div>
          </div>

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
