import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe(secretKey?: string) {
  const key = secretKey || process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
  }
  return new Stripe(key);
}

function sanitizeForLog(value: unknown): string {
  if (typeof value !== 'string') {
    return String(value);
  }
  // Remove newline and carriage return characters to prevent log injection
  return value.replace(/[\r\n]/g, '');
}

async function findCustomerAccount(customerId: string): Promise<Stripe | null> {
  // Try new account first
  const newStripe = getStripe();
  try {
    await newStripe.customers.retrieve(customerId);
    return newStripe;
  } catch {
    // Not in new account
  }

  // Try legacy account if configured
  if (process.env.STRIPE_SECRET_KEY_LEGACY) {
    const legacyStripe = getStripe(process.env.STRIPE_SECRET_KEY_LEGACY);
    try {
      await legacyStripe.customers.retrieve(customerId);
      console.log(
        `[checkout] Using legacy Stripe for ${sanitizeForLog(customerId)}`,
      );
      return legacyStripe;
    } catch {
      // Not in legacy either
    }
  }

  return null; // Customer doesn't exist in either account
}

async function findPriceAccount(priceId: string): Promise<Stripe | null> {
  // Try new account first
  const newStripe = getStripe();
  try {
    const price = await newStripe.prices.retrieve(priceId);
    // Check if price is active
    if (price.active) {
      return newStripe;
    } else {
      const safePriceId = sanitizeForLog(priceId);
      console.warn(
        `Price ${safePriceId} exists but is inactive in primary account`,
      );
    }
  } catch (error: any) {
    // Log the error for debugging
    if (error?.code !== 'resource_missing') {
      console.warn(`Error checking price in primary account:`, error?.message);
    }
  }

  // Try legacy account if configured
  if (process.env.STRIPE_SECRET_KEY_LEGACY) {
    const legacyStripe = getStripe(process.env.STRIPE_SECRET_KEY_LEGACY);
    try {
      const price = await legacyStripe.prices.retrieve(priceId);
      // Check if price is active
      if (price.active) {
        const safePriceId = sanitizeForLog(priceId);
        console.log(`[checkout] Using legacy Stripe for price ${safePriceId}`);
        return legacyStripe;
      } else {
        const safePriceId = sanitizeForLog(priceId);
        console.warn(
          `Price ${safePriceId} exists but is inactive in legacy account`,
        );
      }
    } catch (error: any) {
      // Log the error for debugging
      if (error?.code !== 'resource_missing') {
        console.warn(`Error checking price in legacy account:`, error?.message);
      }
    }
  }

  return null; // Price doesn't exist or is inactive in either account
}

// Helper function to get trial period from Stripe product/price metadata
async function getTrialPeriodForPrice(
  priceId: string,
  stripeInstance?: Stripe,
): Promise<number> {
  try {
    const stripe = stripeInstance || getStripe();
    // Get the price and its associated product
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product'],
    });

    const product = price.product as Stripe.Product;

    // Check for trial period in product metadata first, then price metadata
    const trialPeriodDays =
      product.metadata?.trial_period_days ||
      price.metadata?.trial_period_days ||
      // Fallback to default values if no metadata is set
      (price.recurring?.interval === 'month' ? '7' : '14');

    return parseInt(trialPeriodDays);
  } catch (error) {
    console.error('Error fetching trial period from Stripe:', error);
    // Fallback to default values in case of error
    return 7; // default monthly trial
  }
}

