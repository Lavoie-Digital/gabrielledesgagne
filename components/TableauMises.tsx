"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { CONFIG, argent } from "@/lib/donnees";

gsap.registerPlugin(Flip);

/**
 * Le tableau de l’encan projeté sur grand écran le soir de la soirée.
 *
 *  - à gauche, un lot « à l’honneur » qui change toutes les quelques secondes,
 *    avec sa photo ; il saute sur le lot qui vient de recevoir une mise ;
 *  - à droite, le classement : les lots glissent à leur nouvelle place quand
 *    l’ordre change, et les montants défilent jusqu’à leur nouvelle valeur ;
 *  - chaque nouvelle mise est annoncée en grand quelques secondes, tout comme
 *    les paliers franchis par le total ;
 *  - en bas, un bandeau défile avec les dernières mises.
 *
 * Pour essayer sans données : ajoutez ?demo à l’adresse (/direct?demo).
 */

type Ligne = {
  titre: string;
  mise: number;
  nbMises: number;
  categorie?: string;
  donateur?: string;
  valeur?: number;
  miseDepart?: number;
  image?: string;
  cadrage?: "entier" | "remplir";
  connu: boolean;
};

type Reponse = {
  source: "fichier" | "firestore" | "externe";
  maj: string;
  erreur?: string;
  lots: Ligne[];
};

type Annonce =
  | { type: "mise"; id: number; titre: string; mise: number; ancien: number; image?: string; cadrage?: Ligne["cadrage"] }
  | { type: "palier"; id: number; montant: number };

type Evenement = { id: number; titre: string; mise: number; heure: string };

type Vedette = { titre: string; raison: "rotation" | "nouvelle"; ancien?: number; cle: number };

/* Durées (en millisecondes) */
const ROTATION = 9000; // un lot reste à l’honneur
const TENUE_NOUVELLE = 14000; // un lot qui vient de recevoir une mise reste plus longtemps
const ANNONCE = 5200; // une annonce reste à l’écran
const SORTIE = 600; // temps de l’animation de sortie
const PALIER = 2500; // le total est fêté à chaque tranche de 2 500 $

const deuxChiffres = (n: number) => String(n).padStart(2, "0");
const heure = (d: Date) => `${deuxChiffres(d.getHours())}:${deuxChiffres(d.getMinutes())}`;
const heurePrecise = (d: Date) => `${heure(d)}:${deuxChiffres(d.getSeconds())}`;

const trier = (l: Ligne[]) =>
  [...l].sort((a, b) => b.mise - a.mise || a.titre.localeCompare(b.titre, "fr-CA"));

const mouvementReduit = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------------
   Un montant qui défile jusqu’à sa nouvelle valeur
   ------------------------------------------------------------------------ */
function Montant({ valeur, depart, className }: { valeur: number; depart?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const affiche = useRef(depart ?? valeur);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const de = affiche.current;
    if (de === valeur || mouvementReduit()) {
      affiche.current = valeur;
      el.textContent = argent(valeur);
      return;
    }
    el.textContent = argent(Math.round(de));
    const o = { v: de };
    const tw = gsap.to(o, {
      v: valeur,
      duration: Math.min(2.4, 1 + Math.abs(valeur - de) / 2000),
      ease: "power2.out",
      onUpdate: () => {
        affiche.current = o.v;
        el.textContent = argent(Math.round(o.v));
      },
    });
    return () => {
      tw.kill();
    };
  }, [valeur]);

  return <span ref={ref} className={className} />;
}

/* ------------------------------------------------------------------------
   La photo d’un lot, ou un monogramme quand il n’y en a pas
   ------------------------------------------------------------------------ */
