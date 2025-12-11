/**
 * Birth Chart Pack PDF Template
 *
 * Generates PDFs for birth chart packs with placement meanings and guidance.
 */

import { PDFDocument, PDFPage, PDFFont, PDFImage } from 'pdf-lib';
import {
  COLORS,
  FONT_SIZES,
  LINE_HEIGHT,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  MARGIN,
  CONTENT_WIDTH,
  SPACING,
} from '../theme';
import { PdfBirthChartPack, PdfBirthChartSection } from '../schema';

function drawBackground(page: PDFPage) {
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    color: COLORS.eventHorizon,
  });
}

function drawCenteredText(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  color = COLORS.stardust,
) {
  page.drawText(text, {
    x: (PAGE_WIDTH - font.widthOfTextAtSize(text, size)) / 2,
    y,
    size,
    font,
    color,
  });
}

function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(testLine, fontSize) <= maxWidth)
      currentLine = testLine;
    else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawDivider(page: PDFPage, y: number): number {
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: MARGIN + CONTENT_WIDTH, y },
    thickness: 0.5,
    color: COLORS.border,
  });
  return y - SPACING.md;
}

function drawFooter(
  page: PDFPage,
  packTitle: string,
  pageNum: number,
  totalPages: number,
  font: PDFFont,
) {
  const y = 35;
  page.drawText('Lunary', {
    x: MARGIN,
    y,
    size: FONT_SIZES.tiny,
    font,
    color: COLORS.nebulaViolet,
  });
  page.drawText(' · lunary.app', {
    x: MARGIN + font.widthOfTextAtSize('Lunary', FONT_SIZES.tiny),
    y,
    size: FONT_SIZES.tiny,
    font,
    color: COLORS.textSoft,
  });
  const pt = `${pageNum} of ${totalPages}`;
  page.drawText(pt, {
    x: PAGE_WIDTH - MARGIN - font.widthOfTextAtSize(pt, FONT_SIZES.tiny),
    y,
    size: FONT_SIZES.tiny,
    font,
    color: COLORS.textSoft,
  });
}

function buildBirthChartCoverPage(
  pdfDoc: PDFDocument,
  pack: PdfBirthChartPack,
  fonts: { regular: PDFFont; bold: PDFFont },
  logo: PDFImage | null,
): void {
  const { regular, bold } = fonts;
  const cover = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawBackground(cover);

  if (logo) {
    const s = 0.12;
    cover.drawImage(logo, {
      x: (PAGE_WIDTH - logo.width * s) / 2,
      y: PAGE_HEIGHT - 100 - logo.height * s,
      width: logo.width * s,
      height: logo.height * s,
    });
  }

  const centerY = PAGE_HEIGHT / 2 - 20;
  drawCenteredText(
    cover,
    'B I R T H   C H A R T   P A C K',
    centerY + 80,
    regular,
    FONT_SIZES.meta,
    COLORS.nebulaViolet,
  );
  drawCenteredText(
    cover,
    pack.title,
    centerY + 40,
    bold,
    FONT_SIZES.h1,
    COLORS.stardust,
  );
  if (pack.subtitle)
    drawCenteredText(
      cover,
      pack.subtitle,
      centerY,
      regular,
      FONT_SIZES.h4,
      COLORS.textMuted,
    );

  cover.drawLine({
    start: { x: PAGE_WIDTH / 2 - 40, y: centerY - 30 },
    end: { x: PAGE_WIDTH / 2 + 40, y: centerY - 30 },
    thickness: 0.5,
    color: COLORS.nebulaViolet,
  });

  if (pack.moodText) {
    const lines = wrapText(pack.moodText, regular, FONT_SIZES.body, 380);
    let y = centerY - 60;
    for (const line of lines.slice(0, 5)) {
      drawCenteredText(
        cover,
        line,
        y,
        regular,
        FONT_SIZES.body,
        COLORS.textSoft,
      );
      y -= FONT_SIZES.body * LINE_HEIGHT;
    }
  }

  drawCenteredText(
    cover,
    'lunary.app',
    60,
    regular,
    FONT_SIZES.tiny,
    COLORS.textSoft,
  );
}

