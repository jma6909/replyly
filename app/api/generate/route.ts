import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export const maxDuration = 60;

const FREE_LIMIT = 3;

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }
  if (!user.is_paid && user.uses >= FREE_LIMIT) {
    return NextResponse.json(
      { error: "You've used your 3 free replies. Upgrade to keep going.", upgrade: true },
      { status: 402 }
    );
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Server is missing ANTHROPIC_API_KEY." }, { status: 500 });
  }

  const { email, tone, goal } = await req.json();
  const emailText = String(email || "").trim();
  if (emailText.length < 5) {
    return NextResponse.json({ error: "Paste the email you want to reply to." }, { status: 400 });
  }
  if (emailText.length > 8000) {
    return NextResponse.json({ error: "That email is too long (8,000 character max)." }, { status: 400 });
  }

  const toneText = String(tone || "professional");
  const goalText = String(goal || "").trim().slice(0, 500);

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: "claude-sonnet-5-5",
      max_tokens: 1500,
      system:
        "You write email replies for busy people. Given an email they received, write exactly three distinct reply drafts they could send as-is. " +
        "Each draft should take a different approach (for example: short and direct, warm and detailed, and a firm-but-polite option). " +
        "Match the requested tone. Never invent facts, dates, or commitments the user didn't give you; use [brackets] for details they need to fill in. " +
        "Format: for each draft output a line starting with '### ' and a 2-4 word label, then the full email body (with greeting and sign-off). No other commentary.",
      messages: [
        {
          role: "user",
          content:
            `Tone: ${toneText}\n` +
            (goalText ? `What I want to happen: ${goalText}\n` : "") +
            `\nEmail I received:\n"""\n${emailText}\n"""`,
        },
      ],
    });

    const text = msg.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

    const drafts = text
      .split(/^### /m)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((chunk) => {
        const nl = chunk.indexOf("\n");
        return {
          label: (nl === -1 ? "Reply" : chunk.slice(0, nl)).trim(),
          body: (nl === -1 ? chunk : chunk.slice(nl + 1)).trim(),
        };
      });

    await sql()`UPDATE users SET uses = uses + 1 WHERE id = ${user.id}`;

    return NextResponse.json({
      drafts: drafts.length ? drafts : [{ label: "Reply", body: text }],
      usesLeft: user.is_paid ? null : Math.max(0, FREE_LIMIT - (user.uses + 1)),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "The AI request failed. Please try again." }, { status: 500 });
  }
}
