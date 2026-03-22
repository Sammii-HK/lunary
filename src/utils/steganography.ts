/**
 * Unicode steganography for Notion template copyright protection.
 *
 * Encodes an invisible copyright string into visible text using zero-width
 * Unicode characters. The encoded characters are invisible to readers, survive
 * copy-paste, and are present in any redistribution of the content.
 *
 * Used to prove ownership of Lunar Computing, Inc templates in any legal dispute.
 *
 * Encoding scheme:
 *   U+200B (zero-width space)         = bit 0
 *   U+200C (zero-width non-joiner)    = bit 1
 *   U+200D (zero-width joiner)        = start/end delimiter
 */

const BIT_ZERO = '\u200B'; // zero-width space
const BIT_ONE = '\u200C'; // zero-width non-joiner
const DELIMITER = '\u200D'; // zero-width joiner — marks start and end of encoded block

/**
 * Encode a copyright string into zero-width Unicode characters and insert
 * them invisibly after the first word of the visible text.
 */
export function encodeWatermark(
  visibleText: string,
  copyright: string,
): string {
  const binary = stringToBinary(copyright);
  const zwChars = binary
    .split('')
    .map((bit) => (bit === '0' ? BIT_ZERO : BIT_ONE))
    .join('');

  const encoded = DELIMITER + zwChars + DELIMITER;

  // Insert after the first word so it's not at position 0 (harder to spot)
  const firstSpace = visibleText.indexOf(' ');
  if (firstSpace === -1) return visibleText + encoded;
  return (
    visibleText.slice(0, firstSpace) + encoded + visibleText.slice(firstSpace)
  );
}

/**
 * Scan text for an embedded watermark and return the decoded string,
 * or null if no watermark is found.
 */
export function decodeWatermark(text: string): string | null {
  const match = text.match(/\u200D([\u200B\u200C]+)\u200D/);
  if (!match) return null;

  const binary = match[1]
    .split('')
    .map((ch) => (ch === BIT_ZERO ? '0' : '1'))
    .join('');

  return binaryToString(binary);
}

/**
 * Check whether text contains a Lunar Computing, Inc watermark.
 */
export function hasLunarWatermark(text: string): boolean {
  const decoded = decodeWatermark(text);
  return decoded !== null && decoded.includes('Lunar Computing, Inc');
}

/**
 * Generate the standard copyright string for a given template.
 *
 * Format: © Lunar Computing, Inc {year} — {templateId} — lunary.app
 *
 * Example: © Lunar Computing, Inc 2026 — tarot-journal — lunary.app
 */
export function buildCopyrightString(
  templateId: string,
  date: Date = new Date(),
): string {
  return `\u00A9 Lunar Computing, Inc ${date.getFullYear()} \u2014 ${templateId} \u2014 lunary.app`;
}

/**
 * Generate a per-buyer copyright string (canary trap).
 *
 * Encodes the buyer's email and purchase date alongside the template ID.
 * If this template is ever redistributed, decoding the watermark reveals
 * exactly who purchased this specific copy.
 *
 * Format: © Lunar Computing, Inc {year} — {templateId} — buyer:{email} — {date}
 *
 * Example: © Lunar Computing, Inc 2026 — tarot-journal — buyer:sarah@gmail.com — 2026-03-22
 */
export function buildBuyerCopyrightString(
  templateId: string,
  buyerEmail: string,
  date: Date = new Date(),
): string {
  const dateStr = date.toISOString().split('T')[0];
  return `\u00A9 Lunar Computing, Inc ${date.getFullYear()} \u2014 ${templateId} \u2014 buyer:${buyerEmail} \u2014 ${dateStr}`;
}

/**
 * Apply the standard Lunar Computing, Inc watermark to a block of text.
 * Convenience wrapper around encodeWatermark + buildCopyrightString.
 */
export function watermarkTemplate(text: string, templateId: string): string {
  const copyright = buildCopyrightString(templateId);
  return encodeWatermark(text, copyright);
}

/**
 * Apply a per-buyer canary trap watermark to a block of text.
 *
 * Use this in the delivery email body and download page content.
 * If the buyer redistributes anything they received, decoding the
 * watermark reveals their email and the purchase date.
 */
export function watermarkForBuyer(
  text: string,
  templateId: string,
  buyerEmail: string,
  date: Date = new Date(),
): string {
  const copyright = buildBuyerCopyrightString(templateId, buyerEmail, date);
  return encodeWatermark(text, copyright);
}

/**
 * Parse a decoded watermark string and extract structured fields.
 *
 * Returns null if the string is not a valid Lunar Computing watermark.
 */
export function parseWatermark(decoded: string): WatermarkInfo | null {
  if (!decoded.includes('Lunar Computing, Inc')) return null;

  const buyerMatch = decoded.match(/buyer:([^\s\u2014]+)/);
  const templateMatch = decoded.match(/\u2014\s*([a-z0-9-]+)\s*\u2014/);
  const dateMatch = decoded.match(/(\d{4}-\d{2}-\d{2})$/);
  const yearMatch = decoded.match(/Inc (\d{4})/);

  return {
    owner: 'Lunar Computing, Inc',
    year: yearMatch ? parseInt(yearMatch[1]) : null,
    templateId: templateMatch ? templateMatch[1] : null,
    buyerEmail: buyerMatch ? buyerMatch[1] : null,
    purchaseDate: dateMatch ? dateMatch[1] : null,
    isPerBuyer: !!buyerMatch,
  };
}

export interface WatermarkInfo {
  owner: string;
  year: number | null;
  templateId: string | null;
  buyerEmail: string | null;
  purchaseDate: string | null;
  isPerBuyer: boolean;
}

// ─── Internal helpers ────────────────────────────────────────────────────────

// Encode as UTF-8 bytes so multi-byte characters (©, —, etc.) round-trip correctly.

function stringToBinary(str: string): string {
  const bytes = Buffer.from(str, 'utf8');
  return Array.from(bytes)
    .map((b) => b.toString(2).padStart(8, '0'))
    .join('');
}

function binaryToString(binary: string): string {
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= binary.length; i += 8) {
    bytes.push(parseInt(binary.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes).toString('utf8');
}
