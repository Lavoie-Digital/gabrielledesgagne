import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { CONFIG, argent } from "@/lib/donnees";
import { confirmerDon, lireDon, type Don } from "@/lib/dons";
import { envoyerRemerciementDon } from "@/lib/envoi-dons";
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
                <p style={{ marginTop: "1rem", color: "var(--ink-soft)" }}>
                  Votre reçu fiscal de {argent(don.montant)} sera émis par la Fondation En Cœur
                  après la soirée, une fois les fonds remis.
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
