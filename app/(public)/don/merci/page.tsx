import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { CONFIG, argent } from "@/lib/donnees";
import { confirmerDon, lireDon, type Don } from "@/lib/dons";
import { envoyerRemerciementDon } from "@/lib/envoi-dons";
import { dateSoiree } from "@/lib/recu-fiscal";
import { stripe, stripeConfigure } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Merci pour votre don",
  robots: { index: false, follow: false },
};

/* Comme pour les billets : on redemande la session à Stripe, et on confirme
   le don ici si le webhook n’est pas encore passé */
async function trouverDon(sessionId: string): Promise<Don | null> {
  if (!stripeConfigure || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;
  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    if (session.metadata?.type !== "don") return null;
    if (session.payment_status !== "paid") return null;
    const don = await confirmerDon(session);
    if (!don) return null;
    await envoyerRemerciementDon(don.id).catch((e) => console.error("[don] courriel", e));
    return lireDon(don.id);
  } catch {
    return null;
  }
}

export default async function MerciDon({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const { session = "" } = await searchParams;
  const don = await trouverDon(session);
  const { contact } = CONFIG;

  return (
    <>
      <section className="section">
        <div className="wrap center" style={{ maxWidth: 640, paddingTop: "4rem" }}>
          {don && don.statut === "payee" ? (
            <>
              <p className="surtitre">Don reçu</p>
              <h1>Merci{don.prenom ? `, ${don.prenom}` : ""} !</h1>
              <p className="lead" style={{ marginTop: "1rem" }}>
                Votre don de <b>{argent(don.montant)}</b> à la Fondation En Cœur, en mémoire de
                Clément, est bien reçu.
                {don.courrielEnvoyeLe ? ` Une confirmation vous a été envoyée à ${don.courriel}.` : ""}
              </p>
              {don.recu && (
                <p className="don-merci-note">
                  <b>Votre reçu fiscal sera transmis après la soirée.</b> Le reçu de{" "}
                  {argent(don.montant)} est émis par la Fondation En Cœur une fois les fonds remis,
                  après la soirée du {dateSoiree()}
                  {don.typeDonateur === "corporatif" && don.entreprise ? `, au nom de ${don.entreprise}` : ""}.
                  Vous n’avez rien d’autre à faire d’ici là.
                </p>
              )}
              {don.courrielEnvoyeLe && (
                <p className="don-merci-note">
                  <b>Vous ne trouvez pas le courriel de confirmation ?</b> Vérifiez votre dossier de
                  courriers indésirables (pourriels) et indiquez qu’il ne s’agit pas d’un pourriel.
                </p>
              )}
              <p className="pull" style={{ border: 0, padding: 0, fontSize: "1.4rem", marginTop: "2rem" }}>
                « Un petit cœur s’est arrêté. Grâce à vous, beaucoup d’autres continueront de battre. »
              </p>
              <div className="btn-row" style={{ justifyContent: "center", marginTop: "1.6rem" }}>
                <Link className="btn btn--primary" href="/billets">Réserver un billet pour la soirée</Link>
                <Link className="btn btn--ghost" href="/">Retour à l’accueil</Link>
              </div>
            </>
          ) : (
            <>
              <h1>Don introuvable</h1>
              <p className="lead" style={{ marginTop: "1rem" }}>
                Nous ne trouvons pas de don associé à ce lien. Si vous avez été débité, écrivez-nous
                et nous réglerons ça rapidement.
              </p>
              <p style={{ marginTop: "1.4rem" }}>
                <a href={`mailto:${contact.courriel}`}>{contact.courriel}</a>
              </p>
              <Link className="btn btn--primary" href="/don" style={{ marginTop: "1.4rem" }}>
                Retour à la page de don
              </Link>
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
