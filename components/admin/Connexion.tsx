"use client";

import { FirebaseError } from "firebase/app";
import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { courrielAccepte, ouvrirSession } from "@/app/admin/actions";
import { authNavigateur } from "@/lib/firebase-client";

const MEMOIRE = "pourclement:courriel-connexion";

/* Les erreurs Firebase les plus probables, en clair */
function expliquer(e: unknown): string {
  const code = e instanceof FirebaseError ? e.code : "";
  switch (code) {
    case "auth/operation-not-allowed":
    case "auth/configuration-not-found":
      return "Cette méthode de connexion n’est pas encore activée dans la console Firebase (Authentication > Méthode de connexion).";
    case "auth/unauthorized-domain":
    case "auth/unauthorized-continue-uri":
      return "Ce domaine n’est pas autorisé dans Firebase (Authentication > Paramètres > Domaines autorisés).";
    case "auth/invalid-action-code":
    case "auth/expired-action-code":
      return "Ce lien de connexion a expiré ou a déjà servi. Demandez-en un nouveau.";
    case "auth/invalid-email":
      return "L’adresse courriel ne semble pas valide.";
    case "auth/popup-blocked":
      return "Le navigateur a bloqué la fenêtre de connexion. Autorisez les fenêtres surgissantes pour ce site.";
    case "auth/network-request-failed":
      return "Pas de connexion Internet.";
    default:
      return "La connexion a échoué. Réessayez dans un instant.";
  }
}

export default function Connexion() {
  const router = useRouter();
  const [courriel, setCourriel] = useState("");
  const [etat, setEtat] = useState<"pret" | "occupe" | "envoye" | "confirmer">("pret");
  const [erreur, setErreur] = useState("");

  /* Le jeton Firebase est échangé contre une session côté serveur, puis on
     se déconnecte du navigateur : seule la session du serveur fait foi. */
  async function terminer(user: User) {
    const retour = await ouvrirSession(await user.getIdToken());
    await signOut(authNavigateur());
    if (retour?.ok) {
      router.replace("/admin");
      router.refresh();
    } else {
      setErreur(retour?.message ?? "Accès refusé.");
      setEtat("pret");
    }
  }

  // Retour depuis le lien reçu par courriel
  useEffect(() => {
    const auth = authNavigateur();
    if (!isSignInWithEmailLink(auth, window.location.href)) return;

    (async () => {
      await auth.authStateReady();
      const memorise = window.localStorage.getItem(MEMOIRE);
      if (!memorise) {
        // Lien ouvert sur un autre appareil : on redemande l’adresse
        setEtat("confirmer");
        return;
      }
      setEtat("occupe");
      try {
        const r = await signInWithEmailLink(auth, memorise, window.location.href);
        window.localStorage.removeItem(MEMOIRE);
        await terminer(r.user);
      } catch (e) {
        setErreur(expliquer(e));
        setEtat("pret");
      }
    })();
    // terminer ne change pas d’un rendu à l’autre pour ce qui nous concerne
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function avecGoogle() {
    setErreur("");
    setEtat("occupe");
    try {
      const fournisseur = new GoogleAuthProvider();
      fournisseur.setCustomParameters({ prompt: "select_account" });
      const r = await signInWithPopup(authNavigateur(), fournisseur);
      await terminer(r.user);
    } catch (e) {
      if (e instanceof FirebaseError && e.code === "auth/popup-closed-by-user") {
        setEtat("pret");
        return;
      }
      setErreur(expliquer(e));
      setEtat("pret");
    }
  }

  async function parCourriel(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    const adresse = courriel.trim().toLowerCase();
    setEtat("occupe");
    try {
      if (etat === "confirmer") {
        const r = await signInWithEmailLink(authNavigateur(), adresse, window.location.href);
        await terminer(r.user);
        return;
      }
      if (!(await courrielAccepte(adresse))) {
        setErreur("Cette adresse n’a pas accès à l’espace privé.");
        setEtat("pret");
        return;
      }
      await sendSignInLinkToEmail(authNavigateur(), adresse, {
        url: `${window.location.origin}/admin/connexion`,
        handleCodeInApp: true,
      });
      window.localStorage.setItem(MEMOIRE, adresse);
      setEtat("envoye");
    } catch (err) {
      setErreur(expliquer(err));
      setEtat("pret");
    }
  }

  if (etat === "envoye") {
    return (
      <div className="adm-succes" role="status">
        Un lien de connexion vient d’être envoyé à <b>{courriel}</b>. Ouvrez-le depuis ce même
        appareil. Pensez à regarder dans les courriels indésirables.
      </div>
    );
  }

  const occupe = etat === "occupe";

  return (
    <div className="adm-connexion__choix">
      {etat !== "confirmer" && (
        <>
          <button type="button" className="adm-btn adm-btn--plein" onClick={avecGoogle} disabled={occupe}>
            Continuer avec Google
          </button>
          <p className="adm-ou"><span>ou</span></p>
        </>
      )}

      <form onSubmit={parCourriel} className="adm-pile">
        <label className="adm-champ">
          <span>
            {etat === "confirmer"
              ? "Confirmez l’adresse à laquelle le lien a été envoyé"
              : "Recevoir un lien de connexion par courriel"}
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={courriel}
            onChange={(e) => setCourriel(e.target.value)}
            placeholder="prenom@lavoiedigital.ca"
          />
        </label>
        <button type="submit" className="adm-btn" disabled={occupe}>
          {occupe ? "Un instant…" : etat === "confirmer" ? "Me connecter" : "Envoyer le lien"}
        </button>
      </form>

      {erreur && <p className="adm-alerte" role="alert">{erreur}</p>}
    </div>
  );
}
