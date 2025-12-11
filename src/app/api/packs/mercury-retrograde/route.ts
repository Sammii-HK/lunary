import { NextResponse } from 'next/server';
import { generateMercuryRetrogradePdf } from '@/lib/pdf/packs/mercuryRetrogradePack';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pdfBytes = await generateMercuryRetrogradePdf();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          'attachment; filename="mercury-retrograde-survival.pdf"',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Failed to generate Mercury Retrograde PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 },
    );
  }
}
