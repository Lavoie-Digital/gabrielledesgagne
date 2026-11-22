"use client";

export type TypeDonateur = "personnel" | "corporatif";

/**
 * « Personnel » ou « Corporatif », commun au formulaire de don et à la
 * billetterie. En corporatif, on demande aussi le nom de l’entreprise et le
 * poste de la personne. Les autres coordonnées (nom, courriel, téléphone,
 * adresse) sont saisies sur la page de paiement Stripe.
 */
export default function ChoixDonateur({
  type,
  onChange,
  titre = "Type de don",
}: {
  type: TypeDonateur;
  onChange: (t: TypeDonateur) => void;
  titre?: string;
}) {
  return (
    <>
      <input type="hidden" name="type" value={type} />
      <div className="don-extra">
        <p>{titre}</p>
        <div className="don-extra__choix">
          <button type="button" aria-pressed={type === "personnel"} onClick={() => onChange("personnel")}>
            Personnel
          </button>
          <button type="button" aria-pressed={type === "corporatif"} onClick={() => onChange("corporatif")}>
            Corporatif
          </button>
        </div>
      </div>

      {type === "corporatif" && (
        <div className="don-champs">
          <label>
            <span>Nom de l’entreprise</span>
            <input type="text" name="entreprise" required maxLength={120} autoComplete="organization" />
          </label>
          <label>
            <span>Votre poste</span>
            <input
              type="text"
              name="poste"
              required
              maxLength={120}
              autoComplete="organization-title"
              placeholder="Ex. : comptable, présidente…"
            />
          </label>
        </div>
      )}
    </>
  );
}
