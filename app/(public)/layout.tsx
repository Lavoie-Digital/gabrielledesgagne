import DefilementFluide from "@/components/DefilementFluide";
import Header from "@/components/Header";

/**
 * Habillage des pages publiques : en-tête, menu, défilement fluide.
 * Les animations de chaque page vivent dans template.tsx, qui se recrée à
 * chaque navigation.
 * La page d’affichage de l’encan (/direct) ne passe pas par ici, ce qui lui
 * permet d’occuper l’écran en entier, sans menu ni pied de page.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      <Header />
      <main id="contenu">{children}</main>
      <DefilementFluide />
    </>
  );
}
