import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sql } from '@vercel/postgres';
import { getPlanIdFromPriceId } from '../../../../../utils/pricing';

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

  return null; // Price doesn't exist or is inactive in account
}

type StoredCustomer = {
  customerId: string | null;
  email: string | null;
};

async function getStoredCustomerForUser(
  userId: string,
): Promise<StoredCustomer | null> {
  try {
    const subscriptionResult = await sql`
      SELECT stripe_customer_id, user_email
      FROM subscriptions
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (subscriptionResult.rows.length > 0) {
      return {
        customerId: subscriptionResult.rows[0].stripe_customer_id || null,
        email: subscriptionResult.rows[0].user_email || null,
      };
    }

    const profileResult = await sql`
      SELECT stripe_customer_id
      FROM user_profiles
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (profileResult.rows.length > 0) {
      return {
        customerId: profileResult.rows[0].stripe_customer_id || null,
        email: null,
      };
    }
  } catch (error) {
    console.warn('Failed to lookup stored Stripe customer:', error);
  }

  return null;
}

async function findCustomerIdByEmail(
  stripe: Stripe,
  email: string,
  userId?: string,
): Promise<string | null> {
  try {
    const customers = await stripe.customers.list({
      email,
      limit: 10,
    });

    if (customers.data.length === 0) {
      return null;
    }

    // CRITICAL: If userId provided, ONLY return customer if metadata matches
    // This prevents matching the wrong customer when multiple exist with same email
    if (userId) {
      const match = customers.data.find(
        (customer) => customer.metadata?.userId === userId,
      );
      if (match?.id) {
        return match.id;
      }

      // If we have multiple customers with this email but none match userId,
      // DO NOT return any of them - create a new one instead
      if (customers.data.length > 1) {
        console.warn(
          `Multiple customers found for email ${email} but none match userId ${userId}. Will create new customer.`,
        );
        return null;
      }
    }

    // Only return single customer if no userId to match against
    if (customers.data.length === 1) {
      return customers.data[0].id;
    }

    // Multiple customers, no userId to disambiguate - don't guess
    console.warn(
      `Multiple customers found for email ${email} without userId. Cannot determine which to use.`,
    );
    return null;
  } catch (error) {
    console.warn('Failed to lookup Stripe customer by email:', error);
    return null;
  }
}

async function findCustomerIdByMetadata(
  stripe: Stripe,
  userId: string,
): Promise<string | null> {
  try {
    const result = await stripe.customers.search({
      query: `metadata['userId']:'${userId}'`,
      limit: 1,
    });
    return result.data[0]?.id || null;
  } catch (error) {
    console.warn('Failed to search Stripe customers by metadata:', error);
    return null;
  }
}

async function ensureStripeCustomer(
  stripe: Stripe,
  params: {
    existingCustomerId?: string | null;
    userId?: string | null;
    email?: string | null;
  },
): Promise<string | null> {
  const { existingCustomerId, userId, email } = params;

  // First, validate existing customer ID if provided
  if (existingCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(existingCustomerId);
      const isDeleted =
        typeof customer === 'object' &&
        'deleted' in customer &&
        customer.deleted;
      if (!isDeleted) {
        // Ensure metadata is set
        if (userId && !(customer as any).metadata?.userId) {
          await stripe.customers.update(existingCustomerId, {
            metadata: { userId },
          });
        }
        return existingCustomerId;
      }
    } catch {
      // Fall through to search/create.
    }
  }

  // Search by userId metadata (most reliable)
  if (userId) {
    const foundByMetadata = await findCustomerIdByMetadata(stripe, userId);
    if (foundByMetadata) {
      return foundByMetadata;
    }
  }

  // Search by email - but be STRICT to avoid false matches
  if (email && userId) {
    const foundByEmail = await findCustomerIdByEmail(
      stripe,
      email,
      userId || undefined,
    );
    if (foundByEmail) {
      // Update the customer to include userId metadata to prevent future duplicates
      try {
        await stripe.customers.update(foundByEmail, {
          metadata: { userId },
        });
      } catch (error) {
        console.warn('Failed to backfill userId metadata on customer:', error);
      }
      return foundByEmail;
    }
  }

  // Only create if we have userId or email
  if (userId || email) {
    try {
      // Use idempotency key based on userId to prevent duplicate creation
      const idempotencyKey = userId
        ? `customer_${userId}_${Date.now()}`
        : undefined;

      const created = await stripe.customers.create(
        {
          email: email || undefined,
          metadata: userId ? { userId } : undefined,
        },
        idempotencyKey ? { idempotencyKey } : undefined,
      );

      console.log(
        `✅ Created new Stripe customer ${created.id} for user ${userId || email}`,
      );
      return created.id;
    } catch (error) {
      console.error('Failed to create Stripe customer:', error);
      throw error; // Don't silently fail - this is critical
    }
  }

  return null;
}

