import { NextResponse } from 'next/server';
import { generateShadowWorkTarotPdf } from '@/lib/pdf/packs/shadowWorkTarotPack';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pdfBytes = await generateShadowWorkTarotPdf();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="shadow-work-tarot.pdf"',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Failed to generate Shadow Work Tarot PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 },
    );
  }
}
