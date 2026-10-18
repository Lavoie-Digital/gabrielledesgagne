import Link from "next/link";
import { NOM_PALIER, PALIERS, lireCommanditaires } from "@/lib/catalogue";

export const metadata = { title: "Commanditaires" };

export default async function ListeCommanditaires() {
  const liste = await lireCommanditaires();

  return (
    <>
      <div className="adm-titre">
        <h1>Commanditaires</h1>
        <Link className="adm-btn adm-btn--plein" href="/admin/commanditaires/nouveau">
          Ajouter un commanditaire
        </Link>
      </div>

      {liste.length === 0 && (
        <p className="adm-carte">Aucun commanditaire pour l’instant. Le site public affiche les exemples en attendant.</p>
      )}

      {PALIERS.map((p) => {
        const du = liste.filter((c) => c.palier === p);
        if (!du.length) return null;
        return (
          <section key={p} className="adm-section">
            <h2>{NOM_PALIER[p]} <span className="adm-discret">({du.length})</span></h2>
            <ul className="adm-logos">
              {du.map((c) => (
                <li key={c.id}>
                  <Link href={`/admin/commanditaires/${c.id}`}>
                    <span className="adm-logos__logo">
                      {c.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element -- vignette d’administration
                        <img src={c.logo} alt="" />
                      ) : (
                        <em>Logo à venir</em>
                      )}
                    </span>
                    <b>{c.nom}</b>
                    <small>Position {c.ordre}</small>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
