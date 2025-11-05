import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        credits: true,
        lastFreeReset: true,
        totalCreditsUsed: true,
        subscriptionType: true,
        subscriptionEndDate: true,
        monthlyQuota: true,
        monthlyUsed: true,
        lastMonthlyReset: true,
      }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        },
        select: {
          credits: true,
          lastFreeReset: true,
          totalCreditsUsed: true,
          subscriptionType: true,
          subscriptionEndDate: true,
          monthlyQuota: true,
          monthlyUsed: true,
          lastMonthlyReset: true,
        }
      })
    }

    const now = new Date()

    // Migration automatique : convertir les anciens "day_pass" vers "free" (garder les crédits)
    if (user.subscriptionType === "day_pass") {
      user = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          subscriptionType: "free",
          subscriptionEndDate: null, // Supprimer l'expiration
        },
        select: {
          credits: true,
          lastFreeReset: true,
          totalCreditsUsed: true,
          subscriptionType: true,
          subscriptionEndDate: true,
          monthlyQuota: true,
          monthlyUsed: true,
          lastMonthlyReset: true,
        }
      })
    }

    // Vérifier si abonnement (monthly/pro) est expiré
    if ((user.subscriptionType === "monthly" || user.subscriptionType === "pro") && 
        user.subscriptionEndDate && new Date(user.subscriptionEndDate) < now) {
      user = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          subscriptionType: "free",
          subscriptionEndDate: null,
          stripeSubscriptionId: null,
          credits: 3,
          lastFreeReset: now,
        },
        select: {
          credits: true,
          lastFreeReset: true,
          totalCreditsUsed: true,
          subscriptionType: true,
          subscriptionEndDate: true,
          monthlyQuota: true,
          monthlyUsed: true,
          lastMonthlyReset: true,
        }
      })
    }

    // Reset mensuel pour plan Monthly
    if (user.subscriptionType === "monthly") {
      const lastMonthlyReset = new Date(user.lastMonthlyReset)
      const daysSinceReset = (now.getTime() - lastMonthlyReset.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysSinceReset >= 30) {
        user = await prisma.user.update({
          where: { email: session.user.email },
          data: {
            monthlyUsed: 0,
            lastMonthlyReset: now,
          },
          select: {
            credits: true,
            lastFreeReset: true,
            totalCreditsUsed: true,
            subscriptionType: true,
            subscriptionEndDate: true,
            monthlyQuota: true,
            monthlyUsed: true,
            lastMonthlyReset: true,
          }
        })
      }
    }

    // Reset quotidien pour plan Free
    if (user.subscriptionType === "free") {
      const lastReset = new Date(user.lastFreeReset)
      const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceReset >= 24) {
        user = await prisma.user.update({
          where: { email: session.user.email },
          data: {
            credits: 3,
            lastFreeReset: now,
          },
          select: {
            credits: true,
            lastFreeReset: true,
            totalCreditsUsed: true,
            subscriptionType: true,
            subscriptionEndDate: true,
            monthlyQuota: true,
            monthlyUsed: true,
            lastMonthlyReset: true,
          }
        })
      }
    }

    // Calculer les crédits disponibles selon le plan
    let availableCredits = 0
    if (user.subscriptionType === "free") {
      availableCredits = user.credits
    } else if (user.subscriptionType === "monthly") {
      availableCredits = user.monthlyQuota - user.monthlyUsed
    } else if (user.subscriptionType === "pro") {
      availableCredits = 999999 // Illimité
    }

    return NextResponse.json({
      success: true,
      credits: availableCredits,
      subscriptionType: user.subscriptionType,
      subscriptionEndDate: user.subscriptionEndDate,
      monthlyQuota: user.monthlyQuota,
      monthlyUsed: user.monthlyUsed,
      lastFreeReset: user.lastFreeReset,
      totalCreditsUsed: user.totalCreditsUsed,
    })

  } catch (error: any) {
    console.error("Erreur API credits:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

