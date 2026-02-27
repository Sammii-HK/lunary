/**
 * Build in Public — Spellcast Client
 *
 * Uploads card images and schedules posts to the sammii account set
 * via the Spellcast API.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

function getSpellcastConfig(): { url: string; apiKey: string } {
  const url = (process.env.SPELLCAST_API_URL ?? '').replace(/\/$/, '');
  const apiKey = process.env.SPELLCAST_API_KEY ?? '';
  if (!url) throw new Error('SPELLCAST_API_URL not set in .env.local');
  if (!apiKey) throw new Error('SPELLCAST_API_KEY not set in .env.local');
  return { url, apiKey };
}

function authHeaders(): Record<string, string> {
  const { apiKey } = getSpellcastConfig();
  return { Authorization: `Bearer ${apiKey}` };
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

export async function uploadCardImage(pngPath: string): Promise<string> {
  const { url } = getSpellcastConfig();
  const filename = path.basename(pngPath);
  const data = fs.readFileSync(pngPath);

  const blob = new Blob([new Uint8Array(data)], { type: 'image/png' });
  const form = new FormData();
  form.append('file', blob, filename);
  form.append('filename', filename);

  const res = await fetch(`${url}/api/media/upload`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Media upload failed (${res.status}): ${err}`);
  }

  const uploaded = (await res.json()) as { id: string; url: string };
  return uploaded.id;
}

// ---------------------------------------------------------------------------
// Post creation & scheduling
// ---------------------------------------------------------------------------

const SAMMII_ACCOUNT_SET_ID = '430eab81-ea60-4d11-9733-1bb126c5264c';

export interface SchedulePostOpts {
  content: string;
  mediaId: string;
  accountSetId?: string;
  scheduledFor: string; // ISO 8601
}

export async function schedulePost(opts: SchedulePostOpts): Promise<string> {
  const { url } = getSpellcastConfig();
  const accountSetId = opts.accountSetId ?? SAMMII_ACCOUNT_SET_ID;

  // Step 1: Create draft
  const createRes = await fetch(`${url}/api/posts`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: opts.content,
      mediaIds: [opts.mediaId],
      scheduledFor: opts.scheduledFor,
      accountSetId,
      postType: 'post',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Create post failed (${createRes.status}): ${err}`);
  }

  const draft = (await createRes.json()) as { id: string };

  // Step 2: Schedule it
  const schedRes = await fetch(`${url}/api/posts/${draft.id}/schedule`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
  });

  if (!schedRes.ok) {
    const err = await schedRes.text();
    throw new Error(`Schedule post failed (${schedRes.status}): ${err}`);
  }

  return draft.id;
}

export async function createDraftPost(
  opts: Omit<SchedulePostOpts, 'scheduledFor'>,
): Promise<string> {
  const { url } = getSpellcastConfig();
  const accountSetId = opts.accountSetId ?? SAMMII_ACCOUNT_SET_ID;

  const createRes = await fetch(`${url}/api/posts`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: opts.content,
      mediaIds: [opts.mediaId],
      accountSetId,
      postType: 'post',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Create draft failed (${createRes.status}): ${err}`);
  }

  const draft = (await createRes.json()) as { id: string };
  return draft.id;
}

export function getSpellcastPostUrl(postId: string): string {
  const { url } = getSpellcastConfig();
  return `${url}/posts/${postId}`;
}

// ---------------------------------------------------------------------------
// Text-only post helpers (no media — for daily BIP posts)
// ---------------------------------------------------------------------------

export async function scheduleTextPost(opts: {
  content: string;
  accountSetId?: string;
  scheduledFor: string;
}): Promise<string> {
  const { url } = getSpellcastConfig();
  const accountSetId = opts.accountSetId ?? SAMMII_ACCOUNT_SET_ID;

  const createRes = await fetch(`${url}/api/posts`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: opts.content,
      scheduledFor: opts.scheduledFor,
      accountSetId,
      postType: 'post',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Create post failed (${createRes.status}): ${err}`);
  }

  const draft = (await createRes.json()) as { id: string };

  const schedRes = await fetch(`${url}/api/posts/${draft.id}/schedule`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
  });

  if (!schedRes.ok) {
    const err = await schedRes.text();
    throw new Error(`Schedule post failed (${schedRes.status}): ${err}`);
  }

  return draft.id;
}

export async function createTextDraft(opts: {
  content: string;
  accountSetId?: string;
}): Promise<string> {
  const { url } = getSpellcastConfig();
  const accountSetId = opts.accountSetId ?? SAMMII_ACCOUNT_SET_ID;

  const createRes = await fetch(`${url}/api/posts`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: opts.content,
      accountSetId,
      postType: 'post',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Create draft failed (${createRes.status}): ${err}`);
  }

  const draft = (await createRes.json()) as { id: string };
  return draft.id;
}
