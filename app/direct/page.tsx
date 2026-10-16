import type { Metadata } from "next";
import TableauMises from "@/components/TableauMises";

export const metadata: Metadata = {
  title: "Les mises en direct",
  description: "Classement des mises de l’encan silencieux, mis à jour en continu.",
  robots: { index: false, follow: false },
};

/**
 * Page prévue pour être projetée sur un écran le soir de la soirée.
 * Elle n’a ni menu ni pied de page : elle occupe l’écran en entier.
 */
export default function Direct() {
  return <TableauMises />;
}
