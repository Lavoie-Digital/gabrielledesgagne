"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { attacherSession, DUREE_RESERVATION_MS, liberer, montantRecu, reserver } from "@/lib/billetterie";
import { CONFIG, argent } from "@/lib/donnees";
import { firebaseConfigure } from "@/lib/firebase-admin";
import { lireDonateur, MESSAGE_CORPORATIF_INCOMPLET } from "@/lib/recu-fiscal";
import { stripe, stripeConfigure } from "@/lib/stripe";

export type EtatPaiement = { message: string } | null;

/* L’adresse du site, pour les liens de retour depuis Stripe */
async function origine(): Promise<string> {
  const fixe = process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (fixe) return fixe;
  const h = await headers();
  const hote = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocole = h.get("x-forwarded-proto") ?? (hote.startsWith("localhost") ? "http" : "https");
  return `${protocole}://${hote}`;
}

/**
 * « Passer au paiement » : vérifie la commande, met les places de côté,
 * puis envoie la personne sur la page de paiement sécurisée de Stripe.
 */
export async function passerAuPaiement(_: EtatPaiement, form: FormData): Promise<EtatPaiement> {
  const { billet } = CONFIG;

  if (!stripeConfigure || !firebaseConfigure) {
    return { message: "La billetterie en ligne n’est pas encore ouverte. Revenez bientôt !" };
  }

  const qte = Math.floor(Number(form.get("qte")));
  if (!Number.isFinite(qte) || qte < 1 || qte > billet.maxParCommande) {
    return { message: `Choisissez entre 1 et ${billet.maxParCommande} billets.` };
  }

  const donBrut = Number(String(form.get("don") ?? "0").replace(",", "."));
  const donExtra = Number.isFinite(donBrut) && donBrut > 0 ? Math.round(donBrut) : 0;
  if (donExtra > 25000) {
    return { message: "Pour un don de plus de 25 000 $, écrivez-nous : nous vous accompagnerons." };
  }

  const recu = form.get("recu") === "on";
  const acheteur = lireDonateur(form);
  if (!acheteur) return { message: MESSAGE_CORPORATIF_INCOMPLET };

  /* 1. Mettre les places de côté */
  let reservation;
  try {
    reservation = await reserver(qte, donExtra, recu, acheteur);
  } catch (e) {
    console.error("[billetterie] réservation impossible", e);
    return { message: "Un problème technique empêche la réservation. Réessayez dans un instant." };
  }
  if (!reservation.ok && reservation.fermee) {
    return { message: "La billetterie n’est pas encore ouverte. Revenez bientôt !" };
  }
  if (!reservation.ok) {
    return {
      message:
        reservation.restantes === 0
          ? "La soirée affiche complet. Merci de tout cœur ! Vous pouvez encore faire un don."
          : `Il ne reste que ${reservation.restantes} ${reservation.restantes > 1 ? "places" : "place"}. Ajustez le nombre de billets.`,
    };
  }

  /* 2. Créer la session de paiement Stripe */
  const site = await origine();
  let url: string | null = null;
  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      locale: "fr-CA",
      currency: "cad",
      client_reference_id: reservation.id,
      expires_at: Math.floor((Date.now() + DUREE_RESERVATION_MS) / 1000),
      submit_type: "pay",
      // Les mêmes coordonnées que pour un don : adresse et téléphone
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      line_items: [
        {
          quantity: qte,
          price_data: {
            currency: "cad",
            unit_amount: billet.prix * 100,
            product_data: {
              name: "Billet · Soirée-bénéfice Pour Clément",
              description: `${CONFIG.evenement.date} · ${CONFIG.evenement.lieu}`,
            },
          },
        },
        ...(donExtra > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: "cad",
                  unit_amount: donExtra * 100,
                  product_data: { name: "Don supplémentaire à la Fondation En Cœur" },
                },
              },
            ]
          : []),
      ],
      // Prénom et nom séparés, obligatoires : liste d’accueil et reçus fiscaux
      // (Stripe permet au plus 3 champs personnalisés)
      custom_fields: [
        {
          key: "prenom",
          type: "text",
          optional: false,
          label: { type: "custom", custom: "Prénom" },
          text: { minimum_length: 1, maximum_length: 80 },
        },
        {
          key: "nom",
          type: "text",
          optional: false,
          label: { type: "custom", custom: "Nom de famille" },
          text: { minimum_length: 1, maximum_length: 80 },
        },
        {
          key: "allergies",
          type: "text",
          optional: true,
          label: { type: "custom", custom: "Allergies ou régime alimentaire (facultatif)" },
          text: { maximum_length: 200 },
        },
      ],
      custom_text: recu
        ? {
            submit: {
              message: `Votre reçu fiscal de ${argent(montantRecu(qte, donExtra, true))} (${argent(CONFIG.billet.montantRecuParBillet)} par billet${donExtra > 0 ? " + votre don" : ""}) sera émis par la Fondation En Cœur après la soirée, au nom et à l’adresse indiqués ici${acheteur.entreprise ? ` (${acheteur.entreprise})` : ""}.`,
            },
          }
        : undefined,
      metadata: {
        commande: reservation.id,
        qte: String(qte),
        donExtra: String(donExtra),
        recu: recu ? "oui" : "non",
        acheteur: acheteur.type,
        entreprise: acheteur.entreprise,
        poste: acheteur.poste,
      },
      payment_intent_data: {
        description: `Pour Clément : ${qte} billet${qte > 1 ? "s" : ""}${donExtra > 0 ? ` + don de ${donExtra} $` : ""}`,
        metadata: { commande: reservation.id },
      },
      success_url: `${site}/billets/merci?session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/billets#reserver`,
    });
    await attacherSession(reservation.id, session.id);
    url = session.url;
  } catch (e) {
    console.error("[billetterie] session Stripe impossible", e);
    await liberer(reservation.id).catch(() => {});
    return { message: "Le paiement n’a pas pu démarrer. Réessayez dans un instant." };
  }

  if (!url) return { message: "Le paiement n’a pas pu démarrer. Réessayez dans un instant." };
  redirect(url);
}
