/**
 * Self-Love Pack Download API
 *
 * GET /api/packs/self-love
 * Returns the Self-Love Ritual Pack as a downloadable PDF
 */

import { NextResponse } from 'next/server';
import { generateSelfLovePackPdf } from '@/lib/pdf/packs/selfLovePack';

export async function GET() {
  try {
    const pdfBytes = await generateSelfLovePackPdf();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          'attachment; filename="lunary-self-love-pack.pdf"',
        'Content-Length': String(pdfBytes.length),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Failed to generate Self-Love Pack PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 },
    );
  }
}
