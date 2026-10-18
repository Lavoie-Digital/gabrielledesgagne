import type { Metadata } from "next";
import Link from "next/link";
import EnTete from "@/components/EnTete";
import Footer from "@/components/Footer";
import { CONFIG } from "@/lib/donnees";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment la soirée-bénéfice Pour Clément recueille, utilise, conserve et protège vos renseignements personnels, conformément à la Loi 25.",
};

/* Le sommaire, dans l’ordre des sections */
const SECTIONS = [
  ["qui", "Qui sommes-nous"],
  ["responsable", "La personne responsable"],
  ["recueillis", "Ce que nous recueillons, et pourquoi"],
  ["consentement", "Votre consentement"],
  ["temoins", "Témoins et technologies"],
  ["partage", "Avec qui vos renseignements sont partagés"],
  ["hors-quebec", "Renseignements conservés hors du Québec"],
  ["conservation", "Combien de temps nous les gardons"],
  ["securite", "Comment nous les protégeons"],
  ["droits", "Vos droits"],
  ["plainte", "Porter plainte"],
  ["mineurs", "Les enfants de moins de 14 ans"],
  ["changements", "Modifications de cette politique"],
] as const;

export default function Confidentialite() {
  const { confidentialite: rp, evenement } = CONFIG;
  const ecrire = (
    <a href={`mailto:${rp.courriel}?subject=Renseignements%20personnels`}>{rp.courriel}</a>
  );

  return (
    <>
      <EnTete
        surtitre="Loi 25 · Québec"
        titre="Politique de confidentialité"
        texte="Ce que nous faisons de vos renseignements personnels, en termes simples. En résumé : nous en recueillons le moins possible, nous ne les vendons jamais, et vous pouvez nous demander à tout moment de les voir, de les corriger ou de les effacer."
      />

      <section className="section">
        <div className="wrap politique">
          <nav className="politique__sommaire" aria-label="Sommaire">
            <p className="surtitre">Sommaire</p>
            <ol>
              {SECTIONS.map(([id, titre]) => (
                <li key={id}><a href={`#${id}`}>{titre}</a></li>
              ))}
            </ol>
            <p className="politique__date">Mise à jour : {rp.miseAJour}</p>
          </nav>

          <article className="politique__texte">
            <h2 id="qui">Qui sommes-nous</h2>
            <p>
              Ce site présente la soirée-bénéfice <b>Pour Clément</b>, qui aura lieu le{" "}
              {evenement.date.toLowerCase()} à l’{evenement.lieu}. La soirée est organisée par{" "}
              {rp.responsable}, au profit de la{" "}
              <a href="https://en-coeur.org/" target="_blank" rel="noopener">Fondation En Cœur</a>.
            </p>
            <p>
              La Fondation En Cœur est un organisme distinct. Les renseignements qu’elle recueille
              elle-même, par exemple pour émettre un reçu fiscal, sont régis par sa propre
              politique de confidentialité.
            </p>
            <p>
              Cette politique s’applique au site, à la billetterie, aux dons, à l’encan
              silencieux et à toute communication que vous avez avec nous au sujet de la soirée.
            </p>

            <h2 id="responsable">La personne responsable</h2>
            <p>
              La personne responsable de la protection des renseignements personnels est :
            </p>
            <address className="politique__encadre">
              <b>{rp.responsable}</b>
              <br />
              {rp.titre}
              <br />
              {ecrire}
            </address>
            <p>
              C’est à elle que vous pouvez adresser toute question, toute demande d’accès ou de
              correction, et toute plainte au sujet de vos renseignements.
            </p>

            <h2 id="recueillis">Ce que nous recueillons, et pourquoi</h2>
            <p>
              Nous ne recueillons que les renseignements nécessaires aux fins indiquées
              ci-dessous, et nous ne les utilisons pas à d’autres fins sans votre consentement.
            </p>

            <h3>Quand vous visitez le site</h3>
            <p>
              Nous ne vous demandons rien. Le site n’utilise <b>aucun témoin (cookie)</b>, aucun
              outil de mesure d’audience et aucune publicité. Comme pour tout site Web, notre
              hébergeur enregistre automatiquement des données techniques (adresse IP, type de
              navigateur, pages demandées, heure) dans des journaux qui servent uniquement à
              faire fonctionner le site et à le protéger contre les abus.
            </p>

            <h3>Quand vous réservez un billet, faites un don ou misez</h3>
            <p>
              Les paiements se font sur des plateformes spécialisées : Zeffy pour la billetterie
              et les dons, et la plateforme d’encan indiquée sur la page des prix. Elles
              recueillent votre nom, vos coordonnées et les renseignements de paiement. Nous ne
              voyons jamais votre numéro de carte. Nous recevons de ces plateformes votre nom,
              vos coordonnées, le nombre de billets, le montant de votre don ou de votre mise,
              afin de :
            </p>
            <ul className="liste">
              <li>vous accueillir à la soirée et vous placer à une table ;</li>
              <li>vous remettre un lot remporté à l’encan ;</li>
              <li>transmettre votre don à la Fondation En Cœur, qui émet les reçus fiscaux ;</li>
              <li>vous écrire au sujet de la soirée (confirmation, horaire, changement).</li>
            </ul>

            <h3>Si vous nous signalez une allergie ou une restriction alimentaire</h3>
            <p>
              Il s’agit d’un renseignement de santé, donc d’un <b>renseignement sensible</b>. Nous
              ne le recueillons que si vous choisissez de nous le donner, uniquement pour que le
              traiteur adapte votre repas. Il n’est transmis qu’au traiteur et à l’hôtel, sans
              autre détail que votre nom et votre table, et il est détruit après la soirée.
            </p>

            <h3>Quand vous nous écrivez ou nous appelez</h3>
            <p>
              Nous utilisons votre nom, votre adresse courriel ou votre numéro de téléphone pour
              vous répondre, et pour rien d’autre.
            </p>

            <h3>Si votre entreprise est commanditaire ou offre un lot</h3>
            <p>
              Nous conservons le nom de l’entreprise, son logo, son site Web et les coordonnées de
              la personne-ressource, afin d’afficher la commandite comme convenu et de faire le
              suivi de l’entente. Le nom, le logo et le site de l’entreprise sont publiés sur ce
              site avec son accord.
            </p>

            <h2 id="consentement">Votre consentement</h2>
            <p>
              Nous vous demandons votre consentement de façon claire, pour une fin précise, au
              moment où nous recueillons vos renseignements. Vous pouvez retirer votre
              consentement en tout temps en écrivant à {ecrire}. Ce retrait peut toutefois nous
              empêcher de vous rendre un service : par exemple, sans coordonnées, nous ne
              pourrons pas vous remettre un lot remporté.
            </p>

            <h2 id="temoins">Témoins et technologies</h2>
            <p>
              Le site public ne dépose <b>aucun témoin</b> sur votre appareil et ne vous suit pas
              d’une page à l’autre. Il n’utilise aucune technologie permettant de vous
              identifier, de vous localiser ou d’établir votre profil.
            </p>
            <p>
              Deux précisions :
            </p>
            <ul className="liste">
              <li>
                Le formulaire de don intégré à la page{" "}
                <Link href="/don">Faire un don</Link> est fourni par Zeffy, qui peut déposer ses
                propres témoins, nécessaires au paiement, selon sa politique.
              </li>
              <li>
                L’espace privé, réservé aux organisatrices et organisateurs, utilise un témoin de
                session strictement nécessaire à la connexion. Il ne concerne pas les visiteurs.
              </li>
            </ul>

            <h2 id="partage">Avec qui vos renseignements sont partagés</h2>
            <p>
              Nous ne vendons, ne louons et n’échangeons jamais vos renseignements. Nous les
              communiquons seulement, et seulement dans la mesure nécessaire, à :
            </p>
            <ul className="liste">
              <li><b>la Fondation En Cœur</b>, pour les dons et les reçus fiscaux ;</li>
              <li><b>Zeffy</b> et la <b>plateforme d’encan</b>, qui traitent les paiements ;</li>
              <li>
                <b>l’hôtel et le traiteur</b>, pour la liste des invités, le plan de salle et les
                repas adaptés ;
              </li>
              <li>
                nos <b>fournisseurs techniques</b> : l’hébergeur du site et Google Firebase, qui
                héberge la base de données de l’encan et la connexion à l’espace privé.
              </li>
            </ul>
            <p>
              Ces fournisseurs n’ont le droit d’utiliser vos renseignements que pour le service
              qu’ils nous rendent. Nous pourrions aussi devoir communiquer un renseignement si la
              loi l’exige.
            </p>

            <h2 id="hors-quebec">Renseignements conservés hors du Québec</h2>
            <p>
              Certains de nos fournisseurs techniques, notamment Google (Firebase) et l’hébergeur
              du site, peuvent conserver des renseignements sur des serveurs situés à l’extérieur
              du Québec, par exemple aux États-Unis. Avant de leur confier des renseignements,
              nous évaluons, comme l’exige la loi, si ceux-ci y bénéficient d’une protection
              adéquate, notamment au regard des engagements contractuels de ces fournisseurs.
            </p>

            <h2 id="conservation">Combien de temps nous les gardons</h2>
            <p>
              Nous gardons vos renseignements le temps nécessaire aux fins pour lesquelles ils ont
              été recueillis. Les listes d’invités, les renseignements alimentaires et les
              coordonnées des personnes qui ont misé sont détruits au plus tard{" "}
              <b>douze mois après la soirée</b>, sauf si la loi nous oblige à les garder plus
              longtemps (par exemple pour la comptabilité). Ils sont alors détruits de façon
              sécuritaire ou rendus anonymes.
            </p>

            <h2 id="securite">Comment nous les protégeons</h2>
            <p>
              L’accès à vos renseignements est limité aux personnes qui en ont besoin pour
              organiser la soirée. L’espace privé du site est protégé par une authentification et
              réservé à une liste fermée d’adresses. Les échanges avec le site sont chiffrés, et
              la base de données n’est accessible que par le serveur du site.
            </p>
            <p>
              En cas d’incident de confidentialité (par exemple un accès non autorisé), nous
              prenons rapidement les mesures pour en limiter les effets, nous le consignons dans
              un registre et, s’il présente un risque de préjudice sérieux, nous en avisons la
              Commission d’accès à l’information et les personnes concernées.
            </p>

            <h2 id="droits">Vos droits</h2>
            <p>Vous pouvez en tout temps nous demander :</p>
            <ul className="liste">
              <li>d’<b>accéder</b> aux renseignements que nous détenons sur vous ;</li>
              <li>de les <b>corriger</b> s’ils sont inexacts, incomplets ou équivoques ;</li>
              <li>de les <b>supprimer</b>, ou de <b>retirer votre consentement</b> ;</li>
              <li>
                de <b>cesser de diffuser</b> un renseignement vous concernant, ou de
                désindexer un lien qui y mène ;
              </li>
              <li>
                de recevoir les renseignements que vous nous avez fournis dans un{" "}
                <b>format technologique structuré</b> et couramment utilisé (portabilité).
              </li>
            </ul>
            <p>
              Écrivez à {ecrire}. Nous vous répondrons par écrit dans un délai de{" "}
              <b>30 jours</b>, gratuitement. Pour protéger vos renseignements, nous pourrions vous
              demander de confirmer votre identité.
            </p>
            <p>
              Aucune décision vous concernant n’est prise de façon automatisée.
            </p>

            <h2 id="plainte">Porter plainte</h2>
            <p>
              Si vous n’êtes pas satisfait de notre réponse ou de notre façon de traiter vos
              renseignements, écrivez-nous d’abord : nous voulons régler la situation. Vous pouvez
              aussi vous adresser à la{" "}
              <a href="https://www.cai.gouv.qc.ca/" target="_blank" rel="noopener">
                Commission d’accès à l’information du Québec
              </a>{" "}
              (1 888 528-7741).
            </p>

            <h2 id="mineurs">Les enfants de moins de 14 ans</h2>
            <p>
              La soirée et ce site s’adressent aux adultes. Nous ne recueillons pas sciemment de
              renseignements sur un enfant de moins de 14 ans sans le consentement de son parent
              ou de son tuteur.
            </p>

            <h2 id="changements">Modifications de cette politique</h2>
            <p>
              Nous pouvons mettre cette politique à jour, par exemple si nous changeons de
              fournisseur. La date de la dernière mise à jour figure en haut de la page. Si un
              changement touche la façon dont nous utilisons des renseignements déjà recueillis,
              nous vous en informerons.
            </p>
          </article>
        </div>
      </section>

      <Footer />
    </>
  );
}
