import { SUBSTACK_CONFIG } from '../../src/config/substack';

export interface SubstackDraftPayload {
  title: string;
  subtitle?: string;
  body_json?: object;
  body_html?: string;
  audience: 'everyone' | 'only_paid' | 'only_free' | 'founding';
  type?: 'newsletter' | 'podcast' | 'thread';
  section_id?: number;
}

export interface SubstackDraftResponse {
  id: number;
  title: string;
  subtitle: string;
  slug: string;
  draft_title: string;
  draft_subtitle: string;
  draft_body: string;
  audience: string;
  type: string;
  post_date: string;
}

export interface SubstackPublishResponse {
  id: number;
  slug: string;
  canonical_url: string;
  post_date: string;
}

export interface SubstackPublicationInfo {
  id: number;
  name: string;
  subdomain: string;
  custom_domain?: string;
  author_id: number;
  bylines?: { id: number; name: string }[];
}

export interface PublishResult {
  success: boolean;
  postUrl?: string;
  error?: string;
  tier: 'free' | 'paid';
  draftId?: number;
}

interface PlaywrightCookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
}

export class SubstackClient {
  private baseUrl: string;
  private cookies: string;
  private publicationSubdomain: string;
  private authorId: number | null = null;

  constructor(publicationUrl: string, cookies: PlaywrightCookie[]) {
    const url = new URL(publicationUrl);
    this.publicationSubdomain = url.hostname.split('.')[0];
    this.baseUrl = `https://${this.publicationSubdomain}.substack.com/api/v1`;
    this.cookies = this.formatCookies(cookies);
  }

  private formatCookies(playwrightCookies: PlaywrightCookie[]): string {
    return playwrightCookies
      .filter((c) => c.domain?.includes('substack.com'))
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      Cookie: this.cookies,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Origin: `https://${this.publicationSubdomain}.substack.com`,
      Referer: `https://${this.publicationSubdomain}.substack.com/publish`,
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Substack API error: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    return response.json();
  }

