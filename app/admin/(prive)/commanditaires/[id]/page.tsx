import Link from "next/link";
import { notFound } from "next/navigation";
import { supprimerCommanditaire } from "@/app/admin/actions";
import BoutonSupprimer from "@/components/admin/BoutonSupprimer";
import FormCommanditaire from "@/components/admin/FormCommanditaire";
import { NOM_PALIER, lireCommanditaire } from "@/lib/catalogue";

export const metadata = { title: "Modifier un commanditaire" };

export default async function ModifierCommanditaire({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cree?: string }>;
}) {
  const { id } = await params;
  const { cree } = await searchParams;
  const c = await lireCommanditaire(id);
  if (!c) notFound();

  return (
    <>
      <Link href="/admin/commanditaires" className="adm-retour">← Tous les commanditaires</Link>
      <div className="adm-titre">
        <h1>{c.nom}</h1>
        <BoutonSupprimer id={c.id} action={supprimerCommanditaire} quoi={`« ${c.nom} »`} />
      </div>
      <FormCommanditaire
        key={c.id}
        c={c}
        paliers={Object.entries(NOM_PALIER)}
        message={cree ? "Commanditaire ajouté. Il est déjà visible sur le site." : undefined}
      />
    </>
  );
}
