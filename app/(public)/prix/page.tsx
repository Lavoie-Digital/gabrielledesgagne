import type { Metadata } from "next";
import EnTete from "@/components/EnTete";
import Footer from "@/components/Footer";
import Lots from "@/components/Lots";
import { lotsPublics } from "@/lib/catalogue";
import { CONFIG } from "@/lib/donnees";

export const metadata: Metadata = {
  title: "Les prix de l’encan",
  description:
    "Les lots de l’encan silencieux de la soirée-bénéfice Pour Clément, offerts par des entreprises d’ici au profit de la Fondation En Cœur.",
};

export default async function Prix() {
  const lots = await lotsPublics();
  return (
    <>
      <EnTete
        surtitre="Encan silencieux"
        titre="Les prix"
        texte="Des lots offerts par des entreprises généreuses. Chaque mise remportée devient un soutien concret pour une famille."
        image="/images/soiree/verre.jpg"
        alt="Un verre servi à la lueur des bougies"
      />

      <section className="section">
        <div className="wrap">
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
