import { auth } from "@/auth"
import DashboardContent from "@/components/DashboardContent"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Scraping - Scraper des produits Shopify",
  description: "Scrapez des pages produits Shopify et extrayez toutes les données : titre, prix, images, variants, métadonnées SEO. Export JSON en un clic.",
}

export default async function DashboardPage() {
  await auth() // Initialiser la session même si non utilisée

  return (
    <div className="min-h-full bg-linear-to-br from-[#FAFBFC] via-[#F0F4F8] to-[#E8EEF5]">
      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="animate-scale-in">
          <DashboardContent />
        </div>
      </main>

      {/* Floating decorative elements */}
      <div className="fixed top-20 right-10 w-32 h-32 bg-[#E0BBE4]/20 rounded-full blur-3xl animate-float pointer-events-none"></div>
      <div className="fixed bottom-20 left-10 w-40 h-40 bg-[#A8D8EA]/20 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '1s' }}></div>
    </div>
  )
}
