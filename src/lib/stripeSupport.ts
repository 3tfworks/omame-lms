import "server-only";

import type Stripe from "stripe";
import {
  classifyStripePayment,
  type StripePaymentSummary,
  type StripeSupportLookup,
} from "@/lib/stripeSupportStatus";

const MAX_SESSIONS = 10;
const MAX_STRIPE_EVENTS = 100;
const STRIPE_EVENT_RETENTION_DAYS = 30;

function getPaymentIntent(session: Stripe.Checkout.Session) {
  return session.payment_intent && typeof session.payment_intent !== "string"
    ? session.payment_intent
    : null;
}

function getPaymentIntentId(session: Stripe.Checkout.Session) {
  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id || null;
}

function getProductType(session: Stripe.Checkout.Session): StripePaymentSummary["productType"] {
  const value = session.metadata?.price_type;
  return value === "general" || value === "salon" ? value : null;
}

export async function lookupStripePaymentsByEmail(email: string): Promise<StripeSupportLookup> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { configured: false, available: false, payments: [] };
  }

  const { stripe } = await import("@/lib/stripe");
  const sessions = await stripe.checkout.sessions.list({
    customer_details: { email },
    limit: MAX_SESSIONS,
    expand: ["data.payment_intent"],
  });

  const paymentIntentIds = new Set(
    sessions.data.map(getPaymentIntentId).filter((id): id is string => Boolean(id)),
  );
  const authenticationEventPaymentIntentIds = new Set<string>();

  if (paymentIntentIds.size > 0 && sessions.data.length > 0) {
    const earliestSessionCreated = Math.min(...sessions.data.map((session) => session.created));
    const retentionStart = Math.floor(Date.now() / 1000) - STRIPE_EVENT_RETENTION_DAYS * 24 * 60 * 60;
    const events = await stripe.events.list({
      created: { gte: Math.max(earliestSessionCreated, retentionStart) },
      limit: MAX_STRIPE_EVENTS,
      types: ["payment_intent.requires_action", "payment_intent.payment_failed"],
    });

    for (const event of events.data) {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      if (paymentIntentIds.has(paymentIntent.id)) {
        authenticationEventPaymentIntentIds.add(paymentIntent.id);
      }
    }
  }

  const payments = sessions.data.map((session): StripePaymentSummary => {
    const paymentIntent = getPaymentIntent(session);
    const paymentIntentId = getPaymentIntentId(session);
    const paymentIntentStatus = paymentIntent?.status || null;

    return {
      checkoutSessionId: session.id,
      paymentIntentId,
      status: classifyStripePayment({
        sessionStatus: session.status,
        paymentStatus: session.payment_status,
        paymentIntentStatus,
        hadAuthenticationEvent: Boolean(
          paymentIntentId && authenticationEventPaymentIntentIds.has(paymentIntentId),
        ),
      }),
      sessionStatus: session.status,
      paymentStatus: session.payment_status,
      paymentIntentStatus,
      amountTotal: session.amount_total,
      currency: session.currency,
      productType: getProductType(session),
      customerEmail: session.customer_details?.email || session.customer_email || null,
      customerName: session.customer_details?.name || null,
      managedPurchase: Boolean(getProductType(session)),
      createdAt: new Date(session.created * 1000).toISOString(),
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
    };
  });

  return { configured: true, available: true, payments };
}
