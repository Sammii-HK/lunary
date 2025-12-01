import { NextRequest, NextResponse } from 'next/server';
import { SUBSTACK_CONFIG } from '@/config/substack';
import { verifySubstackConnection } from '../../../../../utils/substack/publisher';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!SUBSTACK_CONFIG.publicationUrl) {
      return NextResponse.json({
        success: false,
        error: 'Substack publication URL not configured',
        configured: false,
      });
    }

    const result = await verifySubstackConnection();

    if (result.authenticated) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        message: `Connected to ${result.publication?.name || 'Substack'}`,
        publicationUrl: SUBSTACK_CONFIG.publicationUrl,
        publication: result.publication,
      });
    } else {
      return NextResponse.json({
        success: false,
        authenticated: false,
        error:
          result.error ||
          'Failed to authenticate. Please run the cookie setup script.',
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to verify Substack connection',
      },
      { status: 500 },
    );
  }
}
