import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import * as cheerio from "cheerio"
import { cookies } from "next/headers"

const TRIAL_COOKIE_NAME = 'trial_scrapes'
const MAX_TRIAL_SCRAPES = 3

async function performScraping(url: string) {
  // 1. Récupérer le HTML pour parser les meta tags
  const htmlResponse = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ShopifyScraper/1.0)',
    },
  })

  if (!htmlResponse.ok) {
    throw new Error(`Échec du scraping HTML: ${htmlResponse.statusText}`)
  }

  const html = await htmlResponse.text()
  const $ = cheerio.load(html)

  // Extraire les meta tags
  const metaDescription = $('meta[name="description"]').attr('content') || 
                         $('meta[property="og:description"]').attr('content') || ''
  
  const ogImage = $('meta[property="og:image"]').attr('content') || 
                 $('meta[property="og:image:secure_url"]').attr('content') || ''

  // Extraire description courte depuis le DOM Shopify
  let shortDescription = $('.product-description').first().text().trim()
  if (!shortDescription) {
    shortDescription = $('.product__description').first().text().trim()
  }
  if (!shortDescription) {
    shortDescription = $('[class*="description"]').first().text().trim()
  }
  shortDescription = shortDescription.substring(0, 200)

  // 2. Récupérer les données JSON Shopify
  let productUrl = url.replace(/\/$/, '') + '.json'
  
  const jsonResponse = await fetch(productUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ShopifyScraper/1.0)',
    },
  })

  if (!jsonResponse.ok) {
    throw new Error(`Échec du scraping JSON: ${jsonResponse.statusText}`)
  }

  const data = await jsonResponse.json()
  const product = data.product

  if (!product) {
    throw new Error("Aucune donnée produit trouvée")
  }

  // Retourner les données formatées
  return {
    url,
    shopifyDomain: new URL(url).hostname,
    productHandle: product.handle,
    title: product.title,
    description: shortDescription || product.body_html || product.description,
    vendor: product.vendor,
    productType: product.product_type,
    price: product.variants?.[0]?.price ? parseFloat(product.variants[0].price) : null,
    compareAtPrice: product.variants?.[0]?.compare_at_price 
      ? parseFloat(product.variants[0].compare_at_price) 
      : null,
    currency: product.variants?.[0]?.price ? 'USD' : null,
    available: product.available || false,
    mainImage: ogImage || product.images?.[0]?.src || product.image?.src,
    images: JSON.stringify(product.images?.map((img: any) => img.src) || []),
    variants: JSON.stringify(product.variants || []),
    variantCount: product.variants?.length || 0,
    metaTitle: product.title,
    metaDescription: metaDescription,
    tags: JSON.stringify(product.tags || []),
    rawData: JSON.stringify({
      ...product,
      ogImage,
      metaDescription,
      shortDescription,
    }),
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: "URL manquante" },
        { status: 400 }
      )
    }

    // Valider que c'est bien une URL Shopify
    const isShopifyUrl = url.includes('.myshopify.com') || 
                         url.includes('/products/') ||
                         url.match(/\.(com|net|org|io)\/products\//)

    if (!isShopifyUrl) {
      return NextResponse.json(
        { error: "L'URL ne semble pas être une page produit Shopify valide" },
        { status: 400 }
      )
    }

    const startTime = Date.now()

    // MODE NON CONNECTÉ : Essai gratuit avec limitation par cookie
    if (!session?.user?.email) {
      const cookieStore = await cookies()
      const trialData = cookieStore.get(TRIAL_COOKIE_NAME)

      let remaining = MAX_TRIAL_SCRAPES
      let lastReset = new Date()

      if (trialData?.value) {
        try {
          const parsed = JSON.parse(trialData.value)
          const now = new Date()
          const resetTime = new Date(parsed.lastReset)
          const hoursSinceReset = (now.getTime() - resetTime.getTime()) / (1000 * 60 * 60)

          if (hoursSinceReset >= 24) {
            remaining = MAX_TRIAL_SCRAPES
            lastReset = now
          } else {
            remaining = parsed.remaining
            lastReset = resetTime
          }
        } catch {
          // Cookie invalide, reset
        }
      }

      // Vérifier s'il reste des essais
      if (remaining <= 0) {
        return NextResponse.json(
          { error: "Vous avez utilisé vos 3 essais gratuits. Connectez-vous pour continuer !" },
          { status: 403 }
        )
      }

      try {
        const productData = await performScraping(url)
        const duration = Date.now() - startTime

        // Décrémenter le cookie
        const newRemaining = remaining - 1
        
        const response = NextResponse.json({
          success: true,
          product: {
            id: 'trial',
            ...productData,
          },
          isTrial: true,
          remainingTrials: newRemaining,
        })

        response.cookies.set(TRIAL_COOKIE_NAME, JSON.stringify({
          remaining: newRemaining,
          lastReset: lastReset.toISOString(),
        }), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax',
        })

        return response

      } catch (error: any) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }
    }

    // MODE CONNECTÉ : Système de crédits + DB
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        }
      })
    }

    const now = new Date()

    // Day Pass n'expire plus - les crédits sont persistants

    // 1. Vérifier si abonnement (monthly/pro) est expiré
    if ((user.subscriptionType === "monthly" || user.subscriptionType === "pro") && 
        user.subscriptionEndDate && new Date(user.subscriptionEndDate) < now) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionType: "free",
          subscriptionEndDate: null,
          stripeSubscriptionId: null,
          credits: 3,
          lastFreeReset: now,
        }
      })
    }

    // 3. Reset mensuel pour plan Monthly
    if (user.subscriptionType === "monthly") {
      const lastMonthlyReset = new Date(user.lastMonthlyReset)
      const daysSinceReset = (now.getTime() - lastMonthlyReset.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysSinceReset >= 30) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            monthlyUsed: 0,
            lastMonthlyReset: now,
          }
        })
      }
    }

    // 4. Reset quotidien pour plan Free
    if (user.subscriptionType === "free") {
      const lastReset = new Date(user.lastFreeReset)
      const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceReset >= 24) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            credits: 3,
            lastFreeReset: now,
          }
        })
      }
    }

    // 5. Vérifier les quotas selon le plan
    let canScrape = false
    let errorMessage = ""

    switch (user.subscriptionType) {
      case "free":
        canScrape = user.credits > 0
        errorMessage = "Vous n'avez plus de crédits. Achetez un pack de crédits ou choisissez un abonnement."
        break

      case "monthly":
        canScrape = user.monthlyUsed < user.monthlyQuota
        errorMessage = `Vous avez atteint votre quota mensuel (${user.monthlyQuota} extractions). Passez au plan Pro pour l'illimité.`
        break

      case "pro":
        // Fair use : max 500 extractions/jour (anti-abus)
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const todayScrapes = await prisma.scrapeJob.count({
          where: {
            userId: user.id,
            createdAt: { gte: todayStart },
          }
        })
        canScrape = todayScrapes < 500
        errorMessage = "Limite de fair use atteinte (500/jour). Contactez-nous si vous avez besoin de plus."
        break
    }

    if (!canScrape) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 403 }
      )
    }

    // 6. Déduire selon le plan
    if (user.subscriptionType === "free") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          credits: { decrement: 1 },
          totalCreditsUsed: { increment: 1 },
        }
      })
    } else if (user.subscriptionType === "monthly") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          monthlyUsed: { increment: 1 },
          totalCreditsUsed: { increment: 1 },
        }
      })
    } else if (user.subscriptionType === "pro") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalCreditsUsed: { increment: 1 },
        }
      })
    }

    // Créer un ScrapeJob
    const scrapeJob = await prisma.scrapeJob.create({
      data: {
        userId: user.id,
        url,
        status: "processing",
        startedAt: new Date(),
      }
    })

    try {
      const productData = await performScraping(url)
      const duration = Date.now() - startTime

      // Créer le produit scrapé
      const scrapedProduct = await prisma.scrapedProduct.create({
        data: {
          scrapeJobId: scrapeJob.id,
          ...productData,
        }
      })

      // Mettre à jour le job
      await prisma.scrapeJob.update({
        where: { id: scrapeJob.id },
        data: {
          status: "completed",
          completedAt: new Date(),
          duration,
        }
      })

      return NextResponse.json({
        success: true,
        jobId: scrapeJob.id,
        product: scrapedProduct,
        isTrial: false,
      })

    } catch (error: any) {
      // En cas d'erreur, mettre à jour le job
      await prisma.scrapeJob.update({
        where: { id: scrapeJob.id },
        data: {
          status: "failed",
          completedAt: new Date(),
          error: error.message,
          duration: Date.now() - startTime,
        }
      })

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error("Erreur API scrape:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// GET: Récupérer l'historique des scrapes (seulement pour les connectés)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        }
      })
    }

    const scrapeJobs = await prisma.scrapeJob.findMany({
      where: {
        userId: user.id,
      },
      include: {
        productData: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return NextResponse.json({
      success: true,
      jobs: scrapeJobs,
    })

  } catch (error: any) {
    console.error("Erreur API GET scrape:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
