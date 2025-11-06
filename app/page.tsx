import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-full bg-linear-to-br from-[#FAFBFC] via-[#F0F4F8] to-[#E8EEF5]">

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 animate-fade-in">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 animate-scale-in border border-white/30">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-slate-600">Essai gratuit • 3 extractions offertes</span>
          </div>

          {/* Main Title */}
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] bg-clip-text text-transparent leading-tight">
            Arrête de perdre du temps à<br />analyser la concurrence
          </h2>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-600 mb-4 font-medium">
            Scrape → Analyse → Lance tes ads en 2 minutes
          </p>

          <p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto">
            Tu copies une URL Shopify.<br />
            On t&apos;extrait toutes les données produit pour lancer plus vite que les autres.
          </p>

          {/* CTA */}
          <Link 
            href="/scraping"
            className="inline-flex items-center gap-2 glass px-8 py-4 rounded-2xl text-lg font-semibold bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] bg-clip-text text-transparent hover:brightness-110 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-[#7BB5D8]/30 animate-float"
          >
            <span className="bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] bg-clip-text text-transparent">
              Commencer gratuitement
            </span>
            <svg className="w-5 h-5 text-[#7BB5D8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12 text-slate-700">
          Simple. Rapide. Efficace.
        </h3>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="glass rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-white/30 animate-scale-in" style={{animationDelay: '0.1s'}}>
            <div className="w-12 h-12 bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4">
              1
            </div>
            <h4 className="text-xl font-semibold text-slate-700 mb-3">
              Colle ton URL
            </h4>
            <p className="text-slate-600">
              Une URL produit Shopify suffit. Pas besoin d&apos;API, de compte développeur ou de compétences techniques.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-white/30 animate-scale-in" style={{animationDelay: '0.2s'}}>
            <div className="w-12 h-12 bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4">
              2
            </div>
            <h4 className="text-xl font-semibold text-slate-700 mb-3">
              On extrait tout
            </h4>
            <p className="text-slate-600">
              Titre, prix, images HD, variants, descriptions, métadonnées SEO... Toutes les données exploitables en 5 secondes.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-white/30 animate-scale-in" style={{animationDelay: '0.3s'}}>
            <div className="w-12 h-12 bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4">
              3
            </div>
            <h4 className="text-xl font-semibold text-slate-700 mb-3">
              Exporte et utilise
            </h4>
            <p className="text-slate-600">
              Télécharge en JSON ou CSV. Intègre directement dans tes campagnes, tes outils ou ton business.
            </p>
          </div>
        </div>
      </section>

      {/* Psychological Bullets */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="glass rounded-2xl p-10 border border-white/30 animate-scale-in">
          <h3 className="text-2xl font-bold text-center mb-8 bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] bg-clip-text text-transparent">
            Pourquoi choisir ShopiScrap
          </h3>

          <div className="space-y-6">
            {/* Bullet 1 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0 mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 mb-1">Optimisé pour lancer, pas pour coder</h4>
                <p className="text-slate-600">
                  Fini le reverse-engineering manuel. Les données sont formatées pour générer directement tes angles publicitaires et tester plus vite.
                </p>
              </div>
            </div>

            {/* Bullet 2 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0 mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 mb-1">ROI immédiat sur chaque extraction</h4>
                <p className="text-slate-600">
                  Chaque scraping peut révéler un produit gagnant, un angle créatif ou une opportunité de marché. Une seule découverte rentabilise l&apos;investissement.
                </p>
              </div>
            </div>

            {/* Bullet 3 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0 mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 mb-1">Gagne la course contre tes concurrents</h4>
                <p className="text-slate-600">
                  Pendant qu&apos;ils analysent manuellement, tu scrapes, tu testes et tu scapes. La vitesse d&apos;exécution fait toute la différence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Floating decorative elements */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-[#A8D8EA]/20 rounded-full blur-3xl pointer-events-none animate-float" style={{animationDelay: '0s', animationDuration: '8s'}}></div>
      <div className="fixed bottom-20 right-10 w-72 h-72 bg-[#E0BBE4]/20 rounded-full blur-3xl pointer-events-none animate-float" style={{animationDelay: '2s', animationDuration: '10s'}}></div>

          <div className="flex justify-center pb-14">
            {/* CTA */}
          <Link 
            href="/scraping"
            className="inline-flex items-center gap-2 glass px-8 py-4 rounded-2xl text-lg font-semibold bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] bg-clip-text text-transparent hover:brightness-110 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-[#7BB5D8]/30 animate-float"
          >
            <span className="bg-linear-to-r from-[#7BB5D8] to-[#E0BBE4] bg-clip-text text-transparent">
              Commencer gratuitement
            </span>
            <svg className="w-5 h-5 text-[#7BB5D8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          </div>
    </div>
  )
}
