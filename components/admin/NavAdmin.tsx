"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LIENS = [
  { href: "/admin", libelle: "Tableau de bord" },
  { href: "/admin/lots", libelle: "Lots de l’encan" },
  { href: "/admin/commanditaires", libelle: "Commanditaires" },
  { href: "/admin/mises", libelle: "Mises du soir" },
];

export default function NavAdmin() {
  const chemin = usePathname();
  return (
    <nav className="adm-nav">
      {LIENS.map((l) => {
        const actif = l.href === "/admin" ? chemin === "/admin" : chemin.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} className={actif ? "is-active" : ""}>
            {l.libelle}
          </Link>
        );
      })}
      <a href="/" target="_blank" rel="noopener">Voir le site ↗</a>
    </nav>
  );
}
