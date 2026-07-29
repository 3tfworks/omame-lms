import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const applyChanges = process.argv.includes("--apply");
const verbose = process.argv.includes("--verbose");
const required = [
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing environment variable: ${name}`);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const normalizeEmail = (value) => value?.trim().toLowerCase() || "";
const getId = (value) => (typeof value === "string" ? value : value?.id || null);

const { data: users, error: usersError } = await supabase.from("users").select("id, email");
if (usersError) throw usersError;

const emailToUserId = new Map(
  (users || []).map((user) => [normalizeEmail(user.email), user.id]),
);

const { data: emailChanges, error: changesError } = await supabase
  .from("support_action_logs")
  .select("target_user_id, detail")
  .eq("action", "change_customer_email")
  .eq("result", "success");
if (changesError) throw changesError;

for (const change of emailChanges || []) {
  if (!change.target_user_id || !change.detail) continue;
  const emails = change.detail.match(/[^\s@]+@[^\s@]+\.[^\s@]+/g) || [];
  for (const email of emails) emailToUserId.set(normalizeEmail(email), change.target_user_id);
}

let startingAfter;
let scanned = 0;
let matched = 0;
let skippedUnknownProduct = 0;
let skippedUnknownUser = 0;
const unknownUsers = [];
const rows = [];

do {
  const page = await stripe.checkout.sessions.list({
    limit: 100,
    ...(startingAfter ? { starting_after: startingAfter } : {}),
    expand: ["data.payment_intent.latest_charge"],
  });

  for (const session of page.data) {
    scanned += 1;
    const priceType = session.metadata?.price_type;
    if (
      session.mode !== "payment" ||
      session.payment_status !== "paid" ||
      (priceType !== "general" && priceType !== "salon")
    ) {
      skippedUnknownProduct += 1;
      continue;
    }

    const purchasedEmail = normalizeEmail(
      session.customer_details?.email || session.customer_email,
    );
    const userId = emailToUserId.get(purchasedEmail);
    if (!userId) {
      skippedUnknownUser += 1;
      if (verbose) {
        unknownUsers.push({
          checkoutSessionId: session.id,
          purchasedAt: new Date(session.created * 1000).toISOString(),
          purchasedEmail,
          priceType,
        });
      }
      continue;
    }

    const paymentIntent =
      session.payment_intent && typeof session.payment_intent !== "string"
        ? session.payment_intent
        : null;
    const charge =
      paymentIntent?.latest_charge && typeof paymentIntent.latest_charge !== "string"
        ? paymentIntent.latest_charge
        : null;
    const status = charge?.refunded
      ? "refunded"
      : (charge?.amount_refunded || 0) > 0
        ? "partially_refunded"
        : "paid";

    rows.push({
      user_id: userId,
      provider: "stripe",
      product_key: priceType === "salon" ? "omame_basic_salon" : "omame_basic",
      product_name:
        priceType === "salon"
          ? "おうちで学べるお豆奏法基礎講座（サロン価格）"
          : "おうちで学べるお豆奏法基礎講座",
      amount_total: session.amount_total || 0,
      currency: session.currency || "jpy",
      status,
      purchased_email: purchasedEmail,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: getId(session.payment_intent),
      stripe_charge_id: getId(paymentIntent?.latest_charge),
      purchased_at: new Date(session.created * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });
    matched += 1;
  }

  startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
} while (startingAfter);

if (applyChanges && rows.length > 0) {
  const { error } = await supabase
    .from("purchase_records")
    .upsert(rows, { onConflict: "stripe_checkout_session_id" });
  if (error) throw error;
}

console.log({
  mode: applyChanges ? "apply" : "dry-run",
  scanned,
  matched,
  skippedUnknownProduct,
  skippedUnknownUser,
  ...(verbose ? { unknownUsers } : {}),
});
