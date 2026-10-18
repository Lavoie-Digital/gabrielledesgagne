import LigneMise from "@/components/admin/LigneMise";
import { lireLots } from "@/lib/catalogue";
import { CONFIG } from "@/lib/donnees";

export const metadata = { title: "Mises du soir" };

export default async function Mises() {
  const lots = await lireLots();

  return (
    <>
      <div className="adm-titre">
        <h1>Mises du soir</h1>
        <a className="adm-btn" href="/direct" target="_blank" rel="noopener">Ouvrir l’écran /direct ↗</a>
      </div>
      <p className="adm-discret" style={{ maxWidth: "62ch" }}>
        Tapez la nouvelle mise et appuyez sur Entrée. L’écran projeté se met à jour à son
        prochain rafraîchissement (toutes les {CONFIG.encan.intervalleSecondes} secondes), et le lot s’y illumine.
      </p>
      <div className="adm-mises">
        {lots.map((l) => (
          <LigneMise key={l.id} id={l.id} titre={l.titre} miseActuelle={l.miseActuelle} nbMises={l.nbMises} />
        ))}
      </div>
    </>
  );
}
