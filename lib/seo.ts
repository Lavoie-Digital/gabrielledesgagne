import type { Metadata } from "next";

/**
 * L’adresse publique du site. Facebook et les autres réseaux exigent des liens
 * complets (https://…) pour l’image de partage : c’est d’ici qu’ils partent.
 * Pour la changer sans toucher au code : NEXT_PUBLIC_SITE_URL dans apphosting.yaml.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://encoeurpourclement.ca").replace(/\/$/, "");

export const SITE_NOM = "Pour Clément";
export const TITRE = "Pour Clément | Soirée-bénéfice et encan silencieux";
export const DESCRIPTION =
  "Soirée-bénéfice et encan silencieux à la mémoire de Clément, au profit de la Fondation En Cœur. Le 12 novembre 2027 à l’Hôtel Plaza Québec.";

/**
 * L’image de partage, générée par app/opengraph-image.tsx. On la nomme ici
 * parce qu’une page qui précise ses propres balises Open Graph perd celle
 * héritée automatiquement.
 */
export const IMAGE_PARTAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "Pour Clément, soirée-bénéfice et encan silencieux au profit de la Fondation En Cœur",
};

/**
 * Les balises d’une page publique : titre, description, adresse canonique,
 * et les mêmes informations pour Facebook (Open Graph) et X.
 */
export function metaPage({
  titre,
  description,
  chemin,
}: {
  titre: string;
  description: string;
  chemin: string;
}): Metadata {
  const titreComplet = chemin === "/" ? titre : `${titre} | ${SITE_NOM}`;
  return {
    title: chemin === "/" ? { absolute: titre } : titre,
    description,
    alternates: { canonical: chemin },
    openGraph: {
      type: "website",
      locale: "fr_CA",
      siteName: SITE_NOM,
      url: chemin,
      title: titreComplet,
      description,
      images: [IMAGE_PARTAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: titreComplet,
      description,
      images: [IMAGE_PARTAGE],
    },
  };
}
