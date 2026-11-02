import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { appUrl, stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }
  if (user.is_paid) {
    return NextResponse.json({ url: `${appUrl(req)}/dashboard` });
  }

  try {
    const base = appUrl(req);
    const cents = Number(process.env.PRICE_CENTS) || 100;

    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      client_reference_id: String(user.id),
      metadata: { user_id: String(user.id) },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: cents,
            recurring: { interval: "month" },
            product_data: {
              name: "Replyly Pro",
              description: "Unlimited AI email replies",
            },
          },
        },
      ],
      success_url: `${base}/api/stripe/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/dashboard?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }
}
