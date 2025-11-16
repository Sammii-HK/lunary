'use client';

import { useState, useEffect } from 'react';
// Note: getPriceForCurrency is imported where needed, not here

export function useCurrency() {
  const [currency, setCurrency] = useState<string>('USD');

  useEffect(() => {
    // Detect currency from browser locale
    try {
      // Try to get currency from Intl API
      const locale = navigator.language || 'en-US';
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD', // Default
      });

      // Get currency from locale (e.g., 'en-GB' -> 'GBP', 'en-US' -> 'USD')
      // Map common locales to currencies
      const localeToCurrency: Record<string, string> = {
        'en-GB': 'GBP',
        'en-US': 'USD',
        'en-CA': 'CAD',
        'en-AU': 'AUD',
        'en-NZ': 'NZD',
        'fr-FR': 'EUR',
        'fr-CA': 'CAD',
        'de-DE': 'EUR',
        'es-ES': 'EUR',
        'it-IT': 'EUR',
        'pt-BR': 'BRL',
        'ja-JP': 'JPY',
        'zh-CN': 'CNY',
        'zh-HK': 'HKD',
        'sv-SE': 'SEK',
        'no-NO': 'NOK',
        'da-DK': 'DKK',
        'pl-PL': 'PLN',
        'cs-CZ': 'CZK',
        'hu-HU': 'HUF',
        'hi-IN': 'INR',
        'es-MX': 'MXN',
        'af-ZA': 'ZAR',
      };

      // Try to get currency from locale
      const detectedCurrency =
        localeToCurrency[locale] ||
        localeToCurrency[locale.split('-')[0]] ||
        'USD';

      // Check if we have prices for this currency, otherwise fallback to USD
      // We'll check this when we use it, but for now just set it
      setCurrency(detectedCurrency);
    } catch (error) {
      console.warn('Failed to detect currency, using USD:', error);
      setCurrency('USD');
    }
  }, []);

  return currency;
}

export function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toLowerCase(),
      minimumFractionDigits: currency === 'JPY' || currency === 'HUF' ? 0 : 2,
    }).format(amount);
  } catch (error) {
    // Fallback to simple formatting
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${amount.toFixed(currency === 'JPY' || currency === 'HUF' ? 0 : 2)}`;
  }
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    GBP: '£',
    EUR: '€',
    CAD: 'C$',
    AUD: 'A$',
    JPY: '¥',
    CHF: 'CHF ',
    NZD: 'NZ$',
    SEK: 'kr ',
    NOK: 'kr ',
    DKK: 'kr ',
    PLN: 'zł ',
    CZK: 'Kč ',
    HUF: 'Ft ',
    INR: '₹',
    SGD: 'S$',
    HKD: 'HK$',
    MXN: 'MX$',
    BRL: 'R$',
    ZAR: 'R ',
  };
  return symbols[currency.toUpperCase()] || currency.toUpperCase() + ' ';
}
