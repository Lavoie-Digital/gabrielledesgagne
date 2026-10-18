import type { Metadata } from "next";
import { Cormorant_Garamond, Lato } from "next/font/google";
import "./globals.css";

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
  title: {
    default: "Pour Clément | Soirée-bénéfice et encan silencieux",
    template: "%s | Pour Clément",
  },
  description:
    "Soirée-bénéfice et encan silencieux à la mémoire de Clément, au profit de la Fondation En Cœur. Le 12 novembre 2027 à l’Hôtel Plaza Québec.",
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
