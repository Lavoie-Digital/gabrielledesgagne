import Image from "next/image";

/* L’en-tête des pages intérieures : le titre d’un côté, une photo (facultative) de l’autre */
export default function EnTete({
  surtitre,
  titre,
  texte,
  image,
  alt = "",
}: {
  surtitre?: string;
  titre: string;
  texte: string;
  image?: string;
  alt?: string;
}) {
  return (
    <section className="pagehead">
      <div className={"wrap pagehead__grille" + (image ? "" : " pagehead__grille--seul")}>
        <div className="pagehead__texte">
          {surtitre && <p className="surtitre" data-reveal>{surtitre}</p>}
          <h1 data-lignes>{titre}</h1>
          <p data-reveal>{texte}</p>
        </div>
        {image && (
          <figure className="pagehead__image" data-devoile>
            <Image src={image} alt={alt} fill sizes="(max-width: 940px) 100vw, 460px" priority />
          </figure>
        )}
      </div>
    </section>
  );
}
