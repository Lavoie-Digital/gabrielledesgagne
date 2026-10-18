"use client";

import { useGSAP } from "@gsap/react";
import ImageLot from "@/components/ImageLot";
import Link from "next/link";
import { useRef } from "react";
import { CONFIG, argent, type Lot } from "@/lib/donnees";
import { gsap } from "@/lib/mouvement";


/**
 * Les prix de l’encan, sur l’accueil.
 * Sur grand écran, la section reste en place pendant que les lots défilent
 * de droite à gauche au rythme de la molette. Sur téléphone, c’est un simple
 * carrousel qu’on fait glisser du doigt.
 */
export default function VitrineEncan({ lots }: { lots: Lot[] }) {
  const racine = useRef<HTMLElement>(null);

  // Les huit lots de plus grande valeur ouvrent la vitrine
  const vedettes = lots
    .map((lot, i) => ({ lot, i }))
    .sort((a, b) => b.lot.valeur - a.lot.valeur)
    .slice(0, 8);
  const valeurTotale = lots.reduce((s, l) => s + l.valeur, 0);
  const autres = lots.length - vedettes.length;

  useGSAP(
    () => {
      if (!lots.length) return; // pas de lots : pas de défilement horizontal
      const mm = gsap.matchMedia();
      mm.add("(min-width: 941px) and (prefers-reduced-motion: no-preference)", () => {
        const fenetre = racine.current!.querySelector<HTMLElement>(".vitrine__fenetre")!;
        const piste = racine.current!.querySelector<HTMLElement>(".vitrine__piste")!;
        const distance = () => Math.max(0, piste.scrollWidth - fenetre.clientWidth);

        const glisse = gsap.to(piste, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: ".vitrine__epingle",
            start: "top top",
            end: () => "+=" + distance(),
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        gsap.fromTo(".vitrine__progres i", { scaleX: 0 }, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".vitrine__epingle",
            start: "top top",
            end: () => "+=" + distance(),
            scrub: 0.8,
          },
        });

        // Chaque photo glisse un peu dans son cadre pendant le passage
        gsap.utils.toArray<HTMLElement>(".vlot__image .image-lot--remplir .image-lot__image").forEach((img) => {
          gsap.fromTo(img, { xPercent: -7 }, {
            xPercent: 7,
            ease: "none",
            scrollTrigger: {
              trigger: img.closest(".vlot"),
              containerAnimation: glisse,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          });
        });
      });
    },
    { scope: racine }
  );

  /* Tant qu’aucun lot n’est publié, on annonce l’encan et on invite à offrir un lot */
  if (!lots.length) {
    return (
      <section className="vitrine vitrine--attente" id="encan">
        <div className="wrap vitrine__annonce">
          <p className="surtitre">L’encan silencieux</p>
          <h2 data-lignes>
            Les lots seront dévoilés <em>très bientôt.</em>
          </h2>
          <p className="vitrine__texte" data-reveal>
            Escapades, tables gourmandes, œuvres d’ici : les entreprises qui offrent un lot sont
            en train de confirmer leur don. Votre entreprise aimerait en être ?
          </p>
          <div className="btn-row" data-reveal>
            <a
              className="btn btn--light"
              href={`mailto:${CONFIG.contact.courriel}?subject=Offrir%20un%20lot%20%C3%A0%20l%E2%80%99encan`}
            >
              Offrir un lot
            </a>
            <a className="btn btn--outline-light" href={CONFIG.liens.planCommandite} target="_blank" rel="noopener">
              Le plan de commandite
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="vitrine" ref={racine} id="encan">
      <div className="vitrine__epingle">
        <div className="wrap vitrine__tete">
          <div>
            <p className="surtitre">L’encan silencieux</p>
            <h2 data-lignes>
              {lots.length > 1 ? `${lots.length} lots` : "Des lots"} offerts par des gens d’ici. <em>À vous de miser.</em>
            </h2>
          </div>
          <p className="vitrine__total" data-reveal>
            <b>
              <span data-compte={valeurTotale}>{new Intl.NumberFormat("fr-CA").format(valeurTotale)}</span>
              &nbsp;$
            </b>
            <span>en prix, d’une escapade dans Charlevoix à une œuvre originale</span>
          </p>
        </div>

        <div className="vitrine__fenetre">
          <ol className="vitrine__piste">
            {vedettes.map(({ lot, i }) => (
              <li key={lot.id ?? i} className="vlot">
                <Link href="/prix" className="vlot__lien">
                  <figure className="vlot__image">
                    {lot.image ? (
                      <ImageLot src={lot.image} alt="" cadrage={lot.cadrage} sizes="(max-width: 940px) 72vw, 340px" />
                    ) : (
                      <span className="vlot__sans-photo">{String(i + 1).padStart(2, "0")}</span>
                    )}
                  </figure>
                  <p className="vlot__meta">
                    <span>Lot {String(i + 1).padStart(2, "0")}</span>
                    <span>{lot.categorie}</span>
                  </p>
                  <h3 className="vlot__titre">{lot.titre}</h3>
                  <p className="vlot__prix">
                    Valeur {argent(lot.valeur)}
                    <span>Mise de départ {argent(lot.miseDepart)}</span>
                  </p>
                </Link>
              </li>
            ))}
            <li className="vlot vlot--fin">
              <Link href="/prix" className="vlot__lien">
                {autres > 0 ? (
                  <>
                    <span className="vlot__nombre">+{autres}</span>
                    <span className="vlot__suite">autres lots à découvrir</span>
                  </>
                ) : (
                  <span className="vlot__suite">Tous les détails, lot par lot</span>
                )}
                <span className="lien-fleche lien-fleche--clair">
                  Voir tous les prix <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          </ol>
        </div>

        <div className="wrap vitrine__progres" aria-hidden="true">
          <i />
        </div>
      </div>
    </section>
  );
}
