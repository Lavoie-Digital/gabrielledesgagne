import Link from "next/link";
import { fermerSession } from "@/app/admin/actions";
import NavAdmin from "@/components/admin/NavAdmin";
import Ourson from "@/components/Ourson";
import { exigerAdmin } from "@/lib/session";

/* Tout ce qui est sous ce dossier exige une session valide */
export default async function PriveLayout({ children }: { children: React.ReactNode }) {
  const admin = await exigerAdmin();

  return (
    <>
      <header className="adm-entete">
        <Link href="/admin" className="adm-marque">
          <Ourson className="adm-marque__ourson" />
          <span>Pour Clément <small>Espace privé</small></span>
        </Link>
        <NavAdmin />
        <div className="adm-compte">
          <span>{admin.courriel}</span>
          <form action={fermerSession}>
            <button type="submit" className="adm-lien">Se déconnecter</button>
          </form>
        </div>
      </header>
      <main className="adm-contenu">{children}</main>
    </>
  );
}
