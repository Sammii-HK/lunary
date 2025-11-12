# Stripe Promo Codes Setup

## Your Promo Codes

1. **1 Month Free**: `fvELIyJ1` (Promo Code ID: `promo_1SS5fLDA9sa1fEONEtJLcJAt`)
2. **3 Months Free (First 500)**: `promo_1SS5gPDA9sa1fEONwCAZxrjf`

## How It Works

### Option 1: Stripe Checkout Built-in Field (Recommended)

- **Enabled**: `allow_promotion_codes: true` is set in checkout session
- **User Experience**: Stripe Checkout will show a "Promo code" link/field automatically
- **No code needed**: Users can enter promo codes directly in Stripe Checkout

### Option 2: Pre-enter on Pricing Page

- Users can click "Have a promo code?" on pricing page
- Enter code before clicking "Start Free Trial"
- Code is passed to Stripe Checkout automatically

## Testing

1. Go to `/pricing`
2. Click "Have a promo code?" (optional - Stripe Checkout also has this)
3. Enter: `fvELIyJ1` or `promo_1SS5gPDA9sa1fEONwCAZxrjf`
4. Click "Start Free Trial"
5. In Stripe Checkout, you'll see the promo code field (if not pre-entered)
6. Complete checkout - discount should apply automatically

## Notes

- Stripe Checkout has a built-in promo code field when `allow_promotion_codes: true`
- Users can enter codes either:
  - On your pricing page (pre-filled)
  - Directly in Stripe Checkout (recommended)
- Both methods work - Stripe Checkout is more user-friendly

## Promo Code Details

### 1 Month Free (`fvELIyJ1`)

- Code: `fvELIyJ1`
- Promo ID: `promo_1SS5fLDA9sa1fEONEtJLcJAt`
- Discount: 1 month free

### 3 Months Free (First 500)

- Promo ID: `promo_1SS5gPDA9sa1fEONwCAZxrjf`
- Discount: 3 months free
- Limit: First 500 users
