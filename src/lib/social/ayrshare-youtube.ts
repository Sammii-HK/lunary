/**
 * Ayrshare YouTube posting helper
 *
 * Routes YouTube uploads through Ayrshare instead of the direct YouTube Data API.
 * Ayrshare accepts mediaUrls directly (no need to download video buffers).
 */

const AYRSHARE_API_URL = 'https://api.ayrshare.com/api';

function getAyrshareConfig() {
  const apiKey = process.env.AYRSHARE_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Ayrshare not configured. Set AYRSHARE_API_KEY environment variable.',
    );
  }
  const profileKey = process.env.AYRSHARE_PROFILE_KEY;
  return { apiKey, profileKey };
}

function getAyrshareHeaders() {
  const { apiKey, profileKey } = getAyrshareConfig();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
  if (profileKey) {
    headers['Profile-Key'] = profileKey;
  }
  return headers;
}

export interface AyrshareYouTubeParams {
  content: string;
  videoUrl: string;
  title: string;
  isShort?: boolean;
  visibility?: string;
  playlistId?: string;
  tags?: string[];
  madeForKids?: boolean;
  categoryId?: string;
  publishAt?: string;
}

export interface AyrshareYouTubeResult {
  success: boolean;
  videoId?: string;
  postId?: string;
  url?: string;
  error?: string;
  rawResponse?: unknown;
}

export async function postVideoToYouTubeViaAyrshare(
  params: AyrshareYouTubeParams,
): Promise<AyrshareYouTubeResult> {
  const headers = getAyrshareHeaders();

  const youTubeOptions: Record<string, unknown> = {
    title: params.title,
    shorts: params.isShort ?? false,
    visibility: params.visibility || 'public',
    madeForKids: params.madeForKids ?? false,
    categoryId: parseInt(params.categoryId || '22', 10),
    notifySubscribers: false,
  };

  if (params.tags && params.tags.length > 0) {
    youTubeOptions.tags = params.tags;
  }

  if (params.playlistId) {
    youTubeOptions.playListId = params.playlistId;
  }

  if (params.publishAt) {
    youTubeOptions.publishAt = params.publishAt;
  }

  const payload: Record<string, unknown> = {
    post: params.content,
    platforms: ['youtube'],
    mediaUrls: [params.videoUrl],
    isVideo: true,
    youTubeOptions,
  };

  try {
    const response = await fetch(`${AYRSHARE_API_URL}/post`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Ayrshare YouTube API error (${response.status}):`,
        errorText,
      );
      let rawResponse: unknown;
      try {
        rawResponse = JSON.parse(errorText);
      } catch {
        rawResponse = errorText;
      }
      return {
        success: false,
        error: `Ayrshare YouTube API error (${response.status}): ${errorText}`,
        rawResponse,
      };
    }

    const data = await response.json();

    if (data.status === 'error') {
      return {
        success: false,
        error: data.message || 'Ayrshare YouTube post failed',
        rawResponse: data,
      };
    }

    const ytResult = data.youtube;
    if (ytResult?.status === 'error') {
      return {
        success: false,
        error: ytResult.message || 'YouTube post failed via Ayrshare',
        rawResponse: data,
      };
    }

    return {
      success: true,
      videoId: ytResult?.id || undefined,
      postId: data.id || data.refId,
      url: ytResult?.postUrl || undefined,
      rawResponse: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
