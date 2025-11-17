import { auth } from '@/lib/auth';
import { withCors } from '@/lib/auth-cors';

async function handleAuthRequest(request: Request) {
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.DEBUG_AUTH === 'true'
  ) {
    console.log('🔍 Auth request to get-session:', {
      method: request.method,
      url: request.url,
    });
  }

  try {
    const response = await withCors(request, auth.handler);

    // Read the response body to check if it's valid JSON
    const text = await response.text().catch(() => '');

    // If empty, return a valid JSON response
    if (!text || text.trim() === '') {
      return new Response(JSON.stringify({ session: null }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(response.headers.entries()),
        },
      });
    }

    // Try to parse to ensure it's valid JSON
    try {
      JSON.parse(text);
      // If valid JSON, recreate the response with the text
      return new Response(text, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (parseError) {
      // If parsing fails, return a valid JSON error response
      console.error('❌ Invalid JSON in get-session response:', {
        text: text.substring(0, 100),
        status: response.status,
      });
      return new Response(
        JSON.stringify({
          session: null,
          error: 'Invalid response format',
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(response.headers.entries()),
          },
        },
      );
    }
  } catch (error) {
    console.error('❌ Error in get-session handler:', {
      error: error instanceof Error ? error.message : String(error),
      method: request.method,
      url: request.url,
    });

    // Return a valid JSON error response instead of throwing
    return new Response(
      JSON.stringify({
        error: 'Failed to get session',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}

export async function GET(request: Request) {
  return handleAuthRequest(request);
}

export async function POST(request: Request) {
  return handleAuthRequest(request);
}

export async function PUT(request: Request) {
  return handleAuthRequest(request);
}

export async function DELETE(request: Request) {
  return handleAuthRequest(request);
}

export async function OPTIONS(request: Request) {
  return handleAuthRequest(request);
}
