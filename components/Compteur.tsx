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

  if (reste === null) {
    return <div className="bulles" aria-hidden="true" style={{ minHeight: 102 }} />;
  }

  if (reste <= 0) {
    return (
      <div className="bulles">
        <div className="bulle bulle--seule">
          <b style={{ fontSize: "1.5rem" }}>C’est ce soir</b>
        </div>
      </div>
    );
  }

  let restant = reste;
  return (
    <div className="bulles">
      {UNITES.map(([nom, ms]) => {
        const v = Math.floor(restant / ms);
        restant -= v * ms;
        return (
          <div className="bulle" key={nom}>
            <b>{v}</b>
            <span>{nom}</span>
          </div>
        );
      })}
    </div>
  );
}
