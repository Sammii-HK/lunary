const ISO_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseIsoDateOnly(isoDate: string): Date | null {
  const match = ISO_DATE_ONLY.exec(isoDate);
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
  const date = parseIsoDateOnly(isoDate);
  if (!date) return isoDate;
  return new Intl.DateTimeFormat(locale).format(date);
}
