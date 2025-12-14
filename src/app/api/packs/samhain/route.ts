import { NextResponse } from 'next/server';
import { generateSamhainPdf } from '@/lib/pdf/packs/samhainPack';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pdfBytes = await generateSamhainPdf();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="samhain-ritual-pack.pdf"',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Failed to generate Samhain PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 },
    );
  }
}
