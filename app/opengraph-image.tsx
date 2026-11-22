import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { CONFIG } from "@/lib/donnees";
import { IMAGE_PARTAGE } from "@/lib/seo";

/**
 * L’image qui s’affiche quand on partage un lien du site (Facebook, Messenger,
 * LinkedIn, iMessage, etc.). Format recommandé par Facebook : 1200 × 630.
 * Elle est générée une seule fois à la compilation, puis servie telle quelle.
 * Toutes les pages publiques en héritent.
 */

export const alt = IMAGE_PARTAGE.alt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [cormorant, cormorantItalique, lato, latoGras, photo] = await Promise.all([
    readFile(join(process.cwd(), "assets/polices/CormorantGaramond-Medium.ttf")),
    readFile(join(process.cwd(), "assets/polices/CormorantGaramond-MediumItalic.ttf")),
    readFile(join(process.cwd(), "assets/polices/Lato-Regular.ttf")),
    readFile(join(process.cwd(), "assets/polices/Lato-Bold.ttf")),
    readFile(join(process.cwd(), "public/images/clement-portrait.jpg")),
  ]);
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;
  const { evenement } = CONFIG;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#3E4C45" }}>
        {/* Le texte */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 690,
            height: "100%",
            padding: "64px 64px 56px 72px",
            color: "#FDFBF7",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Lato",
              fontWeight: 700,
              fontSize: 19,
              letterSpacing: 4,
              color: "#F0E1D7",
              textTransform: "uppercase",
            }}
          >
            Soirée-bénéfice · Encan silencieux
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontFamily: "Cormorant",
                fontSize: 118,
                lineHeight: 1,
                letterSpacing: -1,
              }}
            >
              Pour&nbsp;<span style={{ fontStyle: "italic", color: "#E3B79C" }}>Clément</span>
            </div>
            <div style={{ display: "flex", width: 90, height: 2, background: "#B99B62", margin: "34px 0 30px" }} />
            <div style={{ display: "flex", fontFamily: "Cormorant", fontSize: 40, lineHeight: 1.2 }}>
              {evenement.date}
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Lato",
                fontSize: 24,
                marginTop: 10,
                color: "#D8E1DA",
              }}
            >
              {evenement.lieu}
            </div>
          </div>

          <div style={{ display: "flex", fontFamily: "Lato", fontSize: 21, color: "#D8E1DA" }}>
            Au profit de la Fondation En Cœur
          </div>
        </div>

        {/* La photo */}
        <img
          src={photoSrc}
          alt=""
          width={510}
          height={630}
          style={{ width: 510, height: 630, objectFit: "cover", objectPosition: "center 40%" }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Cormorant", data: cormorant, style: "normal", weight: 500 },
        { name: "Cormorant", data: cormorantItalique, style: "italic", weight: 500 },
        { name: "Lato", data: lato, style: "normal", weight: 400 },
        { name: "Lato", data: latoGras, style: "normal", weight: 700 },
      ],
    },
  );
}
