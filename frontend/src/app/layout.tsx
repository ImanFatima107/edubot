import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EduBot — AI Tech Learning Roadmap Generator",
  description: "Generate a custom 1-week structured technology learning roadmap powered by AI and get it delivered directly to your inbox.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${jakarta.variable} antialiased h-full`}>
      <body className="min-h-full font-sans bg-gradient-to-br from-slate-50 via-purple-50/40 to-pink-50/50 text-slate-800 selection:bg-pink-200 selection:text-pink-900">
        {children}
      </body>
    </html>
  );
}
