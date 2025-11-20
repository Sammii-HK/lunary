import { NextRequest, NextResponse } from 'next/server';
import { SUBSTACK_CONFIG } from '@/config/substack';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { authenticateWithCookies } = await import(
      '../../../../../utils/substack/publisher'
    );

    if (!SUBSTACK_CONFIG.publicationUrl) {
      return NextResponse.json({
        success: false,
        error: 'Substack publication URL not configured',
        configured: false,
      });
    }

    let browser: any = null;
    try {
      const playwright = await import('playwright');
      const { chromium } = playwright;
      browser = await chromium.launch({
        headless: true,
      });

      const context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });

      const page = await context.newPage();

      const authenticated = await authenticateWithCookies(context, page);

      if (authenticated) {
        await page.goto(`${SUBSTACK_CONFIG.publicationUrl}/dashboard`);
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        const isAuthenticated =
          currentUrl.includes('/dashboard') ||
          currentUrl.includes('/publish') ||
          !currentUrl.includes('/sign-in');

        await browser.close();

        return NextResponse.json({
          success: true,
          authenticated: isAuthenticated,
          message: isAuthenticated
            ? 'Substack connection verified successfully'
            : 'Substack authentication failed',
          publicationUrl: SUBSTACK_CONFIG.publicationUrl,
        });
      } else {
        await browser.close();
        return NextResponse.json({
          success: false,
          authenticated: false,
          error:
            'Failed to authenticate with Substack. Please run the cookie setup script.',
        });
      }
    } catch (error) {
      if (browser) {
        await browser.close();
      }
      return NextResponse.json({
        success: false,
        authenticated: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error during verification',
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
