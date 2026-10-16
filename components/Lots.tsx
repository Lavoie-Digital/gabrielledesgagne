"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CATEGORIES, CONFIG, LOTS, argent, type Lot } from "@/lib/donnees";

export default function Lots() {
  const [filtre, setFiltre] = useState("Tous");
  const [ouvert, setOuvert] = useState<number | null>(null);

  // Seules les catégories réellement utilisées apparaissent dans les filtres
  const utilisees = CATEGORIES.filter((c) => LOTS.some((l) => l.categorie === c));

  const visibles = LOTS.map((lot, i) => ({ lot, i })).filter(
    ({ lot }) => filtre === "Tous" || lot.categorie === filtre
  );

  // Fermer la fiche avec la touche Échap
  useEffect(() => {
    if (ouvert === null) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOuvert(null);
    };
    document.addEventListener("keydown", surTouche);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", surTouche);
      document.body.style.overflow = "";
    };
  }, [ouvert]);

  const lienDe = (lot: Lot) => lot.lienMise || CONFIG.liens.encan;
  const peutMiser = (lot: Lot) => CONFIG.encan.ouvert && Boolean(lienDe(lot));

  return (
    <>
      <div className="center" style={{ marginBottom: "1.5rem" }}>
        <h2>Parcourez les lots</h2>
        <hr className="filet" />
        <p className="lead" style={{ fontWeight: 700, color: "var(--ink)" }}>
          {visibles.length} {visibles.length > 1 ? "lots affichés" : "lot affiché"}
        </p>
      </div>

      <div className="filters">
        {["Tous", ...utilisees].map((c) => (
          <button
            key={c}
            type="button"
            className={filtre === c ? "is-active" : ""}
            onClick={() => setFiltre(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="lots">
        {visibles.map(({ lot, i }) => (
          <article className="lot" key={i}>
            <div className="lot__media">
              <span className="lot__cat">{lot.categorie}</span>
              <span className="lot__num">Lot {String(i + 1).padStart(2, "0")}</span>
              {lot.image ? (
                <Image src={lot.image} alt={lot.titre} width={600} height={450} />
              ) : (
                <div className="lot__placeholder">
                  <b>{String(i + 1).padStart(2, "0")}</b>
                  <span>Photo à venir</span>
                </div>
              )}
            </div>

            <div className="lot__body">
              <h3 className="lot__title">{lot.titre}</h3>
              <div className="lot__donor">Offert par {lot.donateur}</div>
              <p className="lot__desc">{lot.description}</p>

              <div className="lot__bid">
                <div>
                  <div className="lot__bid-label">Mise actuelle</div>
                  <div className="lot__bid-amount">{argent(lot.miseActuelle)}</div>
                </div>
                <div className="lot__bid-meta">
                  {lot.nbMises === 0
                    ? "Aucune mise"
                    : `${lot.nbMises} ${lot.nbMises > 1 ? "mises" : "mise"}`}
                  <br />
                  Départ {argent(lot.miseDepart)}
                </div>
              </div>

              {peutMiser(lot) ? (
                <a
                  className="btn btn--primary btn--block btn--sm"
                  href={lienDe(lot)}
                  target="_blank"
                  rel="noopener"
                >
                  Miser
                </a>
              ) : (
                <button
                  className="btn btn--ghost btn--block btn--sm"
                  onClick={() => setOuvert(i)}
                >
                  Voir le lot
                </button>
              )}

              <p className="lot__value" style={{ marginTop: ".8rem" }}>
                Valeur au détail : <b>{argent(lot.valeur)}</b>
              </p>
            </div>
          </article>
        ))}
      </div>

      {ouvert !== null && (
        <FicheLot
          lot={LOTS[ouvert]}
          index={ouvert}
          fermer={() => setOuvert(null)}
        />
      )}
    </>
  );
}

function FicheLot({
  lot,
  index,
  fermer,
}: {
  lot: Lot;
  index: number;
  fermer: () => void;
}) {
  const cible = lot.lienMise || CONFIG.liens.encan;
  const peutMiser = CONFIG.encan.ouvert && Boolean(cible);

  return (
    <div
      className="modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) fermer();
      }}
    >
      <div className="modal__box" role="dialog" aria-modal="true" aria-label={lot.titre}>
        <div className="modal__head">
          <button className="modal__close" onClick={fermer} aria-label="Fermer" autoFocus>
            &times;
          </button>
          <p>
            Lot {String(index + 1).padStart(2, "0")} &middot; {lot.categorie}
          </p>
          <h3>{lot.titre}</h3>
        </div>

        <div className="modal__body">
          <p>{lot.description}</p>
          <div className="modal__row"><span>Offert par</span><b>{lot.donateur}</b></div>
          <div className="modal__row"><span>Valeur au détail</span><b>{argent(lot.valeur)}</b></div>
          <div className="modal__row"><span>Mise de départ</span><b>{argent(lot.miseDepart)}</b></div>
          <div className="modal__row"><span>Mise actuelle</span><b>{argent(lot.miseActuelle)}</b></div>

          <div style={{ marginTop: "1.5rem" }}>
            {peutMiser ? (
              <a className="btn btn--primary btn--block" href={cible} target="_blank" rel="noopener">
                Miser sur ce lot
              </a>
            ) : (
              <div className="notice">{CONFIG.encan.messageFerme}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
