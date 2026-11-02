import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { appUrl, stripe } from "@/lib/stripe";

// Stripe sends the customer here after a successful checkout. We verify the
// session with Stripe directly, so paid access never depends on the webhook
// arriving first.
export async function GET(req: Request) {
  const base = appUrl(req);
  const user = await getUser();
  if (!user) return NextResponse.redirect(`${base}/login`);

  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) return NextResponse.redirect(`${base}/dashboard`);

  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    const belongsToUser = session.metadata?.user_id === String(user.id);
    const paid = session.status === "complete" && session.payment_status === "paid";

    if (belongsToUser && paid) {
      const customer = typeof session.customer === "string" ? session.customer : null;
      await sql()`
        UPDATE users SET is_paid = TRUE, stripe_customer_id = ${customer} WHERE id = ${user.id}
      `;
      return NextResponse.redirect(`${base}/dashboard?upgraded=1`);
    }
  } catch (err) {
    console.error(err);
  }
  return NextResponse.redirect(`${base}/dashboard`);
}
