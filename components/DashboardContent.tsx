"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import ExportDropdown from "./ExportDropdown"
import Link from "next/link"

interface ScrapedData {
  id: string
  title: string
  price: number | null
  currency: string | null
  vendor: string | null
  description: string | null
  mainImage: string | null
  images: string
  tags: string
  metaDescription: string | null
  rawData: string | null
}

export default function DashboardContent() {
  const { data: session } = useSession()
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScrapedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [subscriptionType, setSubscriptionType] = useState<string>("free")
  const [trialRemaining, setTrialRemaining] = useState<number | null>(null)
  const [isTrial, setIsTrial] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (session) {
      fetchCredits()
    } else {
      fetchTrialRemaining()
    }
  }, [session])

  // Recharger les crédits quand l'utilisateur revient sur la page (ex: retour de Stripe)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session) {
        fetchCredits()
      }
    }

    const handleFocus = () => {
      if (session) {
        fetchCredits()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [session])

  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/user/credits")
      const data = await response.json()
      if (data.success) {
        setCredits(data.credits)
        setSubscriptionType(data.subscriptionType || "free")
      }
    } catch (error) {
      console.error("Erreur lors du chargement des crédits:", error)
    }
  }

  const fetchTrialRemaining = async () => {
    try {
      const response = await fetch("/api/trial")
      const data = await response.json()
      if (data.success) {
        setTrialRemaining(data.remaining)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des essais:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du scraping")
      }

      setResult(data.product)
      setIsTrial(data.isTrial || false)
      
      if (session) {
        fetchCredits()
      } else {
        setTrialRemaining(data.remainingTrials)
      }

      // Scroll vers le résultat après un court délai
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
        })
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const parseJSONSafe = (data: unknown) => {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data
    } catch {
      return {}
    }
  }

  const parseArraySafe = (data: unknown) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const getExportData = () => {
    if (!result) return null

    const rawData = parseJSONSafe(result.rawData)
    const images = parseArraySafe(result.images)
    const tags = parseArraySafe(result.tags)

    return {
      title: result.title,
      price: result.price,
      currency: result.currency,
      vendor: result.vendor,
      description: result.description,
      mainImage: result.mainImage,
      images: images,
      tags: tags,
      metaDescription: result.metaDescription,
      ogImage: rawData.ogImage,
      shortDescription: rawData.shortDescription,
      variants: rawData.variants || [],
    }
  }

  const exportJSON = () => {
    const exportData = getExportData()
    if (!exportData) return

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const urlBlob = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = urlBlob
    a.download = `${result?.title?.replace(/[^a-z0-9]/gi, '_') || 'product'}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(urlBlob)
  }

  const exportCSV = () => {
    const exportData = getExportData()
    if (!exportData) return

    const rawData = parseJSONSafe(result?.rawData)

    // Créer les headers CSV
    const headers = [
      "Titre",
      "Prix",
      "Prix comparaison",
      "Devise",
      "Vendeur",
      "Type de produit",
      "Disponible",
      "Handle (slug)",
      "Description",
      "Description courte",
      "Meta description",
      "Image principale",
      "Image OG",
      "Toutes les images (URLs)",
      "Nombre d'images",
      "Tags",
      "Nombre de variants",
      "Variants (détails)",
      "Options disponibles",
      "URL source"
    ]

    // Extraire les options de variants (ex: "Taille: S, M, L / Couleur: Rouge, Bleu")
    const variantOptions = rawData.options?.map((opt: unknown) => {
      const option = opt as { name?: string; values?: string[] }
      return `${option.name || ''}: ${option.values?.join(', ') || ''}`
    }).join(' / ') || ""

    // Formater les variants de manière lisible
    const variantsDetails = exportData.variants?.map((v: unknown) => {
      const variant = v as { title?: string; price?: string; sku?: string; available?: boolean }
      return `[${variant.title || 'N/A'}] Prix: ${variant.price || 'N/A'}, SKU: ${variant.sku || 'N/A'}, Stock: ${variant.available ? 'Oui' : 'Non'}`
    }).join(' | ') || ""

    // Créer la ligne de données
    const row = [
      exportData.title || "",
      exportData.price || "",
      rawData.compare_at_price || "",
      exportData.currency || "",
      exportData.vendor || "",
      rawData.product_type || "",
      rawData.available ? "Oui" : "Non",
      rawData.handle || "",
      exportData.description || "",
      exportData.shortDescription || "",
      exportData.metaDescription || "",
      exportData.mainImage || "",
      exportData.ogImage || "",
      exportData.images.join(" | ") || "",
      exportData.images.length || "0",
      exportData.tags.join("; ") || "",
      exportData.variants?.length || "0",
      variantsDetails,
      variantOptions,
      rawData.url || result?.mainImage || ""
    ]

    // Échapper les guillemets et entourer les valeurs avec guillemets
    const escapeCsvValue = (value: string | number) => {
      const strValue = String(value)
      if (strValue.includes(",") || strValue.includes('"') || strValue.includes("\n")) {
        return `"${strValue.replace(/"/g, '""')}"`
      }
      return strValue
    }

    const csvContent = [
      headers.map(escapeCsvValue).join(","),
      row.map(escapeCsvValue).join(",")
    ].join("\n")

    // Ajouter le BOM UTF-8 pour Excel
    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    })
    const urlBlob = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = urlBlob
    a.download = `${result?.title?.replace(/[^a-z0-9]/gi, '_') || 'product'}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(urlBlob)
  }

  return (
    <div className="space-y-8">
      {/* Disclaimer pour non-connectés */}
      {!session && trialRemaining !== null && (
        <div className="glass glass-hover rounded-3xl p-6 border-2 border-[#A8D8EA] animate-slide-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Info + CTA */}
            <div className="flex-1">
              <p className="text-gray-700 mb-4 leading-relaxed">
                ⚠️ <strong>Sans connexion</strong> : vos résultats ne seront pas sauvegardés et vous n&apos;aurez pas accès à l&apos;historique.
              </p>
              <Link
                href="/login"
                className="px-6 w-fit py-3 rounded-xl gradient-blue text-white font-bold shadow-lg hover:shadow-xl hover:brightness-110 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Se connecter pour tout débloquer
              </Link>
            </div>

            {/* Compteur d'essais */}
            <div className="text-center md:text-right">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Essais gratuits restants
              </p>
              <p className="text-5xl font-bold bg-linear-to-r from-[#7BB5D8] to-[#FEC8D8] bg-clip-text text-transparent">
                {trialRemaining} / 3
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Badge de crédits (connectés uniquement) */}
      {session && credits !== null && (
        <div className="glass glass-hover rounded-3xl p-6 animate-slide-in">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-600">
                  {subscriptionType === "pro" ? "Plan Pro - Illimité" :
                   subscriptionType === "monthly" ? "Plan Monthly" :
                   subscriptionType === "day_pass" ? "Day Pass" :
                   "Crédits gratuits"}
                </p>
                {subscriptionType !== "free" && (
                  <span className="px-2 py-0.5 rounded-full bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] text-white text-xs font-semibold">
                    {subscriptionType === "pro" ? "PRO" : 
                     subscriptionType === "monthly" ? "MONTHLY" : 
                     "DAY PASS"}
                  </span>
                )}
              </div>
              <p className="text-4xl font-bold bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] bg-clip-text text-transparent">
                {subscriptionType === "pro" ? "∞" : credits}
              </p>
            </div>
            {(credits <= 0 || (subscriptionType === "free" && credits <= 2)) && (
              <a
                href="/billing"
                className="px-6 py-3 rounded-xl gradient-green text-white font-semibold shadow-lg hover:shadow-xl hover:brightness-110 transition-all duration-300"
              >
                {credits <= 0 ? "Recharger" : "Upgrade"}
              </a>
            )}
          </div>
          {subscriptionType === "free" && credits <= 2 && credits > 0 && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-orange-50 border border-orange-200">
              <p className="text-sm text-orange-800">
                ⚠️ Il vous reste peu de crédits. <a href="/billing" className="font-semibold hover:underline">Passer à un plan payant</a>
              </p>
            </div>
          )}
          {subscriptionType === "monthly" && credits <= 20 && credits > 0 && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800">
                ⚡ Plus que {credits} extraction{credits > 1 ? 's' : ''} ce mois ! <a href="/billing" className="font-semibold hover:underline">Passer au plan Pro</a>
              </p>
            </div>
          )}
        </div>
      )}
      {/* Formulaire de scraping */}
      <div className="glass glass-hover rounded-3xl p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Nouveau scraping
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="url" 
              className="block text-sm font-semibold text-gray-700 mb-3"
            >
              URL du produit Shopify
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/products/product-name"
              className="w-full rounded-2xl border-2 border-gray-200 bg-white/80 px-6 py-4 text-gray-900 placeholder-gray-400 focus:border-[#A8D8EA] focus:outline-none focus:ring-4 focus:ring-[#A8D8EA]/20 transition-all duration-300"
              required
              disabled={loading}
            />
            <p className="mt-2 text-xs text-gray-500">
              Exemple : https://store.com/products/product-name
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !url || (!session && trialRemaining === 0)}
            className="w-full rounded-2xl gradient-blue px-8 py-4 font-bold text-white shadow-lg hover:shadow-xl hover:brightness-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 relative overflow-hidden group"
          >
            {loading ? (
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
                Scraping en cours...
              </span>
            ) : (
              <>
                <span className="relative z-10">Lancer le scraping</span>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 border-2 border-red-200 p-4 animate-scale-in">
            <p className="text-sm font-medium text-red-800 flex items-center gap-2">
              <span className="text-xl">❌</span> {error}
            </p>
          </div>
        )}

        {/* Message d'essai gratuit utilisé */}
        {!session && trialRemaining === 0 && (
          <div className="mt-6 rounded-2xl bg-linear-to-br from-[#E0BBE4]/20 to-[#A8D8EA]/20 border-2 border-[#A8D8EA] p-6 animate-scale-in">
            <p className="text-center text-gray-800 font-semibold">
              🎉 Vous avez utilisé vos 3 essais gratuits !
            </p>
          </div>
        )}
      </div>

      {/* Résultat */}
      {result && (() => {
        const parseTags = () => {
          try {
            const tags = typeof result.tags === 'string' ? JSON.parse(result.tags) : result.tags
            return Array.isArray(tags) ? tags : []
          } catch {
            return []
          }
        }

        const parseImages = () => {
          try {
            const images = typeof result.images === 'string' ? JSON.parse(result.images) : result.images
            return Array.isArray(images) ? images : []
          } catch {
            return []
          }
        }

        const tags = parseTags()
        const images = parseImages()

        return (
          <div ref={resultRef} className="glass glass-hover rounded-3xl p-8 animate-scale-in scroll-mt-24">
            {/* Badge Trial */}
            {isTrial && (
              <div className="mb-6 glass rounded-2xl p-4 border-2 border-[#FFE5B4]">
                <p className="text-sm text-center text-gray-700">
                  ⚠️ <strong>Mode essai</strong> : Ce résultat ne sera pas sauvegardé. 
                  <Link
                    href="/login"
                    className="ml-2 text-[#7BB5D8] font-bold hover:underline"
                  >
                    Connectez-vous pour sauvegarder
                  </Link>
                </p>
              </div>
            )}

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Résultat
              </h2>
              <ExportDropdown 
                onExportJSON={exportJSON}
                onExportCSV={exportCSV}
              />
            </div>

            <div className="space-y-6">
              {/* Section principale : Image à gauche + Infos à droite */}
              <div className="flex mt-4 flex-col lg:flex-row gap-6">
                {/* Image principale */}
                {result.mainImage && (
                  <div className="lg:w-2/5 shrink-0">
                    <div className="overflow-hidden rounded-2xl sticky top-4">
                      <Image
                        src={result.mainImage}
                        alt={`${result.title} - Photo du produit`}
                        width={448}
                        height={448}
                        className="w-full h-auto rounded-2xl shadow-xl"
                        priority
                      />
                    </div>
                  </div>
                )}

                {/* Infos texte */}
                <div className="flex-1 space-y-4">
                  <div className="pb-6 px-6 rounded-2xl bg-linear-to-br from-white to-gray-50">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Titre
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {result.title}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 rounded-2xl bg-linear-to-br from-[#A8D8EA]/10 to-[#A8D8EA]/5">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Prix
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {result.price} {result.currency || 'USD'}
                      </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-linear-to-br from-[#E0BBE4]/10 to-[#E0BBE4]/5">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Vendeur
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {result.vendor || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {result.description && (
                    <div className="p-6 rounded-2xl bg-linear-to-br from-white to-gray-50">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Description
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {result.description}
                      </p>
                    </div>
                  )}

                  {result.metaDescription && (
                    <div className="p-6 rounded-2xl bg-linear-to-br from-[#FEC8D8]/10 to-[#FEC8D8]/5">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Meta Description
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {result.metaDescription}
                      </p>
                    </div>
                  )}

                  {tags.length > 0 && (
                    <div className="p-6 rounded-2xl bg-linear-to-br from-white to-gray-50">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Tags
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="px-4 py-2 rounded-lg bg-linear-to-r from-[#E0BBE4] to-[#A8D8EA] text-white text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Images secondaires (en dessous) */}
              {images.length > 1 && (
                <div className="p-6 rounded-2xl bg-linear-to-br from-white to-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Images ({images.length})
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.slice(0, 8).map((img: string, i: number) => (
                      <Image
                        key={i}
                        src={img}
                        alt={`${result.title} - Image ${i + 1}`}
                        width={200}
                        height={200}
                        className="aspect-square rounded-xl object-cover shadow-md"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
