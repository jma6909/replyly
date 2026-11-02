import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureSetup, sql } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const e = String(email || "").trim().toLowerCase();
    const p = String(password || "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (p.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    await ensureSetup();
    const q = sql();
    const existing = await q`SELECT id FROM users WHERE email = ${e}`;
    if (existing.length) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    const hash = await bcrypt.hash(p, 10);
    const rows = await q`
      INSERT INTO users (email, password_hash) VALUES (${e}, ${hash}) RETURNING id
    `;
    await createSession(rows[0].id as number);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
