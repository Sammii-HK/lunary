/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const sqlMock = jest.fn();

jest.mock('@vercel/postgres', () => ({
  sql: (...args: any[]) => sqlMock(...args),
}));

jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock('@/lib/community/moderation', () => ({
  validateInsightText: jest.fn().mockReturnValue({ isValid: true }),
}));

jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn().mockReturnValue({ allowed: true, retryAfterMs: 0 }),
}));

import { GET, POST } from '@/app/api/community/spaces/[slug]/posts/route';
import { auth } from '@/lib/auth';
import { validateInsightText } from '@/lib/community/moderation';

function makeGetRequest(slug: string, params?: string): NextRequest {
  return new NextRequest(
    `https://lunary.app/api/community/spaces/${slug}/posts${params ? `?${params}` : ''}`,
  );
}

function makePostRequest(slug: string, body: unknown): NextRequest {
  return new NextRequest(
    `https://lunary.app/api/community/spaces/${slug}/posts`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
}

describe('GET /api/community/spaces/[slug]/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 for missing slug', async () => {
    const req = makeGetRequest('');
    const res = await GET(req, { params: Promise.resolve({ slug: '' }) });
    expect(res.status).toBe(400);
  });

  it('returns 404 for nonexistent space', async () => {
    sqlMock.mockResolvedValueOnce({ rows: [] });

    const req = makeGetRequest('nonexistent');
    const res = await GET(req, {
      params: Promise.resolve({ slug: 'nonexistent' }),
    });
    expect(res.status).toBe(404);
  });

  it('returns paginated posts for a valid space', async () => {
    // Space lookup
    sqlMock.mockResolvedValueOnce({
      rows: [{ id: 1, title: 'Aries Rising', post_count: 2 }],
    });
    // Total count
    sqlMock.mockResolvedValueOnce({ rows: [{ count: 2 }] });
    // Posts
    sqlMock.mockResolvedValueOnce({
      rows: [
        {
          id: 10,
          post_text: 'Hello world!',
          is_anonymous: true,
          created_at: new Date('2026-01-15'),
        },
        {
          id: 11,
          post_text: 'Another post',
          is_anonymous: false,
          created_at: new Date('2026-01-16'),
        },
      ],
    });

    const req = makeGetRequest('aries-rising', 'limit=10&offset=0&sort=newest');
    const res = await GET(req, {
      params: Promise.resolve({ slug: 'aries-rising' }),
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.posts).toHaveLength(2);
    expect(data.total).toBe(2);
    expect(data.posts[0].postText).toBe('Hello world!');
    expect(data.space.title).toBe('Aries Rising');
  });
});

describe('POST /api/community/spaces/[slug]/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (validateInsightText as jest.Mock).mockReturnValue({ isValid: true });
  });

  it('returns 401 without authentication', async () => {
    (auth.api.getSession as jest.Mock).mockResolvedValue(null);

    const req = makePostRequest('aries-rising', {
      post_text: 'My first post here!',
      is_anonymous: true,
    });
    const res = await POST(req, {
      params: Promise.resolve({ slug: 'aries-rising' }),
    });
    expect(res.status).toBe(401);
  });

  it('returns 404 for nonexistent space', async () => {
    (auth.api.getSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-1' },
    });
    sqlMock.mockResolvedValueOnce({ rows: [] });

    const req = makePostRequest('nonexistent', {
      post_text: 'Testing post content',
    });
    const res = await POST(req, {
      params: Promise.resolve({ slug: 'nonexistent' }),
    });
    expect(res.status).toBe(404);
  });

  it('returns 400 for text shorter than 10 characters', async () => {
    (auth.api.getSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-1' },
    });
    sqlMock.mockResolvedValueOnce({ rows: [{ id: 1, is_active: true }] });

    const req = makePostRequest('aries-rising', { post_text: 'Short' });
    const res = await POST(req, {
      params: Promise.resolve({ slug: 'aries-rising' }),
    });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/at least 10 characters/);
  });

  it('returns 400 for moderated content', async () => {
    (auth.api.getSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-1' },
    });
    sqlMock.mockResolvedValueOnce({ rows: [{ id: 1, is_active: true }] });
    (validateInsightText as jest.Mock).mockReturnValue({
      isValid: false,
      error: 'Content contains inappropriate language',
    });

    const req = makePostRequest('aries-rising', {
      post_text: 'Some blocked content here that should be caught',
    });
    const res = await POST(req, {
      params: Promise.resolve({ slug: 'aries-rising' }),
    });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/inappropriate/);
  });

  it('returns 429 when rate limited (3 posts per user)', async () => {
    (auth.api.getSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-1' },
    });
    sqlMock.mockResolvedValueOnce({ rows: [{ id: 1, is_active: true }] });
    sqlMock.mockResolvedValueOnce({ rows: [{ count: 3 }] });

    const req = makePostRequest('aries-rising', {
      post_text: 'This is my fourth post attempt',
    });
    const res = await POST(req, {
      params: Promise.resolve({ slug: 'aries-rising' }),
    });
    expect(res.status).toBe(429);
  });

  it('creates post successfully with valid input', async () => {
    (auth.api.getSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-1' },
    });
    sqlMock.mockResolvedValueOnce({ rows: [{ id: 1, is_active: true }] });
    sqlMock.mockResolvedValueOnce({ rows: [{ count: 0 }] });
    sqlMock.mockResolvedValueOnce({
      rows: [
        {
          id: 42,
          post_text: 'This is a valid community post',
          is_anonymous: true,
          created_at: new Date('2026-01-15'),
        },
      ],
    });

    const req = makePostRequest('aries-rising', {
      post_text: 'This is a valid community post',
      is_anonymous: true,
    });
    const res = await POST(req, {
      params: Promise.resolve({ slug: 'aries-rising' }),
    });
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.post.postText).toBe('This is a valid community post');
    expect(data.post.isAnonymous).toBe(true);
    expect(data.post.id).toBe(42);
  });

  it('returns 403 for inactive space', async () => {
    (auth.api.getSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-1' },
    });
    sqlMock.mockResolvedValueOnce({ rows: [{ id: 1, is_active: false }] });

    const req = makePostRequest('old-retrograde', {
      post_text: 'Trying to post in inactive space',
    });
    const res = await POST(req, {
      params: Promise.resolve({ slug: 'old-retrograde' }),
    });
    expect(res.status).toBe(403);
  });

  it('defaults to anonymous when is_anonymous not provided', async () => {
    (auth.api.getSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-1' },
    });
    sqlMock.mockResolvedValueOnce({ rows: [{ id: 1, is_active: true }] });
    sqlMock.mockResolvedValueOnce({ rows: [{ count: 0 }] });
    sqlMock.mockResolvedValueOnce({
      rows: [
        {
          id: 43,
          post_text: 'Post without anonymous flag specified',
          is_anonymous: true,
          created_at: new Date(),
        },
      ],
    });

    const req = makePostRequest('aries-rising', {
      post_text: 'Post without anonymous flag specified',
    });
    const res = await POST(req, {
      params: Promise.resolve({ slug: 'aries-rising' }),
    });
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.post.isAnonymous).toBe(true);
  });
});
