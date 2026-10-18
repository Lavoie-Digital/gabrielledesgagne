/**
 * L’ourson de Clément, dessiné d’un seul trait d’après son urne :
 * le nœud papillon, le petit cœur au centre, les coussinets ronds des pattes.
 *
 * Le trait prend la couleur du texte autour (currentColor), le cœur garde
 * toujours l’accent argile. Les tracés portent la classe « ourson__trait »
 * pour que les animations puissent les dessiner un à un.
 */
export default function Ourson({
  className = "",
  titre,
}: {
  className?: string;
  titre?: string;
}) {
  return (
    <svg
      className={"ourson " + className}
      viewBox="18 6 84 122"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={titre ? "img" : undefined}
      aria-label={titre}
      aria-hidden={titre ? undefined : true}
    >
      {/* Oreilles */}
      <path className="ourson__trait" d="M37.55 33 A10.5 10.5 0 1 1 47.99 22.07" />
      <path className="ourson__trait" d="M72.01 22.07 A10.5 10.5 0 1 1 82.45 33" />
      <path className="ourson__trait ourson__fin" d="M38.2 26.5 A4.8 4.8 0 0 1 44.6 22.6" />
      <path className="ourson__trait ourson__fin" d="M75.4 22.6 A4.8 4.8 0 0 1 81.8 26.5" />

      {/* Tête et museau */}
      <circle className="ourson__trait" cx="60" cy="44" r="25" />
      <path
        className="ourson__trait"
        d="M51 57.5 C52 51 56 49.5 60 49.5 C64 49.5 68 51 69 57.5 C68 61.5 64 63 60 63 C56 63 52 61.5 51 57.5Z"
      />
      <path
        className="ourson__plein"
        d="M57.2 53.2 Q60 51.8 62.8 53.2 Q61.8 55.9 60 56.2 Q58.2 55.9 57.2 53.2Z"
        fill="currentColor"
        strokeWidth={1}
      />
      <path className="ourson__trait" d="M60 56.2 V59" strokeWidth={1.3} />
      <circle className="ourson__plein" cx="50.5" cy="41" r="2.1" fill="currentColor" stroke="none" />
      <circle className="ourson__plein" cx="69.5" cy="41" r="2.1" fill="currentColor" stroke="none" />

      {/* Corps et bras */}
      <path className="ourson__trait" d="M45.5 64.3 C36 74 30 91 31.6 107" />
      <path className="ourson__trait" d="M74.5 64.3 C84 74 90 91 88.4 107" />
      <path
        className="ourson__trait"
        d="M45.2 77.5 C40.2 85 39.6 94.5 43.6 99.6 C46 102.4 50.6 101.4 50.8 97.6 C51.1 91.5 49.6 84.5 47.4 79.6"
      />
      <path
        className="ourson__trait"
        d="M74.8 77.5 C79.8 85 80.4 94.5 76.4 99.6 C74 102.4 69.4 101.4 69.2 97.6 C68.9 91.5 70.4 84.5 72.6 79.6"
      />

      {/* Pattes, avec leurs coussinets */}
      <circle className="ourson__trait" cx="42" cy="113" r="12" />
      <circle className="ourson__trait ourson__fin" cx="42" cy="113" r="6.2" />
      <circle className="ourson__trait" cx="78" cy="113" r="12" />
      <circle className="ourson__trait ourson__fin" cx="78" cy="113" r="6.2" />
      <path className="ourson__trait" d="M54 117.5 Q60 119.5 66 117.5" />

      {/* Le nœud papillon */}
      <path
        className="ourson__trait"
        d="M56 74.5 C52 71.5 48.5 69.5 46.6 70.2 C44.8 71 44.8 78 46.6 78.8 C48.5 79.5 52 77.5 56 74.5Z"
      />
      <path
        className="ourson__trait"
        d="M64 74.5 C68 71.5 71.5 69.5 73.4 70.2 C75.2 71 75.2 78 73.4 78.8 C71.5 79.5 68 77.5 64 74.5Z"
      />

      {/* Le cœur */}
      <path
        className="ourson__coeur"
        d="M60 79.6 C57.4 77.7 55.5 76 55.5 73.9 C55.5 72.3 56.7 71.2 58 71.2 C58.9 71.2 59.6 71.7 60 72.4 C60.4 71.7 61.1 71.2 62 71.2 C63.3 71.2 64.5 72.3 64.5 73.9 C64.5 76 62.6 77.7 60 79.6Z"
        strokeWidth={1.2}
      />
    </svg>
  );
}
