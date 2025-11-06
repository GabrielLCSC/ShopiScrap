import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import PricingCard from "./PricingCard";

export const metadata = {
  title: "Tarifs - ShopiScrap",
  description: "Choisissez le plan qui correspond à vos besoins",
};

export default async function BillingPage() {
  const session = await auth();

  let user = null;
  
  if (session?.user?.email) {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        credits: true,
        subscriptionType: true,
        subscriptionEndDate: true,
        monthlyUsed: true,
        monthlyQuota: true,
        totalCreditsUsed: true,
      },
    });
  }

  const plans = [
    {
      id: "pack_credits",
      name: "Pack 50 Crédits",
      price: "4€",
      period: "one-time",
      features: [
        "50 extractions",
        "Crédits persistants",
        "Parfait pour un besoin ponctuel",
        "Accès immédiat",
      ],
      credits: 50,
      stripePriceId: process.env.STRIPE_PACK_CREDITS_PRICE_ID!,
      highlighted: false,
      planType: "day_pass", // Type interne pour Stripe (keep for webhook compatibility)
    },
    {
      id: "monthly",
      name: "Monthly Starter",
      price: "9€",
      period: "mois",
      features: [
        "200 extractions/mois",
        "Renouvellement automatique",
        "Annulation à tout moment",
        "Idéal pour utilisation régulière",
      ],
      credits: 200,
      stripePriceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
      highlighted: true,
      planType: "monthly",
    },
    {
      id: "pro",
      name: "Pro",
      price: "19€",
      period: "mois",
      features: [
        "Extractions illimitées",
        "Fair use policy",
        "Priorité support",
        "Pour les power users",
      ],
      credits: "Unlimited",
      stripePriceId: process.env.STRIPE_PRO_PRICE_ID!,
      highlighted: false,
      planType: "pro",
    },
  ];

  return (
    <div className="min-h-full bg-linear-to-br from-[#FAFBFC] via-[#F0F4F8] to-[#E8EEF5]">
      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-8 animate-fade-in">
          <a 
            href="/scraping" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#7BB5D8] transition-colors group"
          >
            <svg 
              className="w-5 h-5 transition-transform group-hover:-translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            Scraping
          </a>
        </div>

        {/* Title */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] bg-clip-text text-transparent mb-4">
            Choisissez votre plan
          </h2>
          <p className="text-lg text-slate-600">
            Commencez avec 3 extractions gratuites, puis choisissez le plan qui vous convient
          </p>
        </div>

        {/* Current Status - Only for logged in users */}
        {user && (
          <div className="glass rounded-2xl p-6 mb-12 max-w-2xl mx-auto border border-white/30 animate-scale-in">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Votre compte</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/50 rounded-lg border border-white/30">
              <p className="text-sm text-slate-600 mb-1">Plan actuel</p>
              <p className="text-2xl font-bold text-blue-600 capitalize">
                {user.subscriptionType === "day_pass" ? "Free" : user.subscriptionType.replace("_", " ")}
              </p>
            </div>

              <div className="text-center p-4 bg-white/50 rounded-lg border border-white/30">
                <p className="text-sm text-slate-600 mb-1">Disponibles</p>
                <p className="text-2xl font-bold text-green-600">
                  {user.subscriptionType === "pro" ? "∞" : 
                   user.subscriptionType === "monthly" ? `${user.monthlyQuota - user.monthlyUsed}` :
                   user.credits}
                </p>
              </div>

              <div className="text-center p-4 bg-white/50 rounded-lg border border-white/30">
                <p className="text-sm text-slate-600 mb-1">Total utilisé</p>
                <p className="text-2xl font-bold text-slate-900">
                  {user.totalCreditsUsed}
                </p>
              </div>
            </div>

            {user.subscriptionType !== "day_pass" && user.subscriptionEndDate && new Date(user.subscriptionEndDate) > new Date() && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-blue-800">
                  Abonnement actif jusqu&apos;au{" "}
                  <span className="font-semibold">
                    {new Date(user.subscriptionEndDate).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}


        {/* Free Tier Info */}
        <div className="glass bg-linear-to-r from-green-50/50 to-emerald-50/50 border border-green-200/50 rounded-2xl p-6 mb-8 max-w-2xl mx-auto animate-scale-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl">
              ✓
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                Gratuit à vie : 3 extractions par jour
              </h3>
              <p className="text-green-700">
                Aucune carte bancaire requise. Essayez maintenant !
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16 animate-fade-in">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              currentPlan={user?.subscriptionType || "free"}
              isLoggedIn={!!user}
            />
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16 animate-fade-in">
          <h3 className="text-2xl font-bold bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] bg-clip-text text-transparent mb-8 text-center">
            Questions fréquentes
          </h3>
          
          <div className="space-y-4">
            <details className="glass rounded-lg border border-white/30 overflow-hidden transition-all duration-300 hover:border-[#7BB5D8]/50 group">
              <summary className="font-semibold text-slate-900 cursor-pointer p-6 flex items-center justify-between transition-colors hover:text-[#7BB5D8]">
                <span>Que deviennent mes extractions gratuites ?</span>
                <svg className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 animate-fade-in">
                <p className="text-slate-600">
                  Vos 3 extractions gratuites quotidiennes restent toujours disponibles, même avec un plan payant !
                </p>
              </div>
            </details>

            <details className="glass rounded-lg border border-white/30 overflow-hidden transition-all duration-300 hover:border-[#7BB5D8]/50 group">
              <summary className="font-semibold text-slate-900 cursor-pointer p-6 flex items-center justify-between transition-colors hover:text-[#7BB5D8]">
                <span>Qu&apos;est-ce que le &quot;fair use&quot; pour le plan Pro ?</span>
                <svg className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 animate-fade-in">
                <p className="text-slate-600">
                  Fair use signifie utilisation raisonnable. Nous ne limitons pas les extractions, mais un scraping 
                  automatisé excessif (1000+/jour) peut être examiné. L&apos;usage normal est illimité.
                </p>
              </div>
            </details>

            <details className="glass rounded-lg border border-white/30 overflow-hidden transition-all duration-300 hover:border-[#7BB5D8]/50 group">
              <summary className="font-semibold text-slate-900 cursor-pointer p-6 flex items-center justify-between transition-colors hover:text-[#7BB5D8]">
                <span>Puis-je annuler à tout moment ?</span>
                <svg className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 animate-fade-in">
                <p className="text-slate-600">
                  Oui ! Les abonnements Monthly et Pro peuvent être annulés à tout moment. Vous conserverez l&apos;accès 
                  jusqu&apos;à la fin de votre période de facturation.
                </p>
              </div>
            </details>

            <details className="glass rounded-lg border border-white/30 overflow-hidden transition-all duration-300 hover:border-[#7BB5D8]/50 group">
              <summary className="font-semibold text-slate-900 cursor-pointer p-6 flex items-center justify-between transition-colors hover:text-[#7BB5D8]">
                <span>Les extractions non utilisées sont-elles reportées ?</span>
                <svg className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 animate-fade-in">
                <p className="text-slate-600">
                  Pack 50 Crédits : Non, les crédits sont persistants à vie. Monthly Starter : Non, réinitialisé chaque mois. 
                  Gratuit : Réinitialisé quotidiennement.
                </p>
              </div>
            </details>
          </div>
        </div>
      </main>

      {/* Floating decorative elements */}
      <div className="fixed top-20 right-10 w-32 h-32 bg-[#E0BBE4]/20 rounded-full blur-3xl animate-float pointer-events-none"></div>
      <div className="fixed bottom-20 left-10 w-40 h-40 bg-[#A8D8EA]/20 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '1s' }}></div>
    </div>
  );
}
