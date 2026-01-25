import { sql } from '@vercel/postgres';

export type CanonicalEventType =
  | 'app_opened'
  | 'product_opened'
  | 'page_viewed'
  | 'cta_clicked'
  | 'user_signed_up'
  | 'user_logged_in'
  | 'nav_tab_clicked'
  | 'dashboard_widget_cta_clicked'
  | 'dashboard_widget_expanded'
  | 'tarot_draw_started'
  | 'tarot_card_drawn'
  | 'tarot_reading_completed'
  | 'tarot_patterns_viewed'
  | 'tarot_patterns_range_selected'
  | 'tarot_patterns_module_viewed'
  | 'tarot_card_modal_opened'
  | 'tarot_card_grimoire_clicked'
  | 'horoscope_viewed'
  | 'horoscope_section_expanded'
  | 'birth_chart_learn_more_clicked'
  | 'journal_mode_activated'
  | 'reflection_started'
  | 'reflection_saved'
  | 'book_of_shadows_tab_selected'
  | 'archetype_modal_opened'
  | 'collection_page_viewed'
  | 'collection_filter_applied'
  | 'collection_item_opened'
  | 'guide_thread_prompt_shown'
  | 'guide_thread_prompt_actioned'
  | 'guide_assist_clicked'
  | 'guide_message_sent'
  | 'guide_to_journal_initiated'
  | 'grimoire_viewed'
  | 'chart_viewed'
  | 'daily_dashboard_viewed'
  | 'astral_chat_used'
  | 'tarot_drawn'
  | 'ritual_started'
  | 'signup_completed'
  | 'subscription_started'
  | 'subscription_cancelled'
  | 'trial_started';

type CanonicalInsertRow = {
  eventType: CanonicalEventType;
  eventId: string | null;
  userId: string;
  anonymousId: string | null;
  userEmail: string | null;
  planType: string | null;
  trialDaysRemaining: number | null;
  featureName: string | null;
  pagePath: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date | null;
};

export type CanonicaliseResult =
  | { ok: true; row: CanonicalInsertRow }
  | { ok: false; reason: 'skipped_no_user' | 'skipped_invalid' };

function normalizePath(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Accept either a pathname or a full URL.
  try {
    const url = new URL(trimmed);
    return url.pathname.replace(/\/+$/, '') || '/';
  } catch {
    // Not a URL, assume it's already a path.
    const pathname = trimmed.split('?')[0]?.split('#')[0] ?? trimmed;
    return pathname.replace(/\/+$/, '') || '/';
  }
}

function normalizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed ? trimmed : null;
}

function normalizeAnonymousId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function canonicaliseEventType(raw: unknown): {
  eventType: CanonicalEventType;
  legacyEventType?: string;
} | null {
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  if (!value) return null;

  // Canonical events
  if (
    value === 'app_opened' ||
    value === 'product_opened' ||
    value === 'page_viewed' ||
    value === 'cta_clicked' ||
    value === 'user_signed_up' ||
    value === 'user_logged_in' ||
    value === 'nav_tab_clicked' ||
    value === 'dashboard_widget_cta_clicked' ||
    value === 'dashboard_widget_expanded' ||
    value === 'tarot_draw_started' ||
    value === 'tarot_card_drawn' ||
    value === 'tarot_reading_completed' ||
    value === 'tarot_patterns_viewed' ||
    value === 'tarot_patterns_range_selected' ||
    value === 'tarot_patterns_module_viewed' ||
    value === 'tarot_card_modal_opened' ||
    value === 'tarot_card_grimoire_clicked' ||
    value === 'horoscope_viewed' ||
    value === 'horoscope_section_expanded' ||
    value === 'birth_chart_learn_more_clicked' ||
    value === 'journal_mode_activated' ||
    value === 'reflection_started' ||
    value === 'reflection_saved' ||
    value === 'book_of_shadows_tab_selected' ||
    value === 'archetype_modal_opened' ||
    value === 'collection_page_viewed' ||
    value === 'collection_filter_applied' ||
    value === 'collection_item_opened' ||
    value === 'guide_thread_prompt_shown' ||
    value === 'guide_thread_prompt_actioned' ||
    value === 'guide_assist_clicked' ||
    value === 'guide_message_sent' ||
    value === 'guide_to_journal_initiated' ||
    value === 'grimoire_viewed' ||
    value === 'chart_viewed' ||
    value === 'daily_dashboard_viewed' ||
    value === 'astral_chat_used' ||
    value === 'tarot_drawn' ||
    value === 'ritual_started' ||
    value === 'signup_completed' ||
    value === 'subscription_started' ||
    value === 'subscription_cancelled' ||
    value === 'trial_started'
  ) {
    return { eventType: value };
  }

  // Legacy mappings (keep original in metadata for auditability)
  if (value === 'birth_chart_viewed') {
    return { eventType: 'chart_viewed', legacyEventType: value };
  }
  if (value === 'dashboard_viewed') {
    return { eventType: 'daily_dashboard_viewed', legacyEventType: value };
  }
  if (value === 'ai_chat') {
    return { eventType: 'astral_chat_used', legacyEventType: value };
  }
  if (value === 'tarot_viewed') {
    return { eventType: 'tarot_drawn', legacyEventType: value };
  }
  if (value === 'ritual_view') {
    return { eventType: 'ritual_started', legacyEventType: value };
  }
  if (value === 'signup') {
    return { eventType: 'signup_completed', legacyEventType: value };
  }
  if (value === 'trial_converted') {
    // Treat trial conversion as a subscription start for KPI purposes.
    return { eventType: 'subscription_started', legacyEventType: value };
  }

  return null;
}

