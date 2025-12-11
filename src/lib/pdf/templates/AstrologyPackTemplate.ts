/**
 * Astrology Pack PDF Template
 *
 * Generates PDFs for astrology packs with transit guides and practical tips.
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
import { PdfAstrologyPack, PdfAstrologySection } from '../schema';

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
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: (PAGE_WIDTH - textWidth) / 2,
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
    color: COLORS.cometTrail,
  });
  const w = font.widthOfTextAtSize('Lunary', FONT_SIZES.tiny);
  page.drawText(' · lunary.app', {
    x: MARGIN + w,
    y,
    size: FONT_SIZES.tiny,
    font,
    color: COLORS.textSoft,
  });
  const pageText = `${pageNum} of ${totalPages}`;
  page.drawText(pageText, {
    x: PAGE_WIDTH - MARGIN - font.widthOfTextAtSize(pageText, FONT_SIZES.tiny),
    y,
    size: FONT_SIZES.tiny,
    font,
    color: COLORS.textSoft,
  });
}

function buildAstrologyCoverPage(
  pdfDoc: PDFDocument,
  pack: PdfAstrologyPack,
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
    'A S T R O L O G Y   P A C K',
    centerY + 80,
    regular,
    FONT_SIZES.meta,
    COLORS.cometTrail,
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
    color: COLORS.cometTrail,
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

function buildAstrologySection(
  pdfDoc: PDFDocument,
  section: PdfAstrologySection,
  packTitle: string,
  fonts: { regular: PDFFont; bold: PDFFont },
  pageNum: number,
  totalPages: number,
): number {
  const { regular, bold } = fonts;
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawBackground(page);

  let y = PAGE_HEIGHT - MARGIN - 30;
  page.drawText(section.title, {
    x: MARGIN,
    y,
    size: FONT_SIZES.h2,
    font: bold,
    color: COLORS.stardust,
  });
  y -= 25;
  y = drawDivider(page, y);

  const descLines = wrapText(
    section.description,
    regular,
    FONT_SIZES.body,
    CONTENT_WIDTH,
  );
  for (const line of descLines) {
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

  if (section.keyDates && section.keyDates.length > 0) {
    page.drawText('Key Dates', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;
    for (const date of section.keyDates) {
      page.drawText('◆', {
        x: MARGIN,
        y,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.cometTrail,
      });
      page.drawText(date, {
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

  if (section.practicalTips.length > 0) {
    page.drawText('Practical Tips', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;
    for (let i = 0; i < section.practicalTips.length; i++) {
      page.drawText(`${i + 1}.`, {
        x: MARGIN,
        y,
        size: FONT_SIZES.h4,
        font: bold,
        color: COLORS.cometTrail,
      });
      const lines = wrapText(
        section.practicalTips[i],
        regular,
        FONT_SIZES.body,
        CONTENT_WIDTH - 30,
      );
      for (const line of lines) {
        page.drawText(line, {
          x: MARGIN + 25,
          y,
          size: FONT_SIZES.body,
          font: regular,
          color: COLORS.textMuted,
        });
        y -= FONT_SIZES.body * LINE_HEIGHT;
      }
      y -= SPACING.xs;
    }
  }

  drawFooter(page, packTitle, pageNum, totalPages, regular);
  return pageNum + 1;
}

export async function generateAstrologyPackPdf(
  pack: PdfAstrologyPack,
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

  buildAstrologyCoverPage(pdfDoc, pack, fonts, logo);
  pageNum++;

  for (const section of pack.sections) {
    pageNum = buildAstrologySection(
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
  closing.drawText('Cosmic Guidance', {
    x: MARGIN,
    y,
    size: FONT_SIZES.h2,
    font: bold,
    color: COLORS.stardust,
  });
  y -= SPACING.lg;

  const closingText =
    pack.closingText ||
    'Thank you for exploring the cosmos with Lunary. May the stars illuminate your path.';
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
