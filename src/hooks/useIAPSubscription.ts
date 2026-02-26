import {
  Purchases,
  PURCHASES_ERROR_CODE,
} from '@revenuecat/purchases-capacitor';
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';

// RevenueCat entitlement IDs — must match what's configured in the RC dashboard
export const RC_ENTITLEMENT_PLUS = 'plus';
export const RC_ENTITLEMENT_PRO = 'pro';

// RevenueCat package identifiers set in the RC dashboard Offering
const PACKAGE_PLUS_MONTHLY = '$rc_monthly';
const PACKAGE_PLUS_ANNUAL = '$rc_annual_plus';
const PACKAGE_PRO_MONTHLY = '$rc_monthly_pro';
const PACKAGE_PRO_ANNUAL = '$rc_annual';

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
  return {
    plusMonthly:
      pkgs.find((p) => p.identifier === PACKAGE_PLUS_MONTHLY) ?? null,
    plusAnnual: pkgs.find((p) => p.identifier === PACKAGE_PLUS_ANNUAL) ?? null,
    proMonthly: pkgs.find((p) => p.identifier === PACKAGE_PRO_MONTHLY) ?? null,
    proAnnual: pkgs.find((p) => p.identifier === PACKAGE_PRO_ANNUAL) ?? null,
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
