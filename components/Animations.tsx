"use client";

import { useEffect } from "react";

/**
 * Deux effets, discrets tous les deux :
 *   1. les blocs marqués data-reveal apparaissent en montant légèrement
 *      quand ils entrent dans l’écran
 *   2. la photo en arche glisse un peu plus lentement que le reste
 *
 * Si la personne a demandé à son système de réduire les animations,
 * on n’anime rien du tout : tout est simplement visible.
 */
export default function Animations() {
  useEffect(() => {
    const doux = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const blocs = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (doux) {
      blocs.forEach((b) => b.classList.add("est-visible"));
      return;
    }

    const observateur = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("est-visible");
            observateur.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
    );
    blocs.forEach((b) => observateur.observe(b));

    // Filet de sécurité : si quelque chose empêche l’observateur de faire son
    // travail, tout le contenu réapparaît quand même au bout de deux secondes.
    // Mieux vaut une animation ratée qu’un texte invisible.
    const secours = window.setTimeout(() => {
      blocs.forEach((b) => b.classList.add("est-visible"));
    }, 2000);

    // Léger décalage de la photo au défilement
    const parallaxes = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    let enAttente = false;

    const bouger = () => {
      enAttente = false;
      const y = window.scrollY;
      parallaxes.forEach((el) => {
        const force = Number(el.dataset.parallax) || 0.06;
        el.style.transform = `translate3d(0, ${(-y * force).toFixed(1)}px, 0)`;
      });
    };

    const auDefilement = () => {
      if (!enAttente) {
        enAttente = true;
        requestAnimationFrame(bouger);
      }
    };

    if (parallaxes.length) {
      bouger();
      window.addEventListener("scroll", auDefilement, { passive: true });
    }

    return () => {
      observateur.disconnect();
      window.clearTimeout(secours);
      window.removeEventListener("scroll", auDefilement);
    };
  }, []);

  return null;
}
