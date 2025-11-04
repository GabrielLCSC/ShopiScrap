This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🎯 Project Overview

**Shopify Product Scraper** - A simple SaaS that solves ONE measurable pain point: extracting product data from Shopify stores.

### Features
- 🔐 Google OAuth authentication (NextAuth.js)
- 🗄️ Local SQLite database (Prisma ORM)
- 🔍 Scrape Shopify product pages avec parsing HTML + JSON
- 📊 Données complètes : title, price, images, vendor, descriptions, meta, og:image, tags
- 📥 Export JSON en un clic
- 💾 Historique sauvegardé en local
- 💳 **Système de crédits + Stripe** : Free tier (3/jour) + packs payants (100 crédits = 2€)

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: Prisma + SQLite (local, no infrastructure needed)
- **Payment**: Stripe (système de crédits)
- **TypeScript**: Full type safety

## ⚙️ Setup

### 1. Authentication

This project includes NextAuth.js with Google OAuth authentication.

**⚠️ Important**: Before running the project, you need to set up your environment variables. See [AUTH_SETUP.md](./AUTH_SETUP.md) for detailed instructions on:
- Creating Google OAuth credentials
- Configuring environment variables
- Setting up authentication in production

### 2. Database

This project uses Prisma with SQLite for local development.

See [PRISMA_SETUP.md](./PRISMA_SETUP.md) for:
- Database schema details
- Useful Prisma commands
- How to use Prisma in your code
- Troubleshooting tips

### 3. Stripe (Paiements)

This project uses Stripe for credit-based monetization.

See [STRIPE_SETUP.md](./STRIPE_SETUP.md) for:
- Creating a Stripe account
- Getting API keys
- Setting up webhooks
- Testing payments locally
- Production deployment

## Getting Started

First, configure your environment variables (see [AUTH_SETUP.md](./AUTH_SETUP.md)), then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🗂️ Project Structure

```
app/
  ├── api/
  │   ├── auth/[...nextauth]/   # NextAuth API routes
  │   └── scrape/               # Scraping API endpoints
  ├── components/
  │   ├── AuthButton.tsx        # Login/logout button
  │   ├── DashboardContent.tsx  # Dashboard form + result
  │   └── HistoryList.tsx       # History cards list
  ├── dashboard/
  │   ├── page.tsx              # Main dashboard (scraping)
  │   └── history/
  │       └── page.tsx          # Scraping history
  └── page.tsx                  # Landing page (redirects to dashboard)

lib/
  └── prisma.ts                 # Prisma client singleton

prisma/
  ├── schema.prisma             # Database schema
  ├── migrations/               # Database migrations
  └── dev.db                    # SQLite database file

auth.ts                         # NextAuth configuration
```

## 🚀 Quick Commands

```bash
# Start development server
npm run dev

# Open Prisma Studio (database GUI)
npx prisma studio

# Generate Prisma client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Build for production
npm run build

# Start production server
npm start
```

## 📖 Usage

### Scraper un produit
1. **Sign in** with your Google account on the home page (`/`)
2. **Click "Accéder au Dashboard"** → redirects to `/dashboard`
3. **Enter a Shopify product URL** (e.g., `https://store.myshopify.com/products/product-name`)
4. **Click "Lancer le scraping"**
5. **View the results** - all scraped data displays instantly
6. **Click "📥 Exporter JSON"** to download the data

### Voir l'historique
1. **Click "📚 Historique"** in the dashboard header
2. **Browse all scraped products** as cards
3. **Click "📥 Exporter JSON"** on any product to download its data

### Gérer les crédits
1. **Click "💳 Crédits"** in the dashboard header → redirects to `/billing`
2. **View your available credits** and usage stats
3. **Buy credit packs** (100 crédits = 2€) if needed

### Example Shopify URLs

The scraper works with any Shopify product page URL format:
- `https://store.myshopify.com/products/product-handle`
- `https://yourstore.com/products/product-handle`
- `https://example.com/en/products/product-handle`

## 🔍 What Data is Scraped?

### Informations de base
- ✅ Title, vendor, product type
- ✅ Price, compare at price, currency
- ✅ Availability status

### Images
- ✅ Main image (priorité: og:image)
- ✅ All product images
- ✅ Open Graph image (réseaux sociaux)

### Descriptions
- ✅ Short description (parsed from Shopify DOM selectors)
- ✅ Full HTML description
- ✅ Meta description (SEO)

### Metadata
- ✅ Tags et collections
- ✅ All variants (size, color, etc.)
- ✅ Raw JSON data for flexibility

📖 Voir [FEATURES.md](./FEATURES.md) pour la liste complète

## 🎨 UI Features

- Modern, clean interface with Tailwind CSS
- Dark mode support
- Responsive design
- Loading states and error handling
- Real-time scraping feedback

## 📊 Database

All scraped data is stored locally in `prisma/dev.db`. Use Prisma Studio to view and manage your data:

```bash
npx prisma studio
```

## 🚢 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

**Note**: For production, you'll need to:
1. Replace SQLite with a production database (PostgreSQL, MySQL, etc.)
2. Update Google OAuth redirect URIs
3. Set environment variables on Vercel

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📚 Documentation

- [AUTH_SETUP.md](./AUTH_SETUP.md) - Authentication setup guide
- [PRISMA_SETUP.md](./PRISMA_SETUP.md) - Database setup and usage
- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Prisma Documentation](https://www.prisma.io/docs)
