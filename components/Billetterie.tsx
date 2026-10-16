"use client";

import { useState } from "react";
import { CONFIG, argent } from "@/lib/donnees";

export default function Billetterie() {
  const prix = CONFIG.billet.prix;
  const parTable = CONFIG.billet.placesParTable;
  const [qte, setQte] = useState(1);

  const borner = (n: number) => Math.min(40, Math.max(1, n || 1));
  const tables = qte / parTable;
  const lienActif = Boolean(CONFIG.liens.billetterie);

  return (
    <>
      <div className="qty">
        <label htmlFor="qte">Nombre de billets</label>
        <div className="qty__control">
          <button type="button" onClick={() => setQte(borner(qte - 1))} aria-label="Retirer un billet">
            &minus;
          </button>
          <input
            type="number"
            id="qte"
            min={1}
            max={40}
            value={qte}
            onChange={(e) => setQte(borner(parseInt(e.target.value, 10)))}
          />
          <button type="button" onClick={() => setQte(borner(qte + 1))} aria-label="Ajouter un billet">
            +
          </button>
        </div>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setQte(parTable)}>
          Une table de {parTable}
        </button>
      </div>

      <div className="total-box">
        <div>
          <span>Total</span>
          <div style={{ fontSize: ".82rem", color: "var(--ink-soft)", fontWeight: 400 }}>
            {qte} {qte > 1 ? "billets" : "billet"} × {argent(prix)}
            {Number.isInteger(tables) && tables >= 1
              ? `, soit ${tables} ${tables > 1 ? "tables complètes" : "table complète"}`
              : ""}
          </div>
        </div>
        <b>{argent(qte * prix)}</b>
      </div>

      {lienActif ? (
        <a
          className="btn btn--primary btn--block"
          href={CONFIG.liens.billetterie}
          target="_blank"
          rel="noopener"
        >
          Passer à la réservation
        </a>
      ) : (
        <span className="btn btn--primary btn--block btn--disabled" aria-disabled="true">
          Billetterie bientôt ouverte
        </span>
      )}

      <p style={{ fontSize: ".82rem", color: "var(--ink-soft)", marginTop: "1rem", textAlign: "center" }}>
        Le paiement se fait de façon sécurisée sur notre plateforme de billetterie.
        Une question ? Écrivez à{" "}
        <a href={`mailto:${CONFIG.contact.courriel}`}>{CONFIG.contact.courriel}</a>.
      </p>
    </>
  );
}
