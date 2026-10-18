"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CONFIG, argent } from "@/lib/donnees";

type Ligne = {
  titre: string;
  mise: number;
  nbMises: number;
  categorie?: string;
  donateur?: string;
  valeur?: number;
  miseDepart?: number;
  connu: boolean;
};

type Reponse = {
  source: "fichier" | "firestore" | "externe";
  maj: string;
  erreur?: string;
  lots: Ligne[];
};

const deuxChiffres = (n: number) => String(n).padStart(2, "0");

/* 15:28 */
function heure(d: Date): string {
  return `${deuxChiffres(d.getHours())}:${deuxChiffres(d.getMinutes())}`;
}

/* 15:27:57 */
function heurePrecise(d: Date): string {
  return `${heure(d)}:${deuxChiffres(d.getSeconds())}`;
}

export default function TableauMises() {
  const [lots, setLots] = useState<Ligne[] | null>(null);
  const [source, setSource] = useState<"fichier" | "firestore" | "externe">("fichier");
  const [erreur, setErreur] = useState<string | null>(null);
  const [panne, setPanne] = useState(false);
  const [maj, setMaj] = useState<Date | null>(null);
  const [horloge, setHorloge] = useState("");
  const [changes, setChanges] = useState<Set<string>>(new Set());

  // Montants du tour précédent, pour repérer ce qui vient de bouger
  const precedents = useRef<Map<string, number>>(new Map());

  const charger = useCallback(async () => {
    try {
      const r = await fetch("/api/mises", { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const d: Reponse = await r.json();

      const bouge = new Set<string>();
      d.lots.forEach((l) => {
        const avant = precedents.current.get(l.titre);
        if (avant !== undefined && l.mise !== avant) bouge.add(l.titre);
        precedents.current.set(l.titre, l.mise);
      });

      setLots(d.lots);
      setSource(d.source);
      setErreur(d.erreur ?? null);
      setMaj(new Date(d.maj));
      setPanne(false);

      if (bouge.size) {
        setChanges(bouge);
        window.setTimeout(() => setChanges(new Set()), 5000);
      }
    } catch {
      // On garde à l'écran les derniers montants connus plutôt que de vider
      setPanne(true);
    }
  }, []);

  useEffect(() => {
    charger();
    const secondes = Math.max(5, CONFIG.encan.intervalleSecondes || 15);
    const t = setInterval(charger, secondes * 1000);
    return () => clearInterval(t);
  }, [charger]);

  // L'heure, utile quand l'écran tourne toute la soirée.
  // Format construit à la main : « 15 h 27 min 57 s » serait trop long ici.
  useEffect(() => {
    const tic = () => setHorloge(heure(new Date()));
    tic();
    const t = setInterval(tic, 10000);
    return () => clearInterval(t);
  }, []);

  const pleinEcran = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  };

  if (!lots) {
    return (
      <div className="direct">
        <div className="direct__attente">Chargement des mises…</div>
      </div>
    );
  }

  if (!lots.length) {
    return (
      <div className="direct">
        <div className="direct__attente">
          Les lots apparaîtront ici dès qu’ils seront ajoutés dans l’espace privé.
        </div>
      </div>
    );
  }

  const classes = [...lots].sort((a, b) => b.mise - a.mise || a.titre.localeCompare(b.titre));
  const total = classes.reduce((s, l) => s + l.mise, 0);
  const totalMises = classes.reduce((s, l) => s + l.nbMises, 0);
  const rangs = Math.ceil(classes.length / 2);

  return (
    <div className="direct">
      <header className="direct__tete">
        <div>
          <p className="direct__surtitre">Encan silencieux &middot; Pour Clément</p>
          <h1 className="direct__titre">Les mises en direct</h1>
        </div>

        <div className="direct__chiffres">
          <div>
            <b>{argent(total)}</b>
            <span>Total des mises</span>
          </div>
          <div>
            <b>{classes.length}</b>
            <span>lots</span>
          </div>
          {totalMises > 0 && (
            <div>
              <b>{totalMises}</b>
              <span>mises reçues</span>
            </div>
          )}
        </div>
      </header>

      <ol
        className={"direct__liste" + (rangs >= 8 ? " direct__liste--etire" : "")}
        style={{ "--rangs": rangs } as React.CSSProperties}
      >
        {classes.map((l, i) => (
          <li
            key={l.titre + i}
            className={
              "direct__ligne" +
              (i < 3 ? " direct__ligne--tete" : "") +
              (changes.has(l.titre) ? " direct__ligne--bouge" : "")
            }
          >
            <span className="direct__rang">{i + 1}</span>
            <span className="direct__lot">
              <span className="direct__nom">{l.titre}</span>
              {l.donateur && <span className="direct__don">Offert par {l.donateur}</span>}
            </span>
            <span className="direct__montant">
              {argent(l.mise)}
              {l.nbMises > 0 && (
                <small>
                  {l.nbMises} {l.nbMises > 1 ? "mises" : "mise"}
                </small>
              )}
            </span>
          </li>
        ))}
      </ol>

      <footer className="direct__pied">
        <span className={"direct__etat" + (source !== "fichier" && !panne ? " est-direct" : "")}>
          <i />
          {panne
            ? "Connexion perdue, derniers montants connus"
            : source !== "fichier"
              ? "En direct"
              : "Montants du fichier local"}
        </span>

        {erreur && <span className="direct__erreur">Source illisible : {erreur}</span>}

        <span className="direct__maj">
          {maj ? "Mis à jour à " + heurePrecise(maj) : ""}
        </span>

        <span className="direct__heure">{horloge}</span>

        <button className="direct__bouton" onClick={pleinEcran}>
          Plein écran
        </button>
      </footer>
    </div>
  );
}
