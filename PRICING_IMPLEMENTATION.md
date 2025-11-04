# ✅ Nouveau Pricing Intégré

## 📊 Les 3 Plans

| Plan | Prix | Détails |
|------|------|---------|
| **Free** | 0€ | 3 extractions/jour (reste toujours gratuit) |
| **Day Pass** | 4€ | 50 extractions valable 24h |
| **Monthly Starter** | 9€/mois | 200 extractions/mois |
| **Pro** | 19€/mois | Illimité (fair use: 500/jour max) |

## ✨ Ce qui a été fait

### 1. ✅ Base de données (Prisma)

**Nouveaux champs User** :
- `subscriptionType` : "free" | "day_pass" | "monthly" | "pro"
- `subscriptionEndDate` : Date de fin d'abonnement
- `stripeCustomerId` : ID client Stripe
- `stripeSubscriptionId` : ID abonnement Stripe
- `monthlyQuota` : Quota mensuel (200 pour Monthly)
- `monthlyUsed` : Utilisé ce mois
- `lastMonthlyReset` : Dernier reset mensuel

**Migration créée** : `add_subscription_system`

### 2. ✅ Page de Pricing (`/billing`)

**Fonctionnalités** :
- Affichage des 3 plans avec design moderne
- Carte "Most Popular" sur Monthly
- Badge "Current Plan" sur le plan actif
- Affichage du statut utilisateur :
  - Plan actuel
  - Crédits/quota disponibles
  - Total utilisé
  - Date d'expiration
- FAQ intégrée
- Free tier toujours mis en avant

**Fichiers** :
- `app/billing/page.tsx` : Page principale
- `app/billing/PricingCard.tsx` : Composant de carte
- `app/billing/success/page.tsx` : Page de confirmation

### 3. ✅ API Stripe

**Endpoints créés** :

#### `/api/stripe/create-checkout`
- Crée une session de paiement Stripe
- Gère Day Pass (one-time) et abonnements (recurring)
- Crée/récupère le customer Stripe

#### `/api/stripe/webhook`
- Écoute les événements Stripe
- Gère :
  - `checkout.session.completed` : Active le plan
  - `customer.subscription.updated` : Met à jour l'abonnement
  - `customer.subscription.deleted` : Retour au plan free
  - `invoice.payment_succeeded` : Reset mensuel

### 4. ✅ API Scrape Mise à Jour

**Nouvelle logique** :

1. **Vérifications automatiques** :
   - Expiration Day Pass → retour au free
   - Expiration abonnement → retour au free
   - Reset mensuel pour Monthly
   - Reset quotidien pour Free

2. **Quotas par plan** :
   - **Free** : 3 crédits/jour
   - **Day Pass** : 50 crédits (24h)
   - **Monthly** : 200/mois
   - **Pro** : Illimité (fair use 500/jour)

3. **Déduction intelligente** :
   - Free/Day Pass : décrémente `credits`
   - Monthly : incrémente `monthlyUsed`
   - Pro : aucune limite (sauf fair use)

### 5. ✅ Variables d'Environnement

**Nouvelles variables nécessaires** (à ajouter dans `.env`) :

```bash
# Stripe Price IDs (à créer dans Stripe Dashboard)
STRIPE_DAY_PASS_PRICE_ID="price_..."
STRIPE_MONTHLY_PRICE_ID="price_..."
STRIPE_PRO_PRICE_ID="price_..."
```

## 🚀 Prochaines Étapes

### Étape 1 : Créer les Produits Stripe

1. Connecte-toi à [Stripe Dashboard](https://dashboard.stripe.com/)
2. Suis le guide : `STRIPE_PRODUCTS_SETUP.md`
3. Copie les 3 Price IDs dans ton `.env`

### Étape 2 : Tester en Local

```bash
# 1. Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# 2. Login
stripe login

# 3. Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 4. Lancer l'app
npm run dev

# 5. Tester sur http://localhost:3000/billing
```

**Carte de test Stripe** :
- Numéro : `4242 4242 4242 4242`
- Date : N'importe quelle date future
- CVC : N'importe quel 3 chiffres

### Étape 3 : Vérifier

1. ✅ Paiement Day Pass fonctionne
2. ✅ Abonnement Monthly fonctionne
3. ✅ Abonnement Pro fonctionne
4. ✅ Webhooks reçus correctement
5. ✅ Plan activé dans la DB
6. ✅ Scraping fonctionne avec le nouveau plan
7. ✅ Quotas respectés

### Étape 4 : Déployer

1. Push sur GitHub
2. Vercel redéploie automatiquement
3. Ajoute les variables d'environnement sur Vercel :
   ```bash
   STRIPE_DAY_PASS_PRICE_ID
   STRIPE_MONTHLY_PRICE_ID
   STRIPE_PRO_PRICE_ID
   STRIPE_WEBHOOK_SECRET (production)
   ```
4. Configure le webhook en production

## 📝 Notes Importantes

### Fair Use (Plan Pro)

**Limite** : 500 extractions/jour

**Pourquoi ?**
- Éviter les abus
- Empêcher le scraping massif automatisé
- 500/jour = ~15,000/mois = largement suffisant

**Si dépassement** :
- Message : "Limite de fair use atteinte (500/jour)"
- L'utilisateur peut te contacter pour une limite custom

### Gestion des Quotas

**Free** : Reset tous les jours (24h)
**Day Pass** : Valable 24h puis retour au free
**Monthly** : Reset tous les 30 jours
**Pro** : Fair use reset tous les jours

### Sécurité

✅ Vérification de l'abonnement à chaque scrape
✅ Webhooks Stripe signés
✅ Expiration automatique
✅ Protection anti-abus (fair use)

## 🎨 Design

- Gradient moderne (slate/blue/indigo)
- Cartes avec ombres
- Badge "Most Popular"
- Badge "Current Plan"
- FAQ intégrée
- Mobile-responsive

## 🔄 Migration Automatique

Tes utilisateurs existants :
- Ont automatiquement le plan "free"
- Gardent leurs 3 crédits/jour
- Peuvent upgrade quand ils veulent

## ❓ FAQ Dev

### Comment tester les webhooks en local ?

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Comment voir les logs Stripe ?

```bash
stripe logs tail
```

### Comment annuler un abonnement ?

Dans Stripe Dashboard → Customers → Select customer → Subscriptions → Cancel

L'utilisateur retourne automatiquement au plan "free".

### Comment changer les prix ?

1. Créer de nouveaux Price IDs dans Stripe
2. Mettre à jour les variables d'environnement
3. Redéployer

## 📚 Documentation

- `STRIPE_PRODUCTS_SETUP.md` : Guide détaillé Stripe
- `DEPLOYMENT_GUIDE.md` : Guide de déploiement complet
- `.env.example` : Variables d'environnement nécessaires

## ✅ Checklist Complète

- [x] Migration Prisma
- [x] Page /billing
- [x] API create-checkout
- [x] API webhook
- [x] API scrape mise à jour
- [x] Fair use pour Pro
- [x] Page success
- [x] Variables d'environnement
- [x] Documentation
- [ ] **TOI** : Créer les produits Stripe
- [ ] **TOI** : Tester les paiements
- [ ] **TOI** : Déployer

## 🎉 C'est Prêt !

Tout est codé et prêt à fonctionner. Il te reste juste à :
1. Créer les 3 produits Stripe
2. Tester
3. Déployer

Bon courage ! 🚀