function Visuel({ lot, className }: { lot: Pick<Ligne, "titre" | "image" | "cadrage">; className: string }) {
  if (lot.image) {
    return (
      <span className={`${className} ${className}--${lot.cadrage === "remplir" ? "remplir" : "entier"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- images Firestore de taille libre */}
        <img src={lot.image} alt="" />
      </span>
    );
  }
  return (
    <span className={`${className} ${className}--vide`} aria-hidden="true">
      <b>{lot.titre.trim().charAt(0).toUpperCase() || "·"}</b>
    </span>
  );
}

/* ------------------------------------------------------------------------
   Mode démonstration (/direct?demo) : de faux lots et des mises au hasard
   ------------------------------------------------------------------------ */
const LOTS_DEMO: Ligne[] = [
  ["Escapade de deux nuits dans Charlevoix", "Hébergement", 900],
  ["Souper gastronomique pour quatre", "Restauration", 600],
  ["Forfait spa nordique pour deux", "Bien-être", 350],
  ["Œuvre originale d’une artiste d’ici", "Art", 1200],
  ["Billets pour un match de hockey", "Sport", 500],
  ["Panier du terroir québécois", "Gourmandise", 200],
  ["Séance photo de famille", "Famille", 450],
  ["Cours de cuisine privé", "Restauration", 400],
  ["Week-end en chalet au bord du lac", "Hébergement", 1100],
  ["Sélection de vins d’importation privée", "Gourmandise", 300],
  ["Vélo de route remis à neuf", "Sport", 800],
  ["Carte-cadeau d’une boutique locale", "Services", 250],
].map(([titre, categorie, valeur]) => ({
  titre: titre as string,
  categorie: categorie as string,
  donateur: "Un partenaire de la soirée",
  valeur: valeur as number,
  miseDepart: Math.round((valeur as number) * 0.4),
  mise: Math.round((valeur as number) * 0.4),
  nbMises: 0,
  connu: true,
}));

function tourDemo(lots: Ligne[]): Ligne[] {
  const suivants = lots.map((l) => ({ ...l }));
  const combien = Math.random() < 0.35 ? 2 : 1;
  for (let k = 0; k < combien; k++) {
    const l = suivants[Math.floor(Math.random() * suivants.length)];
    const pas = [10, 25, 25, 50, 50, 75, 100, 150][Math.floor(Math.random() * 8)];
    l.mise += pas;
    l.nbMises += 1;
  }
  return suivants;
}

/* ======================================================================== */

export default function TableauMises() {
  const [lots, setLots] = useState<Ligne[] | null>(null);
  const [source, setSource] = useState<Reponse["source"]>("fichier");
  const [erreur, setErreur] = useState<string | null>(null);
  const [panne, setPanne] = useState(false);
  const [maj, setMaj] = useState<Date | null>(null);
  const [horloge, setHorloge] = useState("");
  const [demo, setDemo] = useState<boolean | null>(null); // null : pas encore lu

  const [changes, setChanges] = useState<Set<string>>(new Set());
  const [montees, setMontees] = useState<Map<string, number>>(new Map());
  const [fil, setFil] = useState<Evenement[]>([]);
  const [vedette, setVedette] = useState<Vedette | null>(null);
  const [annonce, setAnnonce] = useState<(Annonce & { sortie?: boolean }) | null>(null);

  const precedents = useRef<Map<string, number>>(new Map());
  const rangsAvant = useRef<Map<string, number>>(new Map());
  const palierAvant = useRef<number | null>(null);
  const compteur = useRef(0);
  const lotsDemo = useRef<Ligne[]>(LOTS_DEMO);

  const listeRef = useRef<HTMLOListElement>(null);
  const etatFlip = useRef<Flip.FlipState | null>(null);

  const file = useRef<Annonce[]>([]);
  const minuteries = useRef<number[]>([]);
  const enCours = useRef(false);

  const attendre = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    minuteries.current.push(t);
  };

  /* --- File d’annonces : une à la fois --- */
  const annoncer = useCallback((nouvelles: Annonce[]) => {
    // On ne laisse pas la file s’allonger : au-delà de quatre, on garde les plus récentes
    file.current = [...file.current, ...nouvelles].slice(-4);
    if (!enCours.current) {
      enCours.current = true;
      setAnnonce(file.current.shift() ?? null);
    }
  }, []);

  // Chaque annonce reste ANNONCE ms, puis laisse la place à la suivante
  const idAnnonce = annonce?.id;
  useEffect(() => {
    if (idAnnonce === undefined) return;
    const t1 = window.setTimeout(
      () => setAnnonce((x) => (x && x.id === idAnnonce ? { ...x, sortie: true } : x)),
      ANNONCE - SORTIE
    );
    const t2 = window.setTimeout(() => {
      const a = file.current.shift() ?? null;
      enCours.current = a !== null;
      setAnnonce(a);
    }, ANNONCE);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [idAnnonce]);

  /* --- Lecture des montants --- */
  const charger = useCallback(async () => {
    try {
      let d: Reponse;
      if (demo) {
        lotsDemo.current = precedents.current.size ? tourDemo(lotsDemo.current) : lotsDemo.current;
        d = { source: "externe", maj: new Date().toISOString(), lots: lotsDemo.current };
      } else {
        const r = await fetch("/api/mises", { cache: "no-store" });
        if (!r.ok) throw new Error(String(r.status));
        d = await r.json();
      }

      const premiere = precedents.current.size === 0;
      const tries = trier(d.lots);
      const nouvelles: Annonce[] = [];
      const bouge = new Set<string>();
      const monte = new Map<string, number>();
      const evts: Evenement[] = [];
      const maintenant = heure(new Date());

      tries.forEach((l, i) => {
        const avant = precedents.current.get(l.titre);
        if (avant !== undefined && l.mise !== avant) {
          bouge.add(l.titre);
          if (l.mise > avant) {
            nouvelles.push({
              type: "mise",
              id: ++compteur.current,
              titre: l.titre,
              mise: l.mise,
              ancien: avant,
              image: l.image,
              cadrage: l.cadrage,
            });
            evts.push({ id: compteur.current, titre: l.titre, mise: l.mise, heure: maintenant });
          }
        }
        const rangAvant = rangsAvant.current.get(l.titre);
        if (rangAvant !== undefined && rangAvant > i) monte.set(l.titre, rangAvant - i);
      });

      precedents.current = new Map(d.lots.map((l) => [l.titre, l.mise]));
      rangsAvant.current = new Map(tries.map((l, i) => [l.titre, i]));

      // Paliers franchis par le total
      const total = d.lots.reduce((s, l) => s + l.mise, 0);
      const palier = Math.floor(total / PALIER);
      if (palierAvant.current !== null && palier > palierAvant.current && palier > 0) {
        nouvelles.push({ type: "palier", id: ++compteur.current, montant: palier * PALIER });
      }
      palierAvant.current = palier;

      // On photographie les positions avant de changer l’ordre (glissement)
      if (!premiere && listeRef.current && !mouvementReduit()) {
        etatFlip.current = Flip.getState(listeRef.current.querySelectorAll("[data-flip-id]"));
      }

      setLots(d.lots);
      setSource(d.source);
      setErreur(d.erreur ?? null);
      setMaj(new Date(d.maj));
      setPanne(false);

      if (bouge.size) {
        setChanges(bouge);
        attendre(() => setChanges(new Set()), 6000);
      }
      if (monte.size) {
        setMontees(monte);
        attendre(() => setMontees(new Map()), 7000);
      }
      if (evts.length) setFil((f) => [...evts.reverse(), ...f].slice(0, 14));

      const misesNouvelles = nouvelles.filter((n) => n.type === "mise");
      if (misesNouvelles.length) {
        // Le lot qui a le plus monté passe à l’honneur
        const vedetteMise = misesNouvelles.reduce((a, b) => (b.mise - b.ancien > a.mise - a.ancien ? b : a));
        setVedette({ titre: vedetteMise.titre, raison: "nouvelle", ancien: vedetteMise.ancien, cle: vedetteMise.id });
      }
      if (nouvelles.length) annoncer(nouvelles);
    } catch {
      // On garde à l’écran les derniers montants connus plutôt que de vider
      setPanne(true);
    }
  }, [demo, annoncer]);

  /* Mode démo : lu dans l’adresse, une fois dans le navigateur */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture de l’adresse, côté navigateur seulement
    setDemo(new URLSearchParams(window.location.search).has("demo"));
  }, []);

  useEffect(() => {
    if (demo === null) return;
    charger();
    const secondes = demo ? 6 : Math.max(5, CONFIG.encan.intervalleSecondes || 15);
    const t = setInterval(charger, secondes * 1000);
    return () => clearInterval(t);
  }, [charger, demo]);

  useEffect(() => {
    const liste = minuteries.current;
    return () => liste.forEach((t) => clearTimeout(t));
  }, []);

  /* Glissement des lignes vers leur nouvelle place */
  useLayoutEffect(() => {
    const etat = etatFlip.current;
    if (!etat) return;
    etatFlip.current = null;
    Flip.from(etat, { duration: 1.1, ease: "power3.inOut", stagger: 0.015 });
  }, [lots]);

  /* L’heure */
  useEffect(() => {
    const tic = () => setHorloge(heure(new Date()));
    tic();
    const t = setInterval(tic, 10000);
    return () => clearInterval(t);
  }, []);

  const classes = useMemo(() => (lots ? trier(lots) : []), [lots]);
  const classesRef = useRef(classes);
  useEffect(() => {
    classesRef.current = classes;
  }, [classes]);

  /* Rotation du lot à l’honneur */
  const nbLots = classes.length;
  useEffect(() => {
    if (!nbLots) return;
    const t = window.setTimeout(
      () => {
        const c = classesRef.current;
        if (!c.length) return;
        const actuel = vedette?.titre ?? c[0].titre;
        const i = c.findIndex((l) => l.titre === actuel);
        const prochain = c[(i + 1) % c.length];
        setVedette((v) => ({ titre: prochain.titre, raison: "rotation", cle: (v?.cle ?? 0) + 1000 }));
      },
      vedette?.raison === "nouvelle" ? TENUE_NOUVELLE : ROTATION
    );
    return () => clearTimeout(t);
  }, [vedette, nbLots]);

  const pleinEcran = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  };

  /* ------------------------------------------------------------------ */

  if (!lots || !lots.length) {
    return (
      <div className="direct">
        <div className="direct__attente">
          <span className="direct__attente-ourson" aria-hidden="true" />
          {!lots
            ? "Chargement des mises…"
            : "Les lots apparaîtront ici dès qu’ils seront ajoutés dans l’espace privé."}
        </div>
      </div>
    );
  }

  const total = classes.reduce((s, l) => s + l.mise, 0);
  const totalMises = classes.reduce((s, l) => s + l.nbMises, 0);
  const max = Math.max(1, classes[0]?.mise ?? 1);
  const deuxColonnes = classes.length > 10;
  const rangs = deuxColonnes ? Math.ceil(classes.length / 2) : classes.length;
  const compact = rangs > 11;

  const lotVedette = classes.find((l) => l.titre === vedette?.titre) ?? classes[0];
  const rangVedette = classes.indexOf(lotVedette) + 1;
  const estNouvelle = vedette?.raison === "nouvelle" && vedette.titre === lotVedette.titre;
  const pctValeur = lotVedette.valeur ? Math.round((lotVedette.mise / lotVedette.valeur) * 100) : null;

  const enDirect = source !== "fichier" && !panne;

  // Le bandeau : les dernières mises, ou le classement s’il n’y en a pas encore
  const bandeau =
    fil.length > 0
      ? fil.map((e) => ({ cle: `e${e.id}`, gauche: e.heure, titre: e.titre, mise: e.mise }))
      : classes.slice(0, 10).map((l, i) => ({ cle: `c${i}`, gauche: `N° ${i + 1}`, titre: l.titre, mise: l.mise }));

  return (
    <div className={"direct" + (compact ? " direct--compact" : "")}>

      {/* ---------------- En-tête ---------------- */}
      <header className="direct__tete">
        <div className="direct__marque">
          <span className="direct__ourson" aria-hidden="true" />
          <div>
            <p className="direct__surtitre">
              Encan silencieux, pour Clément
              <span className={"direct__pastille" + (enDirect ? " est-direct" : "")}>
                <i />
                {panne ? "Hors ligne" : enDirect ? (demo ? "Démo" : "En direct") : "Local"}
              </span>
            </p>
            <h1 className="direct__titre">
              Les mises <em>en direct</em>
            </h1>
          </div>
        </div>

        <div className="direct__chiffres">
          <div className="direct__total">
            <span className="direct__etiquette">Total amassé à l’encan</span>
            <Montant valeur={total} className="direct__total-montant" />
          </div>
          <div className="direct__petits">
            <div>
              <b>{classes.length}</b>
              <span>lots</span>
            </div>
            {totalMises > 0 && (
              <div>
                <b>{totalMises}</b>
                <span>mises</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ---------------- Corps ---------------- */}
      <main className="direct__corps">
        {/* Le lot à l’honneur */}
        <section
          className={"vedette" + (estNouvelle ? " vedette--nouvelle" : "")}
          aria-live="polite"
          key={(vedette?.cle ?? 0) + lotVedette.titre}
        >
          <div className="vedette__image">
            <Visuel lot={lotVedette} className="vedette__visuel" />
          </div>

          <div className="vedette__texte">
            <p className="vedette__cat">
              <span className="vedette__badge">
                {estNouvelle ? "Nouvelle mise" : rangVedette === 1 ? "En tête" : `${rangVedette}e place`}
              </span>
              {lotVedette.categorie && <span>{lotVedette.categorie}</span>}
            </p>
            <h2 className="vedette__titre">{lotVedette.titre}</h2>
            {lotVedette.donateur && <p className="vedette__don">Offert par {lotVedette.donateur}</p>}

            <div className="vedette__mise">
              <div>
                <span className="direct__etiquette">Mise actuelle</span>
                <Montant
                  valeur={lotVedette.mise}
                  depart={estNouvelle ? vedette?.ancien : undefined}
                  className="vedette__montant"
                />
              </div>
              <div className="vedette__infos">
                {lotVedette.nbMises > 0 && (
                  <p>
                    <b>{lotVedette.nbMises}</b> {lotVedette.nbMises > 1 ? "mises" : "mise"}
                  </p>
                )}
                {!!lotVedette.valeur && (
                  <p>
                    Valeur <b>{argent(lotVedette.valeur)}</b>
                  </p>
                )}
              </div>
            </div>

            {pctValeur !== null && (
              <div className="vedette__jauge">
                <div className="vedette__jauge-piste">
                  <i style={{ "--part": Math.min(1, pctValeur / 100) } as React.CSSProperties} />
                </div>
                <span>{pctValeur} % de la valeur</span>
              </div>
            )}
          </div>

          <span
            className="vedette__minuterie"
            style={{ "--duree": `${estNouvelle ? TENUE_NOUVELLE : ROTATION}ms` } as React.CSSProperties}
          />
        </section>

        {/* Le classement */}
        <ol
          ref={listeRef}
          className={"classement" + (deuxColonnes ? " classement--deux" : "")}
          style={{ "--pistes": Math.max(rangs, 7) } as React.CSSProperties}
        >
          {classes.map((l, i) => {
            const monte = montees.get(l.titre);
            return (
              <li
                key={l.titre}
                data-flip-id={l.titre}
                className={
                  "rangee" +
                  (i === 0 ? " rangee--premier" : i < 3 ? " rangee--podium" : "") +
                  (changes.has(l.titre) ? " rangee--bouge" : "") +
                  (l.titre === lotVedette.titre ? " rangee--vedette" : "")
                }
                style={{ "--part": l.mise / max } as React.CSSProperties}
              >
                <span className="rangee__rang">{deuxChiffres(i + 1)}</span>
                {!compact && <Visuel lot={l} className="rangee__visuel" />}
                <span className="rangee__lot">
                  <span className="rangee__nom">{l.titre}</span>
                  {l.donateur && !compact && <span className="rangee__don">{l.donateur}</span>}
                </span>
                {monte && <span className="rangee__monte">↑ {monte}</span>}
                <span className="rangee__montant">
                  <Montant valeur={l.mise} />
                  {l.nbMises > 0 && !compact && (
                    <small>
                      {l.nbMises} {l.nbMises > 1 ? "mises" : "mise"}
                    </small>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </main>

      {/* ---------------- Pied ---------------- */}
      <footer className="direct__pied">
        <div className="bandeau" aria-hidden="true">
          <span className="bandeau__etiquette">{fil.length ? "Dernières mises" : "Classement"}</span>
          <div className="bandeau__fenetre">
            <div className="bandeau__piste" key={bandeau.map((b) => b.cle).join()} style={{ "--n": bandeau.length } as React.CSSProperties}>
              {[0, 1].map((copie) => (
                <span className="bandeau__groupe" key={copie}>
                  {bandeau.map((b) => (
                    <span className="bandeau__item" key={b.cle}>
                      <small>{b.gauche}</small>
                      {b.titre}
                      <b>{argent(b.mise)}</b>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="direct__etat">
          {erreur && <span className="direct__erreur">Source illisible : {erreur}</span>}
          {panne && <span className="direct__erreur">Connexion perdue, derniers montants connus</span>}
          <span className="direct__maj">{maj ? "Mis à jour à " + heurePrecise(maj) : ""}</span>
          <span className="direct__heure">{horloge}</span>
          <button className="direct__bouton" onClick={pleinEcran}>
            Plein écran
          </button>
        </div>
      </footer>

      {/* ---------------- Annonce ---------------- */}
      {annonce && <AnnonceGeante annonce={annonce} />}
    </div>
  );
}

/* ------------------------------------------------------------------------
   L’annonce plein écran
   ------------------------------------------------------------------------ */
function AnnonceGeante({ annonce }: { annonce: Annonce & { sortie?: boolean } }) {
  return (
    <div className={"annonce" + (annonce.sortie ? " annonce--sortie" : "")} role="status">
      {annonce.type === "mise" ? (
        <div className="annonce__carte" key={annonce.id}>
          {annonce.image && <Visuel lot={annonce} className="annonce__visuel" />}
          <p className="annonce__surtitre">Nouvelle mise</p>
          <h2 className="annonce__titre">{annonce.titre}</h2>
          <Montant valeur={annonce.mise} depart={annonce.ancien} className="annonce__montant" />
          <p className="annonce__hausse">
            + {argent(annonce.mise - annonce.ancien)}
            <span>auparavant {argent(annonce.ancien)}</span>
          </p>
        </div>
      ) : (
        <div className="annonce__carte annonce__carte--palier" key={annonce.id}>
          <p className="annonce__surtitre">Le total de l’encan franchit</p>
          <Montant valeur={annonce.montant} depart={Math.max(0, annonce.montant - PALIER)} className="annonce__montant" />
          <p className="annonce__merci">Merci, pour Clément</p>
        </div>
      )}
    </div>
  );
}