export async function POST(request: NextRequest) {
  let priceId: string | undefined;
  try {
    // Will be set after finding the price account
    let stripe = getStripe();
    const requestBody = await request.json();
    priceId = requestBody.priceId;
    const { customerId, userId } = requestBody;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 },
      );
    }

    // Build base URL from request if env not set
    const originFromRequest = new URL(request.url).origin;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || originFromRequest;

    // Find which Stripe account has this price
    let priceStripe = await findPriceAccount(priceId);
    if (!priceStripe) {
      // Try to find an equivalent price from the mapping (e.g., if GBP price missing, use USD)
      const safePriceId = sanitizeForLog(priceId);
      console.warn(
        `Price ${safePriceId} not found in Stripe. Attempting to find equivalent price...`,
      );
      try {
        const { STRIPE_PRICE_MAPPING } =
          await import('../../../../../utils/stripe-prices');

        // Find which plan this price belongs to
        let equivalentPriceId: string | null = null;
        let foundPlanId: string | null = null;
        for (const [planId, currencies] of Object.entries(
          STRIPE_PRICE_MAPPING,
        )) {
          for (const currencyData of Object.values(
            currencies as Record<string, { priceId: string }>,
          )) {
            if (currencyData.priceId === priceId) {
              foundPlanId = planId;
              // Found the plan, try to get USD price as fallback
              const usdPrice = (currencies as any)['USD'];
              if (usdPrice) {
                equivalentPriceId = usdPrice.priceId;
                console.log(
                  `Found equivalent USD price ${sanitizeForLog(equivalentPriceId)} for plan ${sanitizeForLog(planId)}`,
                );
                break;
              }
            }
          }
          if (equivalentPriceId) break;
        }

        if (equivalentPriceId && foundPlanId) {
          console.log(
            `Attempting to use equivalent USD price ${sanitizeForLog(equivalentPriceId)} for plan ${sanitizeForLog(foundPlanId)}`,
          );
          // Try the equivalent price
          priceStripe = await findPriceAccount(equivalentPriceId);
          if (priceStripe) {
            console.log(
              `✅ Successfully using equivalent price ${sanitizeForLog(equivalentPriceId)} instead of ${sanitizeForLog(priceId)}`,
            );
            priceId = equivalentPriceId;
          } else {
            console.error(
              `❌ Equivalent USD price ${sanitizeForLog(equivalentPriceId)} also not found in Stripe. Attempting to find any active price for plan ${sanitizeForLog(foundPlanId)}...`,
            );
            // Last resort: try to find ANY active price for this plan in Stripe
            try {
              const primaryStripe = getStripe();
              // Search for products with this plan_id
              const products = await primaryStripe.products.search({
                query: `metadata['plan_id']:'${foundPlanId}'`,
                limit: 1,
              });

              if (products.data.length > 0) {
                const product = products.data[0];
                // Get active prices for this product
                const prices = await primaryStripe.prices.list({
                  product: product.id,
                  active: true,
                  limit: 10,
                });

                if (prices.data.length > 0) {
                  // Use the first active price we find
                  const activePrice = prices.data[0];
                  console.log(
                    `✅ Found active price ${sanitizeForLog(activePrice.id)} for plan ${sanitizeForLog(foundPlanId)} in Stripe`,
                  );
                  priceId = activePrice.id;
                  priceStripe = primaryStripe;
                } else {
                  // Try legacy account
                  if (process.env.STRIPE_SECRET_KEY_LEGACY) {
                    const legacyStripe = getStripe(
                      process.env.STRIPE_SECRET_KEY_LEGACY,
                    );
                    const legacyProducts = await legacyStripe.products.search({
                      query: `metadata['plan_id']:'${foundPlanId}'`,
                      limit: 1,
                    });
                    if (legacyProducts.data.length > 0) {
                      const legacyProduct = legacyProducts.data[0];
                      const legacyPrices = await legacyStripe.prices.list({
                        product: legacyProduct.id,
                        active: true,
                        limit: 10,
                      });
                      if (legacyPrices.data.length > 0) {
                        const activePrice = legacyPrices.data[0];
                        console.log(
                          `✅ Found active price ${sanitizeForLog(activePrice.id)} for plan ${sanitizeForLog(foundPlanId)} in legacy Stripe`,
                        );
                        priceId = activePrice.id;
                        priceStripe = legacyStripe;
                      }
                    }
                  }
                }
              }

              if (!priceStripe) {
                const safePriceId = sanitizeForLog(priceId);
                const safePlanId = sanitizeForLog(foundPlanId);
                return NextResponse.json(
                  {
                    error: 'Price not found',
                    details: `Price ${safePriceId} and no active prices found for plan ${safePlanId} in any Stripe account. Please run 'npm run generate-price-mapping' to update price mappings or create missing prices in Stripe.`,
                  },
                  { status: 404 },
                );
              }
            } catch (searchError) {
              console.error(
                'Error searching for prices in Stripe:',
                searchError,
              );
              const safePriceId = sanitizeForLog(priceId);
              return NextResponse.json(
                {
                  error: 'Price not found',
                  details: `Price ${safePriceId} not found and could not search for alternatives. Please contact support.`,
                },
                { status: 404 },
              );
            }
          }
        } else {
          const safePriceId = sanitizeForLog(priceId);
          console.error(
            `❌ Could not find plan for price ${safePriceId} or no USD equivalent available`,
          );
          return NextResponse.json(
            {
              error: 'Price not found',
              details: `Price ${safePriceId} not found in any Stripe account and no equivalent price available. Please contact support.`,
            },
            { status: 404 },
          );
        }
      } catch (mappingError) {
        console.error('Error finding equivalent price:', mappingError);
        const safePriceId = sanitizeForLog(priceId);
        return NextResponse.json(
          {
            error: 'Price not found',
            details: `Price ${safePriceId} not found in any Stripe account. Please contact support.`,
          },
          { status: 404 },
        );
      }
    }

    // Get the price to determine trial period from Stripe
    const price = await priceStripe.prices.retrieve(priceId, {
      expand: ['product'],
    });
    const product = price.product as Stripe.Product;
    const isMonthly = price.recurring?.interval === 'month';

    // Use the same Stripe account for checkout session
    const checkoutStripe = priceStripe;

    // Fetch trial period from Stripe product/price metadata
    const trialDays = await getTrialPeriodForPrice(priceId, priceStripe);

    // Get plan_id from product metadata, price metadata, or price ID mapping
    const planId =
      product.metadata?.plan_id ||
      price.metadata?.plan_id ||
      (await import('../../../../../utils/pricing')).getPlanIdFromPriceId(
        priceId,
      ) ||
      (isMonthly ? 'lunary_plus' : 'lunary_plus_ai_annual');

    const metadata: Record<string, string> = {
      plan_id: planId,
      planType: isMonthly ? 'monthly' : 'yearly',
    };

    if (typeof userId === 'string' && userId.trim().length > 0) {
      metadata.userId = userId;
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      subscription_data: {
        trial_period_days: trialDays,
        metadata,
      },
      metadata,
      // Enable promo codes in Stripe Checkout
      allow_promotion_codes: true,
    };

    // Apply promo/discount code if provided
    const { discountCode, promoCode, referralCode } = requestBody;

    // Handle promo codes (Stripe promotion codes) - use same account as price
    if (promoCode) {
      try {
        const promoCodes = await checkoutStripe.promotionCodes.list({
          code: promoCode,
          active: true,
        });

        if (promoCodes.data.length > 0) {
          const promoCodeObj = promoCodes.data[0];
          sessionConfig.discounts = [{ promotion_code: promoCodeObj.id }];
          console.log(`✅ Applied promo code: ${promoCode}`);
        } else {
          console.warn(`⚠️ Promo code not found: ${promoCode}`);
        }
      } catch (error) {
        console.error('Failed to apply promo code:', error);
        // Continue without promo code if invalid
      }
    }

    // Handle discount codes (for trial expired users - legacy) - use same account as price
    if (discountCode && !promoCode) {
      try {
        const promotionCodes = await checkoutStripe.promotionCodes.list({
          code: discountCode,
          limit: 1,
        });
        if (promotionCodes.data.length > 0) {
          sessionConfig.discounts = [
            { promotion_code: promotionCodes.data[0].id },
          ];
        }
      } catch (error) {
        console.error('Failed to apply discount code:', error);
        // Continue without discount if code is invalid
      }
    }

    // Handle referral code
    if (referralCode) {
      try {
        const { validateReferralCode } = await import('@/lib/referrals');
        const validation = await validateReferralCode(referralCode);
        if (validation.valid) {
          // Store referral code in metadata to process after successful checkout
          metadata.referralCode = referralCode;
          if (validation.userId) {
            metadata.referrerUserId = validation.userId;
          }
        }
      } catch (error) {
        console.error('Failed to validate referral code:', error);
        // Continue without referral if code is invalid
      }
    }

    // If we have a customer ID, verify it exists in the SAME account as the price
    if (customerId) {
      // Check if customer exists in the same account as the price
      let customerExistsInPriceAccount = false;
      try {
        await checkoutStripe.customers.retrieve(customerId);
        customerExistsInPriceAccount = true;
      } catch {
        // Customer doesn't exist in price account
      }

      if (customerExistsInPriceAccount) {
        // Customer exists in same account as price, use it
        sessionConfig.customer = customerId;
        // Update customer metadata with userId if provided
        if (userId) {
          try {
            await checkoutStripe.customers.update(customerId, {
              metadata: {
                userId: userId,
              },
            });
          } catch (error) {
            console.warn('Failed to update customer metadata:', error);
            // Continue anyway - metadata update failure shouldn't block checkout
          }
        }
      } else {
        // Customer doesn't exist in price account, don't use it
        const safeCustomerId = sanitizeForLog(customerId);
        console.warn(
          `Customer ${safeCustomerId} not found in price account, creating new customer`,
        );
        // Fall through to create new customer with userId in metadata
        if (userId) {
          metadata.userId = userId;
        }
      }
    } else if (userId) {
      // If no customer ID but we have userId, store it in customer metadata
      // Stripe will create the customer, and we'll update metadata via webhook
      sessionConfig.customer_email = undefined; // Let Stripe collect email
      // Store userId in session metadata so webhook can update customer
      metadata.userId = userId;
    }
    // Note: For subscription mode, Stripe automatically creates customers
    // so we don't need to set customer_creation

    const session =
      await checkoutStripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      priceId,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    });
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
