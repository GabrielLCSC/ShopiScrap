# 🛒 Créer les Produits Stripe

Guide pour créer les 3 produits Stripe pour votre pricing.

## 📋 Résumé des Produits

| Plan | Prix | Type | Description |
|------|------|------|-------------|
| Day Pass | 4€ | One-time | 50 extractions valable 24h |
| Monthly Starter | 9€/mois | Récurrent | 200 extractions/mois |
| Pro | 19€/mois | Récurrent | Illimité (fair use) |

## 🔧 Étapes de Configuration

### 1. Accéder au Dashboard Stripe

1. Connectez-vous à [Stripe Dashboard](https://dashboard.stripe.com/)
2. Activez le **mode Test** (switch en haut à droite)

### 2. Créer le Produit "Day Pass"

**Étapes :**
1. Allez dans **Products** → **Add product**
2. Remplissez :
   - **Name** : `Day Pass`
   - **Description** : `50 extractions valables 24h`
   - **Pricing** :
     - **Type** : `One-time`
     - **Price** : `4 EUR`
   - **Currency** : `EUR`

3. Cliquez sur **Save product**
4. Copiez le **Price ID** (format : `price_xxxxx`)
5. Ajoutez-le dans `.env` :
   ```bash
   STRIPE_DAY_PASS_PRICE_ID="price_xxxxx"
   ```

### 3. Créer le Produit "Monthly Starter"

**Étapes :**
1. **Products** → **Add product**
2. Remplissez :
   - **Name** : `Monthly Starter`
   - **Description** : `200 extractions par mois`
   - **Pricing** :
     - **Type** : `Recurring`
     - **Price** : `9 EUR`
     - **Billing period** : `Monthly`
   - **Currency** : `EUR`

3. **Save product**
4. Copiez le **Price ID**
5. Ajoutez dans `.env` :
   ```bash
   STRIPE_MONTHLY_PRICE_ID="price_xxxxx"
   ```

### 4. Créer le Produit "Pro"

**Étapes :**
1. **Products** → **Add product**
2. Remplissez :
   - **Name** : `Pro`
   - **Description** : `Extractions illimitées (fair use policy)`
   - **Pricing** :
     - **Type** : `Recurring`
     - **Price** : `19 EUR`
     - **Billing period** : `Monthly`
   - **Currency** : `EUR`

3. **Save product**
4. Copiez le **Price ID**
5. Ajoutez dans `.env` :
   ```bash
   STRIPE_PRO_PRICE_ID="price_xxxxx"
   ```

## 🎯 Résultat dans `.env`

Votre fichier `.env` doit ressembler à :

```bash
# Stripe
STRIPE_SECRET_KEY="sk_test_51..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs
STRIPE_DAY_PASS_PRICE_ID="price_1QR8dGEhCOQ3456xyz"
STRIPE_MONTHLY_PRICE_ID="price_1QR8dHEhCOQ7890abc"
STRIPE_PRO_PRICE_ID="price_1QR8dIEhCOQ1234def"
```

## 🔄 Webhooks Configuration

### Créer le Webhook Endpoint

1. **Developers** → **Webhooks**
2. **Add endpoint**
3. URL :
   - **Dev** : Utilisez [Stripe CLI](https://stripe.com/docs/stripe-cli) pour tester localement
   - **Prod** : `https://votre-domaine.com/api/stripe/webhook`

4. **Events to listen** :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`

5. Copiez le **Signing secret** (format : `whsec_xxxxx`)
6. Ajoutez dans `.env` :
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
   ```

## 🧪 Test en Local

### 1. Installer Stripe CLI

```bash
brew install stripe/stripe-cli/stripe
# ou
npm install -g stripe
```

### 2. Login

```bash
stripe login
```

### 3. Forward Webhooks

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copiez le **webhook signing secret** qui s'affiche et ajoutez-le dans `.env.local`.

### 4. Tester un Paiement

1. Lancez votre app : `npm run dev`
2. Allez sur `/billing`
3. Cliquez sur un plan
4. Utilisez les cartes de test Stripe :
   - **Succès** : `4242 4242 4242 4242`
   - **Échec** : `4000 0000 0000 0002`
   - **3D Secure** : `4000 0025 0000 3155`
   - Date : N'importe quelle date future
   - CVC : N'importe quels 3 chiffres
   - ZIP : N'importe quel code

5. Vérifiez dans votre terminal que le webhook est reçu
6. Vérifiez dans votre DB que l'utilisateur a bien le plan activé

## 🚀 Passage en Production

### 1. Créer les Mêmes Produits en Mode Live

1. Switch Stripe en **mode Live**
2. Recréez les 3 produits (Day Pass, Monthly, Pro)
3. Copiez les nouveaux Price IDs
4. Mettez à jour les variables d'environnement sur Vercel

### 2. Créer le Webhook en Production

1. **Developers** → **Webhooks**
2. **Add endpoint**
3. URL : `https://votre-domaine.vercel.app/api/stripe/webhook`
4. Sélectionnez les mêmes événements
5. Copiez le **Signing secret**
6. Ajoutez-le dans Vercel :
   ```bash
   vercel env add STRIPE_WEBHOOK_SECRET
   ```

### 3. Variables Vercel

Dans Vercel Dashboard :

```bash
# Production
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_DAY_PASS_PRICE_ID="price_live_..."
STRIPE_MONTHLY_PRICE_ID="price_live_..."
STRIPE_PRO_PRICE_ID="price_live_..."
```

## ✅ Checklist

- [ ] Créer les 3 produits Stripe (Test mode)
- [ ] Copier les Price IDs dans `.env`
- [ ] Installer Stripe CLI
- [ ] Tester les paiements en local
- [ ] Vérifier que les webhooks fonctionnent
- [ ] Vérifier que les plans s'activent correctement
- [ ] Créer les produits en mode Live
- [ ] Configurer le webhook en production
- [ ] Tester un vrai paiement

## 🆘 Troubleshooting

### Webhook ne fonctionne pas

```bash
# Vérifier les logs Stripe
stripe logs tail

# Vérifier le endpoint
stripe webhooks list
```

### Paiement réussi mais plan non activé

1. Vérifiez les logs de votre API : `/api/stripe/webhook`
2. Vérifiez que le `metadata.userId` est bien présent
3. Vérifiez dans Stripe Dashboard → Logs

### Price ID invalide

```bash
# Lister tous les prix
stripe prices list

# Voir détails d'un prix
stripe prices retrieve price_xxxxx
```

## 📚 Ressources

- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Stripe Testing Cards](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

