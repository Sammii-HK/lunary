import { STRIPE_PRICE_MAPPING, type PlanId } from './stripe-prices';
import { PRICING_PLANS } from './pricing';

export const DEFAULT_FX_URL = 'https://open.er-api.com/v6/latest/USD';
export const ANCHOR_CURRENCIES = ['USD', 'GBP'] as const;
export const REVIEW_THRESHOLD = 5;
export const UPDATE_THRESHOLD = 10;

export type FxRates = Record<string, number>;

const MONTHLY_PRO_PLAN_ID: PlanId = 'lunary_plus_ai';
const ANNUAL_PRO_PLAN_ID: PlanId = 'lunary_plus_ai_annual';
const ANNUAL_MONTHS_EQUIVALENT = 10;

function getPlanCurrencyAmount(
  planId: PlanId,
  currency: string,
): number | undefined {
  const plan = STRIPE_PRICE_MAPPING[planId];
  if (!plan) return undefined;
  const normalizedCurrency = currency.toUpperCase();
  return plan[normalizedCurrency as keyof typeof plan]?.amount;
}

function getAnnualAnchorAmount(currency: string): number | undefined {
  const monthlyAmount = getPlanCurrencyAmount(MONTHLY_PRO_PLAN_ID, currency);
  if (!monthlyAmount) return undefined;
  return monthlyAmount * ANNUAL_MONTHS_EQUIVALENT;
}

export type FxDriftResult = {
  planId: string;
  currency: string;
  storedAmount: number;
  anchor: 'USD' | 'GBP' | 'UNKNOWN';
  driftPercent: number;
  driftUsd?: number;
  driftGbp?: number;
  interval?: 'month' | 'year';
};

function normalizeRatesToUsd(base: string, rates: FxRates): FxRates {
  const normalized: FxRates = {};
  const usdRate = rates['USD'];

  if (!usdRate) {
    throw new Error(
      `FX rates missing USD when base is ${base}. Cannot normalize.`,
    );
  }

  for (const [currency, rate] of Object.entries(rates)) {
    normalized[currency.toUpperCase()] = rate / usdRate;
  }

  normalized['USD'] = 1;
  return normalized;
}

export async function fetchFxRates(): Promise<FxRates> {
  let apiUrl = process.env.FX_RATE_API_URL || DEFAULT_FX_URL;

  if (process.env.FX_RATE_API_KEY) {
    apiUrl = apiUrl.replace('{API_KEY}', process.env.FX_RATE_API_KEY);
  }

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(
      `FX provider error: ${response.status} ${response.statusText}`,
    );
  }

  const payload = await response.json();
  const base = (
    payload.base ||
    payload.base_code ||
    payload.base_currency ||
    'USD'
  ).toString();
  const rawRates: FxRates =
    payload.rates || payload.conversion_rates || payload.data || {};

  if (!rawRates || Object.keys(rawRates).length === 0) {
    throw new Error('FX provider did not return any rates.');
  }

  if (base.toUpperCase() === 'USD') {
    const upperRates: FxRates = {};
    for (const [currency, rate] of Object.entries(rawRates)) {
      upperRates[currency.toUpperCase()] = rate;
    }
    upperRates['USD'] = 1;
    return upperRates;
  }

  return normalizeRatesToUsd(base.toUpperCase(), rawRates);
}

export async function buildFxDriftReport(): Promise<{
  rates: FxRates;
  results: FxDriftResult[];
}> {
  const rates = await fetchFxRates();
  const results: FxDriftResult[] = [];

  for (const [planId, prices] of Object.entries(STRIPE_PRICE_MAPPING)) {
    const typedPlanId = planId as PlanId;
    const usdPrice =
      typedPlanId === ANNUAL_PRO_PLAN_ID
        ? getAnnualAnchorAmount('USD')
        : getPlanCurrencyAmount(typedPlanId, 'USD');
    const gbpPrice =
      typedPlanId === ANNUAL_PRO_PLAN_ID
        ? getAnnualAnchorAmount('GBP')
        : getPlanCurrencyAmount(typedPlanId, 'GBP');
    const interval = PRICING_PLANS.find((plan) => plan.id === planId)?.interval;

    for (const [currency, price] of Object.entries(prices)) {
      const upperCurrency = currency.toUpperCase();
      const isAnchorCurrency = ANCHOR_CURRENCIES.includes(
        upperCurrency as (typeof ANCHOR_CURRENCIES)[number],
      );
      if (isAnchorCurrency && typedPlanId !== ANNUAL_PRO_PLAN_ID) {
        continue;
      }

      const currentRateUsd = rates[upperCurrency];
      if (!currentRateUsd && !isAnchorCurrency) {
        console.warn(
          `⚠️  Missing FX rate for ${upperCurrency} (plan: ${planId})`,
        );
        continue;
      }

      let driftUsd: number | undefined;
      let driftGbp: number | undefined;

      if (usdPrice) {
        if (isAnchorCurrency && upperCurrency === 'USD') {
          driftUsd = Math.abs(price.amount / usdPrice - 1) * 100;
        } else if (!isAnchorCurrency && currentRateUsd) {
          const impliedRateUsd = price.amount / usdPrice;
          driftUsd = Math.abs(impliedRateUsd / currentRateUsd - 1) * 100;
        }
      }

      if (gbpPrice) {
        if (isAnchorCurrency && upperCurrency === 'GBP') {
          driftGbp = Math.abs(price.amount / gbpPrice - 1) * 100;
        } else if (!isAnchorCurrency) {
          const gbpRate = rates['GBP'];
          if (gbpRate && currentRateUsd) {
            const currentRateGbp = currentRateUsd / gbpRate;
            const impliedRateGbp = price.amount / gbpPrice;
            driftGbp = Math.abs(impliedRateGbp / currentRateGbp - 1) * 100;
          }
        }
      }

      const candidates = [driftUsd, driftGbp].filter(
        (value): value is number => typeof value === 'number',
      );
      if (candidates.length === 0) {
        console.warn(
          `⚠️  Missing anchor prices for ${planId} (${upperCurrency})`,
        );
        continue;
      }
      const driftPercent = Math.min(...candidates);
      const anchor =
        driftPercent === driftUsd
          ? 'USD'
          : driftPercent === driftGbp
            ? 'GBP'
            : 'UNKNOWN';

      results.push({
        planId,
        currency: upperCurrency,
        storedAmount: price.amount,
        anchor,
        driftPercent,
        driftUsd,
        driftGbp,
        interval,
      });
    }
  }

  return { rates, results };
}
