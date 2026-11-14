import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import Ourson from "@/components/Ourson";
import Ouverture from "@/components/Ouverture";
import VitrineEncan from "@/components/VitrineEncan";
import { BandeauDefilant, Credit, CreditDuo } from "@/components/Commanditaires";
import { commanditairesPublics, lotsPublics } from "@/lib/catalogue";
import { CONFIG } from "@/lib/donnees";

const MOMENTS = [
  {
    quand: "17 h",
    quoi: "L’accueil",
    texte: "Un cocktail de bienvenue et des bouchées, le temps de trouver sa table et de faire connaissance.",
  },
  {
    quand: "18 h 30",
    quoi: "Le souper",
    texte: "Un repas quatre services servi à table, deux consommations, et des voisins de table qui ne le resteront pas longtemps.",
  },
  {
    quand: "Toute la soirée",
    quoi: "L’encan silencieux",
    texte: "Des lots offerts par des entreprises d’ici, des mises qui grimpent, et un écran qui affiche le classement en direct.",
  },
  {
    quand: "En fin de soirée",
    quoi: "Musicien et grand tirage",
    texte: "Un musicien prend le relais, puis le gros lot est tiré dans la salle. Quelqu’un repart les bras pleins, tout le monde repart le cœur plein.",
  },
];

export default async function Accueil() {
  const { evenement } = CONFIG;
  const [lots, COMMANDITAIRES] = await Promise.all([lotsPublics(), commanditairesPublics()]);

  return (
    <>
      <Ouverture />

      {/* ============ LA PHRASE ============ */}
      <section className="phrase" id="phrase">
        <div className="wrap">
          <p data-mots>
            Son passage a été court. <em>Ce qu’il nous a laissé ne l’est pas.</em>
          </p>
        </div>
      </section>

      {/* ============ LE RÉCIT ============ */}
      <section className="section section--sand recit-zone">
        <div className="wrap recit">
          <aside className="recit__marge">
            <span data-reveal>
              17 février 2024
              <br />
              Québec
            </span>
            <div className="recit__ourson" data-dessin="defile">
              <Ourson />
            </div>
          </aside>

          <div className="recit__texte">
            <p className="premiere" data-reveal>
              Le 17 février 2024, Clément est né avec une malformation cardiaque. Malgré le
              dévouement et tout le savoir-faire des équipes médicales, son petit cœur a livré
              un combat qu’il ne pouvait pas gagner.
            </p>
            <p data-reveal>
              Son passage a été bref. Son empreinte ne s’effacera pas. Clément nous a appris à
              mesurer la valeur d’une seule journée, la force d’une main que l’on tient, la
              beauté de ce qu’on croyait ordinaire.
            </p>
            <blockquote className="recit__exergue" data-lignes>
              « Il nous a montré, en si peu de temps, à quel point la vie mérite d’être aimée. »
            </blockquote>
            <p data-reveal>
              Cette soirée est en sa mémoire. Mais elle est aussi, et surtout, pour toutes les
              familles qui, en ce moment même, veillent au chevet d’un enfant au cœur fragile :
              pour qu’elles trouvent un peu de répit, un peu de chaleur, et la certitude
              qu’elles ne portent pas cela seules.
            </p>
            <p className="signature" data-reveal>
              Gabrielle Desgagné, maman de Clément
            </p>
          </div>
        </div>
      </section>

      {/* ============ LA SOIRÉE ============ */}
      <section className="section soiree" id="soiree">
        <div className="wrap soiree__grille">
          <div className="soiree__images">
            <figure className="soiree__grande" data-devoile>
              <Image
                src="/images/soiree/tablee.jpg"
                alt="Une longue tablée dressée, bougies et fleurs"
                width={1400}
                height={933}
                sizes="(max-width: 940px) 100vw, 560px"
              />
            </figure>
            <figure className="soiree__petite" data-devoile>
              <Image
                src="/images/soiree/verre.jpg"
                alt=""
                width={1400}
                height={933}
                sizes="(max-width: 940px) 50vw, 260px"
              />
            </figure>
          </div>

          <div>
            <p className="surtitre">Le 12 novembre</p>
            <h2 data-lignes>Une soirée en quatre temps</h2>
            <ol className="moments">
              {MOMENTS.map((m, i) => (
                <li key={m.quoi} data-reveal>
                  <span className="moments__num">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="moments__quand">{m.quand}</p>
                    <h3>{m.quoi}</h3>
                    <p>{m.texte}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="soiree__lieu" data-reveal>
              {evenement.lieu} &middot; {evenement.adresse}
            </p>
            <Link className="btn btn--primary soiree__cta" href="/billets" data-reveal>
              Réserver ma place
            </Link>
          </div>
        </div>
      </section>

      {/* ============ L’ENCAN ============ */}
      <VitrineEncan lots={lots} />

      {/* ============ LA FONDATION ============ */}
      <section className="section" id="fondation">
        <div className="wrap fondation">
          <p className="fondation__chiffre" data-reveal>
            1<span style={{ opacity: 0.4 }}>/</span>100
            <small>enfant naît avec une malformation cardiaque au Québec</small>
          </p>

          <div>
            <h2 data-lignes>Où va l’argent</h2>
            <hr className="filet" />
            <p className="lead" data-reveal>
              À la Fondation En Cœur, qui existe depuis 1984 pour une raison simple : le réseau de
              la santé soigne l’enfant, mais personne ne s’occupe du reste. L’hôtel près de
              l’hôpital. Le stationnement. L’essence. Les repas avalés debout. La nuit où il
              faudrait parler à quelqu’un.
            </p>
            <p data-reveal>
              La Fondation prend ce relais-là, à Montréal, à Québec, à Trois-Rivières et en
              Estrie. Chaque jour, une famille de plus reçoit son aide.
            </p>

            <div className="faits" data-reveal>
              <div>
                <b data-compte="900">900</b>
                <span>familles touchées chaque année</span>
              </div>
              <div>
                <b><i data-compte="80">80</i>&times;</b>
                <span>plus fréquent que le cancer infantile</span>
              </div>
              <div>
                <b data-compte="1984" data-depart="1900" data-brut>1984</b>
                <span>année de fondation</span>
              </div>
            </div>

            <p style={{ marginTop: "1.8rem" }} data-reveal>
              <a className="lien-fleche" href="https://en-coeur.org/" target="_blank" rel="noopener">
                en-coeur.org <span aria-hidden="true">↗</span>
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
          <div className="invitation__ourson" data-dessin>
            <Ourson />
          </div>
          <blockquote data-lignes>
            « Un petit cœur s’est arrêté. Grâce à vous, beaucoup d’autres continueront de battre. »
          </blockquote>

          <div className="invitation__liens" data-reveal>
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
