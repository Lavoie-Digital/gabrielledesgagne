"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import type Lenis from "lenis";

/* Les extensions GSAP sont enregistrées une seule fois, ici. */
gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

/* Courbes d’animation partagées par tout le site */
export const DOUX = "expo.out";
export const GLISSE = "power3.inOut";

/* Le défilement fluide, partagé pour pouvoir le suspendre (fenêtre ouverte) */
let lenis: Lenis | null = null;

export const defilement = {
  brancher(l: Lenis | null) {
    lenis = l;
  },
  arreter() {
    lenis?.stop();
  },
  reprendre() {
    lenis?.start();
  },
  enHaut() {
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  },
};

/* La page est prête quand le voile d’ouverture commence à se lever.
   L’accueil attend ce signal pour lancer l’entrée de son titre. */
export const PAGE_PRETE = "pourclement:page-prete";

export { gsap, ScrollTrigger, SplitText };
