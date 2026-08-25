import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk, Permanent_Marker } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const permanentMarker = Permanent_Marker({
  variable: "--font-marker",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Gymlot — AI Workout Helper",
  description:
    "Build personalised workouts, follow exercise demos, track sets and rest smarter with Gymlot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${spaceGrotesk.variable} ${permanentMarker.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
