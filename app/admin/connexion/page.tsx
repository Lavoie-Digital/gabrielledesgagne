import { redirect } from "next/navigation";
import Connexion from "@/components/admin/Connexion";
import Ourson from "@/components/Ourson";
import { firebaseConfigure } from "@/lib/firebase-admin";
import { adminConnecte } from "@/lib/session";

export const metadata = { title: "Connexion" };

export default async function PageConnexion() {
  if (await adminConnecte()) redirect("/admin");

  return (
    <main className="adm-connexion">
      <div className="adm-connexion__boite">
        <Ourson className="adm-connexion__ourson" />
        <h1>Espace privé</h1>
        <p className="adm-discret">
          Pour gérer les lots de l’encan et les commanditaires de la soirée Pour Clément.
        </p>
        {firebaseConfigure ? (
          <Connexion />
        ) : (
          <p className="adm-alerte">
            Firebase n’est pas configuré sur ce serveur : les variables FIREBASE_* du fichier
            .env sont manquantes.
          </p>
        )}
      </div>
    </main>
  );
}
