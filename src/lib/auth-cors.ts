import { getCorsHeaders, isValidOrigin } from './origin-validation';

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
    const response = await handler(request);

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
