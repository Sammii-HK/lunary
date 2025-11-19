'use client';

import { useState, useEffect } from 'react';
// Note: getPriceForCurrency is imported where needed, not here

export function useCurrency() {
  const [currency, setCurrency] = useState<string>('USD');

  useEffect(() => {
    // Detect currency from browser locale and timezone
    try {
      const locale = navigator.language || 'en-US';

      // Map timezones to currencies (more reliable than locale alone)
      const timezoneToCurrency: Record<string, string> = {
        'Europe/London': 'GBP',
        'America/New_York': 'USD',
        'America/Chicago': 'USD',
        'America/Denver': 'USD',
        'America/Los_Angeles': 'USD',
        'America/Toronto': 'CAD',
        'America/Vancouver': 'CAD',
        'Australia/Sydney': 'AUD',
        'Australia/Melbourne': 'AUD',
        'Pacific/Auckland': 'NZD',
        'Europe/Paris': 'EUR',
        'Europe/Berlin': 'EUR',
        'Europe/Rome': 'EUR',
        'Europe/Madrid': 'EUR',
        'Europe/Amsterdam': 'EUR',
        'Europe/Brussels': 'EUR',
        'Europe/Vienna': 'EUR',
        'America/Sao_Paulo': 'BRL',
        'Asia/Tokyo': 'JPY',
        'Asia/Shanghai': 'CNY',
        'Asia/Hong_Kong': 'HKD',
        'Europe/Stockholm': 'SEK',
        'Europe/Oslo': 'NOK',
        'Europe/Copenhagen': 'DKK',
        'Europe/Warsaw': 'PLN',
        'Europe/Prague': 'CZK',
        'Europe/Budapest': 'HUF',
        'Asia/Kolkata': 'INR',
        'Asia/Singapore': 'SGD',
        'America/Mexico_City': 'MXN',
        'Africa/Johannesburg': 'ZAR',
      };

      // Try to get currency from timezone first (most reliable)
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      let detectedCurrency = timezoneToCurrency[timezone];

      // Fallback to locale-based detection if timezone didn't match
      if (!detectedCurrency) {
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

        detectedCurrency =
          localeToCurrency[locale] ||
          localeToCurrency[locale.split('-')[0]] ||
          'USD';
      }

      setCurrency(detectedCurrency);
    } catch (error) {
      // USD is a safe default fallback
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
