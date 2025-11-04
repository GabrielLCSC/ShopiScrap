import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { stripe } from "@/lib/stripe"

export async function POST() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Créer une session de paiement Stripe
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Pack 100 crédits',
              description: '100 scrapings de produits Shopify',
            },
            unit_amount: 200, // 2€ en centimes
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/billing?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/billing?canceled=true`,
      metadata: {
        userEmail: session.user.email,
        credits: '100',
      },
    })

    return NextResponse.json({ url: checkoutSession.url })

  } catch (error: any) {
    console.error("Erreur Stripe checkout:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de la session" },
      { status: 500 }
    )
  }
}

