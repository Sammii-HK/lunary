import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { generateCosmicReportPdf } from '@/lib/cosmic-report/pdf-generator';
import { CosmicReportData } from '@/lib/cosmic-report/types';

export async function GET(_request: NextRequest, context: any) {
  try {
    const { params } = context as { params: { id: string } };
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid report id' },
        { status: 400 },
      );
    }

    const result = await sql`
      SELECT id, report_data
      FROM cosmic_reports
      WHERE id = ${id}
      LIMIT 1
    `;

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Report not found' },
        { status: 404 },
      );
    }

    const report: CosmicReportData = result.rows[0].report_data;
    const pdfBytes = await generateCosmicReportPdf(report);
    const pdfBuffer = Buffer.from(pdfBytes);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="lunary-${id}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Failed to create cosmic report PDF:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to create PDF' },
      { status: 500 },
    );
  }
}
