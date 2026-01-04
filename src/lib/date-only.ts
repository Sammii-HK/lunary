const ISO_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_DATE_PREFIX = /^(\d{4}-\d{2}-\d{2})/;

export function normalizeIsoDateOnly(input?: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (ISO_DATE_ONLY.test(trimmed)) return trimmed;
  const prefixMatch = ISO_DATE_PREFIX.exec(trimmed);
  if (prefixMatch && ISO_DATE_ONLY.test(prefixMatch[1])) {
    return prefixMatch[1];
  }
  return trimmed;
}

export function parseIsoDateOnly(isoDate: string): Date | null {
  const normalized = normalizeIsoDateOnly(isoDate);
  if (!normalized) return null;
  const match = ISO_DATE_ONLY.exec(normalized);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function formatIsoDateOnly(isoDate: string, locale?: string): string {
  const normalized = normalizeIsoDateOnly(isoDate);
  if (!normalized) return isoDate;
  const date = parseIsoDateOnly(normalized);
  if (!date) return normalized;
  return new Intl.DateTimeFormat(locale).format(date);
}
