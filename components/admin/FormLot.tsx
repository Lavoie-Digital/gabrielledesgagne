"use client";

import { startTransition, useActionState, useState } from "react";
import { enregistrerLot, type Retour } from "@/app/admin/actions";
import ChampImage from "@/components/admin/ChampImage";
import type { Lot } from "@/lib/donnees";

export default function FormLot({
  lot,
  categories,
  message,
}: {
  lot?: Lot & { id: string; ordre: number };
  categories: string[];
  message?: string;
}) {
  const [retour, agir, enCours] = useActionState<Retour, FormData>(
    enregistrerLot,
    message ? { ok: true, message } : null
  );
  const [cadrage, setCadrage] = useState(lot?.cadrage ?? "entier");

  return (
    // Envoi par onSubmit plutôt que action={…} : React viderait sinon le
    // formulaire après chaque envoi, même quand il faut corriger une erreur
    <form
      className="adm-form"
      onSubmit={(e) => {
        e.preventDefault();
        const donnees = new FormData(e.currentTarget);
        startTransition(() => agir(donnees));
      }}
    >
      {lot && <input type="hidden" name="id" value={lot.id} />}

      <div className="adm-form__grille">
        <div className="adm-pile">
          <label className="adm-champ">
            <span>Titre du lot *</span>
            <input name="titre" required defaultValue={lot?.titre} placeholder="Escapade de deux nuits en Charlevoix" />
          </label>

          <div className="adm-form__deux">
            <label className="adm-champ">
              <span>Catégorie *</span>
              <select name="categorie" required defaultValue={lot?.categorie ?? ""}>
                <option value="" disabled>Choisir…</option>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="adm-champ">
              <span>Offert par</span>
              <input name="donateur" defaultValue={lot?.donateur} placeholder="Nom de l’entreprise" />
            </label>
          </div>

          <label className="adm-champ">
            <span>Description</span>
            <textarea name="description" rows={4} defaultValue={lot?.description}
              placeholder="Deux ou trois phrases : ce qui est inclus, les conditions." />
          </label>

          <div className="adm-form__trois">
            <label className="adm-champ">
              <span>Valeur au détail ($)</span>
              <input name="valeur" inputMode="decimal" defaultValue={lot?.valeur ?? 0} />
            </label>
            <label className="adm-champ">
              <span>Mise de départ ($)</span>
              <input name="miseDepart" inputMode="decimal" defaultValue={lot?.miseDepart ?? 0} />
            </label>
            <label className="adm-champ">
              <span>Position dans la liste</span>
              <input name="ordre" inputMode="numeric" defaultValue={lot?.ordre ?? ""} placeholder="à la fin" />
            </label>
          </div>

          <div className="adm-form__trois">
            <label className="adm-champ">
              <span>Mise actuelle ($)</span>
              <input name="miseActuelle" inputMode="decimal" defaultValue={lot?.miseActuelle ?? 0} />
            </label>
            <label className="adm-champ">
              <span>Nombre de mises</span>
              <input name="nbMises" inputMode="numeric" defaultValue={lot?.nbMises ?? 0} />
            </label>
          </div>

          <label className="adm-champ">
            <span>Lien pour miser sur ce lot (facultatif)</span>
            <input name="lienMise" type="url" defaultValue={lot?.lienMise} placeholder="https://…" />
          </label>
        </div>

        <ChampImage
          nom="image"
          libelle="Image du lot"
          actuelle={lot?.image}
          forme="photo"
          remplir={cadrage === "remplir"}
        >
          <fieldset className="adm-choix">
            <legend className="adm-champ__libelle">Affichage sur le site</legend>
            <label className="adm-case">
              <input
                type="radio"
                name="cadrage"
                value="entier"
                checked={cadrage === "entier"}
                onChange={() => setCadrage("entier")}
              />
              <span>
                Montrer l’image en entier
                <small>Pour un logo, une carte-cadeau : rien n’est coupé.</small>
              </span>
            </label>
            <label className="adm-case">
              <input
                type="radio"
                name="cadrage"
                value="remplir"
                checked={cadrage === "remplir"}
                onChange={() => setCadrage("remplir")}
              />
              <span>
                Remplir le cadre
                <small>Pour une photo : elle occupe tout l’espace, les bords peuvent être rognés.</small>
              </span>
            </label>
          </fieldset>
        </ChampImage>
      </div>

      <div className="adm-form__pied">
        <button type="submit" className="adm-btn adm-btn--plein" disabled={enCours}>
          {enCours ? "Enregistrement…" : lot ? "Enregistrer les changements" : "Créer le lot"}
        </button>
        {retour && (
          <p className={retour.ok ? "adm-succes" : "adm-alerte"} role="status">{retour.message}</p>
        )}
      </div>
    </form>
  );
}
