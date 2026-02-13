import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CinéNantes — Toutes les séances de cinéma à Nantes",
  description:
    "Retrouvez toutes les séances et horaires des cinémas de Nantes et périphérie. Pathé, Katorza, Cinématographe, Concorde, UGC et plus encore.",
  keywords: [
    "cinéma",
    "Nantes",
    "séances",
    "horaires",
    "films",
    "Pathé",
    "Katorza",
    "Cinématographe",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
