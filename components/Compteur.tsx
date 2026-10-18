"use client";

import { useEffect, useState } from "react";
import { CONFIG } from "@/lib/donnees";

const UNITES: [string, number][] = [
  ["jours", 86400000],
  ["heures", 3600000],
  ["minutes", 60000],
  ["secondes", 1000],
];

export default function Compteur() {
  // null tant que le premier calcul n’a pas eu lieu : évite que le rendu
  // du serveur et celui du navigateur diffèrent
  const [reste, setReste] = useState<number | null>(null);

  useEffect(() => {
    const cible = new Date(CONFIG.evenement.dateISO).getTime();
    const calculer = () => setReste(cible - Date.now());
    calculer();
    const t = setInterval(calculer, 1000);
    return () => clearInterval(t);
  }, []);

  if (reste !== null && reste <= 0) {
    return (
      <div className="compte">
        <p className="compte__titre">Le 12 novembre</p>
        <p className="compte__cesoir">C’est ce soir.</p>
      </div>
    );
  }

  const valeurs = UNITES.map(([nom, ms], i) => {
    const total = Math.floor((reste ?? 0) / ms);
    // Les heures, minutes et secondes ne gardent que ce qui reste de l’unité au-dessus
    const v = i === 0 ? total : total % (UNITES[i - 1][1] / ms);
    return { nom, texte: reste === null ? "–" : String(v).padStart(i === 0 ? 1 : 2, "0") };
  });

  return (
    <div className="compte" role="timer" aria-label="Temps avant la soirée">
      <p className="compte__titre">Avant de se retrouver</p>
      <div className="compte__cases">
        {valeurs.map(({ nom, texte }) => {
          return (
            <div className="compte__case" key={nom}>
              {/* La clé change à chaque seconde : le chiffre se renouvelle en douceur */}
              <b key={texte}>{texte}</b>
              <span>{nom}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
