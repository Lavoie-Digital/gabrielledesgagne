import Link from "next/link";
import { notFound } from "next/navigation";
import { supprimerLot } from "@/app/admin/actions";
import BoutonSupprimer from "@/components/admin/BoutonSupprimer";
import FormLot from "@/components/admin/FormLot";
import { lireLot } from "@/lib/catalogue";
import { CATEGORIES } from "@/lib/donnees";

export const metadata = { title: "Modifier un lot" };

export default async function ModifierLot({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cree?: string }>;
}) {
  const { id } = await params;
  const { cree } = await searchParams;
  const lot = await lireLot(id);
  if (!lot) notFound();

  return (
    <>
      <Link href="/admin/lots" className="adm-retour">← Tous les lots</Link>
      <div className="adm-titre">
        <h1>{lot.titre}</h1>
        <BoutonSupprimer id={lot.id} action={supprimerLot} quoi={`le lot « ${lot.titre} »`} />
      </div>
      <FormLot
        key={lot.id}
        lot={lot}
        categories={CATEGORIES}
        message={cree ? "Lot créé. Il est déjà visible sur le site." : undefined}
      />
    </>
  );
}
