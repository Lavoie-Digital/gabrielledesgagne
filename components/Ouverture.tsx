"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Compteur from "@/components/Compteur";
import Ourson from "@/components/Ourson";
import { CONFIG, argent } from "@/lib/donnees";
import { DOUX, PAGE_PRETE, SplitText, gsap } from "@/lib/mouvement";

/**
 * L’ouverture de l’accueil, en plein écran.
 *
 * Une vidéo d’ambiance tourne en fond, assombrie pour garder le texte lisible.
 * Au centre : l’ourson, le nom, la date, et une seule action principale,
 * réserver sa place. Tout le reste s’efface derrière elle.
 *
 * La vidéo ne démarre pas si la personne a demandé de réduire les animations
 * ou d’économiser ses données : l’image de couverture reste alors en place.
 * Un bouton permet de la mettre en pause à tout moment.
 */
export default function Ouverture() {
  const racine = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [enPause, setEnPause] = useState(true);
  const { evenement, billet } = CONFIG;

  // Lancer la vidéo seulement quand c’est souhaitable
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const doux = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const economie = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (doux || economie) return;
    v.play()
      .then(() => setEnPause(false))
      .catch(() => {}); // lecture bloquée (mode économie d’énergie) : la couverture reste
  }, []);

  function basculer() {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setEnPause(false)).catch(() => {});
    } else {
      v.pause();
      setEnPause(true);
    }
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-entree]", { autoAlpha: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", (ctx) => {
        const titre = SplitText.create(".ecran__titre", {
          type: "lines,chars",
          mask: "lines",
          linesClass: "ligne",
        });

        /* ---------- L’entrée ---------- */
        const tl = gsap.timeline({ paused: true, defaults: { ease: DOUX } });
        tl.set("[data-entree]", { autoAlpha: 1 })
          .fromTo(".ecran__fond", { scale: 1.12 }, { scale: 1, duration: 3.2 }, 0)
          .from(".ecran__ourson .ourson__trait", {
            drawSVG: 0, duration: 1.4, stagger: 0.02, ease: "power2.inOut",
          }, 0.1)
          .from(".ecran__ourson .ourson__plein, .ecran__ourson .ourson__coeur", {
            scale: 0, transformOrigin: "50% 50%", duration: 0.6, stagger: 0.05, ease: "back.out(3)",
          }, 0.9)
          .fromTo(".ecran__surtitre", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1 }, 0.5)
          .from(titre.chars, { yPercent: 115, duration: 1.4, stagger: 0.035 }, 0.6)
          .fromTo(
            ".ecran__infos, .ecran__actions > *, .ecran__rassurance",
            { autoAlpha: 0, y: 22 },
            { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.09, clearProps: "transform" },
            1.15
          )
          .fromTo(".ecran__bas > *", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, 1.5);

        // On attend que le voile d’ouverture se lève (filet de sécurité : 3,5 s)
        const jouer = ctx.add("jouer", () => {
          tl.play();
        }) as () => void;
        window.addEventListener(PAGE_PRETE, jouer, { once: true });
        const secours = gsap.delayedCall(3.5, jouer);

        /* ---------- En descendant : le contenu s’élève et s’efface ---------- */
        gsap.timeline({
          scrollTrigger: { trigger: racine.current, start: "top top", end: "bottom top", scrub: true },
        })
          .to(".ecran__centre", { yPercent: -18, autoAlpha: 0, ease: "none" }, 0)
          .to(".ecran__bas", { autoAlpha: 0, ease: "none", duration: 0.4 }, 0)
          .to(".ecran__fond", { yPercent: 12, scale: 1.06, ease: "none" }, 0);

        return () => {
          window.removeEventListener(PAGE_PRETE, jouer);
          secours.kill();
        };
      });
    },
    { scope: racine }
  );

  return (
    <section className="ecran" ref={racine}>
      <div className="ecran__fond" aria-hidden="true">
        <video
          ref={video}
          className="ecran__video"
          muted
          loop
          playsInline
          preload="metadata"
          poster="/videos/soiree-couverture.jpg"
        >
          {/* Version allégée pour les téléphones, choisie par le navigateur */}
          <source src="/videos/soiree-mobile.mp4" type="video/mp4" media="(max-width: 820px)" />
          <source src="/videos/soiree.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="ecran__voile" aria-hidden="true" />

      <div className="wrap ecran__centre">
        <div data-entree>
          <Ourson className="ecran__ourson" titre="L’ourson de Clément" />
        </div>

        <p className="ecran__surtitre" data-entree>
          Soirée-bénéfice &amp; encan silencieux
        </p>

        <h1 className="ecran__titre" data-entree>
          Pour <em>Clément</em>
        </h1>

        <p className="ecran__infos" data-entree>
          <span>{evenement.date}</span>
          <i aria-hidden="true" />
          <span>Dès 17 h 30</span>
          <i aria-hidden="true" />
          <span>{evenement.lieu}</span>
        </p>

        <div className="ecran__actions" data-entree>
          <Link className="btn btn--primary btn--grand" href="/billets">
            Réserver ma place
            <span className="btn__prix">{argent(billet.prix)}</span>
          </Link>
          <Link className="btn btn--outline-light btn--grand" href="/prix">
            Découvrir l’encan
          </Link>
        </div>

        <p className="ecran__rassurance" data-entree>
          Souper 4 services, deux consommations et l’encan inclus.{" "}
          <span>Chaque billet est déjà un don.</span>
        </p>
      </div>

      <div className="wrap ecran__bas" data-entree>
        <div className="ecran__compte">
          <Compteur />
        </div>

        <a className="ecran__suite" href="#phrase">
          <span>Son histoire</span>
          <i aria-hidden="true" />
        </a>

        <div className="ecran__partenaire">
          <span>Au profit de</span>
          <Image
            src="/logo-encoeur-desktop-260.png"
            alt="Fondation En Cœur"
            width={260}
            height={62}
            sizes="130px"
          />
        </div>
      </div>

      <button
        type="button"
        className="ecran__pause"
        onClick={basculer}
        aria-label={enPause ? "Lire la vidéo d’ambiance" : "Mettre la vidéo d’ambiance en pause"}
      >
        {enPause ? (
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.5v9l7.5-4.5z" fill="currentColor" /></svg>
        ) : (
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 3h2.5v10H4.5zM9 3h2.5v10H9z" fill="currentColor" /></svg>
        )}
      </button>
    </section>
  );
}
