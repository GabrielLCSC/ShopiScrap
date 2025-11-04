"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function AuthButton() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  if (status === "loading") {
    return (
      <div className="px-6 py-2.5 rounded-xl bg-gray-100 animate-pulse">
        <span className="text-sm text-gray-400">Chargement...</span>
      </div>
    )
  }

  if (session) {
    return (
      <div 
        className="relative"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {/* Bouton principal avec pseudo */}
        <button className="flex items-center gap-3 transition-all duration-300 animate-fade-in group">
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={36}
              height={36}
              className="rounded-full ring-2 ring-gray-200 group-hover:ring-[#A8D8EA] transition-all duration-300"
            />
          )}
          <p className="font-semibold text-gray-800 group-hover:text-[#7BB5D8] transition-colors duration-300">
            {session.user?.name}
          </p>
          <svg 
            className={`w-4 h-4 text-gray-600 group-hover:text-[#7BB5D8] transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Pont invisible pour garder le hover */}
        <div className="absolute right-0 top-full w-56 h-2"></div>

        {/* Menu déroulant */}
        <div 
          className={`absolute right-0 top-full mt-0.5 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 origin-top ${
            isOpen 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
          }`}
        >
          <div className="py-2">
            {/* Historique */}
            <Link
              href="/dashboard/history"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-all duration-200 group"
            >
              <span className="font-medium">Historique</span>
            </Link>

            {/* Crédits */}
            <Link
              href="/billing"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-all duration-200 group"
            >
              <span className="font-medium">Plans</span>
            </Link>

            {/* Séparateur */}
            <div className="my-2 mx-3 h-px bg-linear-to-r from-transparent via-gray-300 to-transparent"></div>

            {/* Déconnexion */}
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-all duration-200 group"
            >
              <span className="font-semibold">Se déconnecter</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="px-6 py-3 rounded-xl gradient-blue text-white text-sm font-bold shadow-lg hover:shadow-xl hover:brightness-110 transition-all duration-300 flex items-center gap-2"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Se connecter avec Google
    </button>
  )
}
