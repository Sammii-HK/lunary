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

/**
 * Configure RevenueCat SDK. Must be called before any IAP operations.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export async function configureIAP(userId?: string): Promise<void> {
  if (rcConfigured) return;
  if (!RC_IOS_API_KEY) {
    console.warn('[IAP] NEXT_PUBLIC_REVENUECAT_IOS_KEY is not set');
    return;
  }
  await Purchases.configure({ apiKey: RC_IOS_API_KEY });
  if (userId) {
    await Purchases.logIn({ appUserID: userId }).catch(() => {});
  }
  rcConfigured = true;
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
  const offerings = await Purchases.getOfferings();
  const pkgs = offerings.current?.availablePackages ?? [];
  console.log('[IAP] current offering id:', offerings.current?.identifier);
  console.log(
    '[IAP] packages:',
    pkgs.map((p) => `${p.identifier} → ${p.product.productIdentifier}`),
  );
  return {
    plusMonthly:
      pkgs.find((p) => p.product.productIdentifier === PRODUCT_PLUS_MONTHLY) ??
      null,
    plusAnnual:
      pkgs.find((p) => p.product.productIdentifier === PRODUCT_PLUS_ANNUAL) ??
      null,
    proMonthly:
      pkgs.find((p) => p.product.productIdentifier === PRODUCT_PRO_MONTHLY) ??
      null,
    proAnnual:
      pkgs.find((p) => p.product.productIdentifier === PRODUCT_PRO_ANNUAL) ??
      null,
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
