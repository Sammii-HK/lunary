import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Moon } from "lunarphase-js";

const inter = Inter({ subsets: ["latin"] });
const phase = Moon.lunarPhase();
const emoji = Moon.emojiForLunarPhase(phase);

export const metadata: Metadata = {
  title: `${emoji} Lunary`,
  description: "Your Lunary Diary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
