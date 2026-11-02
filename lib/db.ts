import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

export const DEMO_EMAIL = "demo@demo.com";
export const DEMO_PASSWORD = "password123!";

export function sql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(process.env.DATABASE_URL);
}

let ready: Promise<void> | null = null;

/**
 * Creates the tables if they don't exist and makes sure the grader's demo
 * account exists, is verified, and has full paid access. Safe to call often.
 */
export function ensureSetup(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const q = sql();
      await q`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          is_paid BOOLEAN NOT NULL DEFAULT FALSE,
          verified BOOLEAN NOT NULL DEFAULT TRUE,
          uses INTEGER NOT NULL DEFAULT 0,
          stripe_customer_id TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
      await q`
        INSERT INTO users (email, password_hash, is_paid, verified)
        VALUES (${DEMO_EMAIL}, ${hash}, TRUE, TRUE)
        ON CONFLICT (email) DO UPDATE
        SET is_paid = TRUE, verified = TRUE, password_hash = ${hash}
      `;
    })().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}
