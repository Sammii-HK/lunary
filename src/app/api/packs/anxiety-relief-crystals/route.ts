import { NextResponse } from 'next/server';
import { generateAnxietyReliefCrystalsPdf } from '@/lib/pdf/packs/anxietyReliefCrystalsPack';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pdfBytes = await generateAnxietyReliefCrystalsPdf();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          'attachment; filename="anxiety-relief-crystals.pdf"',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Failed to generate Anxiety Relief Crystals PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 },
    );
  }
}
