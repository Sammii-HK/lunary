import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const swPath = join(process.cwd(), 'public', 'sw.js');
    const swContent = readFileSync(swPath, 'utf-8');

    return new NextResponse(swContent, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'Service-Worker-Allowed': '/',
      },
    });
  } catch (error) {
    console.error('Failed to serve service worker:', error);
    return new NextResponse('Service worker not found', { status: 404 });
  }
}
