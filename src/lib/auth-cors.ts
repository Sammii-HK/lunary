import { getCorsHeaders, isValidOrigin } from './origin-validation';

function createRequestWithValidatedOrigin(
  request: Request,
  origin: string | null,
): Request {
  if (!origin || !isValidOrigin(origin)) {
    return request;
  }

  // Better Auth handles origin validation internally, so we don't need to modify the request
  // Just pass it through - the origin header is already set by the browser
  return request;
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
    console.log('🔍 withCors: Calling auth handler', {
      method: request.method,
      url: request.url,
      origin,
    });

    const validatedRequest = createRequestWithValidatedOrigin(request, origin);
    const response = await handler(validatedRequest);

    // Log if we get an error response
    if (response.status >= 400) {
      const clonedResponse = response.clone();
      const responseText = await clonedResponse.text();
      console.error('❌ Auth handler returned error:', {
        status: response.status,
        method: request.method,
        url: request.url,
        origin,
        responseText: responseText.substring(0, 500),
      });

      // If it's a 500 error with "invalid tag", it's likely a secret mismatch
      if (response.status === 500 && responseText.includes('invalid tag')) {
        console.error(
          '⚠️ Encryption error detected - BETTER_AUTH_SECRET mismatch',
        );
        console.error(
          '💡 Solution: Set BETTER_AUTH_SECRET in .env.local to match the secret used to encrypt existing credentials',
        );
      }

      // Log 405 errors specifically
      if (response.status === 405) {
        console.error(
          '⚠️ Method Not Allowed (405) - Better Auth handler rejected the HTTP method',
        );
        console.error('Request details:', {
          method: request.method,
          url: request.url,
          headers: Object.fromEntries(request.headers.entries()),
        });
      }
    }

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
    console.error('❌ Error in withCors wrapper:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      method: request.method,
      url: request.url,
      origin,
    });

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

    // Return proper error response instead of throwing
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message:
          process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...(isValidOrigin(origin) ? getCorsHeaders(origin) : {}),
        },
      },
    );
  }
}
