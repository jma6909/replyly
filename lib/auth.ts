import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ensureSetup, sql } from "./db";

const COOKIE = "session";

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");
}

export type User = {
  id: number;
  email: string;
  is_paid: boolean;
  uses: number;
};

export async function createSession(userId: number) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret());
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function destroySession() {
  cookies().set(COOKIE, "", { path: "/", maxAge: 0 });
}

export async function getUser(): Promise<User | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    await ensureSetup();
    const rows = await sql()`
      SELECT id, email, is_paid, uses FROM users WHERE id = ${payload.uid as number}
    `;
    return (rows[0] as User) || null;
  } catch {
    return null;
  }
}
