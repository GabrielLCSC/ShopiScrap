import { auth } from "@/auth"
import { redirect } from "next/navigation"
import HistoryList from "@/components/HistoryList"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Historique des scrapings",
  description: "Consultez tous vos produits Shopify scrapés. Exportez n'importe quelle donnée produit en JSON.",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function HistoryPage() {
  const session = await auth()

  if (!session) {
    redirect("/")
  }

  return (
    <div className="min-h-full bg-linear-to-br from-[#FAFBFC] via-[#F0F4F8] to-[#E8EEF5]">
      <main className="mx-auto max-w-7xl px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-8 animate-fade-in">
          <a 
            href="/dashboard" 
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
            Dashboard
          </a>
        </div>

        <div className="animate-scale-in">
          <HistoryList />
        </div>
      </main>

      {/* Floating decorative elements */}
      <div className="fixed top-20 right-10 w-32 h-32 bg-[#FEC8D8]/20 rounded-full blur-3xl animate-float pointer-events-none"></div>
      <div className="fixed bottom-20 left-10 w-40 h-40 bg-[#B5EAD7]/20 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>
    </div>
  )
}
