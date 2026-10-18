import type { Metadata } from "next";
import EnTete from "@/components/EnTete";
import Link from "next/link";
import Footer from "@/components/Footer";
import {
  BandeauDefilant,
  Credit,
  GrilleCommanditaires,
} from "@/components/Commanditaires";
import { commanditairesPublics } from "@/lib/catalogue";
import { CONFIG } from "@/lib/donnees";

export const metadata: Metadata = {
  title: "Nos commanditaires",
  description:
    "Les entreprises qui rendent possible la soirée-bénéfice Pour Clément, et comment devenir commanditaire à votre tour.",
};

const PALIERS = [
  {
    tag: "Partenaire Or", couleur: "#9C7A22", prix: "3 000 $",
    dispo: "1 place, déjà comblée", epuise: true,
    avantages: [
      "Logo en très grand format sur tous les outils promotionnels",
      "Une table complète de 8 billets",
      "Prise de parole de 2 minutes devant tous les invités",
      "Présence en tête d’affiche sur la plateforme d’encan",
    ],
  },
  {
    tag: "Partenaire Argent", couleur: "#6E747B", prix: "2 000 $",
    dispo: "2 disponibilités", epuise: false,
    avantages: [
      "Logo format moyen sur le matériel imprimé et numérique",
      "4 billets pour la soirée",
      "Mention spéciale sur la page d’accueil de la plateforme d’encan",
    ],
  },
  {
    tag: "Partenaire Bronze", couleur: "#96694A", prix: "1 000 $",
    dispo: "6 disponibilités", epuise: false,
    avantages: [
      "Logo format standard dans le programme de la soirée",
      "2 billets pour la soirée",
      "Logo défilant sur la plateforme d’encan",
    ],
  },
];

export default async function Commanditaires() {
  const COMMANDITAIRES = await commanditairesPublics();
  return (
    <>
      <EnTete
        surtitre="Ils rendent la soirée possible"
        titre="Nos commanditaires"
        texte="Sans eux, il n’y a pas de soirée. Voici les entreprises qui ont dit oui, et la façon de les rejoindre."
        image="/images/soiree/salle.jpg"
        alt="Une salle de réception dressée"
      />

      {/* ===== Devenir commanditaire ===== */}
      <section className="section" style={{ paddingBlock: "clamp(2.5rem,5vw,3.5rem)" }}>
        <div className="wrap">
          <div
            className="card card--accent"
            style={{
              display: "flex", flexWrap: "wrap", alignItems: "center",
              gap: "2rem", justifyContent: "space-between",
            }}
          >
            <div style={{ flex: "1 1 340px" }}>
              <h2 style={{ fontSize: "1.9rem", marginBottom: ".4rem" }}>Devenez commanditaire</h2>
              <p style={{ color: "var(--ink-soft)", margin: 0 }}>
                Plus de 200 personnes dans la salle, un public venu par conviction, et une
                association qui vous ressemble. Tout est détaillé dans le plan de commandite.
              </p>
            </div>
            <div className="btn-row">
              <a className="btn btn--primary" href={CONFIG.liens.planCommandite} target="_blank" rel="noopener">
                Le plan de commandite (PDF)
              </a>
              <a className="btn btn--ghost" href={`mailto:${CONFIG.contact.courriel}`}>
                Nous écrire
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Les paliers ===== */}
      <section className="section section--sand" style={{ paddingBlock: "clamp(3rem,6vw,4.5rem)" }}>
        <div className="wrap">
          <div className="paliers">
            {PALIERS.map((p) => (
              <div data-reveal className="palier" key={p.tag}>
                <span className="palier__tag" style={{ color: p.couleur }}>{p.tag}</span>
                <p className="palier__prix">{p.prix}</p>
                <p className={"palier__dispo" + (p.epuise ? " palier__dispo--epuise" : "")}>
                  {p.dispo}
                </p>
                <ul className="liste" style={{ fontSize: ".92rem" }}>
                  {p.avantages.map((a) => <li key={a}>{a}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <p style={{ marginTop: "2.5rem", color: "var(--ink-soft)", fontSize: ".92rem" }}>
            Deux formules de don matériel s’ajoutent à ces paliers : le gros lot du tirage et les
            prix de l’encan silencieux. Elles sont décrites dans le plan de commandite.
          </p>
        </div>
      </section>

      {/* ===== Le présentateur ===== */}
      <section className="section">
        <div className="wrap">
          <Credit c={COMMANDITAIRES.principal} />
        </div>
      </section>

      {/* ===== Argent ===== */}
      <section className="section section--mist">
        <div className="wrap">
          <p className="surtitre center">Partenaires Argent</p>
          <div style={{ marginTop: "1.5rem" }}>
            <GrilleCommanditaires
              liste={COMMANDITAIRES.secondaires}
              etiquette="Partenaire Argent"
              colonnes="grid--2"
            />
          </div>
        </div>
      </section>

      {/* ===== Bronze ===== */}
      <section className="section">
        <div className="wrap">
          <p className="surtitre center">Partenaires Bronze</p>
          <div style={{ marginTop: "1.5rem" }}>
            <GrilleCommanditaires
              liste={COMMANDITAIRES.bronze}
              etiquette="Partenaire Bronze"
            />
          </div>
        </div>
        <div style={{ marginTop: "3rem" }}>
          <BandeauDefilant liste={COMMANDITAIRES.bronze} />
        </div>
      </section>

      {/* ===== Dons matériels ===== */}
      <section className="section section--sand">
        <div className="wrap">
          <p className="surtitre center">Dons matériels</p>
          <p className="lead center" style={{ maxWidth: 620, margin: "0 auto 2.5rem" }}>
            Le gros lot du tirage et les prix de l’encan sont offerts par des entreprises qui ont
            accepté de donner sans rien demander en retour.
          </p>
          <GrilleCommanditaires liste={COMMANDITAIRES.dons} etiquette="Don matériel" />
          <div className="center" style={{ marginTop: "2.5rem" }}>
            <Link className="btn btn--ghost btn--sm" href="/prix">
              Voir les lots de l’encan
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Rappel ===== */}
      <section className="section section--deep">
        <div className="wrap center" style={{ maxWidth: 700 }}>
          <h2 data-lignes>Merci d’y penser. Cela compte plus qu’on ne peut le dire.</h2>
          <p className="lead" style={{ marginTop: "1.2rem" }}>
            Écrivez-nous et nous trouverons ensemble la formule qui convient à votre entreprise.
          </p>
          <div className="btn-row" style={{ justifyContent: "center", marginTop: "1.8rem" }}>
            <a className="btn btn--light" href={CONFIG.liens.planCommandite} target="_blank" rel="noopener">
              Télécharger le plan
            </a>
            <a className="btn btn--outline-light" href={`mailto:${CONFIG.contact.courriel}`}>
              Écrire à Gabrielle
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