  async verifyAuthentication(): Promise<{
    authenticated: boolean;
    publication?: SubstackPublicationInfo;
    error?: string;
  }> {
    try {
      const publication =
        await this.request<SubstackPublicationInfo>('/publication');
      this.authorId = publication.author_id;
      return {
        authenticated: true,
        publication,
      };
    } catch (error) {
      return {
        authenticated: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getDefaultBylines(): Promise<{ id: number; is_guest: boolean }[]> {
    try {
      const pub = await this.request<Record<string, unknown>>('/publication');

      const bylines = pub.bylines as { id: number }[] | undefined;
      const authorId = pub.author_id as number | undefined;
      const author = pub.author as { id: number } | undefined;

      if (bylines && bylines.length > 0) {
        return bylines.map((b) => ({ id: b.id, is_guest: false }));
      }

      if (authorId) {
        return [{ id: authorId, is_guest: false }];
      }

      if (author?.id) {
        return [{ id: author.id, is_guest: false }];
      }

      return [];
    } catch {
      return [];
    }
  }

  async createDraft(
    payload: SubstackDraftPayload,
  ): Promise<SubstackDraftResponse> {
    const bylines = await this.getDefaultBylines();

    const draftPayload: Record<string, unknown> = {
      draft_title: payload.title,
      draft_subtitle: payload.subtitle || '',
      draft_bylines: bylines.length > 0 ? bylines : [],
      audience: payload.audience,
      type: payload.type || 'newsletter',
    };

    if (payload.body_json) {
      draftPayload.draft_body = JSON.stringify(payload.body_json);
    } else if (payload.body_html) {
      draftPayload.draft_body = payload.body_html;
    }

    if (payload.section_id) {
      draftPayload.section_id = payload.section_id;
    }

    return this.request<SubstackDraftResponse>('/drafts', {
      method: 'POST',
      body: JSON.stringify(draftPayload),
    });
  }

  async publishDraft(
    draftId: number,
    sendEmail: boolean = true,
  ): Promise<SubstackPublishResponse> {
    return this.request<SubstackPublishResponse>(`/drafts/${draftId}/publish`, {
      method: 'POST',
      body: JSON.stringify({
        send: sendEmail,
      }),
    });
  }

  async createAndPublish(
    title: string,
    content: string,
    options: {
      subtitle?: string;
      audience?: 'everyone' | 'only_paid' | 'only_free' | 'founding';
      sendEmail?: boolean;
    } = {},
  ): Promise<{
    success: boolean;
    postUrl?: string;
    draftId?: number;
    error?: string;
  }> {
    try {
      const bodyJson = this.markdownToProseMirror(content);

      const draft = await this.createDraft({
        title,
        subtitle: options.subtitle,
        body_json: bodyJson,
        audience: options.audience || 'everyone',
      });

      console.log(`📝 Draft created with ID: ${draft.id}`);

      const published = await this.publishDraft(
        draft.id,
        options.sendEmail ?? true,
      );

      const postUrl =
        published.canonical_url ||
        (draft.slug
          ? `https://${this.publicationSubdomain}.substack.com/p/${draft.slug}`
          : `https://${this.publicationSubdomain}.substack.com/p/${draft.id}`);

      console.log(`🚀 Post published: ${postUrl}`);

      return {
        success: true,
        postUrl,
        draftId: draft.id,
      };
    } catch (error) {
      console.error('Failed to publish to Substack:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private markdownToProseMirror(markdown: string): object {
    const content: object[] = [];
    const lines = markdown.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith('# ')) {
        content.push({
          type: 'heading',
          attrs: { level: 2 },
          content: this.parseInlineContent(line.substring(2)),
        });
      } else if (line.startsWith('## ')) {
        content.push({
          type: 'heading',
          attrs: { level: 3 },
          content: this.parseInlineContent(line.substring(3)),
        });
      } else if (line.startsWith('### ')) {
        content.push({
          type: 'heading',
          attrs: { level: 4 },
          content: this.parseInlineContent(line.substring(4)),
        });
      } else if (line.startsWith('#### ')) {
        content.push({
          type: 'heading',
          attrs: { level: 5 },
          content: this.parseInlineContent(line.substring(5)),
        });
      } else if (line === '---') {
        content.push({ type: 'horizontal_rule' });
      } else if (line.startsWith('- ')) {
        const listItems: object[] = [];
        while (i < lines.length && lines[i].startsWith('- ')) {
          listItems.push({
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: this.parseInlineContent(lines[i].substring(2)),
              },
            ],
          });
          i++;
        }
        content.push({
          type: 'bullet_list',
          content: listItems,
        });
        continue;
      } else if (line.trim() === '') {
        i++;
        continue;
      } else {
        content.push({
          type: 'paragraph',
          content: this.parseInlineContent(line),
        });
      }

      i++;
    }

    return {
      type: 'doc',
      content,
    };
  }

  private parseInlineContent(
    text: string,
    existingMarks: object[] = [],
  ): object[] {
    const result: object[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
      if (boldMatch) {
        const innerContent = this.parseInlineContent(boldMatch[1], [
          ...existingMarks,
          { type: 'bold' },
        ]);
        result.push(...innerContent);
        remaining = remaining.substring(boldMatch[0].length);
        continue;
      }

      const italicMatch = remaining.match(/^\*([^*]+)\*/);
      if (italicMatch) {
        const innerContent = this.parseInlineContent(italicMatch[1], [
          ...existingMarks,
          { type: 'italic' },
        ]);
        result.push(...innerContent);
        remaining = remaining.substring(italicMatch[0].length);
        continue;
      }

      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const linkMark = {
          type: 'link',
          attrs: {
            href: linkMatch[2],
            target: '_blank',
            rel: 'noopener noreferrer nofollow',
            class: null,
          },
        };
        result.push({
          type: 'text',
          marks: [...existingMarks, linkMark],
          text: linkMatch[1],
        });
        remaining = remaining.substring(linkMatch[0].length);
        continue;
      }

      const nextSpecial = remaining.search(/\*|\[/);
      if (nextSpecial === -1) {
        if (remaining.length > 0) {
          if (existingMarks.length > 0) {
            result.push({
              type: 'text',
              marks: existingMarks,
              text: remaining,
            });
          } else {
            result.push({ type: 'text', text: remaining });
          }
        }
        break;
      } else if (nextSpecial === 0) {
        if (existingMarks.length > 0) {
          result.push({
            type: 'text',
            marks: existingMarks,
            text: remaining[0],
          });
        } else {
          result.push({ type: 'text', text: remaining[0] });
        }
        remaining = remaining.substring(1);
      } else {
        if (existingMarks.length > 0) {
          result.push({
            type: 'text',
            marks: existingMarks,
            text: remaining.substring(0, nextSpecial),
          });
        } else {
          result.push({
            type: 'text',
            text: remaining.substring(0, nextSpecial),
          });
        }
        remaining = remaining.substring(nextSpecial);
      }
    }

    return result.length > 0 ? result : [{ type: 'text', text: '' }];
  }
}

export async function loadCookiesFromDatabase(): Promise<
  PlaywrightCookie[] | null
> {
  try {
    const { sql } = await import('@vercel/postgres');
    const COOKIES_KEY = 'substack_auth_cookies';

    const result = await sql`
      SELECT value FROM app_config 
      WHERE key = ${COOKIES_KEY}
      LIMIT 1
    `;

    if (result.rows.length > 0 && result.rows[0].value) {
      const cookies = JSON.parse(result.rows[0].value);
      return Array.isArray(cookies) ? cookies : null;
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('relation "app_config" does not exist')
    ) {
      console.warn('app_config table does not exist');
    } else {
      console.warn('Failed to load cookies from database:', error);
    }
  }
  return null;
}

export async function createSubstackClient(): Promise<SubstackClient | null> {
  const publicationUrl = SUBSTACK_CONFIG.publicationUrl;

  if (!publicationUrl) {
    console.error('Substack publication URL not configured');
    return null;
  }

  const cookies = await loadCookiesFromDatabase();

  if (!cookies || cookies.length === 0) {
    console.error('No Substack cookies found in database');
    return null;
  }

  return new SubstackClient(publicationUrl, cookies);
}