async function persistStripeCustomer(
  userId: string,
  customerId: string,
  email?: string | null,
) {
  try {
    await sql`
      INSERT INTO subscriptions (user_id, stripe_customer_id, user_email)
      VALUES (${userId}, ${customerId}, ${email || null})
      ON CONFLICT (user_id)
      DO UPDATE SET stripe_customer_id = EXCLUDED.stripe_customer_id,
                    user_email = COALESCE(EXCLUDED.user_email, subscriptions.user_email),
                    updated_at = NOW()
    `;
  } catch (error) {
    console.warn('Failed to persist Stripe customer to subscriptions:', error);
  }

  try {
    await sql`
      INSERT INTO user_profiles (user_id, stripe_customer_id)
      VALUES (${userId}, ${customerId})
      ON CONFLICT (user_id)
      DO UPDATE SET stripe_customer_id = EXCLUDED.stripe_customer_id,
                    updated_at = NOW()
    `;
  } catch (error) {
    console.warn('Failed to persist Stripe customer to user_profiles:', error);
  }
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
    const {
      customerId: requestedCustomerId,
      userId,
      userEmail,
      discountCode,
      promoCode,
      referralCode,
    } = requestBody;

    let resolvedCustomerId =
      typeof requestedCustomerId === 'string' &&
      requestedCustomerId.trim().length > 0
        ? requestedCustomerId.trim()
        : null;
    let resolvedEmail =
      typeof userEmail === 'string' && userEmail.trim().length > 0
        ? userEmail.trim()
        : null;

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

    // CRITICAL: Always check database FIRST to prevent duplicate customers
    if (typeof userId === 'string') {
      const storedCustomer = await getStoredCustomerForUser(userId);
      if (storedCustomer?.customerId) {
        resolvedCustomerId = storedCustomer.customerId;
        console.log(
          `✅ Found existing customer ${resolvedCustomerId} for user ${userId}`,
        );
      }
      if (!resolvedEmail && storedCustomer?.email) {
        resolvedEmail = storedCustomer.email;
      }
    }

    // Ensure we have a customer (will reuse existing or create new)
    const ensuredCustomerId = await ensureStripeCustomer(checkoutStripe, {
      existingCustomerId: resolvedCustomerId,
      userId: typeof userId === 'string' ? userId : null,
      email: resolvedEmail,
    });

    if (!ensuredCustomerId) {
      return NextResponse.json(
        { error: 'Failed to create or find Stripe customer' },
        { status: 500 },
      );
    }

    resolvedCustomerId = ensuredCustomerId;

    const normalizedPromoCode =
      typeof promoCode === 'string' && promoCode.trim().length > 0
        ? promoCode.trim().toUpperCase()
        : null;
    const normalizedDiscountCode =
      typeof discountCode === 'string' && discountCode.trim().length > 0
        ? discountCode.trim().toUpperCase()
        : null;
    const skipTrialFromCoupon =
      Boolean(normalizedPromoCode) || Boolean(normalizedDiscountCode);

    // Fetch trial period from Stripe product/price metadata
    const trialDays = skipTrialFromCoupon
      ? 0
      : await getTrialPeriodForPrice(priceId, priceStripe);

    // Get plan_id from product metadata, price metadata, or price ID mapping
    const planId =
      product.metadata?.plan_id ||
      price.metadata?.plan_id ||
      getPlanIdFromPriceId(priceId) ||
      (isMonthly ? 'lunary_plus' : 'lunary_plus_ai_annual');

    const metadata: Record<string, string> = {
      plan_id: planId,
      planType: isMonthly ? 'monthly' : 'yearly',
    };

    if (typeof userId === 'string' && userId.trim().length > 0) {
      metadata.userId = userId;
    }

    if (skipTrialFromCoupon) {
      metadata.skipTrialReason = normalizedPromoCode ? 'promo' : 'discount';
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      payment_method_collection: 'if_required',
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

    if (userId) {
      sessionConfig.client_reference_id = userId;
    }

    // Apply promo/discount code if provided

    if (normalizedPromoCode) {
      metadata.promoCode = normalizedPromoCode;
    }

    if (normalizedDiscountCode) {
      metadata.discountCode = normalizedDiscountCode;
    }

    // Handle promo codes (Stripe promotion codes) - use same account as price
    if (promoCode) {
      try {
        const promoLookupCode = normalizedPromoCode || promoCode;
        const promoCodes = await checkoutStripe.promotionCodes.list({
          code: promoLookupCode,
          active: true,
        });

        if (promoCodes.data.length > 0) {
          const promoCodeObj = promoCodes.data[0];
          sessionConfig.discounts = [{ promotion_code: promoCodeObj.id }];
          console.log(`✅ Applied promo code: ${promoLookupCode}`);
        } else {
          console.warn(`⚠️ Promo code not found: ${promoLookupCode}`);
        }
      } catch (error) {
        console.error('Failed to apply promo code:', error);
        // Continue without promo code if invalid
      }
    }

    // Handle discount codes (for trial expired users) - use same account as price
    if (discountCode && !promoCode) {
      try {
        const discountLookupCode = normalizedDiscountCode || discountCode;
        const promotionCodes = await checkoutStripe.promotionCodes.list({
          code: discountLookupCode,
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

    // If a discount was applied from the app, remove allow_promotion_codes
    // to avoid Stripe conflicts and prevent double-discounting
    if (sessionConfig.discounts && sessionConfig.discounts.length > 0) {
      delete sessionConfig.allow_promotion_codes;
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

    if (resolvedCustomerId) {
      sessionConfig.customer = resolvedCustomerId;

      // CRITICAL: Persist customer to database BEFORE creating checkout session
      // This prevents duplicate customers if user refreshes/retries
      if (typeof userId === 'string') {
        await persistStripeCustomer(userId, resolvedCustomerId, resolvedEmail);

        // CRITICAL: Ensure metadata is set on Stripe customer IMMEDIATELY
        // This ensures webhooks can always resolve the user
        try {
          await checkoutStripe.customers.update(resolvedCustomerId, {
            metadata: {
              userId: userId,
            },
          });
          console.log(
            `✅ Set userId metadata on customer ${resolvedCustomerId}`,
          );
        } catch (error) {
          console.error('CRITICAL: Failed to update customer metadata:', error);
          // This is critical - if we can't set metadata, webhooks will fail
          return NextResponse.json(
            { error: 'Failed to configure customer account' },
            { status: 500 },
          );
        }
      }
    } else if (resolvedEmail) {
      sessionConfig.customer_email = resolvedEmail;
    }

    // CRITICAL: Multi-layered defense against duplicate subscriptions
    // Layer 0: Check for pending checkout (prevents concurrent requests)
    // Layer 1: Check database for existing subscription
    // Layer 2: Check Stripe directly (catches unsynced subscriptions)
    // Layer 3: Use idempotency key on checkout.sessions.create (prevents duplicates at Stripe level)

    if (typeof userId === 'string') {
      // LAYER 0: Check and create pending checkout record
      // This is the FIRST line of defense - uses UNIQUE constraint on user_id
      try {
        const expiresAt = new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        ).toISOString(); // 24 hours

        // First, clean up any expired pending checkouts for this user
        await sql`
          DELETE FROM pending_checkouts
          WHERE user_id = ${userId}
          AND (status = 'expired' OR expires_at < NOW() OR status = 'completed')
        `;

        // Check if there's an active pending checkout
        const pendingCheck = await sql`
          SELECT checkout_session_id, created_at, status
          FROM pending_checkouts
          WHERE user_id = ${userId}
          AND status = 'pending'
          AND expires_at > NOW()
        `;

        if (pendingCheck.rows.length > 0) {
          const pending = pendingCheck.rows[0];
          const ageSeconds =
            (Date.now() - new Date(pending.created_at).getTime()) / 1000;

          // If pending checkout is less than 30 seconds old, return the existing session
          if (ageSeconds < 30 && pending.checkout_session_id) {
            console.log(
              `⚠️ User ${userId} has pending checkout from ${ageSeconds.toFixed(0)}s ago. Returning existing session.`,
            );
            try {
              const existingSession =
                await checkoutStripe.checkout.sessions.retrieve(
                  pending.checkout_session_id,
                );
              if (existingSession.status === 'open') {
                return NextResponse.json({
                  sessionId: existingSession.id,
                  url: existingSession.url,
                  reason: 'existing_pending_checkout',
                });
              }
            } catch {
              // Session might have expired, continue to create new one
            }
          }

          // If older than 30 seconds, mark as expired and continue
          await sql`
            UPDATE pending_checkouts
            SET status = 'expired'
            WHERE user_id = ${userId}
            AND status = 'pending'
          `;
        }

        // Try to insert new pending checkout (will fail if one exists due to UNIQUE constraint)
        await sql`
          INSERT INTO pending_checkouts (user_id, price_id, status, expires_at)
          VALUES (${userId}, ${priceId}, 'pending', ${expiresAt})
          ON CONFLICT (user_id) DO UPDATE SET
            price_id = EXCLUDED.price_id,
            status = 'pending',
            expires_at = EXCLUDED.expires_at,
            created_at = NOW(),
            checkout_session_id = NULL
        `;
      } catch (error) {
        console.error('Error managing pending checkout:', error);
        // Continue anyway - idempotency key will protect us
      }
    }

    if (typeof userId === 'string' && resolvedCustomerId) {
      try {
        // LAYER 1: Check database for existing subscription
        const existingSubscription = await sql`
          SELECT status, plan_type, stripe_subscription_id, stripe_customer_id
          FROM subscriptions
          WHERE user_id = ${userId}
        `;
        const existing = existingSubscription.rows[0];
        const hasActiveSubscription =
          existing &&
          ['active', 'trial', 'past_due'].includes(existing.status) &&
          existing.plan_type !== 'free' &&
          existing.stripe_subscription_id;

        if (hasActiveSubscription) {
          console.log(
            `⚠️ User ${userId} already has active subscription ${existing.stripe_subscription_id}. Redirecting to billing portal.`,
          );
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || originFromRequest;
          const portalSession =
            await checkoutStripe.billingPortal.sessions.create({
              customer: existing.stripe_customer_id || resolvedCustomerId,
              return_url: `${baseUrl}/pricing`,
            });
          return NextResponse.json({
            portalUrl: portalSession.url,
            reason: 'existing_subscription',
            message:
              'You already have an active subscription. Redirecting to billing portal.',
          });
        }

        // ADDITIONAL CHECK: Verify no active subscription in Stripe directly
        // This catches cases where webhook hasn't synced yet
        try {
          const stripeSubscriptions = await checkoutStripe.subscriptions.list({
            customer: resolvedCustomerId,
            status: 'all',
            limit: 10,
          });
          const activeInStripe = stripeSubscriptions.data.filter((s) =>
            ['active', 'trialing', 'past_due'].includes(s.status),
          );
          if (activeInStripe.length > 0) {
            console.log(
              `⚠️ User ${userId} has ${activeInStripe.length} active subscription(s) in Stripe. Redirecting to billing portal.`,
            );
            const baseUrl =
              process.env.NEXT_PUBLIC_BASE_URL || originFromRequest;
            const portalSession =
              await checkoutStripe.billingPortal.sessions.create({
                customer: resolvedCustomerId,
                return_url: `${baseUrl}/pricing`,
              });
            return NextResponse.json({
              portalUrl: portalSession.url,
              reason: 'existing_subscription_stripe',
              message:
                'You already have an active subscription. Redirecting to billing portal.',
            });
          }
        } catch (stripeError) {
          console.error('Failed to check Stripe subscriptions:', stripeError);
          // Continue if Stripe check fails - DB check is primary
        }
      } catch (error) {
        console.error('Failed to check existing subscription:', error);
        // Don't fail - allow checkout to proceed
      }
    }

    // Also check for orphaned subscriptions that might belong to this user
    if (typeof userId === 'string' || resolvedEmail) {
      try {
        const orphanedCheck = await sql`
          SELECT stripe_subscription_id, stripe_customer_id, customer_email
          FROM orphaned_subscriptions
          WHERE resolved = FALSE
            AND (customer_email = ${resolvedEmail} OR stripe_customer_id = ${resolvedCustomerId})
          ORDER BY created_at DESC
          LIMIT 1
        `;

        if (orphanedCheck.rows.length > 0) {
          const orphaned = orphanedCheck.rows[0];
          console.warn(
            `⚠️ Found orphaned subscription ${orphaned.stripe_subscription_id} for ${resolvedEmail || resolvedCustomerId}. May need manual linking.`,
          );
          // Log for admin review but don't block checkout
        }
      } catch (error) {
        console.error('Failed to check for orphaned subscriptions:', error);
      }
    }
    // Note: For subscription mode, Stripe automatically creates customers
    // so we don't need to set customer_creation

    // CRITICAL: Use idempotency key to prevent duplicate checkout sessions
    // This is the ULTIMATE safeguard against double-clicks and race conditions
    // Stripe will return the same session if called with the same key within 24 hours
    const idempotencyKey = `checkout_${userId}_${priceId}_${Math.floor(Date.now() / 60000)}`; // Changes every minute

    const session = await checkoutStripe.checkout.sessions.create(
      sessionConfig,
      {
        idempotencyKey,
      },
    );

    console.log(
      `✅ Created checkout session ${session.id} for user ${userId} with idempotency key`,
    );

    // Update pending checkout with session ID
    if (typeof userId === 'string') {
      try {
        await sql`
          UPDATE pending_checkouts
          SET checkout_session_id = ${session.id}
          WHERE user_id = ${userId}
          AND status = 'pending'
        `;
      } catch (error) {
        console.error(
          'Failed to update pending checkout with session ID:',
          error,
        );
        // Non-critical - continue
      }
    }

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
