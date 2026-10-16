import Image from "next/image";
import type { Commanditaire } from "@/lib/donnees";

/* Logo de l’entreprise, ou son nom dans un cadre si le logo n’est pas fourni */
export function Plaque({ c, grande = false }: { c: Commanditaire; grande?: boolean }) {
  if (c.logo) {
    return (
      <Image
        src={c.logo}
        alt={c.nom}
        width={grande ? 300 : 180}
        height={grande ? 150 : 80}
        style={{ width: "auto", height: "auto", maxHeight: grande ? 150 : 80 }}
      />
    );
  }
  return (
    <div className={"plaque" + (grande ? " plaque--grande" : "")}>
      {c.nom}
      <small>Logo à venir</small>
    </div>
  );
}

/* Le partenaire présentateur, présenté comme un générique plutôt qu’une carte */
export function Credit({
  c,
  mention = "Soirée présentée par",
}: {
  c: Commanditaire;
  mention?: string;
}) {
  return (
    <div className="credit">
      <p className="credit__mention">{mention}</p>
      <div className="credit__scene"><Plaque c={c} grande /></div>
      <p className="credit__nom">{c.nom}</p>
      {c.mot && (
        <p className="lead" style={{ maxWidth: 460, margin: "0 auto" }}>{c.mot}</p>
      )}
      {c.url && (
        <p style={{ marginTop: "1.4rem" }}>
          <a className="btn btn--ghost btn--sm" href={c.url} target="_blank" rel="noopener">
            Visiter le site
          </a>
        </p>
      )}
    </div>
  );
}

/* Les deux partenaires argent, côte à côte sous le présentateur */
export function CreditDuo({ liste }: { liste: Commanditaire[] }) {
  if (!liste.length) return null;
  return (
    <div className="credit__duo">
      {liste.map((c, i) => {
        const contenu = (
          <>
            <p className="credit__mention" style={{ marginBottom: ".9rem" }}>
              Partenaire Argent
            </p>
            <div className="credit__scene"><Plaque c={c} /></div>
            <p className="credit__nom">{c.nom}</p>
            {c.mot && (
              <p style={{ fontSize: ".9rem", color: "var(--ink-soft)", margin: 0 }}>{c.mot}</p>
            )}
          </>
        );
        return c.url ? (
          <a key={i} href={c.url} target="_blank" rel="noopener"
             style={{ textDecoration: "none", color: "inherit" }}>
            {contenu}
          </a>
        ) : (
          <div key={i}>{contenu}</div>
        );
      })}
    </div>
  );
}

/* Une grille de commanditaires (pages intérieures) */
export function GrilleCommanditaires({
  liste,
  etiquette,
  colonnes = "grid--3",
}: {
  liste: Commanditaire[];
  etiquette: string;
  colonnes?: string;
}) {
  if (!liste.length) {
    return <p className="lead">Les places sont encore libres à ce niveau.</p>;
  }
  return (
    <div className={`grid ${colonnes}`}>
      {liste.map((c, i) => {
        const contenu = (
          <>
            <span className="tier-tag">{etiquette}</span>
            <div className="sponsor-card__logo"><Plaque c={c} /></div>
            <div className="sponsor-card__nom">{c.nom}</div>
            {c.mot && <div className="sponsor-card__desc">{c.mot}</div>}
          </>
        );
        return c.url ? (
          <a key={i} className="sponsor-card" href={c.url} target="_blank" rel="noopener">
            {contenu}
          </a>
        ) : (
          <div key={i} className="sponsor-card">{contenu}</div>
        );
      })}
    </div>
  );
}

/* Le bandeau défilant des partenaires bronze */
export function BandeauDefilant({ liste }: { liste: Commanditaire[] }) {
  if (!liste.length) return null;

  // La liste est doublée pour que le défilement boucle sans saut visible
  const doublee = [...liste, ...liste];

  return (
    <div className="marquee">
      <div className="marquee__track">
        {doublee.map((c, i) => {
          const contenu = c.logo ? (
            <Image src={c.logo} alt={c.nom} width={170} height={58}
                   style={{ width: "auto", height: "auto", maxHeight: 58 }} />
          ) : (
            c.nom
          );
          return c.url ? (
            <a key={i} className="marquee__item" href={c.url} target="_blank" rel="noopener">
              {contenu}
            </a>
          ) : (
            <div key={i} className="marquee__item">{contenu}</div>
          );
        })}
      </div>
    </div>
  );
}
