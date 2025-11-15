import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { buildShareUrl, createShareToken } from '@/lib/cosmic-report/share';

const emailSchema = z.object({
  email: z.string().email(),
  make_public: z.boolean().optional(),
});

interface Params {
  id: string;
}

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    const body = await request.json();
    const parsed = emailSchema.parse(body);
    const id = Number(params.id);

    if (Number.isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid report id' },
        { status: 400 },
      );
    }

    const result = await sql`
      SELECT id, report_data, share_token, is_public
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

    const row = result.rows[0];
    let shareToken: string | null = row.share_token;
    let isPublic = row.is_public as boolean;

    if (parsed.make_public && !shareToken) {
      shareToken = createShareToken();
      isPublic = true;
      await sql`
        UPDATE cosmic_reports
        SET share_token = ${shareToken}, is_public = true
        WHERE id = ${id}
      `;
    }

    const shareUrl =
      shareToken && isPublic ? buildShareUrl(shareToken) : undefined;
    const pdfUrl = `/api/cosmic-report/${id}/pdf`;

    await sendEmail({
      to: parsed.email.toLowerCase(),
      subject: `Your Lunary ${row.report_data.reportType} report`,
      html: `
        <div style="font-family:Inter,Helvetica,sans-serif;background:#05020c;color:#f4f4ff;padding:32px;border-radius:20px">
          <h1>${row.report_data.title}</h1>
          <p>${row.report_data.subtitle}</p>
          ${shareUrl ? `<p><strong>Share Link:</strong> ${shareUrl}</p>` : ''}
          <p><a href="${pdfUrl}" style="color:#c4b5fd">Download PDF</a></p>
        </div>
      `,
      text: `${row.report_data.title}

${row.report_data.subtitle}
${shareUrl ? `Share: ${shareUrl}\n` : ''}Download PDF: ${pdfUrl}`,
    });

    return NextResponse.json({ success: true, message: 'Report emailed' });
  } catch (error) {
    console.error('Failed to email cosmic report:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload', issues: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: 'Unable to email report' },
      { status: 500 },
    );
  }
}
