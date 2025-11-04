import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const TRIAL_COOKIE_NAME = 'trial_scrapes'
const MAX_TRIAL_SCRAPES = 3

export async function GET() {
  try {
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
          // Reset après 24h
          remaining = MAX_TRIAL_SCRAPES
          lastReset = now
        } else {
          remaining = parsed.remaining
          lastReset = resetTime
        }
      } catch {
        // Cookie invalide, reset
        remaining = MAX_TRIAL_SCRAPES
      }
    }

    return NextResponse.json({
      success: true,
      remaining,
      max: MAX_TRIAL_SCRAPES,
      lastReset,
    })

  } catch (error) {
    console.error("Erreur API trial:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
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
          // Reset après 24h
          remaining = MAX_TRIAL_SCRAPES - 1
          lastReset = now
        } else {
          remaining = Math.max(0, parsed.remaining - 1)
          lastReset = resetTime
        }
      } catch {
        remaining = MAX_TRIAL_SCRAPES - 1
      }
    } else {
      remaining = MAX_TRIAL_SCRAPES - 1
    }

    // Sauvegarder le cookie (expire dans 30 jours)
    const response = NextResponse.json({
      success: true,
      remaining,
    })

    response.cookies.set(TRIAL_COOKIE_NAME, JSON.stringify({
      remaining,
      lastReset: lastReset.toISOString(),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      sameSite: 'lax',
    })

    return response

  } catch (error) {
    console.error("Erreur API trial POST:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

