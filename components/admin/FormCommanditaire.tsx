"use client";

import { startTransition, useActionState } from "react";
import { enregistrerCommanditaire, type Retour } from "@/app/admin/actions";
import ChampImage from "@/components/admin/ChampImage";
import type { Commanditaire } from "@/lib/donnees";

export default function FormCommanditaire({
  c,
  paliers,
  message,
}: {
  c?: Commanditaire & { id: string; palier: string; ordre: number };
  paliers: [string, string][];
  message?: string;
}) {
  const [retour, agir, enCours] = useActionState<Retour, FormData>(
    enregistrerCommanditaire,
    message ? { ok: true, message } : null
  );

  return (
    <form
      className="adm-form"
      onSubmit={(e) => {
        e.preventDefault();
        const donnees = new FormData(e.currentTarget);
        startTransition(() => agir(donnees));
      }}
    >
      {c && <input type="hidden" name="id" value={c.id} />}

      <div className="adm-form__grille">
        <div className="adm-pile">
          <label className="adm-champ">
            <span>Nom de l’entreprise *</span>
            <input name="nom" required defaultValue={c?.nom} />
          </label>

          <div className="adm-form__deux">
            <label className="adm-champ">
              <span>Niveau *</span>
              <select name="palier" required defaultValue={c?.palier ?? ""}>
                <option value="" disabled>Choisir…</option>
                {paliers.map(([v, nom]) => <option key={v} value={v}>{nom}</option>)}
              </select>
            </label>
            <label className="adm-champ">
              <span>Position dans son niveau</span>
              <input name="ordre" inputMode="numeric" defaultValue={c?.ordre ?? ""} placeholder="à la fin" />
            </label>
          </div>

          <label className="adm-champ">
            <span>Site web</span>
            <input name="url" type="url" defaultValue={c?.url} placeholder="https://…" />
          </label>

          <label className="adm-champ">
            <span>Courte description (facultatif)</span>
            <textarea name="mot" rows={3} defaultValue={c?.mot}
              placeholder="Affichée sous le logo pour les partenaires Or et Argent, et les dons matériels." />
          </label>

          <p className="adm-discret">
            Le partenaire Or est mis en vedette sur l’accueil (« Soirée présentée par »). Les
            partenaires Bronze défilent dans le bandeau.
          </p>
        </div>

        <ChampImage nom="logo" libelle="Logo" actuelle={c?.logo} forme="logo" />
      </div>

      <div className="adm-form__pied">
        <button type="submit" className="adm-btn adm-btn--plein" disabled={enCours}>
          {enCours ? "Enregistrement…" : c ? "Enregistrer les changements" : "Ajouter le commanditaire"}
        </button>
        {retour && (
          <p className={retour.ok ? "adm-succes" : "adm-alerte"} role="status">{retour.message}</p>
        )}
      </div>
    </form>
  );
}
