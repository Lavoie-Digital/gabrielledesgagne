import "server-only";

import Stripe from "stripe";

/**
 * Le client Stripe, côté serveur seulement.
 *
 * Deux secrets, dans le fichier .env en local et dans Cloud Secret Manager
 * en ligne (voir apphosting.yaml) :
 *   STRIPE_SECRET_KEY       la clé secrète (sk_test_… pour les essais, sk_live_… en vrai)
 *   STRIPE_WEBHOOK_SECRET   le secret de signature du webhook (whsec_…)
 */

const CLE = process.env.STRIPE_SECRET_KEY?.trim();

export const stripeConfigure = Boolean(CLE);

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!CLE) throw new Error("Stripe n’est pas configuré : ajoutez STRIPE_SECRET_KEY au fichier .env.");
  client ??= new Stripe(CLE);
  return client;
}
