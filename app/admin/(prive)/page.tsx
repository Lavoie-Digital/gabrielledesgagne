import Link from "next/link";
import BoutonImport from "@/components/admin/BoutonImport";
import { lireCommanditaires, lireLots } from "@/lib/catalogue";
import { argent } from "@/lib/donnees";

export const metadata = { title: "Tableau de bord" };

export default async function TableauDeBord() {
  let erreur = "";
  let lots: Awaited<ReturnType<typeof lireLots>> = [];
  let comms: Awaited<ReturnType<typeof lireCommanditaires>> = [];
  try {
    [lots, comms] = await Promise.all([lireLots(), lireCommanditaires()]);
  } catch (e) {
    erreur = e instanceof Error ? e.message.split("\n")[0] : String(e);
  }

  if (erreur) {
    return (
      <>
        <h1>Tableau de bord</h1>
        <div className="adm-alerte">
          <p><b>Firestore ne répond pas.</b> Le site public affiche en attendant les exemples de lib/donnees.ts.</p>
          <p>Le plus souvent, c’est que la base de données n’a pas encore été créée : console
            Firebase &gt; Firestore Database &gt; Créer une base de données.</p>
          <p className="adm-discret">Détail technique : {erreur}</p>
        </div>
      </>
    );
  }

  const totalMises = lots.reduce((s, l) => s + (l.nbMises > 0 ? l.miseActuelle : 0), 0);
  const valeur = lots.reduce((s, l) => s + l.valeur, 0);

  return (
    <>
      <h1>Tableau de bord</h1>

      <div className="adm-chiffres">
        <div><b>{lots.length}</b><span>lots à l’encan</span></div>
        <div><b>{argent(valeur)}</b><span>en valeur au détail</span></div>
        <div><b>{argent(totalMises)}</b><span>de mises reçues</span></div>
        <div><b>{comms.length}</b><span>commanditaires</span></div>
      </div>

      {lots.length === 0 && comms.length === 0 && (
        <section className="adm-carte">
          <h2>Firestore est vide</h2>
          <p>
            En attendant, le site public montre les exemples écrits dans lib/donnees.ts. Vous
            pouvez les copier ici d’un clic pour partir de là, ou commencer directement par vos
            propres fiches.
          </p>
          <BoutonImport />
        </section>
      )}

      <div className="adm-grille2">
        <section className="adm-carte">
          <h2>Lots de l’encan</h2>
          <p className="adm-discret">Titre, photo, valeur, mise de départ, donateur.</p>
          <div className="adm-rangee">
            <Link className="adm-btn adm-btn--plein" href="/admin/lots/nouveau">Ajouter un lot</Link>
            <Link className="adm-btn" href="/admin/lots">Voir les {lots.length} lots</Link>
          </div>
        </section>
        <section className="adm-carte">
          <h2>Commanditaires</h2>
          <p className="adm-discret">Or, Argent, Bronze et dons matériels, avec leur logo.</p>
          <div className="adm-rangee">
            <Link className="adm-btn adm-btn--plein" href="/admin/commanditaires/nouveau">Ajouter un commanditaire</Link>
            <Link className="adm-btn" href="/admin/commanditaires">Voir la liste</Link>
          </div>
        </section>
        <section className="adm-carte">
          <h2>Le soir de l’encan</h2>
          <p className="adm-discret">
            Saisissez les mises au fur et à mesure : l’écran projeté (/direct) suit tout seul.
          </p>
          <div className="adm-rangee">
            <Link className="adm-btn" href="/admin/mises">Saisir les mises</Link>
            <a className="adm-btn" href="/direct" target="_blank" rel="noopener">Ouvrir l’écran /direct ↗</a>
          </div>
        </section>
      </div>
    </>
  );
}
