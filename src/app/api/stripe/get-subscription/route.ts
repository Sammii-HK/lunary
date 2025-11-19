import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sql } from '@vercel/postgres';
import { normalizePlanType } from '../../../../../utils/pricing';

// Cache subscription checks for 5 minutes to reduce CPU/API calls
// Subscription status changes infrequently, and users can force refresh via button
export const revalidate = 300;

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    const isPreview =
      process.env.VERCEL_ENV === 'preview' ||
      process.env.NODE_ENV === 'development';
    if (isPreview) {
      console.warn(
        '[get-subscription] STRIPE_SECRET_KEY not set in preview/dev environment - subscription checks will use database only',
      );
      return null;
    }
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

async function getPlanTypeFromSubscription(
  subscription: Stripe.Subscription,
  stripe: Stripe,
): Promise<string> {
  // First try to get plan_id from subscription metadata
  const planIdFromMetadata = subscription.metadata?.plan_id;
  if (planIdFromMetadata) {
    return planIdFromMetadata;
  }

  // Try to get from price metadata
  const priceId = subscription.items.data[0]?.price?.id;
  if (priceId) {
    try {
      const price = await stripe.prices.retrieve(priceId, {
        expand: ['product'],
      });
      const product = price.product as Stripe.Product;

      const planIdFromPrice =
        price.metadata?.plan_id || product.metadata?.plan_id;
      if (planIdFromPrice) {
        return planIdFromPrice;
      }

      // Fallback to price ID mapping
      const { getPlanIdFromPriceId } = await import(
        '../../../../../utils/pricing'
      );
      const mappedPlanId = getPlanIdFromPriceId(priceId);
      if (mappedPlanId) {
        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[getPlanTypeFromSubscription] Mapped plan from price ID ${priceId}: ${mappedPlanId}`,
          );
        }
        return mappedPlanId;
      } else {
        console.warn(
          `[getPlanTypeFromSubscription] Price ID ${priceId} not found in mapping. Available env vars:`,
          {
            LUNARY_PLUS: !!process.env.NEXT_PUBLIC_STRIPE_LUNARY_PLUS_PRICE_ID,
            LUNARY_PLUS_AI:
              !!process.env.NEXT_PUBLIC_STRIPE_LUNARY_PLUS_AI_PRICE_ID,
            LUNARY_PLUS_AI_ANNUAL:
              !!process.env.NEXT_PUBLIC_STRIPE_LUNARY_PLUS_AI_ANNUAL_PRICE_ID,
          },
        );
      }
    } catch (error) {
      console.error('Failed to retrieve price metadata:', error);
    }
  }

  // Final fallback: use interval-based mapping for backward compatibility
  // Note: This is less ideal - prefer using price ID mapping or metadata
  // WARNING: This fallback cannot distinguish between lunary_plus and lunary_plus_ai monthly plans
  // Only use this fallback if we have actual subscription items (subscription exists)
  if (
    subscription.items &&
    subscription.items.data &&
    subscription.items.data.length > 0
  ) {
    const interval = subscription.items.data[0]?.price?.recurring?.interval;
    if (interval) {
      console.warn(
        `[getPlanTypeFromSubscription] Using interval-based fallback for ${interval} subscription. Price ID mapping should have caught this.`,
      );
      // For monthly, default to lunary_plus (lower tier) - this is conservative
      // For yearly, default to lunary_plus_ai_annual (only yearly plan available)
      return interval === 'month' ? 'lunary_plus' : 'lunary_plus_ai_annual';
    }
  }

  // If we truly can't determine, return free as safest default
  console.error(
    '[getPlanTypeFromSubscription] Could not determine plan type from subscription',
  );
  return 'free';
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe not configured',
          message:
            'Stripe API not available in this environment - use database subscription',
          useDatabaseFallback: true,
        },
        { status: 503 },
      );
    }
    let body;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        return NextResponse.json(
          { error: 'Request body is required' },
          { status: 400 },
        );
      }
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 },
      );
    }

    const { customerId, userId, forceRefresh } = body;

    // ALWAYS prioritize userId-based lookup if userId is provided
    // This ensures we get the correct customer even if customerId is from another account
    let resolvedCustomerId = customerId;

    if (userId) {
      try {
        // Search for customer by userId in metadata (this is the source of truth)
        const customers = await stripe.customers.search({
          query: `metadata['userId']:'${userId}'`,
          limit: 1,
        });
        if (customers.data.length > 0) {
          const userIdMatchedCustomer = customers.data[0].id;

          // If we found a customer by userId, use it (even if different from provided customerId)
          if (userIdMatchedCustomer !== customerId) {
            console.log(
              `[get-subscription] userId ${userId} maps to customer ${userIdMatchedCustomer}, but provided customerId was ${customerId}. Using userId-matched customer.`,
            );
          }
          resolvedCustomerId = userIdMatchedCustomer;
          console.log(
            `[get-subscription] Found customer ${resolvedCustomerId} by userId ${userId}`,
          );
        } else if (customerId) {
          // No customer found by userId, but we have customerId - verify it matches userId
          try {
            const providedCustomer =
              await stripe.customers.retrieve(customerId);
            const providedCustomerUserId = (providedCustomer as any).metadata
              ?.userId;

            if (providedCustomerUserId && providedCustomerUserId !== userId) {
              // Customer ID belongs to a different user - don't use it
              console.warn(
                `[get-subscription] Provided customerId ${customerId} belongs to userId ${providedCustomerUserId}, but request is for userId ${userId}. Ignoring customerId.`,
              );
              resolvedCustomerId = null; // Force email lookup
            } else if (!providedCustomerUserId) {
              // Customer exists but has no userId metadata - update it
              try {
                await stripe.customers.update(customerId, {
                  metadata: { userId: userId },
                });
                console.log(
                  `[get-subscription] Updated customer ${customerId} metadata with userId ${userId}`,
                );
                resolvedCustomerId = customerId;
              } catch (updateError) {
                console.warn(
                  '[get-subscription] Failed to update customer metadata:',
                  updateError,
                );
              }
            } else {
              // Customer matches userId - use it
              resolvedCustomerId = customerId;
            }
          } catch (retrieveError) {
            console.warn(
              '[get-subscription] Failed to retrieve provided customer:',
              retrieveError,
            );
            resolvedCustomerId = null; // Force email lookup
          }
        }
      } catch (error) {
        console.warn(
          '[get-subscription] Failed to search for customer by userId:',
          error,
        );
        // Continue with customerId if provided, or fall back to email lookup
      }
    }

    // If still no customerId but we have userId, try email lookup as fallback
    if (!resolvedCustomerId && userId) {
      try {
        // Get user email from database
        const { sql } = await import('@vercel/postgres');
        const userResult = await sql`
          SELECT email FROM users WHERE id = ${userId} LIMIT 1
        `;
        if (userResult.rows.length > 0 && userResult.rows[0].email) {
          const userEmail = userResult.rows[0].email;
          // Get ALL customers with this email (Stripe allows multiple)
          const customers = await stripe.customers.list({
            email: userEmail,
            limit: 100, // Get all to find the right one
          });

          if (customers.data.length > 0) {
            // Priority 1: Find customer with matching userId in metadata
            let matchingCustomer = customers.data.find(
              (c) => (c.metadata as any)?.userId === userId,
            );

            // Priority 2: If no match, find customer with active subscription
            if (!matchingCustomer) {
              for (const customer of customers.data) {
                const subscriptions = await stripe.subscriptions.list({
                  customer: customer.id,
                  status: 'all',
                  limit: 1,
                });
                const hasActiveSub = subscriptions.data.some(
                  (sub) =>
                    sub.status === 'active' ||
                    sub.status === 'trialing' ||
                    sub.status === 'past_due',
                );
                if (hasActiveSub) {
                  matchingCustomer = customer;
                  break;
                }
              }
            }

            // Priority 3: If still no match, use most recently created customer
            if (!matchingCustomer) {
              matchingCustomer = customers.data.sort(
                (a, b) => b.created - a.created,
              )[0];
            }

            resolvedCustomerId = matchingCustomer.id;
            console.log(
              `[get-subscription] Found customer ${resolvedCustomerId} by email ${userEmail} (from ${customers.data.length} customers with same email)`,
            );

            // Update customer metadata with userId for future lookups
            try {
              await stripe.customers.update(resolvedCustomerId, {
                metadata: { userId: userId },
              });
              console.log(
                `[get-subscription] Updated customer ${resolvedCustomerId} metadata with userId ${userId}`,
              );
            } catch (updateError) {
              console.warn(
                '[get-subscription] Failed to update customer metadata:',
                updateError,
              );
            }
          }
        }
      } catch (error) {
        console.warn(
          '[get-subscription] Failed to lookup customer by email:',
          error,
        );
      }
    }

    if (!resolvedCustomerId) {
      return NextResponse.json(
        {
          error: 'Customer ID is required',
          message:
            'Could not find Stripe customer. Please ensure you have completed checkout.',
        },
        { status: 400 },
      );
    }

    // Get customer to retrieve userId and email for database sync
    let userIdToUse: string | null = userId || null;
    let userEmail: string | null = null;
    try {
      const customer = await stripe.customers.retrieve(resolvedCustomerId);
      if (!userIdToUse) {
        userIdToUse = (customer as any).metadata?.userId || null;
      }
      userEmail = (customer as any).email || null;
    } catch (error) {
      console.warn('[get-subscription] Failed to retrieve customer:', error);
    }

    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: resolvedCustomerId,
      status: 'all', // Include all statuses
      limit: 10,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No subscriptions found for this customer',
        subscription: null,
      });
    }

    // Get the most recent subscription (active or trial first, then most recent)
    const activeSubscription = subscriptions.data.find((sub) =>
      ['active', 'trialing'].includes(sub.status),
    );

    const subscription = activeSubscription || subscriptions.data[0];

    // Extract plan_id from subscription metadata
    const rawPlanType = await getPlanTypeFromSubscription(subscription, stripe);
    const planType = normalizePlanType(rawPlanType);

    // Map Stripe status to database status
    const rawStatus = subscription.status;
    const mappedStatus =
      rawStatus === 'trialing'
        ? 'trial'
        : rawStatus === 'active'
          ? 'active'
          : rawStatus === 'canceled'
            ? 'cancelled'
            : rawStatus === 'past_due'
              ? 'past_due'
              : 'free';

    // Update database with fresh Stripe data so future checks are correct
    // This ensures all routes that fetch from Stripe automatically have DB updated
    if (userIdToUse || userEmail) {
      try {
        const trialEndsAt = subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null;
        const currentPeriodEnd = (subscription as any).current_period_end
          ? new Date(
              (subscription as any).current_period_end * 1000,
            ).toISOString()
          : null;

        if (userIdToUse) {
          // Update by user_id (preferred)
          await sql`
            INSERT INTO subscriptions (
              user_id, user_email, status, plan_type, stripe_customer_id,
              stripe_subscription_id, trial_ends_at, current_period_end
            ) VALUES (
              ${userIdToUse}, ${userEmail}, ${mappedStatus}, ${planType},
              ${resolvedCustomerId}, ${subscription.id}, ${trialEndsAt}, ${currentPeriodEnd}
            )
            ON CONFLICT (user_id) DO UPDATE SET
              status = EXCLUDED.status,
              plan_type = EXCLUDED.plan_type,
              stripe_customer_id = EXCLUDED.stripe_customer_id,
              stripe_subscription_id = EXCLUDED.stripe_subscription_id,
              trial_ends_at = EXCLUDED.trial_ends_at,
              current_period_end = EXCLUDED.current_period_end,
              user_email = COALESCE(EXCLUDED.user_email, subscriptions.user_email),
              updated_at = NOW()
          `;
          console.log(
            `[get-subscription] ✅ Synced subscription to database for user ${userIdToUse}: plan=${planType}, status=${mappedStatus}`,
          );
        } else if (userEmail) {
          // Update by email if user_id not available
          await sql`
            UPDATE subscriptions
            SET
              status = ${mappedStatus},
              plan_type = ${planType},
              stripe_customer_id = ${resolvedCustomerId},
              stripe_subscription_id = ${subscription.id},
              trial_ends_at = ${trialEndsAt},
              current_period_end = ${currentPeriodEnd},
              updated_at = NOW()
            WHERE user_email = ${userEmail}
          `;
          console.log(
            `[get-subscription] ✅ Updated subscription in database for email ${userEmail}: plan=${planType}, status=${mappedStatus}`,
          );
        }
      } catch (dbError) {
        console.error('[get-subscription] Failed to update database:', dbError);
        // Don't fail the request if DB update fails - subscription data is still valid
      }
    } else {
      console.warn(
        '[get-subscription] Cannot update database: no userId or email available',
      );
    }

    // Determine cache headers based on forceRefresh
    const cacheHeaders: Record<string, string> = forceRefresh
      ? {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        }
      : {
          // Cache for 5 minutes, allow stale-while-revalidate for 10 minutes
          // Reduces Stripe API calls significantly - users can force refresh via button
          'Cache-Control':
            'private, s-maxage=300, stale-while-revalidate=600, must-revalidate',
        };

    // Check if resolved customerId differs from provided customerId
    const customerIdChanged =
      customerId && resolvedCustomerId !== customerId ? true : false;

    return NextResponse.json(
      {
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          customerId: resolvedCustomerId, // Use resolved customerId, not subscription.customer
          customer: resolvedCustomerId,
          plan: planType,
          planName: planType, // Include planName for compatibility
          rawPlan: rawPlanType,
          current_period_end: (subscription as any).current_period_end || null,
          trial_end: (subscription as any).trial_end || null,
          trialEnd: (subscription as any).trial_end || null, // Include both formats
          items: subscription.items,
          created: subscription.created,
        },
        message: `Found ${subscription.status} subscription`,
        customerIdChanged, // Flag to indicate customerId was resolved differently
        resolvedCustomerId, // Always include resolved customerId
      },
      {
        headers: cacheHeaders,
      },
    );
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
