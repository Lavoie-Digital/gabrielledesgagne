import { CONFIG } from "@/lib/donnees";

export default function FormulaireDon() {
  const url = CONFIG.liens.donIntegre;

  if (url) {
    return (
      <div className="embed-frame">
        <iframe src={url} title="Formulaire de don" loading="lazy" allow="payment" />
      </div>
    );
  }

  return (
    <div className="embed-placeholder">
      <div>
        <p className="surtitre">Formulaire de don</p>
        <h3>Le formulaire Zeffy s’affichera ici</h3>
        <p className="lead" style={{ maxWidth: 460, margin: "0 auto 1.4rem" }}>
          Créez votre formulaire de don sur Zeffy, copiez son adresse, puis collez-la
          dans le fichier <b>lib/donnees.ts</b> à la ligne <b>donIntegre</b>.
        </p>
        <a
          className="btn btn--ghost btn--sm"
          href="https://www.zeffy.com/fr-CA"
          target="_blank"
          rel="noopener"
        >
          Aller sur Zeffy
        </a>
      </div>
    </div>
  );
}
