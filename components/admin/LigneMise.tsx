"use client";

import { startTransition, useActionState } from "react";
import { majMise, type Retour } from "@/app/admin/actions";

/* Une rangée par lot : on tape la nouvelle mise, Entrée, c’est publié */
export default function LigneMise({
  id,
  titre,
  miseActuelle,
  nbMises,
}: {
  id: string;
  titre: string;
  miseActuelle: number;
  nbMises: number;
}) {
  const [retour, agir, enCours] = useActionState<Retour, FormData>(majMise, null);

  return (
    <form
      className="adm-mise"
      onSubmit={(e) => {
        e.preventDefault();
        const donnees = new FormData(e.currentTarget);
        startTransition(() => agir(donnees));
      }}
    >
      <input type="hidden" name="id" value={id} />
      <span className="adm-mise__titre">{titre}</span>
      <label>
        <span>Mise ($)</span>
        <input name="miseActuelle" inputMode="decimal" defaultValue={miseActuelle} />
      </label>
      <label>
        <span>Nb de mises</span>
        <input name="nbMises" inputMode="numeric" defaultValue={nbMises} />
      </label>
      <button type="submit" className="adm-btn" disabled={enCours}>
        {enCours ? "…" : "Publier"}
      </button>
      <span className={"adm-mise__etat" + (retour && !retour.ok ? " adm-mise__etat--erreur" : "")} role="status">
        {retour?.message}
      </span>
    </form>
  );
}
