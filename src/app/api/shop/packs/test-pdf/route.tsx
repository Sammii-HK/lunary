/**
 * Minimal PDF test using pdf-lib instead (React-PDF has React 19 issues)
 */

import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('🧪 Generating test PDF with pdf-lib...');

    // Create PDF using pdf-lib (more reliable than react-pdf with Next.js 15)
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Page 1 - Cover
    const coverPage = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = coverPage.getSize();

    // Dark background effect (draw rectangles)
    coverPage.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: height,
      color: rgb(0.04, 0.04, 0.04), // #0A0A0A
    });

    // Title
    coverPage.drawText('SPELL PACK', {
      x: width / 2 - 60,
      y: height - 200,
      size: 12,
      font: font,
      color: rgb(0.52, 0.35, 0.85), // #8458D8
    });

    coverPage.drawText('Self-Love Ritual Pack', {
      x: width / 2 - 120,
      y: height - 250,
      size: 28,
      font: boldFont,
      color: rgb(1, 1, 1), // white
    });

    coverPage.drawText('Return to yourself with gentle magic.', {
      x: width / 2 - 130,
      y: height - 290,
      size: 14,
      font: font,
      color: rgb(0.7, 0.7, 0.7),
    });

    // Divider line
    coverPage.drawLine({
      start: { x: width / 2 - 50, y: height - 320 },
      end: { x: width / 2 + 50, y: height - 320 },
      thickness: 1,
      color: rgb(0.52, 0.35, 0.85),
    });

    // Logo
    coverPage.drawText('LUNARY', {
      x: width / 2 - 30,
      y: 100,
      size: 14,
      font: boldFont,
      color: rgb(0.52, 0.35, 0.85),
    });

    // Page 2 - Content
    const contentPage = pdfDoc.addPage([595.28, 841.89]);
    contentPage.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: height,
      color: rgb(0.04, 0.04, 0.04),
    });

    contentPage.drawText('Welcome to Your Pack', {
      x: 50,
      y: height - 80,
      size: 22,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    contentPage.drawText('8 spells curated for you', {
      x: 50,
      y: height - 110,
      size: 10,
      font: font,
      color: rgb(0.7, 0.7, 0.7),
    });

    // Callout box
    contentPage.drawRectangle({
      x: 50,
      y: height - 200,
      width: width - 100,
      height: 60,
      color: rgb(0.1, 0.1, 0.18),
      borderColor: rgb(0.52, 0.35, 0.85),
      borderWidth: 2,
    });

    contentPage.drawText(
      'Before beginning any spell, take a moment to centre yourself.',
      {
        x: 60,
        y: height - 165,
        size: 10,
        font: font,
        color: rgb(0.7, 0.7, 0.7),
      },
    );

    contentPage.drawText('Ground your energy and create sacred space.', {
      x: 60,
      y: height - 180,
      size: 10,
      font: font,
      color: rgb(0.7, 0.7, 0.7),
    });

    const pdfBytes = await pdfDoc.save();

    console.log('✅ Test PDF generated:', pdfBytes.length, 'bytes');

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test.pdf"',
      },
    });
  } catch (error: any) {
    console.error('❌ Test PDF failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
