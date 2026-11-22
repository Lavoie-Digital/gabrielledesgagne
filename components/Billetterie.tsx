"use client";

import { useActionState, useState } from "react";
import { passerAuPaiement } from "@/app/(public)/billets/actions";
import ChoixDonateur, { type TypeDonateur } from "@/components/ChoixDonateur";
import { CONFIG, argent } from "@/lib/donnees";

/**
 * Le formulaire de réservation : achat personnel ou corporatif, nombre de
 * billets, don supplémentaire, reçu fiscal, puis envoi vers la page de
 * paiement sécurisée de Stripe (nom, courriel, téléphone et adresse).
 *
 * `restantes` vaut null quand on ne sait pas (Firestore injoignable) ;
 * `ouverte` est faux tant que Stripe n’est pas configuré.
 */
export default function Billetterie({ restantes, ouverte }: { restantes: number | null; ouverte: boolean }) {
  const { prix, placesParTable, maxParCommande, donsSuggeres } = CONFIG.billet;
  const max = Math.max(1, Math.min(maxParCommande, restantes ?? maxParCommande));
  const complet = restantes === 0;

  const [qte, setQte] = useState(1);
  const [recu, setRecu] = useState(false);
  const [type, setType] = useState<TypeDonateur>("personnel");
  const [don, setDon] = useState(0);
  const [autre, setAutre] = useState("");
  const [etat, action, envoi] = useActionState(passerAuPaiement, null);

  const borner = (n: number) => Math.min(max, Math.max(1, n || 1));
  const tables = qte / placesParTable;
  const total = qte * prix + don;
  const choisirAutre = (v: string) => {
    setAutre(v);
    const n = Math.round(Number(v.replace(",", ".")));
    setDon(Number.isFinite(n) && n > 0 ? n : 0);
  };

  if (complet) {
    return (
      <p className="billetterie-erreur" style={{ textAlign: "center" }}>
        La soirée affiche complet. Merci de tout cœur ! Il est encore possible de faire un don.
      </p>
    );
  }

  return (
    <form action={action}>
      <input type="hidden" name="qte" value={qte} />
      <input type="hidden" name="don" value={don} />

      {ouverte && restantes !== null && restantes <= 40 && (
        <p className="places-restantes">
          Plus que {restantes} {restantes > 1 ? "places" : "place"} disponibles
        </p>
      )}

      <ChoixDonateur type={type} onChange={setType} titre="Type d’achat" />

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
            max={max}
            value={qte}
            onChange={(e) => setQte(borner(parseInt(e.target.value, 10)))}
          />
          <button type="button" onClick={() => setQte(borner(qte + 1))} aria-label="Ajouter un billet">
            +
          </button>
        </div>
        {placesParTable <= max && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setQte(placesParTable)}>
            Une table de {placesParTable}
          </button>
        )}
      </div>

      <div className="don-extra">
        <p>Ajouter un don à la Fondation (facultatif)</p>
        <div className="don-extra__choix">
          {donsSuggeres.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={don === m && !autre}
              onClick={() => {
                setAutre("");
                setDon(don === m && !autre ? 0 : m);
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
            Montant du reçu à venir. Le reçu est émis par la Fondation
            En Cœur <b>après la soirée</b>, une fois les fonds remis : vous ne le recevrez donc
            pas tout de suite.
          </small>
        </span>
      </label>

      <div className="total-box">
        <div>
          <span>Total</span>
          <div style={{ fontSize: ".82rem", color: "var(--ink-soft)", fontWeight: 400 }}>
            {qte} {qte > 1 ? "billets" : "billet"} × {argent(prix)}
            {Number.isInteger(tables) && tables >= 1
              ? `, soit ${tables} ${tables > 1 ? "tables complètes" : "table complète"}`
              : ""}
            {don > 0 ? ` + don de ${argent(don)}` : ""}
          </div>
        </div>
        <b>{argent(total)}</b>
      </div>

      {etat?.message && (
        <p className="billetterie-erreur" role="alert">
          {etat.message}
        </p>
      )}

      {ouverte ? (
        <button type="submit" className="btn btn--primary btn--block" disabled={envoi}>
          {envoi ? "Un instant…" : "Passer au paiement"}
        </button>
      ) : (
        <span className="btn btn--primary btn--block btn--disabled" aria-disabled="true">
          Billetterie bientôt ouverte
        </span>
      )}

      <p style={{ fontSize: ".82rem", color: "var(--ink-soft)", marginTop: "1rem", textAlign: "center" }}>
        Paiement sécurisé par Stripe. Vos coordonnées (nom, courriel, téléphone et adresse)
        vous seront demandées à l’étape suivante. Vos numéros de billets s’affichent dès le
        paiement confirmé et vous sont envoyés par courriel. Une question ? Écrivez à{" "}
        <a href={`mailto:${CONFIG.contact.courriel}`}>{CONFIG.contact.courriel}</a>.
      </p>
    </form>
  );
}
