import type { Metadata } from "next";
import { metaPage } from "@/lib/seo";
import Footer from "@/components/Footer";
import Lots from "@/components/Lots";
import { lotsPublics } from "@/lib/catalogue";
import { CONFIG } from "@/lib/donnees";

export const metadata: Metadata = metaPage({
  titre: "Les prix de l’encan",
  description:
    "Les lots de l’encan silencieux de la soirée-bénéfice Pour Clément, offerts par des entreprises d’ici au profit de la Fondation En Cœur.",
  chemin: "/prix",
});

export default async function Prix() {
  // Du lot qui vaut le plus au plus modeste
  const lots = [...(await lotsPublics())].sort((a, b) => (b.valeur || 0) - (a.valeur || 0));
  return (
    <>
      <section className="section">
        <div className="wrap">
          {/* Titre de la page, lu par Google et les lecteurs d’écran */}
          <h1 className="sr-only">Les prix de l’encan silencieux</h1>
          {!CONFIG.encan.ouvert && (
            <div className="notice" style={{ marginBottom: "2.5rem" }}>
              <strong>L’encan n’est pas encore ouvert.</strong> {CONFIG.encan.messageFerme}
            </div>
          )}

          <Lots lots={lots} />

          <div className="center" style={{ marginTop: "3.5rem" }}>
            <div data-reveal className="card" style={{ maxWidth: 640, margin: "0 auto" }}>
              <h3>Vous aimeriez offrir un lot ?</h3>
              <p style={{ color: "var(--ink-soft)" }}>
                Chaque prix d’encan donne droit à une visibilité complète : votre logo, une
                description de votre entreprise et un lien vers votre site sur la fiche de mise,
                imprimée et virtuelle.
              </p>
              <div className="btn-row" style={{ justifyContent: "center", marginTop: ".8rem" }}>
                <a className="btn btn--dark btn--sm" href={CONFIG.liens.planCommandite} target="_blank" rel="noopener">
                  Voir le plan de commandite
                </a>
                <a className="btn btn--ghost btn--sm" href={`mailto:${CONFIG.contact.courriel}`}>
                  Nous écrire
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
