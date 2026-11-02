import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Replyly: AI email replies you can actually send",
  description:
    "Paste any email and get three ready-to-send reply drafts in the tone you choose. Stop staring at a blank screen.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