function buildPlacementPage(
  pdfDoc: PDFDocument,
  section: PdfBirthChartSection,
  packTitle: string,
  fonts: { regular: PDFFont; bold: PDFFont },
  pageNum: number,
  totalPages: number,
): number {
  const { regular, bold } = fonts;
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawBackground(page);

  let y = PAGE_HEIGHT - MARGIN - 30;
  page.drawText(section.placement, {
    x: MARGIN,
    y,
    size: FONT_SIZES.h2,
    font: bold,
    color: COLORS.stardust,
  });
  y -= 25;

  if (section.sign) {
    page.drawText(section.sign, {
      x: MARGIN,
      y,
      size: FONT_SIZES.small,
      font: regular,
      color: COLORS.nebulaViolet,
    });
    y -= SPACING.sm;
  }

  y = drawDivider(page, y);

  const meaningLines = wrapText(
    section.meaning,
    regular,
    FONT_SIZES.body,
    CONTENT_WIDTH,
  );
  for (const line of meaningLines) {
    page.drawText(line, {
      x: MARGIN,
      y,
      size: FONT_SIZES.body,
      font: regular,
      color: COLORS.textMuted,
    });
    y -= FONT_SIZES.body * LINE_HEIGHT;
  }
  y -= SPACING.md;

  if (section.traits.length > 0) {
    page.drawText('Key Traits', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;
    for (const trait of section.traits) {
      page.drawText('✦', {
        x: MARGIN,
        y,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.nebulaViolet,
      });
      page.drawText(trait, {
        x: MARGIN + 15,
        y,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.textMuted,
      });
      y -= FONT_SIZES.body * LINE_HEIGHT;
    }
    y -= SPACING.md;
  }

  page.drawText('Guidance', {
    x: MARGIN,
    y,
    size: FONT_SIZES.h4,
    font: bold,
    color: COLORS.stardust,
  });
  y -= 20;
  const guidanceLines = wrapText(
    section.guidance,
    regular,
    FONT_SIZES.body,
    CONTENT_WIDTH,
  );
  for (const line of guidanceLines) {
    page.drawText(line, {
      x: MARGIN,
      y,
      size: FONT_SIZES.body,
      font: regular,
      color: COLORS.textMuted,
    });
    y -= FONT_SIZES.body * LINE_HEIGHT;
  }

  drawFooter(page, packTitle, pageNum, totalPages, regular);
  return pageNum + 1;
}

export async function generateBirthChartPackPdf(
  pack: PdfBirthChartPack,
  loadFonts: (
    pdfDoc: PDFDocument,
  ) => Promise<{ regular: PDFFont; bold: PDFFont }>,
  loadLogo: (pdfDoc: PDFDocument) => Promise<PDFImage | null>,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const [fonts, logo] = await Promise.all([
    loadFonts(pdfDoc),
    loadLogo(pdfDoc),
  ]);

  const totalPages = 1 + pack.sections.length + 1;
  let pageNum = 1;

  buildBirthChartCoverPage(pdfDoc, pack, fonts, logo);
  pageNum++;

  for (const section of pack.sections) {
    pageNum = buildPlacementPage(
      pdfDoc,
      section,
      pack.title,
      fonts,
      pageNum,
      totalPages,
    );
  }

  const { regular, bold } = fonts;
  const closing = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawBackground(closing);

  let y = PAGE_HEIGHT - MARGIN - 30;
  closing.drawText('Your Cosmic Blueprint', {
    x: MARGIN,
    y,
    size: FONT_SIZES.h2,
    font: bold,
    color: COLORS.stardust,
  });
  y -= SPACING.lg;

  const closingText =
    pack.closingText ||
    'Thank you for exploring your birth chart with Lunary. Your chart is a map, not a destiny - use it as a guide for self-understanding.';
  const lines = wrapText(closingText, regular, FONT_SIZES.body, CONTENT_WIDTH);
  for (const line of lines) {
    closing.drawText(line, {
      x: MARGIN,
      y,
      size: FONT_SIZES.body,
      font: regular,
      color: COLORS.textMuted,
    });
    y -= FONT_SIZES.body * LINE_HEIGHT;
  }

  y -= SPACING.xl;
  drawCenteredText(
    closing,
    'lunary.app',
    y,
    regular,
    FONT_SIZES.body,
    COLORS.textMuted,
  );
  if (logo)
    closing.drawImage(logo, {
      x: (PAGE_WIDTH - logo.width * 0.1) / 2,
      y: 60,
      width: logo.width * 0.1,
      height: logo.height * 0.1,
    });

  drawFooter(closing, pack.title, pageNum, totalPages, regular);
  return pdfDoc.save();
}
