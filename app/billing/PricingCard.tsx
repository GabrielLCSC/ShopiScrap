"use client";

import { useState } from "react";

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  credits: number | string;
  stripePriceId: string;
  highlighted: boolean;
}

interface PricingCardProps {
  plan: Plan;
  currentPlan: string;
}

export default function PricingCard({ plan, currentPlan }: PricingCardProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          planType: plan.id,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data);
        alert(`Error: ${data.error || "Error creating checkout session"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isCurrentPlan = currentPlan === plan.id;

  return (
    <div
      className={`relative glass rounded-2xl p-8 border-2 transition-all hover:scale-105 ${
        plan.highlighted
          ? "border-[#7BB5D8]/50 scale-105"
          : "border-white/30 hover:border-[#7BB5D8]/30"
      }`}
    >
      {plan.highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
          Le plus populaire
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-4 right-4 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
          Plan actuel
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-extrabold text-slate-900">{plan.price}</span>
          <span className="text-slate-600">/ {plan.period}</span>
        </div>
      </div>

      <div className="mb-8">
        <div className="text-center mb-6">
          <div className="inline-block bg-linear-to-r from-[#A8D8EA]/20 to-[#E0BBE4]/20 px-4 py-2 rounded-lg border border-white/30">
            <span className="text-3xl font-bold bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] bg-clip-text text-transparent">
              {plan.credits}
            </span>
            <span className="text-slate-600 ml-2">
              {plan.credits === "Unlimited" ? "" : "extractions"}
            </span>
          </div>
        </div>

        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-500 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-slate-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleSubscribe}
        disabled={loading || isCurrentPlan}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
          isCurrentPlan
            ? "bg-slate-200 text-slate-500 cursor-not-allowed"
            : plan.highlighted
            ? "bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] hover:from-[#6AA5C8] hover:to-[#D0ABD4] text-white shadow-lg hover:shadow-xl"
            : "bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl"
        } disabled:opacity-50`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
            Chargement...
          </span>
        ) : isCurrentPlan ? (
          "Plan actuel"
        ) : plan.id === "day_pass" ? (
          "Acheter le Day Pass"
        ) : (
          "S'abonner maintenant"
        )}
      </button>

      {!isCurrentPlan && plan.id !== "day_pass" && (
        <p className="text-center text-sm text-slate-500 mt-4">
          Annuler à tout moment
        </p>
      )}
    </div>
  );
}

