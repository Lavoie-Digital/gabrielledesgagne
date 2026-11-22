"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CONFIG, argent } from "@/lib/donnees";
import { attacherSessionDon, creerDon, expirerDon } from "@/lib/dons";
import { firebaseConfigure } from "@/lib/firebase-admin";
import { lireDonateur, MESSAGE_CORPORATIF_INCOMPLET } from "@/lib/recu-fiscal";
import { stripe, stripeConfigure } from "@/lib/stripe";

export type EtatDon = { message: string } | null;

async function origine(): Promise<string> {
  const fixe = process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (fixe) return fixe;
  const h = await headers();
  const hote = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocole = h.get("x-forwarded-proto") ?? (hote.startsWith("localhost") ? "http" : "https");
  return `${protocole}://${hote}`;
}

/**
 * « Faire mon don » : envoie la personne sur la page de paiement Stripe.
 * Uniquement un don : ni billet, ni allergies.
 */
export async function faireUnDon(_: EtatDon, form: FormData): Promise<EtatDon> {
  const { minimum, maximum } = CONFIG.don;

  if (!stripeConfigure || !firebaseConfigure) {
    return { message: "Les dons en ligne ne sont pas encore ouverts. Revenez bientôt !" };
  }

  const brut = Number(String(form.get("montant") ?? "").replace(",", "."));
  const montant = Number.isFinite(brut) ? Math.round(brut) : 0;
  if (montant < minimum) return { message: `Le don minimum est de ${argent(minimum)}.` };
  if (montant > maximum) {
    return { message: `Pour un don de plus de ${argent(maximum)}, écrivez-nous : nous vous accompagnerons.` };
  }
  const recu = form.get("recu") === "on";
  const donateur = lireDonateur(form);
  if (!donateur) return { message: MESSAGE_CORPORATIF_INCOMPLET };
  const { type, entreprise, poste } = donateur;

  let id: string;
  try {
    id = await creerDon(montant, recu, donateur);
  } catch (e) {
    console.error("[don] enregistrement impossible", e);
    return { message: "Un problème technique empêche le don. Réessayez dans un instant." };
  }

  const site = await origine();
  let url: string | null = null;
  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      locale: "fr-CA",
      currency: "cad",
      client_reference_id: id,
      submit_type: "donate",
      // Les mêmes coordonnées que la Fondation En Cœur : adresse et téléphone
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "cad",
            unit_amount: montant * 100,
            product_data: {
              name: type === "corporatif" ? `Don corporatif : ${entreprise}` : "Don à la Fondation En Cœur",
              description: "Don à la Fondation En Cœur, en mémoire de Clément",
            },
          },
        },
      ],
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
      ],
      custom_text: recu
        ? {
            submit: {
              message: `Votre reçu fiscal de ${argent(montant)} sera émis par la Fondation En Cœur après la soirée, au nom et à l’adresse indiqués ici.`,
            },
          }
        : undefined,
      metadata: { type: "don", don: id, recu: recu ? "oui" : "non", donateur: type, entreprise, poste },
      payment_intent_data: {
        description: `Pour Clément : don de ${montant} $`,
        metadata: { type: "don", don: id },
      },
      success_url: `${site}/don/merci?session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/don#donner`,
    });
    await attacherSessionDon(id, session.id);
    url = session.url;
  } catch (e) {
    console.error("[don] session Stripe impossible", e);
    await expirerDon(id).catch(() => {});
    return { message: "Le paiement n’a pas pu démarrer. Réessayez dans un instant." };
  }

  if (!url) return { message: "Le paiement n’a pas pu démarrer. Réessayez dans un instant." };
  redirect(url);
}
