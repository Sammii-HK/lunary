# Digital Shop System

A complete digital product shop built for Lunary, featuring automatic pack generation, Stripe integration, and secure downloads.

## ✨ Features

- **🤖 Automatic Pack Generation**: Programmatically creates digital products (PDFs) based on category and specifications
- **🔒 Secure Stripe Integration**: Full payment processing with webhooks
- **☁️ Vercel Blob Storage**: Secure file storage with private access
- **🔐 Secure Downloads**: Token-based download system with expiry and limits
- **📱 Responsive Shop Interface**: Beautiful, mobile-friendly shopping experience
- **⚡ OG Image Generation**: Dynamic pack preview images
- **🛠️ Admin Interface**: Easy pack management and generation

## 🏗️ Architecture

### Core Components

1. **Pack Generation API** (`/api/shop/packs/generate`)
   - Generates content based on category (moon phases, crystals, spells, etc.)
   - Creates PDF files using pdf-lib
   - Uploads to Vercel Blob with private access
   - Generates OG images for previews

2. **Stripe Integration** (`/api/shop/`)
   - Creates products and prices in Stripe
   - Handles checkout sessions
   - Processes webhooks for payment confirmation

3. **Purchase Flow** (`/api/shop/purchases`)
   - Creates secure checkout sessions
   - Generates download tokens
   - Tracks purchase status

4. **Secure Downloads** (`/api/shop/download/[token]`)
   - Token-based authentication
   - Download limits (5 per purchase)
   - 30-day expiry
   - Signed URL generation

5. **Shop Interface** (`/shop`)
   - Category filtering
   - Real-time product display
   - Stripe Checkout integration

6. **Admin Panel** (`/admin/shop`)
   - Pack generation interface
   - Product management
   - Stripe product creation

## 🚀 Getting Started

### Environment Variables

Add these to your `.env.local`:

```env
# Stripe (required)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET_SHOP=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Vercel Blob (required)
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# App URL (required for webhooks)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Stripe Setup

1. Create products in Stripe Dashboard or use the admin interface
2. Set up webhook endpoint: `https://yourdomain.com/api/shop/webhooks`
3. Configure webhook events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### Usage

1. **Generate Packs**: Visit `/admin/shop` to create new digital products
2. **Shop Interface**: Users can browse and purchase at `/shop`
3. **Download**: After purchase, users get secure download links

## 📦 Pack Categories

### Moon Phases

- Yearly, quarterly, or monthly moon phase guides
- Includes lunar calendars and spiritual guidance
- Automatically fetches real astronomical data

### Crystals

- Crystal healing guides
- Properties, chakras, and usage instructions
- Comprehensive crystal databases

### Spells

- Sacred ritual collections
- Protection, abundance, love spells
- Ingredient lists and instructions

### Tarot

- Tarot card meanings and spreads
- Major and minor arcana guides
- Personalized reading techniques

### Astrology

- Planetary transit guides
- Birth chart interpretations
- Astrological calendars

### Seasonal

- Seasonal celebration guides
- Sabbat rituals and traditions
- Nature-based spiritual practices

## 🛡️ Security Features

- **Private Blob Storage**: Files stored with private access
- **Token Authentication**: Secure download tokens
- **Download Limits**: Prevents abuse (5 downloads max)
- **Expiry System**: Downloads expire after 30 days
- **Stripe Security**: PCI-compliant payment processing
- **Webhook Verification**: Stripe webhook signature verification

## 🎨 Customization

### Adding New Categories

1. Update the category enum in `schema.ts`
2. Add generation logic in `/api/shop/packs/generate`
3. Update category mappings in `utils/shop.ts`
4. Add category-specific UI elements

### Custom Pack Templates

Modify the generation functions in `/api/shop/packs/generate/route.ts`:

```typescript
async function generateCustomPack(
  name: string,
  description: string,
  options: CustomOptions,
): Promise<PackContent> {
  // Your custom generation logic
}
```

## 📊 Analytics & Monitoring

- Purchase tracking through Stripe Dashboard
- Download analytics via webhook processing
- Error monitoring in server logs
- User behavior tracking (implement as needed)

## 🔧 Development

### Running Locally

```bash
npm run dev
# or
yarn dev
```

### Testing Payments

Use Stripe test cards:

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### Webhook Testing

Use Stripe CLI for local webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/shop/webhooks
```

## 🚀 Deployment

1. Deploy to Vercel (or your preferred platform)
2. Set up environment variables
3. Configure Stripe webhooks with production URL
4. Test payment flow end-to-end

## 📝 TODO / Future Enhancements

- [ ] Database integration (replace mock data)
- [ ] User purchase history
- [ ] Bulk pack operations
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Subscription-based products
- [ ] Pack bundles and discounts
- [ ] Multi-language support
- [ ] Mobile app integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This shop system is part of the Lunary project and follows the same license terms.
