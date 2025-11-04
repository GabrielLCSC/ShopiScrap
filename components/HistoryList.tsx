"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import ExportDropdown from "./ExportDropdown"

interface ScrapedProduct {
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

interface ScrapeJob {
  id: string
  url: string
  status: string
  createdAt: string
  duration: number | null
  productData: ScrapedProduct | null
}

export default function HistoryList() {
  const [jobs, setJobs] = useState<ScrapeJob[]>([])
  const [loading, setLoading] = useState(true)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/scrape")
      const data = await response.json()
      if (data.success) {
        setJobs(data.jobs)
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error)
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

  const getExportData = (product: ScrapedProduct) => {
    const rawData = parseJSONSafe(product.rawData)
    const images = parseArraySafe(product.images)
    const tags = parseArraySafe(product.tags)

    return {
      title: product.title,
      price: product.price,
      currency: product.currency,
      vendor: product.vendor,
      description: product.description,
      mainImage: product.mainImage,
      images: images,
      tags: tags,
      metaDescription: product.metaDescription,
      ogImage: rawData.ogImage,
      shortDescription: rawData.shortDescription,
      variants: rawData.variants || [],
    }
  }

  const exportJSON = (product: ScrapedProduct) => {
    const exportData = getExportData(product)

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${product.title?.replace(/[^a-z0-9]/gi, '_') || 'product'}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportCSV = (product: ScrapedProduct) => {
    const exportData = getExportData(product)
    const rawData = parseJSONSafe(product.rawData)

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
    const variantOptions = rawData.options?.map((opt: any) => 
      `${opt.name}: ${opt.values?.join(', ')}`
    ).join(' / ') || ""

    // Formater les variants de manière lisible
    const variantsDetails = exportData.variants?.map((v: any) => 
      `[${v.title}] Prix: ${v.price || 'N/A'}, SKU: ${v.sku || 'N/A'}, Stock: ${v.available ? 'Oui' : 'Non'}`
    ).join(' | ') || ""

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
      rawData.url || product.mainImage || ""
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
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${product.title?.replace(/[^a-z0-9]/gi, '_') || 'product'}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="glass rounded-full px-8 py-4 animate-pulse">
          <span className="text-gray-600">Chargement...</span>
        </div>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="glass glass-hover rounded-3xl p-12 text-center animate-scale-in">
        <div className="text-6xl mb-4">📦</div>
        <p className="text-xl font-semibold text-gray-800 mb-2">
          Aucun scraping pour le moment
        </p>
          <a
            href="/dashboard"
            className="inline-block mt-4 px-6 py-3 rounded-xl gradient-blue text-white font-semibold hover:shadow-xl hover:brightness-110 transition-all duration-300"
          >
            Lancer votre premier scraping →
          </a>
      </div>
    )
  }

  const completedJobs = jobs.filter(job => job.status === "completed" && job.productData)

  if (completedJobs.length === 0) {
    return (
      <div className="glass glass-hover rounded-3xl p-12 text-center animate-scale-in">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="text-xl font-semibold text-gray-800">
          Aucun produit scrapé avec succès
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl px-6 py-4 animate-slide-in">
        <p className="text-gray-700 font-medium">
          <span className="text-2xl font-bold bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] bg-clip-text text-transparent">
            {completedJobs.length}
          </span>
          {' '}produit{completedJobs.length > 1 ? 's' : ''} scrapé{completedJobs.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 overflow-visible">
        {completedJobs.map((job, index) => {
          const product = job.productData!
          const parseTags = () => {
            try {
              const tags = typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags
              return Array.isArray(tags) ? tags : []
            } catch {
              return []
            }
          }
          const tags = parseTags()

          const isDropdownOpen = openDropdownId === job.id

          return (
            <div
              key={job.id}
              className={`glass rounded-3xl p-6 animate-scale-in flex flex-col overflow-visible ${!isDropdownOpen ? 'glass-hover' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              {product.mainImage && (
                <div className="mb-4 overflow-hidden rounded-2xl relative h-48">
                  <Image
                    src={product.mainImage}
                    alt={`${product.title} - Photo du produit`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Infos */}
              <div className="space-y-3 flex-1 flex flex-col">
                <h3 className="line-clamp-2 text-lg font-bold text-gray-800 leading-tight">
                  {product.title}
                </h3>

                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] bg-clip-text text-transparent">
                    {product.price} {product.currency || 'USD'}
                  </p>
                  {product.vendor && (
                    <p className="text-sm text-gray-600 font-medium">
                      {product.vendor}
                    </p>
                  )}
                </div>

                {product.description && (
                  <p className="line-clamp-2 text-sm text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                )}

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.slice(0, 3).map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-lg bg-linear-to-r from-[#E0BBE4] to-[#A8D8EA] text-white text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {tags.length > 3 && (
                      <span className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 text-xs font-medium">
                        +{tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Date */}
                <p className="text-xs text-gray-500">
                  {new Date(job.createdAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                {/* Spacer pour pousser le bouton en bas */}
                <div className="flex-1"></div>

                {/* Bouton Export */}
                <ExportDropdown 
                  onExportJSON={() => exportJSON(product)}
                  onExportCSV={() => exportCSV(product)}
                  className="w-full"
                  onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? job.id : null)}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
