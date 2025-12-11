import { NextResponse } from 'next/server';
import { generateSaturnReturnPdf } from '@/lib/pdf/packs/saturnReturnPack';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pdfBytes = await generateSaturnReturnPdf();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="saturn-return-guide.pdf"',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Failed to generate Saturn Return PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 },
    );
  }
}
