import { getCorsHeaders, isValidOrigin } from './origin-validation';

function createRequestWithValidatedOrigin(
  request: Request,
  origin: string | null,
): Request {
  if (!origin || !isValidOrigin(origin)) {
    return request;
  }

  const url = new URL(request.url);
  const headers = new Headers(request.headers);

  const normalizedOrigin = origin.replace(/\/+$/, '');
  headers.set('origin', normalizedOrigin);

  return new Request(url.toString(), {
    method: request.method,
    headers,
    body: request.body,
    redirect: request.redirect,
  });
}

export async function withCors(
  request: Request,
  handler: (request: Request) => Promise<Response>,
): Promise<Response> {
  const origin = request.headers.get('origin');

  if (request.method === 'OPTIONS') {
    const corsHeaders = getCorsHeaders(origin);
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const validatedRequest = createRequestWithValidatedOrigin(request, origin);
    const response = await handler(validatedRequest);

    if (response.status === 403 && isValidOrigin(origin)) {
      const clonedResponse = response.clone();
      const responseText = await clonedResponse.text();
      if (responseText.includes('Invalid origin')) {
        console.warn(
          `⚠️ Better Auth rejected valid origin: ${origin}. Check if it's in trustedOrigins.`,
        );
      }
    }

    if (!isValidOrigin(origin)) {
      return response;
    }

    const corsHeaders = getCorsHeaders(origin);
    const newHeaders = new Headers(response.headers);

    Object.entries(corsHeaders).forEach(([key, value]) => {
      if (value) {
        newHeaders.set(key, value);
      }
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  } catch (error) {
    if (error instanceof Response) {
      const newHeaders = new Headers(error.headers);
      if (isValidOrigin(origin)) {
        const corsHeaders = getCorsHeaders(origin);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          if (value) {
            newHeaders.set(key, value);
          }
        });
      }
      return new Response(error.body, {
        status: error.status,
        statusText: error.statusText,
        headers: newHeaders,
      });
    }
    throw error;
  }
}
