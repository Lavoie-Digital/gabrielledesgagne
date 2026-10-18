import Image from "next/image";

/**
 * L’image d’un lot, dans n’importe quel cadre.
 *
 * « entier » (par défaut) : l’image est montrée au complet, centrée sur un
 * fond blanc, avec un peu d’air autour. Un logo ou une carte-cadeau n’est
 * jamais coupé, quelle que soit la forme du cadre ; un logo sur fond blanc
 * se fond dans la carte sans démarcation.
 * « remplir » : l’image occupe tout le cadre, comme une photo d’ambiance.
 *
 * Le parent doit être positionné (position: relative) et avoir une taille.
 */
export default function ImageLot({
  src,
  alt,
  cadrage = "entier",
  sizes,
  immediat = false,
}: {
  src: string;
  alt: string;
  cadrage?: "entier" | "remplir";
  sizes: string;
  immediat?: boolean; // charger tout de suite (fiche qu’on vient d’ouvrir)
}) {
  return (
    <div className={`image-lot image-lot--${cadrage}`}>
      <Image
        className="image-lot__image"
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        loading={immediat ? "eager" : "lazy"}
      />
    </div>
  );
}