function extractGrimoireEntityId(pagePath: string | null): string | null {
  if (!pagePath) return null;
  if (!pagePath.startsWith('/grimoire')) return null;

  // Use a stable slug key for any grimoire page route.
  // Examples:
  // - /grimoire -> null (no slug)
  // - /grimoire/houses/mars -> houses/mars
  // - /grimoire/events/2026 -> events/2026
  const rest = pagePath.replace(/^\/grimoire\/?/, '');
  const normalized = rest.replace(/\/+$/, '');
  return normalized ? normalized : null;
}

function sanitiseMetadata(
  eventType: CanonicalEventType,
  metadata: unknown,
  legacyEventType?: string,
): Record<string, unknown> | null {
  const input =
    metadata && typeof metadata === 'object'
      ? (metadata as Record<string, unknown>)
      : null;

  const blockedKeys = new Set([
    'message',
    'messages',
    'prompt',
    'completion',
    'input',
    'output',
    'text',
    'content',
    'conversation',
    'thread',
    'assistant',
    'response',
  ]);

  const allowlistedTopLevelKeys = new Set([
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'referrer',
    'referer',
    'device',
    'platform',
    'os',
    'browser',
    'country',
    'locale',
    'source',
    'mode',
    'plan',
    'plan_type',
    'trial_days_remaining',
    'origin_hub',
    'origin_page',
    'origin_type',
  ]);

  const result: Record<string, unknown> = {};

  if (legacyEventType) {
    result.legacy_event_type = legacyEventType;
  }
  result.canonical_event_type = eventType;

  if (!input) {
    return Object.keys(result).length > 0 ? result : null;
  }

  for (const [key, value] of Object.entries(input)) {
    if (blockedKeys.has(key)) continue;

    // Keep only simple, privacy-safe primitives at top-level unless explicitly allowlisted.
    if (!allowlistedTopLevelKeys.has(key)) {
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null
      ) {
        result[key] = value;
      }
      continue;
    }

    // Allowlisted keys can pass through as-is, but never include large nested content.
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null
    ) {
      result[key] = value;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

export function canonicaliseEvent(input: {
  eventType: unknown;
  eventId?: unknown;
  userId?: unknown;
  anonymousId?: unknown;
  userEmail?: unknown;
  planType?: unknown;
  trialDaysRemaining?: unknown;
  featureName?: unknown;
  pagePath?: unknown;
  entityType?: unknown;
  entityId?: unknown;
  metadata?: unknown;
  createdAt?: unknown;
}): CanonicaliseResult {
  const canonical = canonicaliseEventType(input.eventType);
  if (!canonical) {
    return { ok: false, reason: 'skipped_invalid' };
  }

  const rawUserId =
    typeof input.userId === 'string'
      ? input.userId.trim()
      : typeof input.userId === 'number' || typeof input.userId === 'bigint'
        ? String(input.userId)
        : '';
  const eventId =
    typeof input.eventId === 'string' && input.eventId.trim().length > 0
      ? input.eventId.trim()
      : null;

  const anonymousId = normalizeAnonymousId(input.anonymousId);
  const userId = rawUserId || (anonymousId ? `anon:${anonymousId}` : '');
  if (!userId) {
    return { ok: false, reason: 'skipped_no_user' };
  }

  const pagePath = normalizePath(input.pagePath);
  const userEmail = normalizeEmail(input.userEmail);
  const planType = typeof input.planType === 'string' ? input.planType : null;
  const trialDaysRemaining =
    typeof input.trialDaysRemaining === 'number'
      ? input.trialDaysRemaining
      : typeof input.trialDaysRemaining === 'string'
        ? Number(input.trialDaysRemaining)
        : null;

  const featureName =
    typeof input.featureName === 'string' && input.featureName.trim().length > 0
      ? input.featureName.trim()
      : null;

  let entityType =
    typeof input.entityType === 'string' && input.entityType.trim().length > 0
      ? input.entityType.trim()
      : null;
  let entityId =
    typeof input.entityId === 'string' && input.entityId.trim().length > 0
      ? input.entityId.trim()
      : null;

  if (canonical.eventType === 'grimoire_viewed') {
    entityType = entityType || 'grimoire';
    entityId = entityId || extractGrimoireEntityId(pagePath);
  }

  const metadata = sanitiseMetadata(
    canonical.eventType,
    input.metadata,
    canonical.legacyEventType,
  );

  const createdAt =
    input.createdAt instanceof Date
      ? input.createdAt
      : typeof input.createdAt === 'string' &&
          !Number.isNaN(Date.parse(input.createdAt))
        ? new Date(input.createdAt)
        : null;

  return {
    ok: true,
    row: {
      eventType: canonical.eventType,
      eventId,
      userId,
      anonymousId,
      userEmail,
      planType,
      trialDaysRemaining:
        trialDaysRemaining !== null && Number.isFinite(trialDaysRemaining)
          ? trialDaysRemaining
          : null,
      featureName,
      pagePath,
      entityType,
      entityId,
      metadata,
      createdAt,
    },
  };
}

export async function insertCanonicalEvent(row: CanonicalInsertRow): Promise<{
  inserted: boolean;
}> {
  const metadataValue =
    row.metadata && Object.keys(row.metadata).length > 0
      ? JSON.stringify(row.metadata)
      : null;
  const createdAtValue =
    row.createdAt instanceof Date
      ? row.createdAt.toISOString()
      : (row.createdAt ?? null);

  // The unique constraint on event_id keeps retries/idempotent inserts from inflating counts.
  const result = await sql.query(
    `
      INSERT INTO conversion_events (
        event_type,
        event_id,
        user_id,
        anonymous_id,
        user_email,
        plan_type,
        trial_days_remaining,
        feature_name,
        page_path,
        entity_type,
        entity_id,
        metadata,
        created_at
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        COALESCE($12::jsonb, NULL),
        COALESCE($13::timestamptz, NOW())
      )
      ON CONFLICT DO NOTHING
      RETURNING id
    `,
    [
      row.eventType,
      row.eventId,
      row.userId,
      row.anonymousId,
      row.userEmail,
      row.planType,
      row.trialDaysRemaining,
      row.featureName,
      row.pagePath,
      row.entityType,
      row.entityId,
      metadataValue,
      createdAtValue,
    ],
  );

  return { inserted: result.rows.length > 0 };
}

export async function insertCanonicalEventsBatch(
  rows: CanonicalInsertRow[],
): Promise<{ inserted: number; duplicates: number }> {
  if (rows.length === 0) return { inserted: 0, duplicates: 0 };

  const values: string[] = [];
  const params: Array<string | number | null> = [];

  const push = (value: string | number | null) => {
    params.push(value);
    return `$${params.length}`;
  };

  for (const row of rows) {
    values.push(
      `(
        ${push(row.eventType)},
        ${push(row.eventId)},
        ${push(row.userId)},
        ${push(row.anonymousId)},
        ${push(row.userEmail)},
        ${push(row.planType)},
        ${push(row.trialDaysRemaining)},
        ${push(row.featureName)},
        ${push(row.pagePath)},
        ${push(row.entityType)},
        ${push(row.entityId)},
        ${push(row.metadata ? JSON.stringify(row.metadata) : null)}::jsonb,
        COALESCE(${push(row.createdAt ? row.createdAt.toISOString() : null)}::timestamptz, NOW())
      )`,
    );
  }

  const insert = await sql.query(
    `
      INSERT INTO conversion_events (
        event_type,
        event_id,
        user_id,
        anonymous_id,
        user_email,
        plan_type,
        trial_days_remaining,
        feature_name,
        page_path,
        entity_type,
        entity_id,
        metadata,
        created_at
      )
      VALUES ${values.join(',')}
      ON CONFLICT DO NOTHING
      RETURNING 1
    `,
    params,
  );

  const inserted = insert.rows.length;
  return { inserted, duplicates: rows.length - inserted };
}
