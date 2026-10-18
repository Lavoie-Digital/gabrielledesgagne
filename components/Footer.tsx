import Image from "next/image";
import Link from "next/link";
import Ourson from "@/components/Ourson";
import { CONFIG } from "@/lib/donnees";

export default function Footer({ citation = true }: { citation?: boolean }) {
  const { evenement, contact, liens } = CONFIG;

  return (
    <footer className="footer">
      <div className="wrap">
        {citation && (
          <p className="footer__quote">
            « Un petit cœur s’est arrêté. Grâce à vous, beaucoup d’autres continueront de battre. »
          </p>
        )}

        <div className="footer__grid">
          <div>
            <Ourson className="footer__ourson" />
            <h4>Pour Clément</h4>
            <p style={{ fontSize: ".94rem" }}>
              Soirée-bénéfice et encan silencieux au profit de la Fondation En Cœur.
            </p>
            <span className="footer__chip">
              <Image
                src="/logo-encoeur-desktop-260.png"
                alt="Fondation En Cœur"
                width={260}
                height={62}
                sizes="135px"
                style={{ width: 135, height: "auto" }}
              />
            </span>
          </div>

          <div>
            <h4>L’événement</h4>
            <ul>
              <li>{evenement.date}</li>
              <li>{evenement.heure}</li>
              <li>{evenement.lieu}</li>
              <li>{evenement.adresse}</li>
            </ul>
          </div>

          <div>
            <h4>Nous joindre</h4>
            <ul>
              <li>{contact.nom}</li>
              <li><a href={`mailto:${contact.courriel}`}>{contact.courriel}</a></li>
              <li><a href={`tel:${contact.telephone.replace(/\s/g, "")}`}>{contact.telephone}</a></li>
              <li><a href={liens.planCommandite} target="_blank" rel="noopener">Plan de commandite (PDF)</a></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>
            &copy; 2027 Soirée-bénéfice Pour Clément
            {" · "}
            <a href="/direct">Les mises en direct</a>
            {" · "}
            <Link href="/confidentialite">Politique de confidentialité</Link>
            {" · "}
            <a href="/admin" rel="nofollow">Espace privé</a>
          </span>
          <span>
            Fondation En Cœur &middot;{" "}
            <a href="https://en-coeur.org/" target="_blank" rel="noopener">en-coeur.org</a>
          </span>
        </div>

        <p className="footer__credit">
          Création de{" "}
          <a href="https://lavoiedigital.ca" target="_blank" rel="noopener">Lavoie Digital</a>
        </p>
      </div>
    </footer>
  );
}
