import Image from "next/image";
import Link from "next/link";
import Compteur from "@/components/Compteur";
import Footer from "@/components/Footer";
import { BandeauDefilant, Credit, CreditDuo } from "@/components/Commanditaires";
import { COMMANDITAIRES, CONFIG } from "@/lib/donnees";

export default function Accueil() {
  const { evenement } = CONFIG;

  return (
    <>
      {/* ============ OUVERTURE ============ */}
      <section className="ouverture">
        <span className="halo halo--un" aria-hidden="true" />
        <span className="halo halo--deux" aria-hidden="true" />

        <div className="wrap ouverture__grille">
          <div>
            <h1 className="ouverture__nom entre">
              Pour<em>Clément</em>
            </h1>

            <p className="ouverture__intro entre" style={{ "--delai": ".12s" } as React.CSSProperties}>
              Une soirée pour rire, pour manger, pour miser trop cher sur un panier de fromages.
              Et pour que tout cela devienne du répit pour des familles à bout de souffle.
            </p>

            <p className="ouverture__quand entre" style={{ "--delai": ".24s" } as React.CSSProperties}>
              <span>{evenement.date}</span>
              <i />
              <span>{evenement.lieu}</span>
            </p>

            <div className="btn-row entre" style={{ "--delai": ".34s" } as React.CSSProperties}>
              <Link className="btn btn--primary" href="/billets">Réserver ma place</Link>
              <Link className="btn btn--ghost" href="/prix">Voir les prix de l’encan</Link>
            </div>
          </div>

          <figure className="arche entre" style={{ "--delai": ".18s" } as React.CSSProperties}>
            <div className="arche__cadre" />
            <div className="arche__image" data-parallax="0.045">
              <Image
                src="/clement.jpg"
                alt="Souvenir de Clément"
                width={760}
                height={950}
                priority
              />
            </div>
          </figure>
        </div>

        {/* Le décompte, en bulles */}
        <div className="wrap bulles-zone entre" style={{ "--delai": ".46s" } as React.CSSProperties}>
          <p>Avant de se retrouver</p>
          <Compteur />
        </div>
      </section>

      {/* ============ LA PHRASE ============ */}
      <section className="phrase" id="phrase">
        <div className="wrap">
          <p data-reveal>
            Son passage a été court.
            <br />
            <em>Ce qu’il nous a laissé ne l’est pas.</em>
          </p>
          <div className="ornement" data-reveal style={{ "--delai": ".2s", marginTop: "3rem" } as React.CSSProperties}>
            <i />
          </div>
        </div>
      </section>

      {/* ============ LE RÉCIT ============ */}
      <section className="section section--sand">
        <div className="wrap recit">
          <div className="recit__marge" data-reveal>
            <span>
              17 février 2024
              <br />
              Québec
            </span>
          </div>

          <div className="recit__texte">
            <p className="premiere" data-reveal>
              Clément est né avec une malformation cardiaque. Nous avons passé le temps qui a
              suivi dans un hôpital, à apprendre un vocabulaire que personne ne devrait avoir à
              apprendre, entourés d’équipes qui se sont battues autant que lui. Son cœur n’a pas
              tenu.
            </p>
            <p data-reveal style={{ "--delai": ".1s" } as React.CSSProperties}>
              Dans ces couloirs-là, il y a d’autres parents. Certains viennent de loin, dorment à
              l’hôtel, comptent les jours et les dollars entre deux rendez-vous. Personne ne
              devrait avoir à porter ça seul, et pourtant beaucoup le font.
            </p>
            <p data-reveal style={{ "--delai": ".18s" } as React.CSSProperties}>
              Le 12 novembre, on se réunit. Il y aura un bon repas, un encan silencieux, un
              tirage, et une salle pleine de gens qui ne se connaissent pas encore. Tout ce qui
              sera amassé ira à la Fondation En Cœur, qui accompagne ces familles au quotidien,
              partout au Québec.
            </p>
            <p data-reveal style={{ "--delai": ".26s" } as React.CSSProperties}>
              Merci d’avance d’en être. C’est une drôle de façon de dire je t’aime à un enfant qui
              n’est plus là, mais c’est la mienne.
            </p>
            <p className="signature" data-reveal style={{ "--delai": ".34s" } as React.CSSProperties}>
              Gabrielle Desgagné, maman de Clément
            </p>
          </div>
        </div>
      </section>

      {/* ============ LA FONDATION ============ */}
      <section className="section" id="fondation">
        <div className="wrap fondation">
          <p className="fondation__chiffre" data-reveal>
            1<span style={{ opacity: 0.4 }}>/</span>100
            <small>enfant naît avec une malformation cardiaque au Québec</small>
          </p>

          <div data-reveal style={{ "--delai": ".14s" } as React.CSSProperties}>
            <h2>Où va l’argent</h2>
            <hr className="filet" />
            <p className="lead">
              À la Fondation En Cœur, qui existe depuis 1984 pour une raison simple : le réseau de
              la santé soigne l’enfant, mais personne ne s’occupe du reste. L’hôtel près de
              l’hôpital. Le stationnement. L’essence. Les repas avalés debout. La nuit où il
              faudrait parler à quelqu’un.
            </p>
            <p>
              La Fondation prend ce relais-là, à Montréal, à Québec, à Trois-Rivières et en
              Estrie. Chaque jour, une famille de plus reçoit son aide.
            </p>

            <div className="faits">
              <div>
                <b>900</b>
                <span>familles touchées chaque année</span>
              </div>
              <div>
                <b>80&times;</b>
                <span>plus fréquent que le cancer infantile</span>
              </div>
              <div>
                <b>1984</b>
                <span>année de fondation</span>
              </div>
            </div>

            <p style={{ marginTop: "1.8rem" }}>
              <a className="btn btn--ghost btn--sm" href="https://en-coeur.org/" target="_blank" rel="noopener">
                en-coeur.org
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ============ LES PARTENAIRES ============ */}
      <section className="section section--mist" id="partenaires">
        <div className="wrap" data-reveal>
          <Credit c={COMMANDITAIRES.principal} />
          <CreditDuo liste={COMMANDITAIRES.secondaires} />
        </div>

        {COMMANDITAIRES.bronze.length > 0 && (
          <div style={{ marginTop: "3.5rem" }}>
            <BandeauDefilant liste={COMMANDITAIRES.bronze} />
          </div>
        )}

        <div className="wrap center" style={{ marginTop: "2.5rem" }}>
          <Link className="btn btn--ghost btn--sm" href="/commanditaires">
            Tous nos partenaires, et comment le devenir
          </Link>
        </div>
      </section>

      {/* ============ L’INVITATION ============ */}
      <section className="invitation" id="invitation">
        <div className="wrap">
          <blockquote data-reveal>
            « Un petit cœur s’est arrêté. Grâce à vous, beaucoup d’autres continueront de battre. »
          </blockquote>

          <div className="invitation__liens" data-reveal style={{ "--delai": ".14s" } as React.CSSProperties}>
            <Link href="/billets">Réserver une place</Link>
            <Link href="/prix">Découvrir les prix</Link>
            <Link href="/don">Faire un don</Link>
          </div>
        </div>
      </section>

      <Footer citation={false} />
    </>
  );
}
