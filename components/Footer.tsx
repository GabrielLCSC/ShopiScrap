"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

export default function Footer() {
  const { data: session } = useSession()

  return (
    <footer className="border-t border-white/30 backdrop-blur-sm bg-white/40 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo / Brand */}
          <div>
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h2 className="text-xl font-bold bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] bg-clip-text text-transparent">
                ShopiScrap
              </h2>
            </Link>
            <p className="text-sm text-slate-600 mt-1">
              Scrapez des produits Shopify en quelques secondes
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link 
              href="/" 
              className="text-slate-600 hover:text-[#7BB5D8] transition-colors font-medium"
            >
              Accueil
            </Link>
            <Link 
              href="/scraping" 
              className="text-slate-600 hover:text-[#7BB5D8] transition-colors font-medium"
            >
              Scraping
            </Link>
            <Link 
              href="/billing" 
              className="text-slate-600 hover:text-[#7BB5D8] transition-colors font-medium"
            >
              Tarifs
            </Link>
            {session && (
              <Link 
                href="/scraping/history" 
                className="text-slate-600 hover:text-[#7BB5D8] transition-colors font-medium"
              >
                Historique
              </Link>
            )}
            <a 
              href="mailto:gabriel.dautreppe@gmail.com" 
              className="text-slate-600 hover:text-[#7BB5D8] transition-colors font-medium"
            >
              Support
            </a>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-white/20 text-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} ShopiScrap. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}

