"use client"

import { useEffect, useState } from "react"

export default function BillingContent() {
  const [credits, setCredits] = useState<number | null>(null)
  const [totalUsed, setTotalUsed] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    fetchCredits()
  }, [])

  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/user/credits")
      const data = await response.json()
      if (data.success) {
        setCredits(data.credits)
        setTotalUsed(data.totalCreditsUsed)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des crédits:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuyCredits = async () => {
    setPurchasing(true)
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert("Erreur lors de la création de la session de paiement")
      }
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur lors de la création de la session de paiement")
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="glass rounded-xl px-8 py-4 animate-pulse">
          <span className="text-gray-600">Chargement...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats des crédits */}
      <div className="grid gap-6 md:grid-cols-2 animate-slide-in">
        <div className="glass glass-hover rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-[#A8D8EA]/30 to-transparent rounded-full -mr-16 -mt-16"></div>
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3 relative z-10">
            Crédits disponibles
          </p>
          <p className="text-6xl font-bold bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] bg-clip-text text-transparent relative z-10">
            {credits}
          </p>
          <p className="mt-4 text-xs text-gray-500 relative z-10">
            Réinitialisation : 3 crédits/jour (offre gratuite)
          </p>
        </div>

        <div className="glass glass-hover rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-[#E0BBE4]/30 to-transparent rounded-full -mr-16 -mt-16"></div>
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3 relative z-10">
            Total utilisé
          </p>
          <p className="text-6xl font-bold bg-linear-to-r from-[#E0BBE4] to-[#FEC8D8] bg-clip-text text-transparent relative z-10">
            {totalUsed}
          </p>
          <p className="mt-4 text-xs text-gray-500 relative z-10">
            Depuis la création de votre compte
          </p>
        </div>
      </div>

      {/* Offre gratuite */}
      <div className="glass glass-hover rounded-3xl p-6 border-2 border-blue-200 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-start gap-4">
          <span className="text-4xl">🎁</span>
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-2">
              Offre gratuite
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Vous recevez automatiquement <strong className="text-[#7BB5D8]">3 crédits gratuits par jour</strong>.
              <br />
              Chaque scraping consomme 1 crédit.
            </p>
          </div>
        </div>
      </div>

      {/* Pack de crédits */}
      <div className="glass glass-hover rounded-3xl p-8 animate-scale-in" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Acheter des crédits
        </h2>
        <p className="text-gray-600 mb-8">
          Besoin de plus de crédits ? Achetez un pack !
        </p>

        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#B5EAD7] via-[#A8D8EA] to-[#E0BBE4] p-[2px] shadow-2xl">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-3xl font-bold text-gray-800 mb-1">
                  Pack 100 crédits
                </p>
                <p className="text-gray-600">
                  100 scrapings supplémentaires
                </p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] bg-clip-text text-transparent">
                  2€
                </p>
                <p className="text-sm text-gray-500">
                  0.02€ / crédit
                </p>
              </div>
            </div>

            <button
              onClick={handleBuyCredits}
              disabled={purchasing}
              className="w-full rounded-xl bg-linear-to-r from-[#B5EAD7] via-[#A8D8EA] to-[#E0BBE4] px-8 py-5 font-bold text-white text-lg shadow-xl hover:shadow-2xl hover:brightness-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 relative overflow-hidden group"
            >
              {purchasing ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Redirection vers Stripe...
                </span>
              ) : (
                <>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span className="text-2xl">💳</span>
                    Acheter 100 crédits - 2€
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Paiement sécurisé par Stripe
            </p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="glass rounded-3xl p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-start gap-4">
          <div>
            <p className="font-bold text-gray-800 mb-3">
              Comment ça marche ?
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#A8D8EA] font-bold">•</span>
                <span>Chaque scraping consomme 1 crédit</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E0BBE4] font-bold">•</span>
                <span>Vous recevez 3 crédits gratuits chaque jour</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#B5EAD7] font-bold">•</span>
                <span>Les crédits achetés ne s&apos;expirent jamais</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FEC8D8] font-bold">•</span>
                <span>Les crédits gratuits sont réinitialisés toutes les 24h</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
