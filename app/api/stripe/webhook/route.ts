import type Stripe from "stripe";
import { confirmerPaiement, liberer, marquerEnTraitement } from "@/lib/billetterie";
import { stripe } from "@/lib/stripe";

/**
 * Le webhook Stripe : Stripe appelle cette adresse à chaque étape d’un
 * paiement. Dans le tableau de bord Stripe (Développeurs > Webhooks), créez
 * une destination vers https://VOTRE-SITE/api/stripe/webhook avec ces
 * événements :
 *   checkout.session.completed
 *   checkout.session.async_payment_succeeded
 *   checkout.session.async_payment_failed
 *   checkout.session.expired
 * puis copiez le secret de signature (whsec_…) dans STRIPE_WEBHOOK_SECRET.
 */

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return new Response("Webhook non configuré", { status: 400 });

  // La signature se vérifie sur le corps brut, tel que Stripe l’a envoyé
  const corps = await request.text();
  let evenement: Stripe.Event;
  try {
    evenement = await stripe().webhooks.constructEventAsync(corps, signature, secret);
  } catch {
    return new Response("Signature invalide", { status: 400 });
  }

  try {
    switch (evenement.type) {
      case "checkout.session.completed": {
        const session = evenement.data.object;
        if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
          await confirmerPaiement(session);
        } else {
          await marquerEnTraitement(session);
        }
        break;
      }
      case "checkout.session.async_payment_succeeded":
        await confirmerPaiement(evenement.data.object);
        break;
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const id = evenement.data.object.client_reference_id;
        if (id) await liberer(id);
        break;
      }
    }
  } catch (e) {
    // Une réponse 500 fait réessayer Stripe plus tard : rien ne se perd
    console.error("[webhook stripe]", evenement.type, e);
    return new Response("Erreur temporaire", { status: 500 });
  }

  return Response.json({ recu: true });
}
