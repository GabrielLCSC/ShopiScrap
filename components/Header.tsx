"use client"

import AuthButton from "./AuthButton"
import Link from "next/link"

export default function Header() {
  return (
    <header className="border-b border-white/30 backdrop-blur-sm bg-white/40 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-bold bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] bg-clip-text text-transparent">
              ShopiScrap
            </h1>
          </Link>
          <AuthButton />
        </div>
      </div>
    </header>
  )
}

