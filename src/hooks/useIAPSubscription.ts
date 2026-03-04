import {
  Purchases,
  PURCHASES_ERROR_CODE,
} from '@revenuecat/purchases-capacitor';
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';

// RevenueCat entitlement IDs — must match what's configured in the RC dashboard
export const RC_ENTITLEMENT_PLUS = 'plus';
export const RC_ENTITLEMENT_PRO = 'pro';

// Public iOS API key from RevenueCat dashboard — safe to expose client-side
const RC_IOS_API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY ?? '';

let rcConfigured = false;
// Serializes concurrent configureIAP() calls so only one Purchases.configure() fires at a time.
// Without this, two callers hitting configureIAP() simultaneously both fire configure(), and the
// second call resets the RC shared instance right as logIn() fires from the first — causing a
// native fatalError crash ("Purchases has not been configured").
let rcConfigurePromise: Promise<void> | null = null;

/**
 * Configure RevenueCat SDK. Must be called before any IAP operations.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export async function configureIAP(userId?: string): Promise<void> {
  if (!rcConfigured) {
    if (!rcConfigurePromise) {
      rcConfigurePromise = (async () => {
        console.log('[IAP] configureIAP: apiKey present?', !!RC_IOS_API_KEY);
        if (!RC_IOS_API_KEY) {
          console.warn(
            '[IAP] NEXT_PUBLIC_REVENUECAT_IOS_KEY is not set — cannot configure RC',
          );
          return;
        }
        // configure() is CAPPluginReturnNone — fire-and-forget, JS resolves immediately before
        // native has processed the call. Poll isConfigured() to know when native is ready.
        console.log('[IAP] firing Purchases.configure()…');
        Purchases.configure({ apiKey: RC_IOS_API_KEY });

        // Poll until native RC SDK confirms it's configured (max 5 seconds)
        let nativeReady = false;
        for (let i = 0; i < 50; i++) {
          await new Promise((r) => setTimeout(r, 100));
          try {
            const result = await (
              Purchases as unknown as {
                isConfigured(): Promise<{ isConfigured: boolean }>;
              }
            ).isConfigured();
            if (result.isConfigured) {
              nativeReady = true;
              break;
            }
          } catch {
            // isConfigured() may throw if plugin isn't ready yet — keep polling
          }
        }
        console.log('[IAP] native RC ready:', nativeReady);
        if (!nativeReady) {
          console.error(
            '[IAP] configure timed out — RC native SDK never became ready',
          );
          return;
        }
        rcConfigured = true;
      })();
    }
    await rcConfigurePromise;
  } else {
    console.log('[IAP] configureIAP: already configured, skipping');
  }

  // Only call logIn AFTER confirming RC is ready. logIn() crashes with a native fatalError
  // ("Purchases has not been configured") if called before configure completes.
  if (userId && rcConfigured) {
    await Purchases.logIn({ appUserID: userId }).catch(() => {});
  }
}

// Apple product IDs as configured in App Store Connect
const PRODUCT_PLUS_MONTHLY = 'app.lunary.plus.monthly';
const PRODUCT_PLUS_ANNUAL = 'app.lunary.plus.annual';
const PRODUCT_PRO_MONTHLY = 'app.lunary.pro.monthly';
const PRODUCT_PRO_ANNUAL = 'app.lunary.pro.annual';

// Maps active RC entitlement to the Lunary plan ID used by the rest of the app
function entitlementsToPlanId(
  active: Record<string, unknown>,
): string | undefined {
  if (active[RC_ENTITLEMENT_PRO]) return 'lunary_plus_ai';
  if (active[RC_ENTITLEMENT_PLUS]) return 'lunary_plus';
  return undefined;
}

export interface IAPOfferings {
  plusMonthly: PurchasesPackage | null;
  plusAnnual: PurchasesPackage | null;
  proMonthly: PurchasesPackage | null;
  proAnnual: PurchasesPackage | null;
}

export async function getIAPOfferings(): Promise<IAPOfferings> {
  // Verify SDK is alive before fetching offerings
  try {
    const ci = await Purchases.getCustomerInfo();
    console.log(
      '[IAP] SDK alive — appUserID:',
      ci.customerInfo.originalAppUserId,
    );
  } catch (e) {
    console.error('[IAP] SDK NOT alive — getCustomerInfo failed:', String(e));
  }

  // Direct StoreKit product lookup — if this returns 0 products, the issue is Apple-side
  // (missing Paid Apps agreement, products not approved, or wrong bundle ID).
  // RC only populates availablePackages after StoreKit validates the product IDs.
  const ALL_PRODUCT_IDS = [
    PRODUCT_PLUS_MONTHLY,
    PRODUCT_PLUS_ANNUAL,
    PRODUCT_PRO_MONTHLY,
    PRODUCT_PRO_ANNUAL,
  ];
  try {
    const storeKitResult = await Purchases.getProducts({
      productIdentifiers: ALL_PRODUCT_IDS,
    });
    console.log(
      '[IAP] StoreKit direct product count:',
      storeKitResult.products.length,
      storeKitResult.products.map((p) => p.identifier).join(', '),
    );
    if (storeKitResult.products.length === 0) {
      console.error(
        '[IAP] StoreKit returned 0 products for',
        ALL_PRODUCT_IDS.join(', '),
        '— check: (1) Paid Apps agreement in App Store Connect > Business, (2) products are in Ready to Submit status, (3) correct bundle ID app.lunary',
      );
    }
  } catch (e) {
    console.error('[IAP] getProducts failed:', String(e));
  }

  // RC needs time after configure() to fetch offerings from the network.
  // Retry up to 3 times with increasing delays if we get empty results.
  let pkgs: import('@revenuecat/purchases-capacitor').PurchasesPackage[] = [];
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, attempt * 1500));
    }
    const offerings = await Purchases.getOfferings();
    console.log(
      '[IAP] attempt',
      attempt + 1,
      'raw current:',
      offerings.current
        ? `id=${offerings.current.identifier} pkgs=${offerings.current.availablePackages?.length}`
        : 'null',
      'all keys:',
      Object.keys(offerings.all ?? {}).join(', '),
    );
    const current = offerings.current?.availablePackages?.length
      ? offerings.current
      : (offerings.all?.['default'] ?? null);
    pkgs = current?.availablePackages ?? [];
    console.log(
      '[IAP] attempt',
      attempt + 1,
      'pkgs:',
      pkgs.length,
      pkgs.map((p) => p.product.identifier).join(', '),
    );
    if (pkgs.length > 0) break;
  }

  return {
    plusMonthly:
      pkgs.find((p) => p.product.identifier === PRODUCT_PLUS_MONTHLY) ?? null,
    plusAnnual:
      pkgs.find((p) => p.product.identifier === PRODUCT_PLUS_ANNUAL) ?? null,
    proMonthly:
      pkgs.find((p) => p.product.identifier === PRODUCT_PRO_MONTHLY) ?? null,
    proAnnual:
      pkgs.find((p) => p.product.identifier === PRODUCT_PRO_ANNUAL) ?? null,
  };
}

export async function purchaseIAPPackage(
  pkg: PurchasesPackage,
): Promise<{ success: boolean; planId?: string; error?: string }> {
  try {
    const result = await Purchases.purchasePackage({ aPackage: pkg });
    const active = result.customerInfo.entitlements.active;
    return { success: true, planId: entitlementsToPlanId(active) };
  } catch (error: unknown) {
    const rcError = error as { code?: string; message?: string };
    if (rcError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return { success: false, error: 'cancelled' };
    }
    return { success: false, error: rcError.message ?? 'Purchase failed' };
  }
}

export async function restoreIAPPurchases(): Promise<{ planId?: string }> {
  const result = await Purchases.restorePurchases();
  return {
    planId: entitlementsToPlanId(result.customerInfo.entitlements.active),
  };
}

export async function getIAPCustomerInfo(): Promise<{ planId?: string }> {
  const result = await Purchases.getCustomerInfo();
  return {
    planId: entitlementsToPlanId(result.customerInfo.entitlements.active),
  };
}

export async function identifyIAPUser(userId: string): Promise<void> {
  await Purchases.logIn({ appUserID: userId });
}

export async function resetIAPUser(): Promise<void> {
  await Purchases.logOut();
}
