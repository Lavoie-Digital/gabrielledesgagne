import Link from "next/link";
import FormLot from "@/components/admin/FormLot";
import { CATEGORIES } from "@/lib/donnees";

export const metadata = { title: "Nouveau lot" };

export default function NouveauLot() {
  return (
    <>
      <Link href="/admin/lots" className="adm-retour">← Tous les lots</Link>
      <h1>Nouveau lot</h1>
      <FormLot categories={CATEGORIES} />
    </>
  );
}
