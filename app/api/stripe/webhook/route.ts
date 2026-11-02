import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { ensureSetup, sql } from "@/lib/db";
import { stripe } from "@/lib/stripe";

// Keeps paid status in sync with Stripe: unlocks on checkout, locks on cancel.
// Demo account is never downgraded.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const raw = await req.text();
    event = stripe().webhooks.constructEvent(raw, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    await ensureSetup();
    const q = sql();

    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      const userId = Number(s.metadata?.user_id);
      const customer = typeof s.customer === "string" ? s.customer : null;
      if (userId) {
        await q`UPDATE users SET is_paid = TRUE, stripe_customer_id = ${customer} WHERE id = ${userId}`;
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const customer = typeof sub.customer === "string" ? sub.customer : null;
      if (customer) {
        await q`
          UPDATE users SET is_paid = FALSE
          WHERE stripe_customer_id = ${customer} AND email <> 'demo@demo.com'
        `;
      }
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
