import Link from "next/link";
import FormCommanditaire from "@/components/admin/FormCommanditaire";
import { NOM_PALIER } from "@/lib/catalogue";

export const metadata = { title: "Nouveau commanditaire" };

export default function NouveauCommanditaire() {
  return (
    <>
      <Link href="/admin/commanditaires" className="adm-retour">← Tous les commanditaires</Link>
      <h1>Nouveau commanditaire</h1>
      <FormCommanditaire paliers={Object.entries(NOM_PALIER)} />
    </>
  );
}
