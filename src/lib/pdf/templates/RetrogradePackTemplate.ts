/**
 * Retrograde Pack PDF Template
 *
 * Generates PDFs for retrograde survival packs with do/don't lists.
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
import { PdfRetrogradePack, PdfRetrogradeSurvival } from '../schema';

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
    color: COLORS.cosmicRose,
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

function buildRetrogradeCoverPage(
  pdfDoc: PDFDocument,
  pack: PdfRetrogradePack,
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
    'R E T R O G R A D E   P A C K',
    centerY + 80,
    regular,
    FONT_SIZES.meta,
    COLORS.cosmicRose,
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
  drawCenteredText(
    cover,
    pack.planet,
    centerY - 25,
    regular,
    FONT_SIZES.small,
    COLORS.cosmicRose,
  );

  cover.drawLine({
    start: { x: PAGE_WIDTH / 2 - 40, y: centerY - 50 },
    end: { x: PAGE_WIDTH / 2 + 40, y: centerY - 50 },
    thickness: 0.5,
    color: COLORS.cosmicRose,
  });

  if (pack.moodText) {
    const lines = wrapText(pack.moodText, regular, FONT_SIZES.body, 380);
    let y = centerY - 80;
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

function buildSurvivalPage(
  pdfDoc: PDFDocument,
  guide: PdfRetrogradeSurvival,
  packTitle: string,
  fonts: { regular: PDFFont; bold: PDFFont },
  pageNum: number,
  totalPages: number,
): number {
  const { regular, bold } = fonts;
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawBackground(page);

  let y = PAGE_HEIGHT - MARGIN - 30;
  page.drawText(guide.phase, {
    x: MARGIN,
    y,
    size: FONT_SIZES.h2,
    font: bold,
    color: COLORS.stardust,
  });
  y -= 25;
  y = drawDivider(page, y);

  const descLines = wrapText(
    guide.description,
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

  // DO list
  if (guide.doList.length > 0) {
    page.drawText('DO', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;
    for (const item of guide.doList) {
      page.drawText('✓', {
        x: MARGIN,
        y,
        size: FONT_SIZES.body,
        font: bold,
        color: COLORS.auroraGreen,
      });
      page.drawText(item, {
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

  // DON'T list
  if (guide.dontList.length > 0) {
    page.drawText("DON'T", {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;
    for (const item of guide.dontList) {
      page.drawText('✕', {
        x: MARGIN,
        y,
        size: FONT_SIZES.body,
        font: bold,
        color: COLORS.solarFlare,
      });
      page.drawText(item, {
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

  // Affirmation callout
  if (guide.affirmation) {
    const padding = 18;
    const lines = wrapText(
      guide.affirmation,
      regular,
      FONT_SIZES.body,
      CONTENT_WIDTH - padding * 2 - 15,
    );
    const boxHeight =
      lines.length * (FONT_SIZES.body * LINE_HEIGHT) + padding * 2;

    page.drawRectangle({
      x: MARGIN,
      y: y - boxHeight,
      width: CONTENT_WIDTH,
      height: boxHeight,
      color: COLORS.backgroundAlt,
      borderColor: COLORS.border,
      borderWidth: 0.5,
    });
    page.drawRectangle({
      x: MARGIN,
      y: y - boxHeight,
      width: 4,
      height: boxHeight,
      color: COLORS.cosmicRose,
    });

    let textY = y - padding - FONT_SIZES.body;
    for (const line of lines) {
      page.drawText(line, {
        x: MARGIN + padding + 8,
        y: textY,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.textMuted,
      });
      textY -= FONT_SIZES.body * LINE_HEIGHT;
    }
  }

  drawFooter(page, packTitle, pageNum, totalPages, regular);
  return pageNum + 1;
}

export async function generateRetrogradePackPdf(
  pack: PdfRetrogradePack,
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

  const totalPages = 1 + pack.survivalGuide.length + 1;
  let pageNum = 1;

  buildRetrogradeCoverPage(pdfDoc, pack, fonts, logo);
  pageNum++;

  for (const guide of pack.survivalGuide) {
    pageNum = buildSurvivalPage(
      pdfDoc,
      guide,
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
  closing.drawText('Surviving the Storm', {
    x: MARGIN,
    y,
    size: FONT_SIZES.h2,
    font: bold,
    color: COLORS.stardust,
  });
  y -= SPACING.lg;

  const closingText =
    pack.closingText ||
    'Thank you for navigating this retrograde with Lunary. Remember: retrogrades are invitations to slow down, reflect, and realign.';
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
