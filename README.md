# Replyly

Paste an email, get three ready-to-send reply drafts. A complete SaaS starter for the
"Build and Sell a SaaS" project: landing page, real auth, an AI feature, Stripe checkout,
and the required grader demo account.

**Stack:** Next.js 14 (App Router) · Neon Postgres · Claude API · Stripe · Vercel

## What's included

| Requirement | Where |
|---|---|
| Homepage explaining the product | `app/page.tsx` |
| Real signup / login (bcrypt + signed cookie session) | `app/api/auth/*`, `lib/auth.ts` |
| AI feature | `app/api/generate/route.ts`, `components/Generator.tsx` |
| Stripe checkout | `app/api/stripe/checkout`, `confirm`, `webhook` |
| Demo account `demo@demo.com` / `password123!` | `lib/db.ts` (`ensureSetup`) |

The demo account is created automatically (verified, with full paid access) the first time the
database is touched, and it's re-asserted on every login, so it always works.

Free users get 3 generations; paid users get unlimited.

## Setup

> Note: this project was written but not installed or built before delivery (the build
> environment couldn't reach the npm registry). Run the steps below and, if anything errors,
> paste the error into Claude Code and it will fix it.

1. **Install**
   ```bash
   npm install
   ```
2. **Create `.env.local`** by copying `.env.example` and filling in:
   - `DATABASE_URL`: create a free project at [neon.tech](https://neon.tech), copy the connection string. Tables are created automatically.
   - `AUTH_SECRET`: run `openssl rand -hex 32`.
   - `ANTHROPIC_API_KEY`: from [console.anthropic.com](https://console.anthropic.com).
   - `STRIPE_SECRET_KEY`: from the Stripe dashboard (start with the `sk_test_` key).
   - `PRICE_CENTS`: `100` makes the plan $1/month, which is handy for the live $1 charge proof.
   - `NEXT_PUBLIC_APP_URL`: `http://localhost:3000` locally.
3. **Run it**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000, sign up, and log in as `demo@demo.com` to confirm the demo account.
4. **Test payments** with Stripe test mode and card `4242 4242 4242 4242`, any future date, any CVC.

## Deploy (GitHub → Vercel)

1. `git init`, commit, and push to a new GitHub repo.
2. In Vercel, import the repo and add every variable from `.env.example` in
   *Project → Settings → Environment Variables*. Set `NEXT_PUBLIC_APP_URL` to your Vercel URL.
3. Deploy. Every push to GitHub redeploys automatically.

## Going live with Stripe (the $1 proof)

1. In Stripe, switch to live mode and swap `STRIPE_SECRET_KEY` in Vercel to your `sk_live_` key.
2. Keep `PRICE_CENTS=100`, redeploy, then upgrade with your own card. Screenshot the Stripe
   payment and the app showing PRO.
3. Optional but recommended: add a webhook endpoint `https://YOUR-URL/api/stripe/webhook`
   listening for `checkout.session.completed` and `customer.subscription.deleted`, and put its
   signing secret in `STRIPE_WEBHOOK_SECRET`. Upgrades already work without it (the app verifies
   the checkout with Stripe on return); the webhook handles cancellations.
4. Afterward, set `PRICE_CENTS` to your real price.

## Make it yours

Replyly is a placeholder idea. To change the product, edit the system prompt in
`app/api/generate/route.ts`, the form fields in `components/Generator.tsx`, and the copy in
`app/page.tsx`. Everything else (auth, payments, demo account) stays the same.
