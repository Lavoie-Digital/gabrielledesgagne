import type { NextConfig } from "next";

const bucket = process.env.FIREBASE_STORAGE_BUCKET || "gabrielle-488d0.firebasestorage.app";

const nextConfig: NextConfig = {
  images: {
    // Les photos et logos téléversés depuis l’espace privé vivent dans
    // Firebase Storage. On n’autorise que notre propre espace de stockage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: `/v0/b/${bucket}/o/**`,
      },
    ],
  },
  experimental: {
    serverActions: {
      // Les images envoyées depuis l’espace privé : 8 Mo, plus l’enveloppe du formulaire
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
