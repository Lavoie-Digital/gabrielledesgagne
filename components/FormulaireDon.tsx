"use client";

import { useActionState, useState } from "react";
import { faireUnDon } from "@/app/(public)/don/actions";
import { CONFIG, argent } from "@/lib/donnees";

/**
 * Le formulaire de don : un montant, le reçu fiscal si on le souhaite, puis
 * la page de paiement sécurisée de Stripe. Rien d’autre.
 */
export default function FormulaireDon({ ouvert }: { ouvert: boolean }) {
  const { suggeres, minimum } = CONFIG.don;
  const [montant, setMontant] = useState(suggeres[1] ?? suggeres[0]);
  const [autre, setAutre] = useState("");
  const [recu, setRecu] = useState(false);
  const [etat, action, envoi] = useActionState(faireUnDon, null);

  const choisirAutre = (v: string) => {
    setAutre(v);
    const n = Math.round(Number(v.replace(",", ".")));
    setMontant(Number.isFinite(n) && n > 0 ? n : 0);
  };

  return (
    <form action={action} className="ticket" id="formulaire-don">
      <input type="hidden" name="montant" value={montant} />
      <div className="ticket__body">
        <div className="don-extra">
          <p>Montant de votre don</p>
          <div className="don-extra__choix">
            {suggeres.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={montant === m && !autre}
                onClick={() => {
                  setAutre("");
                  setMontant(m);
                }}
              >
                {argent(m)}
              </button>
            ))}
            <label className="don-extra__autre">
              <span className="sr-only">Autre montant</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Autre"
                value={autre}
                onChange={(e) => choisirAutre(e.target.value.replace(/[^\d,.]/g, ""))}
              />
              $
            </label>
          </div>
        </div>

        <label className="option-recu">
          <input type="checkbox" name="recu" checked={recu} onChange={(e) => setRecu(e.target.checked)} />
          <span>
            <b>Je souhaite un reçu fiscal</b>
            <small>
              Pour le montant complet de votre don. Le reçu est émis par la Fondation En Cœur
              après la soirée, une fois les fonds remis. Votre adresse vous sera demandée au
              paiement.
            </small>
          </span>
        </label>

        <div className="total-box">
          <span>Votre don</span>
          <b>{argent(montant)}</b>
        </div>

        {etat?.message && (
          <p className="billetterie-erreur" role="alert">
            {etat.message}
          </p>
        )}

        {ouvert ? (
          <button type="submit" className="btn btn--primary btn--block" disabled={envoi || montant < minimum}>
            {envoi ? "Un instant…" : `Donner ${argent(montant)}`}
          </button>
        ) : (
          <span className="btn btn--primary btn--block btn--disabled" aria-disabled="true">
            Dons en ligne bientôt ouverts
          </span>
        )}

        <p style={{ fontSize: ".82rem", color: "var(--ink-soft)", marginTop: "1rem", textAlign: "center" }}>
          Paiement sécurisé par Stripe. Un courriel de confirmation vous est envoyé tout de suite.
        </p>
      </div>
    </form>
  );
}
