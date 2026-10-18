import Link from "next/link";
import { lireLots } from "@/lib/catalogue";
import { argent } from "@/lib/donnees";

export const metadata = { title: "Lots de l’encan" };

export default async function ListeLots() {
  const lots = await lireLots();

  return (
    <>
      <div className="adm-titre">
        <h1>Lots de l’encan</h1>
        <Link className="adm-btn adm-btn--plein" href="/admin/lots/nouveau">Ajouter un lot</Link>
      </div>

      {lots.length === 0 ? (
        <p className="adm-carte">Aucun lot pour l’instant. Le site public affiche les exemples en attendant.</p>
      ) : (
        <table className="adm-table">
          <thead>
            <tr>
              <th>#</th><th></th><th>Lot</th><th>Catégorie</th>
              <th className="nb">Valeur</th><th className="nb">Mise actuelle</th><th></th>
            </tr>
          </thead>
          <tbody>
            {lots.map((l) => (
              <tr key={l.id}>
                <td className="adm-discret">{l.ordre}</td>
                <td>
                  {l.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- vignette d’administration
                    <img className="adm-vignette" src={l.image} alt="" />
                  ) : (
                    <span className="adm-vignette adm-vignette--vide" />
                  )}
                </td>
                <td>
                  <Link href={`/admin/lots/${l.id}`} className="adm-table__titre">{l.titre}</Link>
                  <small>{l.donateur || "Donateur à préciser"}</small>
                </td>
                <td>{l.categorie}</td>
                <td className="nb">{argent(l.valeur)}</td>
                <td className="nb">
                  {argent(l.miseActuelle)}
                  <small>{l.nbMises} {l.nbMises > 1 ? "mises" : "mise"}</small>
                </td>
                <td><Link href={`/admin/lots/${l.id}`} className="adm-lien">Modifier</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
