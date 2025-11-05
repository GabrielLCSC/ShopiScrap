import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planType = session.metadata?.planType;

  if (!userId || !planType) {
    console.error("Missing metadata in checkout session");
    return;
  }

  const now = new Date();

  if (planType === "day_pass") {
    // Day Pass : 50 crédits persistants (pas d'expiration)
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: { increment: 50 }, // Ajoute 50 crédits au total existant
        // subscriptionType reste "free" ou ce qu'il était
      },
    });
  } else if (planType === "monthly") {
    // Monthly : 200 extractions/mois
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionType: "monthly",
        subscriptionEndDate: endDate,
        stripeSubscriptionId: session.subscription as string,
        monthlyQuota: 200,
        monthlyUsed: 0,
        lastMonthlyReset: now,
      },
    });
  } else if (planType === "pro") {
    // Pro : illimité
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionType: "pro",
        subscriptionEndDate: endDate,
        stripeSubscriptionId: session.subscription as string,
      },
    });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!user) return;

  // current_period_end est un timestamp Unix
  const periodEnd = (subscription as any).current_period_end;
  const endDate = new Date(periodEnd * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionEndDate: endDate,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!user) return;

  // Retour au plan gratuit
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionType: "free",
      subscriptionEndDate: null,
      stripeSubscriptionId: null,
      credits: 3,
      monthlyUsed: 0,
    },
  });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Renouvellement mensuel : reset du quota
  const subscriptionId = (invoice as any).subscription;
  if (!subscriptionId) return;

  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscriptionId as string },
  });

  if (!user) return;

  const now = new Date();

  if (user.subscriptionType === "monthly") {
    // Reset le quota mensuel
    await prisma.user.update({
      where: { id: user.id },
      data: {
        monthlyUsed: 0,
        lastMonthlyReset: now,
        subscriptionEndDate: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()),
      },
    });
  } else if (user.subscriptionType === "pro") {
    // Prolonge l'abonnement
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionEndDate: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()),
      },
    });
  }
}
