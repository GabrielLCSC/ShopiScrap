import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ShopiScrap - Extraire les données produits instantanément",
    template: "%s | ShopiScrap"
  },
  description: "Extrayez les données de produits Shopify en quelques secondes. Titre, prix, images, variants, métadonnées SEO et plus. Essai gratuit disponible. Sans abonnement.",
  keywords: ["shopify", "scraper", "extraction de données", "e-commerce", "shopify api", "scraping produits", "données shopify", "extraction shopify"],
  authors: [{ name: "ShopiScrap" }],
  creator: "ShopiScrap",
  publisher: "ShopiScrap",
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    title: "ShopiScrap - Extraire les données produits instantanément",
    description: "Extrayez les données de produits Shopify en quelques secondes. Titre, prix, images, variants, métadonnées SEO et plus.",
    siteName: "ShopiScrap",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopiScrap - Extraire les données produits instantanément",
    description: "Extrayez les données de produits Shopify en quelques secondes. Essai gratuit disponible.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <Header />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
