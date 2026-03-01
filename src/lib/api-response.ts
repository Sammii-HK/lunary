import { NextResponse } from 'next/server';

/**
 * Standardised API error response helper.
 * Returns { error: string, ...extra } with the given HTTP status.
 */
export const apiError = (
  message: string,
  status: number,
  extra?: Record<string, unknown>,
) => NextResponse.json({ error: message, ...extra }, { status });
