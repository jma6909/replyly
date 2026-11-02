import Link from "next/link";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  let loggedIn = false;
  try {
    loggedIn = !!(await getUser());
  } catch {
    loggedIn = false;
  }

  return (
    <>
      <div className="wrap">
        <nav className="nav">
          <Link href="/" className="logo">
            Reply<span>ly</span>
          </Link>
          <div className="nav-links">
            {loggedIn ? (
              <Link href="/dashboard" className="btn primary">Open app</Link>
            ) : (
              <>
                <Link href="/login" className="btn">Log in</Link>
                <Link href="/signup" className="btn primary">Sign up free</Link>
              </>
            )}
          </div>
        </nav>

        <header className="hero">
          <h1>
            Never stare at a blank <em>reply</em> again.
          </h1>
          <p>
            Paste any email. Get three ready-to-send replies in the tone you pick, in seconds.
            Built for people who get more email than they have time for.
          </p>
          <Link href={loggedIn ? "/dashboard" : "/signup"} className="btn primary big">
            Write my first reply free
          </Link>

          <div className="demo-card" style={{ marginTop: 40 }}>
            <div className="demo-label">Email you received</div>
            <div className="demo-mail">
              &ldquo;Hi, I was supposed to get my order last week and still nothing. Can you tell me
              what is going on? This is the second time.&rdquo;
            </div>
            <div className="demo-label">Replyly draft: warm and direct</div>
            <div className="demo-reply">
              Hi [Name], I&rsquo;m sorry about the delay, especially after a second slip. I&rsquo;ve
              just checked on your order and [status]. I&rsquo;ll send you tracking by [date], and I&rsquo;ve
              added [make-good] to your account for the trouble.
            </div>
          </div>
        </header>

        <section className="section">
          <h2>How it works</h2>
          <p className="sub">Three steps, about ten seconds.</p>
          <div className="grid3">
            <div className="step">
              <div className="n">1</div>
              <h3>Paste the email</h3>
              <p>Drop in whatever landed in your inbox, from a quick question to a tense complaint.</p>
            </div>
            <div className="step">
              <div className="n">2</div>
              <h3>Pick a tone</h3>
              <p>Professional, friendly, firm, or apologetic. Add what you want to happen if you like.</p>
            </div>
            <div className="step">
              <div className="n">3</div>
              <h3>Copy and send</h3>
              <p>Get three different drafts with blanks marked for details only you know. Never invented facts.</p>
            </div>
          </div>
        </section>

        <section className="section" id="pricing">
          <h2>Simple pricing</h2>
          <p className="sub">Try it free, upgrade when it becomes a habit.</p>
          <div className="pricing">
            <div className="plan">
              <h3>Free</h3>
              <div className="price">$0</div>
              <ul>
                <li>3 reply generations</li>
                <li>All tones</li>
              </ul>
              <Link href="/signup" className="btn">Start free</Link>
            </div>
            <div className="plan pro">
              <h3>Pro</h3>
              <div className="price">
                ${((Number(process.env.PRICE_CENTS) || 100) / 100).toFixed(2).replace(/\.00$/, "")}
                <small> / month</small>
              </div>
              <ul>
                <li>Unlimited replies</li>
                <li>All tones and goals</li>
                <li>Cancel anytime</li>
              </ul>
              <Link href={loggedIn ? "/dashboard" : "/signup"} className="btn primary">Go Pro</Link>
            </div>
          </div>
        </section>
      </div>

      <footer className="footer">© {new Date().getFullYear()} Replyly</footer>
    </>
  );
}
