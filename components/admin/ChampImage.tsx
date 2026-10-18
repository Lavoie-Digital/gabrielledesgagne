"use client";

import { useEffect, useState } from "react";

/* Choix d’une image, avec aperçu immédiat et option pour retirer l’actuelle */
export default function ChampImage({
  nom,
  libelle,
  actuelle,
  forme,
  remplir = false,
  children,
}: {
  nom: string;
  libelle: string;
  actuelle?: string;
  forme: "photo" | "logo";
  remplir?: boolean; // aperçu d’une photo qui remplit son cadre
  children?: React.ReactNode; // réglages affichés sous l’image
}) {
  const [apercu, setApercu] = useState<string>(actuelle ?? "");
  const [retirer, setRetirer] = useState(false);

  // Libère l’aperçu local quand on en choisit un autre
  useEffect(() => () => {
    if (apercu.startsWith("blob:")) URL.revokeObjectURL(apercu);
  }, [apercu]);

  return (
    <div className="adm-image">
      <span className="adm-champ__libelle">{libelle}</span>
      <div className={`adm-image__apercu adm-image__apercu--${forme}${remplir ? " adm-image__apercu--remplir" : ""}`}>
        {apercu && !retirer ? (
          // eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:), hors next/image
          <img src={apercu} alt="" />
        ) : (
          <span>Aucune image</span>
        )}
      </div>
      <label className="adm-btn adm-btn--fichier">
        Choisir une image…
        <input
          type="file"
          name={nom}
          accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setApercu(URL.createObjectURL(f));
              setRetirer(false);
            }
          }}
        />
      </label>
      <p className="adm-discret">
        {forme === "logo"
          ? "PNG ou SVG à fond transparent, idéalement."
          : "Photo, logo ou carte-cadeau : JPG, PNG ou WebP, 8 Mo au maximum."}
      </p>
      {children}
      {actuelle && (
        <label className="adm-case">
          <input
            type="checkbox"
            name={`${nom}-retirer`}
            checked={retirer}
            onChange={(e) => setRetirer(e.target.checked)}
          />
          Retirer l’image actuelle
        </label>
      )}
    </div>
  );
}
