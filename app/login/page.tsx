"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/scraping"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error("Email ou mot de passe incorrect")
      }

      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn("google", { callbackUrl: redirectTo })
    } catch {
      setError("Erreur lors de la connexion avec Google")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full bg-linear-to-br from-[#FAFBFC] via-[#F0F4F8] to-[#E8EEF5] flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-8 max-w-md w-full border border-white/30 animate-scale-in">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] bg-clip-text text-transparent">
            Connexion
          </h1>
          <p className="text-slate-600">
            Connectez-vous pour accéder à votre compte
          </p>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mb-6 px-6 py-3 rounded-xl bg-white hover:bg-gray-50 border-2 border-gray-200 font-semibold transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuer avec Google
        </button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Ou</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#7BB5D8] focus:outline-none transition-colors"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#7BB5D8] focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl gradient-blue text-white font-semibold shadow-lg hover:shadow-xl hover:brightness-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {/* Toggle to register */}
        <p className="mt-6 text-center text-sm text-slate-600">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#7BB5D8] hover:underline"
          >
            S&apos;inscrire
          </Link>
        </p>

        {/* Back to home */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-[#7BB5D8] transition-colors"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-[#A8D8EA]/20 rounded-full blur-3xl pointer-events-none animate-float" style={{animationDelay: '0s', animationDuration: '8s'}}></div>
      <div className="fixed bottom-20 right-10 w-72 h-72 bg-[#E0BBE4]/20 rounded-full blur-3xl pointer-events-none animate-float" style={{animationDelay: '2s', animationDuration: '10s'}}></div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-full bg-linear-to-br from-[#FAFBFC] via-[#F0F4F8] to-[#E8EEF5] flex items-center justify-center">
        <div className="text-slate-600">Chargement...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

