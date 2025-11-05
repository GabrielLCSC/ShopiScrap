"use client"

import { useSession, signOut } from "next-auth/react"
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
    <Link
      href="/login"
      className="px-6 py-3 rounded-xl gradient-blue text-white text-sm font-bold shadow-lg hover:shadow-xl hover:brightness-110 transition-all duration-300"
    >
      Se connecter
    </Link>
  )
}
