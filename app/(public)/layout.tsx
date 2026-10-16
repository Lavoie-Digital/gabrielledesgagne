import Animations from "@/components/Animations";
import Header from "@/components/Header";

/**
 * Habillage des pages publiques : en-tête, menu, animations.
 * La page d’affichage de l’encan (/direct) ne passe pas par ici, ce qui lui
 * permet d’occuper l’écran en entier, sans menu ni pied de page.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      <Header />
      <main id="contenu">{children}</main>
      <Animations />
    </>
  );
}
