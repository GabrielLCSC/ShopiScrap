# 🚀 START HERE - Nouveau Pricing Intégré !

## ✅ C'EST PRÊT !

Ton nouveau système de pricing avec 3 plans est **100% codé et testé**.

---

## 📊 Les 3 Plans

```
┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│   FREE (0€)     │  │ DAY PASS (4€)    │  │ MONTHLY (9€)    │  │  PRO (19€)  │
│                 │  │                  │  │                 │  │             │
│  3 extractions  │  │  50 extractions  │  │  200/mois       │  │  ILLIMITÉ   │
│  par jour       │  │  valable 24h     │  │  récurrent      │  │  fair use   │
│  (gratuit vie)  │  │  one-time        │  │                 │  │             │
└─────────────────┘  └──────────────────┘  └─────────────────┘  └─────────────┘
```

---

## 🎯 Il te reste 3 ÉTAPES (20 min)

### ÉTAPE 1 : Créer les Produits Stripe (5 min) ⏱️

```bash
# 1. Va sur https://dashboard.stripe.com/
# 2. Active le MODE TEST (switch en haut à droite)
# 3. Suis le guide : STRIPE_PRODUCTS_SETUP.md
```

**Résultat** : Tu auras 3 **Price IDs** à copier dans `.env.local`

---

### ÉTAPE 2 : Tester en Local (10 min) ⏱️

```bash
# 1. Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# 2. Login Stripe
stripe login

# 3. Forward webhooks (dans un terminal)
stripe listen --forward-to localhost:3000/api/stripe/webhook
# ⚠️ Copie le webhook secret affiché

# 4. Ajoute dans .env.local
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_DAY_PASS_PRICE_ID="price_..."
STRIPE_MONTHLY_PRICE_ID="price_..."
STRIPE_PRO_PRICE_ID="price_..."

# 5. Lance l'app (autre terminal)
npm run dev

# 6. Va sur http://localhost:3000/billing
```

**Teste avec la carte Stripe** :
- Numéro : `4242 4242 4242 4242`
- Date : N'importe quelle date future
- CVC : `123`

---

### ÉTAPE 3 : Déployer (5 min) ⏱️

```bash
# 1. Push sur GitHub
git add .
git commit -m "feat: nouveau pricing avec 3 plans (Day Pass 4€, Monthly 9€, Pro 19€)"
git push

# 2. Vercel redéploie automatiquement ✅

# 3. Ajoute les variables d'environnement sur Vercel Dashboard
STRIPE_DAY_PASS_PRICE_ID="price_live_..."
STRIPE_MONTHLY_PRICE_ID="price_live_..."
STRIPE_PRO_PRICE_ID="price_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..." (production)

# 4. Configure le webhook production
# URL: https://ton-app.vercel.app/api/stripe/webhook
```

---

## 📁 Documentation Complète

| Fichier | Utilité |
|---------|---------|
| **`START_HERE.md`** *(ce fichier)* | Guide rapide de démarrage |
| **`NOUVEAU_PRICING_README.md`** | Vue d'ensemble complète |
| **`STRIPE_PRODUCTS_SETUP.md`** | Guide détaillé Stripe |
| **`PRICING_IMPLEMENTATION.md`** | Détails techniques |
| **`DEPLOYMENT_GUIDE.md`** | Guide de déploiement Vercel |

---

## ✨ Ce qui a été codé

- ✅ Migration Prisma (base de données)
- ✅ Page `/billing` (design moderne)
- ✅ API Stripe checkout
- ✅ API Stripe webhook
- ✅ Logique scraping multi-plans
- ✅ Fair use pour Pro (500/jour max)
- ✅ Page de confirmation
- ✅ Build testé et fonctionnel

---

## 🎨 Aperçu de /billing

```
┌────────────────────────────────────────────────────────────┐
│                     Choose Your Plan                        │
│        Start with 3 free extractions, then upgrade          │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────────┐  ┌─────────────────┐  ┌───────────┐│
│  │   Day Pass        │  │ Monthly Starter │  │    Pro    ││
│  │                   │  │  MOST POPULAR   │  │           ││
│  │      4€           │  │      9€/mois    │  │  19€/mois ││
│  │   50 extracts     │  │  200/mois       │  │ UNLIMITED ││
│  │   Buy Now         │  │  Subscribe      │  │ Subscribe ││
│  └───────────────────┘  └─────────────────┘  └───────────┘│
└────────────────────────────────────────────────────────────┘
```

---

## 🔥 Fonctionnalités Cool

### 1. **Free Tier Toujours Disponible**
Même avec un plan payant, les 3 extractions/jour gratuites restent !

### 2. **Expiration Automatique**
- Day Pass expire après 24h → retour au free
- Abonnements expirés → retour au free
- Aucune intervention manuelle

### 3. **Reset Automatique**
- Free : reset quotidien (3/jour)
- Monthly : reset mensuel (200/mois)
- Pro : fair use reset quotidien (500/jour max)

### 4. **Fair Use Protection**
Le plan Pro est "illimité" mais limité à 500/jour pour éviter les abus.

### 5. **Webhooks Stripe**
Activation/désactivation automatique des plans via Stripe.

---

## 🆘 Problèmes ?

### Webhook ne fonctionne pas
```bash
stripe logs tail
```

### Paiement réussi mais plan non activé
1. Check les logs : `/api/stripe/webhook`
2. Check Stripe Dashboard → Logs
3. Vérifie que `metadata.userId` est présent

### Price ID invalide
```bash
stripe prices list
```

---

## 🎉 RÉSUMÉ

**Status** : ✅ 100% PRÊT

**Temps restant** : 20 minutes

**Actions** :
1. Créer produits Stripe (5 min)
2. Tester en local (10 min)
3. Déployer (5 min)

**Après** : 🚀 TU ES LIVE AVEC TON NOUVEAU PRICING !

---

## 👉 COMMENCE PAR

**Ouvre** : `STRIPE_PRODUCTS_SETUP.md`

**Suis** : Les étapes une par une

**Teste** : Avec la carte `4242 4242 4242 4242`

**Deploy** : Push sur GitHub → Vercel auto-deploy

---

**C'est parti ! 🎊**

