"use client";

import { useActionState, useState } from "react";
import { faireUnDon } from "@/app/(public)/don/actions";
import ChoixDonateur, { type TypeDonateur } from "@/components/ChoixDonateur";
import { CONFIG, argent } from "@/lib/donnees";

/**
 * Le formulaire de don : don personnel ou corporatif, un montant, le reçu
 * fiscal si on le souhaite, puis la page de paiement sécurisée de Stripe
 * (où l’on saisit nom, courriel, téléphone et adresse).
 */
export default function FormulaireDon({ ouvert }: { ouvert: boolean }) {
  const { suggeres, minimum } = CONFIG.don;
  const [montant, setMontant] = useState(suggeres[1] ?? suggeres[0]);
  const [autre, setAutre] = useState("");
  const [recu, setRecu] = useState(false);
  const [type, setType] = useState<TypeDonateur>("personnel");
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
        <ChoixDonateur type={type} onChange={setType} />

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
              <b> après la soirée</b>, une fois les fonds remis : vous ne le recevrez donc pas
              tout de suite.
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
          Paiement sécurisé par Stripe. Vos coordonnées (nom, courriel, téléphone et adresse)
          vous seront demandées à l’étape suivante. Un courriel de confirmation vous est envoyé
          tout de suite.
        </p>
      </div>
    </form>
  );
}
