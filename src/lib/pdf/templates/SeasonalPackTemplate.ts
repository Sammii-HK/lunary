/**
 * Seasonal Pack PDF Template
 *
 * Generates PDFs for sabbat and seasonal packs with rituals and correspondences.
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
import { PdfSeasonalPack, PdfSeasonalRitual } from '../schema';

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
    if (font.widthOfTextAtSize(testLine, fontSize) <= maxWidth) {
      currentLine = testLine;
    } else {
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
    color: COLORS.supernova,
  });
  const lunaryWidth = font.widthOfTextAtSize('Lunary', FONT_SIZES.tiny);
  page.drawText(' · lunary.app', {
    x: MARGIN + lunaryWidth,
    y,
    size: FONT_SIZES.tiny,
    font,
    color: COLORS.textSoft,
  });
  const pageText = `${pageNum} of ${totalPages}`;
  const pageWidth = font.widthOfTextAtSize(pageText, FONT_SIZES.tiny);
  page.drawText(pageText, {
    x: PAGE_WIDTH - MARGIN - pageWidth,
    y,
    size: FONT_SIZES.tiny,
    font,
    color: COLORS.textSoft,
  });
}

function buildSeasonalCoverPage(
  pdfDoc: PDFDocument,
  pack: PdfSeasonalPack,
  fonts: { regular: PDFFont; bold: PDFFont },
  logo: PDFImage | null,
): void {
  const { regular, bold } = fonts;
  const cover = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawBackground(cover);

  if (logo) {
    const logoScale = 0.12;
    cover.drawImage(logo, {
      x: (PAGE_WIDTH - logo.width * logoScale) / 2,
      y: PAGE_HEIGHT - 100 - logo.height * logoScale,
      width: logo.width * logoScale,
      height: logo.height * logoScale,
    });
  }

  const centerY = PAGE_HEIGHT / 2 - 20;
  drawCenteredText(
    cover,
    'S E A S O N A L   P A C K',
    centerY + 80,
    regular,
    FONT_SIZES.meta,
    COLORS.supernova,
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
  if (pack.sabbatDate)
    drawCenteredText(
      cover,
      pack.sabbatDate,
      centerY - 25,
      regular,
      FONT_SIZES.small,
      COLORS.supernova,
    );

  cover.drawLine({
    start: { x: PAGE_WIDTH / 2 - 40, y: centerY - 50 },
    end: { x: PAGE_WIDTH / 2 + 40, y: centerY - 50 },
    thickness: 0.5,
    color: COLORS.supernova,
  });

  if (pack.moodText) {
    const lines = wrapText(pack.moodText, regular, FONT_SIZES.body, 380);
    let descY = centerY - 80;
    for (const line of lines.slice(0, 5)) {
      drawCenteredText(
        cover,
        line,
        descY,
        regular,
        FONT_SIZES.body,
        COLORS.textSoft,
      );
      descY -= FONT_SIZES.body * LINE_HEIGHT;
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

function buildRitualPage(
  pdfDoc: PDFDocument,
  ritual: PdfSeasonalRitual,
  packTitle: string,
  fonts: { regular: PDFFont; bold: PDFFont },
  pageNum: number,
  totalPages: number,
): number {
  const { regular, bold } = fonts;
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawBackground(page);

  let y = PAGE_HEIGHT - MARGIN - 30;

  page.drawText(ritual.title, {
    x: MARGIN,
    y,
    size: FONT_SIZES.h2,
    font: bold,
    color: COLORS.stardust,
  });
  y -= 25;

  if (ritual.timing) {
    page.drawText(ritual.timing, {
      x: MARGIN,
      y,
      size: FONT_SIZES.small,
      font: regular,
      color: COLORS.supernova,
    });
    y -= SPACING.sm;
  }

  y = drawDivider(page, y);

  const descLines = wrapText(
    ritual.description,
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

  if (ritual.activities.length > 0) {
    page.drawText('Activities', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;
    for (const activity of ritual.activities) {
      page.drawText('✦', {
        x: MARGIN,
        y,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.supernova,
      });
      page.drawText(activity, {
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

  if (ritual.correspondences && ritual.correspondences.length > 0) {
    page.drawText('Correspondences', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;
    for (const corr of ritual.correspondences) {
      page.drawText(`${corr.type}:`, {
        x: MARGIN,
        y,
        size: FONT_SIZES.body,
        font: bold,
        color: COLORS.supernova,
      });
      page.drawText(corr.items.join(', '), {
        x: MARGIN + 80,
        y,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.textMuted,
      });
      y -= FONT_SIZES.body * LINE_HEIGHT;
    }
  }

  drawFooter(page, packTitle, pageNum, totalPages, regular);
  return pageNum + 1;
}

export async function generateSeasonalPackPdf(
  pack: PdfSeasonalPack,
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

  const totalPages = 1 + pack.rituals.length + 1;
  let pageNum = 1;

  buildSeasonalCoverPage(pdfDoc, pack, fonts, logo);
  pageNum++;

  for (const ritual of pack.rituals) {
    pageNum = buildRitualPage(
      pdfDoc,
      ritual,
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
  closing.drawText('Closing Reflections', {
    x: MARGIN,
    y,
    size: FONT_SIZES.h2,
    font: bold,
    color: COLORS.stardust,
  });
  y -= 25;

  closing.drawText('After your rituals', {
    x: MARGIN,
    y,
    size: FONT_SIZES.small,
    font: regular,
    color: COLORS.textMuted,
  });
  y -= SPACING.sm;

  y = drawDivider(closing, y);

  const closingText =
    pack.closingText ||
    'Thank you for celebrating the turning of the wheel with Lunary. May this season bring you renewal and connection.';
  const closingPadding = 18;
  const closingLines = wrapText(
    closingText,
    regular,
    FONT_SIZES.body,
    CONTENT_WIDTH - closingPadding * 2 - 15,
  );
  const closingBoxHeight =
    closingLines.length * (FONT_SIZES.body * LINE_HEIGHT) + closingPadding * 2;

  closing.drawRectangle({
    x: MARGIN,
    y: y - closingBoxHeight,
    width: CONTENT_WIDTH,
    height: closingBoxHeight,
    color: COLORS.backgroundAlt,
    borderColor: COLORS.border,
    borderWidth: 0.5,
  });
  closing.drawRectangle({
    x: MARGIN,
    y: y - closingBoxHeight,
    width: 4,
    height: closingBoxHeight,
    color: COLORS.cosmicRose,
  });

  let closingTextY = y - closingPadding - FONT_SIZES.body;
  for (const line of closingLines) {
    closing.drawText(line, {
      x: MARGIN + closingPadding + 8,
      y: closingTextY,
      size: FONT_SIZES.body,
      font: regular,
      color: COLORS.textMuted,
    });
    closingTextY -= FONT_SIZES.body * LINE_HEIGHT;
  }
  y = y - closingBoxHeight - SPACING.md;

  const affirmation =
    pack.optionalAffirmation ||
    "I move with the seasons, honouring nature's rhythms. Each turn of the wheel brings wisdom.";
  const affLines = wrapText(
    affirmation,
    regular,
    FONT_SIZES.body,
    CONTENT_WIDTH - closingPadding * 2 - 15,
  );
  const affBoxHeight =
    affLines.length * (FONT_SIZES.body * LINE_HEIGHT) + closingPadding * 2;

  closing.drawRectangle({
    x: MARGIN,
    y: y - affBoxHeight,
    width: CONTENT_WIDTH,
    height: affBoxHeight,
    color: COLORS.backgroundAlt,
    borderColor: COLORS.border,
    borderWidth: 0.5,
  });
  closing.drawRectangle({
    x: MARGIN,
    y: y - affBoxHeight,
    width: 4,
    height: affBoxHeight,
    color: COLORS.supernova,
  });

  let affTextY = y - closingPadding - FONT_SIZES.body;
  for (const line of affLines) {
    closing.drawText(line, {
      x: MARGIN + closingPadding + 8,
      y: affTextY,
      size: FONT_SIZES.body,
      font: regular,
      color: COLORS.textMuted,
    });
    affTextY -= FONT_SIZES.body * LINE_HEIGHT;
  }
  y = y - affBoxHeight - SPACING.xl;

  drawCenteredText(
    closing,
    'Thank you for practising with Lunary.',
    y,
    regular,
    FONT_SIZES.body,
    COLORS.textMuted,
  );
  y -= SPACING.lg;

  if (logo) {
    const logoScale = 0.12;
    const logoWidth = logo.width * logoScale;
    const logoHeight = logo.height * logoScale;
    closing.drawImage(logo, {
      x: (PAGE_WIDTH - logoWidth) / 2,
      y: y - logoHeight,
      width: logoWidth,
      height: logoHeight,
    });
    y -= logoHeight + SPACING.sm;
    drawCenteredText(
      closing,
      'lunary.app',
      y,
      regular,
      FONT_SIZES.tiny,
      COLORS.textSoft,
    );
  }

  drawFooter(closing, pack.title, pageNum, totalPages, regular);
  return pdfDoc.save();
}
