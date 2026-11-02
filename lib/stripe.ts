import Stripe from "stripe";

export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export function appUrl(req: Request) {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
}
