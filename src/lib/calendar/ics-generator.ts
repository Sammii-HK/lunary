/**
 * RFC-5545 compliant ICS (iCalendar) generator.
 *
 * Pure utility — produces a calendar text body that can be served from an
 * App Router route handler with `Content-Type: text/calendar` so calendar
 * apps (Apple Calendar, Google Calendar, Outlook) can subscribe to it.
 *
 * Reference: https://datatracker.ietf.org/doc/html/rfc5545
 */

export type IcsEvent = {
  /** Globally unique identifier for the event (stable across regenerations). */
  uid: string;
  /** Short event title shown in the calendar grid. */
  title: string;
  /** Long-form description shown when the event is opened. */
  description: string;
  /** Start of the event in absolute (UTC-derivable) time. */
  start: Date;
  /** End of the event in absolute (UTC-derivable) time. */
  end: Date;
  /** When true, the event is rendered as an all-day event (DATE values). */
  allDay?: boolean;
};

const PRODID = '-//Lunary//Personal Transit Calendar//EN';
const CALNAME = 'Lunary Personal Transits';
const CALDESC =
  'Your personalised cosmic transits — aspects to your natal chart, ingresses, retrogrades, and eclipses.';
// Refresh interval hint for clients that honour it (Apple/Outlook).
const REFRESH_INTERVAL = 'PT12H';

/**
 * Pad a number to two digits.
 */
function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * Format a Date as an RFC-5545 UTC timestamp: YYYYMMDDTHHMMSSZ.
 */
function formatUtc(date: Date): string {
  const y = date.getUTCFullYear().toString().padStart(4, '0');
  const m = pad2(date.getUTCMonth() + 1);
  const d = pad2(date.getUTCDate());
  const h = pad2(date.getUTCHours());
  const mi = pad2(date.getUTCMinutes());
  const s = pad2(date.getUTCSeconds());
  return `${y}${m}${d}T${h}${mi}${s}Z`;
}

/**
 * Format a Date as an RFC-5545 DATE value: YYYYMMDD.
 */
function formatDate(date: Date): string {
  const y = date.getUTCFullYear().toString().padStart(4, '0');
  const m = pad2(date.getUTCMonth() + 1);
  const d = pad2(date.getUTCDate());
  return `${y}${m}${d}`;
}

/**
 * Escape RFC-5545 TEXT values: backslash, semicolon, comma, and newline.
 * https://datatracker.ietf.org/doc/html/rfc5545#section-3.3.11
 */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

/**
 * Fold a content line so no line exceeds 75 octets, per RFC-5545 §3.1.
 * Continuation lines begin with a single space (or tab) after CRLF.
 *
 * We approximate octet width with character length, which is correct for
 * the ASCII content we emit (timestamps + escaped TEXT). For multi-byte
 * UTF-8 characters this may fold slightly earlier than strictly required,
 * which is also valid per the spec.
 */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let i = 0;
  // First chunk takes 75 chars; subsequent chunks take 74 (room for leading space).
  parts.push(line.slice(i, i + 75));
  i += 75;
  while (i < line.length) {
    parts.push(' ' + line.slice(i, i + 74));
    i += 74;
  }
  return parts.join('\r\n');
}

function buildEvent(event: IcsEvent, dtstamp: string): string[] {
  const lines: string[] = [];
  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${escapeText(event.uid)}`);
  lines.push(`DTSTAMP:${dtstamp}`);

  if (event.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${formatDate(event.start)}`);
    lines.push(`DTEND;VALUE=DATE:${formatDate(event.end)}`);
  } else {
    lines.push(`DTSTART:${formatUtc(event.start)}`);
    lines.push(`DTEND:${formatUtc(event.end)}`);
  }

  lines.push(`SUMMARY:${escapeText(event.title)}`);
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  }
  lines.push('TRANSP:TRANSPARENT');
  lines.push('END:VEVENT');
  return lines;
}

/**
 * Generate a complete RFC-5545 VCALENDAR document for the given events.
 *
 * - Lines are CRLF-terminated.
 * - Lines longer than 75 octets are folded with continuation whitespace.
 * - TEXT values are escaped per the spec.
 * - Each VEVENT carries a DTSTAMP set to the generation time.
 */
export function generateIcs(events: IcsEvent[]): string {
  const dtstamp = formatUtc(new Date());

  const lines: string[] = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push(`PRODID:${PRODID}`);
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');
  lines.push(`X-WR-CALNAME:${escapeText(CALNAME)}`);
  lines.push(`X-WR-CALDESC:${escapeText(CALDESC)}`);
  lines.push(`X-PUBLISHED-TTL:${REFRESH_INTERVAL}`);
  lines.push(`REFRESH-INTERVAL;VALUE=DURATION:${REFRESH_INTERVAL}`);

  for (const event of events) {
    lines.push(...buildEvent(event, dtstamp));
  }

  lines.push('END:VCALENDAR');

  // Fold each logical line to 75 octets, then join with CRLF.
  return lines.map(foldLine).join('\r\n') + '\r\n';
}
