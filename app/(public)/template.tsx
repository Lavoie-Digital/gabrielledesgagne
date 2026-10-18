"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Ourson from "@/components/Ourson";
import { DOUX, PAGE_PRETE, ScrollTrigger, SplitText, gsap } from "@/lib/mouvement";

/* Le dessin de l’ourson ne se joue qu’à la toute première ouverture du site.
   Ensuite, changer de page fait seulement glisser un rideau. */
let premiereVisite = true;

const nombre = new Intl.NumberFormat("fr-CA");

/**
 * Ce gabarit enveloppe chaque page publique et se recrée à chaque navigation.
 * C’est lui qui orchestre tous les mouvements, à partir de simples attributs
 * posés dans les pages :
 *
 *   data-reveal     le bloc monte doucement en apparaissant
 *   data-lignes     le texte se dévoile ligne par ligne, comme sous un cache
 *   data-mots       les mots s’allument un à un au rythme du défilement
 *   data-devoile    l’image se découvre de bas en haut
 *   data-parallax   l’image glisse moins vite que la page (valeur = amplitude)
 *   data-compte     le chiffre défile jusqu’à sa valeur (data-depart, data-brut)
 *   data-dessin     l’ourson se dessine trait par trait ; avec la valeur
 *                   « defile », il suit le défilement de sa section
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const racine = useRef<HTMLDivElement>(null);
  const voile = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const signaler = () => window.dispatchEvent(new Event(PAGE_PRETE));
      const mm = gsap.matchMedia();

      /* ----- Animations réduites : tout est visible, rien ne bouge ----- */
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(voile.current, { autoAlpha: 0 });
        gsap.set("[data-reveal], [data-lignes]", { autoAlpha: 1, y: 0 });
        gsap.set("[data-devoile]", { clipPath: "none" });
        gsap.set("[data-dessin]", { autoAlpha: 1 });
        premiereVisite = false;
        signaler();
      });

      /* ----- Le reste du temps ----- */
      mm.add("(prefers-reduced-motion: no-preference)", (ctx) => {
        // ctx.add : ce qui est créé plus tard (au lever du voile) sera bien
        // nettoyé avec le reste quand on quitte la page
        const animerLaPage = ctx.add("animerLaPage", () => {
          reveler();
          lignes();
          mots();
          devoiler();
          parallaxe();
          compter();
          dessiner();
          ScrollTrigger.refresh();
        }) as () => void;

        const tl = gsap.timeline();

        if (premiereVisite) {
          tl.from(".voile .ourson__trait", {
            drawSVG: 0, duration: 1.15, ease: "power2.inOut", stagger: 0.02,
          })
            .from(".voile .ourson__plein", {
              scale: 0, transformOrigin: "50% 50%", duration: 0.35, stagger: 0.06,
            }, "-=.45")
            .from(".voile .ourson__coeur", {
              scale: 0, transformOrigin: "50% 50%", duration: 0.7, ease: "back.out(3)",
            }, "-=.25")
            .from(".voile__nom", { autoAlpha: 0, y: 14, duration: 0.7, ease: DOUX }, "<")
            .to(".voile__contenu", { autoAlpha: 0, y: -20, duration: 0.5, ease: "power2.in" }, "+=.25");
        } else {
          gsap.set(".voile__contenu", { autoAlpha: 0 });
        }

        tl.add(signaler)
          .add(animerLaPage)
          .to(voile.current, {
            yPercent: -100,
            duration: premiereVisite ? 1.1 : 0.85,
            ease: "expo.inOut",
          }, "<")
          .set(voile.current, { autoAlpha: 0 })
          .add(() => { premiereVisite = false; });
      });

      // Les polices changent la hauteur des textes : on recalcule une fois chargées
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: racine }
  );

  return (
    <div ref={racine}>
      <div className="voile" ref={voile} aria-hidden="true">
        <div className="voile__contenu">
          <Ourson className="voile__ourson" />
          <p className="voile__nom">
            Pour <em>Clément</em>
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ======================================================================
   Les effets, un par attribut
   ====================================================================== */

function reveler() {
  const blocs = gsap.utils.toArray<HTMLElement>("[data-reveal]");
  if (!blocs.length) return;
  gsap.set(blocs, { autoAlpha: 0, y: 34 });
  ScrollTrigger.batch(blocs, {
    start: "top 90%",
    once: true,
    onEnter: (lot) =>
      gsap.to(lot, {
        autoAlpha: 1, y: 0, duration: 1.2, ease: DOUX, stagger: 0.1, overwrite: true,
        delay: 0.15, clearProps: "transform",
      }),
  });
}

function lignes() {
  gsap.utils.toArray<HTMLElement>("[data-lignes]").forEach((el) => {
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit(soi) {
        gsap.set(el, { autoAlpha: 1 });
        return gsap.from(soi.lines, {
          yPercent: 115,
          duration: 1.25,
          ease: DOUX,
          stagger: 0.11,
          delay: 0.1,
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      },
    });
  });
}

function mots() {
  gsap.utils.toArray<HTMLElement>("[data-mots]").forEach((el) => {
    SplitText.create(el, {
      type: "words",
      autoSplit: true,
      onSplit(soi) {
        return gsap.fromTo(
          soi.words,
          { opacity: 0.13 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 48%", scrub: 0.6 },
          }
        );
      },
    });
  });
}

function devoiler() {
  gsap.utils.toArray<HTMLElement>("[data-devoile]").forEach((el) => {
    const img = el.querySelector("img");
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
    tl.fromTo(
      el,
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" }
    );
    if (img) tl.from(img, { scale: 1.3, duration: 2, ease: DOUX }, "<.1");
  });
}

function parallaxe() {
  gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
    const force = Number(el.dataset.parallax) || 10;
    gsap.fromTo(
      el,
      { yPercent: -force },
      {
        yPercent: force,
        ease: "none",
        scrollTrigger: {
          trigger: el.parentElement ?? el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  });
}

function compter() {
  gsap.utils.toArray<HTMLElement>("[data-compte]").forEach((el) => {
    const cible = Number(el.dataset.compte);
    const depart = Number(el.dataset.depart ?? 0);
    const brut = el.dataset.brut !== undefined;
    const afficher = (v: number) => {
      el.textContent = brut ? String(Math.round(v)) : nombre.format(Math.round(v));
    };
    const etat = { v: depart };
    afficher(depart);
    gsap.to(etat, {
      v: cible,
      duration: 2.2,
      ease: "power3.out",
      onUpdate: () => afficher(etat.v),
      scrollTrigger: { trigger: el, start: "top 92%", once: true },
    });
  });
}

function dessiner() {
  gsap.utils.toArray<HTMLElement>("[data-dessin]").forEach((el) => {
    const traits = el.querySelectorAll(".ourson__trait");
    const pleins = el.querySelectorAll(".ourson__plein, .ourson__coeur");
    gsap.set(el, { autoAlpha: 1 });

    if (el.dataset.dessin === "defile") {
      const section = el.closest("section") ?? el;
      gsap
        .timeline({
          scrollTrigger: { trigger: section, start: "top 70%", end: "bottom 75%", scrub: 0.8 },
        })
        .from(traits, { drawSVG: 0, stagger: 0.12, ease: "none" })
        .from(pleins, { scale: 0, transformOrigin: "50% 50%", stagger: 0.1, ease: "back.out(3)" });
      return;
    }

    gsap
      .timeline({ scrollTrigger: { trigger: el, start: "top 85%", once: true } })
      .from(traits, { drawSVG: 0, duration: 1.6, stagger: 0.03, ease: "power2.inOut" })
      .from(pleins, {
        scale: 0, transformOrigin: "50% 50%", duration: 0.6, stagger: 0.08, ease: "back.out(3)",
      }, "-=.5");
  });
}
