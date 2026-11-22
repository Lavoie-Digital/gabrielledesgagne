import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Lato } from "next/font/google";
import "./globals.css";
import { DESCRIPTION, IMAGE_PARTAGE, SITE_NOM, SITE_URL, TITRE } from "@/lib/seo";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITRE,
    template: "%s | Pour Clément",
  },
  description: DESCRIPTION,
  // Valeurs par défaut du partage ; chaque page publique précise les siennes
  openGraph: {
    type: "website",
    locale: "fr_CA",
    siteName: SITE_NOM,
    title: TITRE,
    description: DESCRIPTION,
    images: [IMAGE_PARTAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITRE,
    description: DESCRIPTION,
    images: [IMAGE_PARTAGE],
  },
  applicationName: SITE_NOM,
  keywords: [
    "Pour Clément",
    "soirée-bénéfice Québec",
    "encan silencieux",
    "Fondation En Cœur",
    "enfants cardiaques",
    "Hôtel Plaza Québec",
    "collecte de fonds",
  ],
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#3E4C45",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA" className={`${cormorant.variable} ${lato.variable}`}>
      <head>
        {/*
          Les blocs animés partent invisibles et sont révélés par le JavaScript.
          Si le JavaScript est bloqué, rien ne les révélerait : ce bloc remet
          donc tout le contenu en place. Il n’est lu que dans ce cas précis.
        */}
        <noscript>
          <style>{`
            [data-reveal],[data-lignes],[data-entree]{ opacity:1 !important; visibility:visible !important; transform:none !important; }
            [data-devoile]{ clip-path:none !important; }
            .voile{ display:none !important; }
          `}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
