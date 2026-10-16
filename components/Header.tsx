"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
    <header className="header">
      <div className="wrap header__inner">
        <Link className="brand" href="/">
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
              {l.libelle}
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
