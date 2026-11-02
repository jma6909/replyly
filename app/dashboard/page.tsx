import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import Generator from "@/components/Generator";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

const FREE_LIMIT = 3;

export default async function Dashboard({
  searchParams,
}: {
  searchParams: { upgraded?: string; canceled?: string };
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  const usesLeft = user.is_paid ? null : Math.max(0, FREE_LIMIT - user.uses);

  return (
    <div className="wrap">
      <nav className="nav">
        <Link href="/" className="logo">
          Reply<span>ly</span>
        </Link>
        <div className="nav-links">
          <span style={{ color: "var(--muted)", fontSize: 14 }}>{user.email}</span>
          <LogoutButton />
        </div>
      </nav>

      <div className="app">
        <div className="app-head">
          <h1>
            Write a reply <span className={`badge ${user.is_paid ? "pro" : ""}`}>{user.is_paid ? "PRO" : "FREE"}</span>
          </h1>
        </div>

        {searchParams.upgraded && user.is_paid && (
          <div className="notice">You&rsquo;re on Pro now. Thank you! Unlimited replies are unlocked.</div>
        )}
        {searchParams.canceled && (
          <div className="notice">Checkout canceled. You haven&rsquo;t been charged.</div>
        )}

        <Generator isPaid={user.is_paid} initialUsesLeft={usesLeft} />
      </div>
    </div>
  );
}
