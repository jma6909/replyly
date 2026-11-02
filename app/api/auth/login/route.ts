import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureSetup, sql } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const e = String(email || "").trim().toLowerCase();
    const p = String(password || "");

    // ensureSetup also guarantees demo@demo.com exists with paid access
    await ensureSetup();
    const rows = await sql()`SELECT id, password_hash FROM users WHERE email = ${e}`;
    const user = rows[0];
    if (!user || !(await bcrypt.compare(p, user.password_hash as string))) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    await createSession(user.id as number);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
