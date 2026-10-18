import type { Metadata } from "next";
import EnTete from "@/components/EnTete";
import Link from "next/link";
import Billetterie from "@/components/Billetterie";
import Footer from "@/components/Footer";
import { CONFIG, argent } from "@/lib/donnees";

export const metadata: Metadata = {
  title: "Réservez votre billet",
  description:
    "Réservez votre billet pour la soirée-bénéfice Pour Clément : 150 $ incluant un cocktail d’accueil, un repas 4 services et deux consommations.",
};

export default function Billets() {
  const { evenement, contact, billet } = CONFIG;

  return (
    <>
      <EnTete
        surtitre="Vendredi 12 novembre 2027"
        titre="Réservez votre billet"
        texte="Du cocktail d’accueil au tirage du gros lot. Et le sentiment, en repartant, d’avoir fait quelque chose de bien."
        image="/images/soiree/fleurs-table.jpg"
        alt="Une table dressée, fleurs et chandelles"
      />

      <section className="section" id="reserver">
        <div className="wrap">
          <div className="grid grid--2" style={{ gap: "2.5rem", alignItems: "start" }}>

            {/* ===== La carte du billet ===== */}
            <div data-reveal className="ticket">
              <div className="ticket__head">
                <div className="ticket__per">Billet individuel</div>
                <div className="ticket__price">
                  {billet.prix}<sup>$</sup>
                </div>
                <div className="ticket__per">par personne, taxes et service inclus</div>
              </div>
              <div className="ticket__body">
                <h3>Ce que votre billet comprend</h3>
                <ul className="ticket__incl">
                  <li><b>Un cocktail de bienvenue</b> et des bouchées à l’accueil</li>
                  <li><b>Un repas 4 services</b> servi à table</li>
                  <li><b>Deux consommations</b> de votre choix</li>
                  <li><b>L’accès à l’encan silencieux</b> et au tirage du gros lot</li>
                </ul>

                <Billetterie />
              </div>
            </div>

            {/* ===== Infos pratiques ===== */}
            <div>
              <div data-reveal className="info-box" style={{ marginBottom: "1.6rem" }}>
                <h3>Tout ce qu’il faut savoir</h3>
                <dl className="dl">
                  <div><dt>Date</dt><dd>{evenement.date}</dd></div>
                  <div><dt>Heure</dt><dd>{evenement.heure}</dd></div>
                  <div><dt>Lieu</dt><dd>{evenement.lieu}</dd></div>
                  <div><dt>Adresse</dt><dd>{evenement.adresse}</dd></div>
                  <div><dt>Tenue</dt><dd>{evenement.tenue}</dd></div>
                  <div><dt>Billet</dt><dd>{argent(billet.prix)}</dd></div>
                </dl>
              </div>

              <div data-reveal className="card" style={{ marginBottom: "1.6rem" }}>
                <h3>Vous venez en groupe ?</h3>
                <p style={{ color: "var(--ink-soft)" }}>
                  Une table accueille {billet.placesParTable} personnes. Réservez{" "}
                  {billet.placesParTable} billets d’un coup, ou écrivez-nous simplement pour que
                  nous placions votre groupe ensemble.
                </p>
                <a
                  className="btn btn--ghost btn--sm"
                  href={`mailto:${contact.courriel}`}
                  style={{ marginTop: ".5rem" }}
                >
                  Nous écrire
                </a>
              </div>

              <div data-reveal className="card">
                <h3>Allergies et régimes</h3>
                <p style={{ color: "var(--ink-soft)" }}>
                  Le traiteur adapte le repas aux allergies, aux intolérances et aux régimes
                  végétariens. Dites-le-nous au moment de réserver, ou au plus tard deux semaines
                  avant la soirée.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== Où va votre argent ===== */}
      <section className="section section--sand">
        <div className="wrap">
          <div style={{ maxWidth: 640, marginBottom: "3rem" }}>
            <h2 data-lignes>Votre billet est déjà un don</h2>
            <hr className="filet" />
            <p className="lead">
              Ce que vous payez ce soir-là ne finance pas seulement votre assiette. Voici à quoi
              ressemble la suite, une fois l’argent remis à la Fondation En Cœur.
            </p>
          </div>

          <div className="usages" data-reveal>
            <div>
              <h3>Un toit près de l’hôpital</h3>
              <p>
                Pour les parents dont l’enfant est hospitalisé loin de la maison, et qui ne
                veulent pas s’éloigner de sa chambre.
              </p>
            </div>
            <div>
              <h3>De quoi tenir le mois</h3>
              <p>
                Essence, stationnement, repas, déplacements. Les petites dépenses qui, mises bout
                à bout, deviennent impossibles.
              </p>
            </div>
            <div>
              <h3>Quelqu’un à qui parler</h3>
              <p>
                Groupes de soutien et accompagnement psychologique, pour les parents, les
                adolescents et même les grands-parents.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap center" style={{ maxWidth: 620 }}>
          <h2 data-lignes>Vous ne pouvez pas venir ?</h2>
          <p className="lead" style={{ marginTop: "1rem" }}>
            Ce n’est pas grave. Un don, même petit, change quelque chose pour une famille.
          </p>
          <Link className="btn btn--primary" href="/don" style={{ marginTop: "1.4rem" }}>
            Faire un don
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
