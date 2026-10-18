"use client";

import { useActionState } from "react";
import { importerExemples, type Retour } from "@/app/admin/actions";

export default function BoutonImport() {
  const [retour, agir, enCours] = useActionState<Retour>(() => importerExemples(), null);
  return (
    <form action={agir} className="adm-pile">
      <button type="submit" className="adm-btn adm-btn--plein" disabled={enCours}>
        {enCours ? "Import en cours…" : "Importer les exemples dans Firestore"}
      </button>
      {retour && <p className={retour.ok ? "adm-succes" : "adm-alerte"}>{retour.message}</p>}
    </form>
  );
}
