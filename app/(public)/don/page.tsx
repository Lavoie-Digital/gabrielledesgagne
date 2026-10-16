import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import FormulaireDon from "@/components/FormulaireDon";
import { CONFIG } from "@/lib/donnees";

export const metadata: Metadata = {
  title: "Faire un don",
  description:
    "Faites un don en ligne au profit de la Fondation En Cœur, en mémoire de Clément. Chaque geste soutient une famille d’enfant cardiaque.",
};

const MONTANTS = [
  ["20 $", "Un repas chaud pour un parent à l’hôpital"],
  ["50 $", "Un plein d’essence pour un aller-retour"],
  ["100 $", "Une nuit d’hébergement près de l’hôpital"],
  ["250 $", "Une semaine de stationnement et de repas"],
];

export default function Don() {
  const lienDon = CONFIG.liens.don || "#donner";
  const externe = Boolean(CONFIG.liens.don);

  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <p className="surtitre">En mémoire de Clément</p>
          <h1>Faire un don</h1>
          <p>
            Vous n’avez pas besoin d’être là le 12 novembre pour faire une différence. Chaque don
            va directement aux familles qui veillent un enfant au cœur fragile.
          </p>
        </div>
      </section>

      <section className="section" id="donner">
        <div className="wrap">
          <div className="grid grid--2" style={{ gap: "2.5rem", alignItems: "start" }}>

            <div>
              <p className="surtitre">Ce que votre don rend possible</p>
              <h2>Des gestes concrets, tout de suite</h2>
              <hr className="filet" />
              <p className="lead">
                La Fondation En Cœur intervient là où le réseau de la santé s’arrête : dans le
                quotidien épuisant des familles. Voici à quoi ressemble votre générosité, une fois
                traduite en vrai.
              </p>

              <div className="amount-grid" style={{ marginTop: "1.8rem" }}>
                {MONTANTS.map(([montant, texte]) => (
                  <a
                    key={montant}
                    href={lienDon}
                    {...(externe ? { target: "_blank", rel: "noopener" } : {})}
                  >
                    <b>{montant}</b>
                    <span>{texte}</span>
                  </a>
                ))}
              </div>

              <div className="notice">
                <strong>Un mot sur les reçus fiscaux.</strong> Les dons sont traités par la
                Fondation En Cœur, un organisme de bienfaisance enregistré. Les modalités
                d’émission des reçus vous seront confirmées au moment de votre don.
              </div>

              <div className="card" style={{ marginTop: "1.6rem" }}>
                <h3>D’autres façons d’aider</h3>
                <ul className="liste" style={{ fontSize: ".96rem" }}>
                  <li><Link href="/billets">Réserver un billet</Link> pour la soirée du 12 novembre</li>
                  <li><Link href="/commanditaires">Devenir commanditaire</Link> avec votre entreprise</li>
                  <li>
                    Offrir un lot pour l’encan silencieux, en nous{" "}
                    <a href={`mailto:${CONFIG.contact.courriel}`}>écrivant</a>
                  </li>
                  <li>Parler de la soirée autour de vous : c’est gratuit, et ça compte beaucoup</li>
                </ul>
              </div>
            </div>

            <div>
              <p className="surtitre">Don sécurisé en ligne</p>
              <h2 style={{ marginBottom: "1.2rem" }}>Votre don, en deux minutes</h2>
              <FormulaireDon />
              <p style={{ fontSize: ".84rem", color: "var(--ink-soft)", marginTop: "1rem", textAlign: "center" }}>
                Le formulaire est hébergé par Zeffy, une plateforme sans frais pour les
                organismes : la totalité de votre don se rend à destination.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ===== La fondation ===== */}
      <section className="section section--deep">
        <div className="wrap">
          <div className="grid grid--2" style={{ gap: "3rem", alignItems: "center" }}>
            <div>
              <p className="surtitre">À qui va votre don</p>
              <h2>Fondation En Cœur</h2>
              <hr className="filet" />
              <p className="lead">
                Depuis 1984, la Fondation québécoise pour les enfants malades du cœur accompagne
                les familles à Montréal, Québec, Trois-Rivières et en Estrie.
              </p>
              <p>
                Au Québec, environ un enfant sur cent naît avec une malformation cardiaque, ce qui
                représente près de 900 familles chaque année. Chaque jour, la Fondation vient en
                aide à une famille de plus.
              </p>
              <p style={{ marginTop: "1.4rem" }}>
                <a className="btn btn--outline-light btn--sm" href="https://en-coeur.org/" target="_blank" rel="noopener">
                  Visiter en-coeur.org
                </a>
              </p>
            </div>
            <div className="faits" style={{ marginTop: 0 }}>
              <div><b>1/100</b><span>enfant sur cent</span></div>
              <div><b>900</b><span>familles par année</span></div>
              <div><b>80×</b><span>le cancer infantile</span></div>
              <div><b>1984</b><span>année de fondation</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap center" style={{ maxWidth: 640 }}>
          <blockquote className="pull" style={{ border: 0, padding: 0, fontSize: "1.7rem", textAlign: "center" }}>
            « Un petit cœur s’est arrêté. Grâce à vous, beaucoup d’autres continueront de battre. »
          </blockquote>
          <p style={{
            fontSize: ".78rem", letterSpacing: ".13em", textTransform: "uppercase",
            color: "var(--ink-soft)", fontWeight: 700,
          }}>
            Gabrielle Desgagné &middot; maman de Clément
          </p>
        </div>
      </section>

      <Footer citation={false} />
    </>
  );
}
