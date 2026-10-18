"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ScrollTrigger, defilement, gsap } from "@/lib/mouvement";

/**
 * Le défilement amorti de tout le site, et l’en-tête qui s’efface quand on
 * descend pour revenir dès qu’on remonte.
 *
 * Si la personne a demandé à son système de réduire les animations, on garde
 * le défilement natif du navigateur, sans amorti.
 */
export default function DefilementFluide() {
  const chemin = usePathname();

  useEffect(() => {
    const entete = document.querySelector<HTMLElement>(".header");
    const doux = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const suivreEntete = (y: number, sens: number) => {
      if (!entete) return;
      entete.classList.toggle("header--decolle", y > 12);
      entete.classList.toggle("header--cache", sens > 0 && y > 220);
    };

    if (doux) {
      const auDefilement = () => {
        entete?.classList.toggle("header--decolle", window.scrollY > 12);
      };
      window.addEventListener("scroll", auDefilement, { passive: true });
      return () => window.removeEventListener("scroll", auDefilement);
    }

    const l = new Lenis({ duration: 1.15, smoothWheel: true });
    defilement.brancher(l);

    l.on("scroll", (e: Lenis) => {
      ScrollTrigger.update();
      suivreEntete(e.scroll, e.direction);
    });

    const tic = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(tic);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tic);
      l.destroy();
      defilement.brancher(null);
    };
  }, []);

  // Chaque nouvelle page commence en haut, en-tête visible
  useEffect(() => {
    defilement.enHaut();
    document.querySelector(".header")?.classList.remove("header--cache");
  }, [chemin]);

  return null;
}
