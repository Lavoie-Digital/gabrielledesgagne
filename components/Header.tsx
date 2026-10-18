"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Ourson from "@/components/Ourson";

const LIENS = [
  { href: "/", libelle: "Accueil" },
  { href: "/prix", libelle: "Les prix" },
  { href: "/commanditaires", libelle: "Nos commanditaires" },
  { href: "/billets", libelle: "Réservez votre billet" },
  { href: "/don", libelle: "Faire un don" },
];

export default function Header() {
  const [ouvert, setOuvert] = useState(false);
  const chemin = usePathname();

  return (
    // Sur l’accueil, l’en-tête flotte, transparent, au-dessus de la vidéo
    <header className={"header" + (chemin === "/" ? " header--sur-ecran" : "")}>
      <div className="wrap header__inner">
        <Link className="brand" href="/" aria-label="Pour Clément, retour à l’accueil">
          <Ourson className="brand__ourson" />
          <span className="brand__text">
            <span className="brand__name">Pour Clément</span>
            <span className="brand__sub">Soirée-bénéfice</span>
          </span>
        </Link>

        <button
          className="nav-toggle"
          aria-expanded={ouvert}
          aria-controls="menu"
          aria-label="Ouvrir le menu"
          onClick={() => setOuvert(!ouvert)}
        >
          <span />
        </button>

        <nav className={"nav" + (ouvert ? " is-open" : "")} id="menu">
          {LIENS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={chemin === l.href ? "is-active" : ""}
              onClick={() => setOuvert(false)}
            >
              <span>{l.libelle}</span>
            </Link>
          ))}
        </nav>

        <Link className="btn btn--primary btn--sm" href="/billets">
          Réserver
        </Link>
      </div>
    </header>
  );
}
