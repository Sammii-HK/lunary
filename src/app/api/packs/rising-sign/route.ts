import { NextResponse } from 'next/server';
import { generateRisingSignPdf } from '@/lib/pdf/packs/risingSignPack';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pdfBytes = await generateRisingSignPdf();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="rising-sign-guide.pdf"',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Failed to generate Rising Sign PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 },
    );
  }
}
