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
import {
  PdfRetrogradePack,
  PdfRetrogradeSurvival,
  PdfRetrogradeRitual,
} from '../schema';

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

function buildRitualPage(
  pdfDoc: PDFDocument,
  ritual: PdfRetrogradeRitual,
  packTitle: string,
  fonts: { regular: PDFFont; bold: PDFFont },
  pageNum: number,
  totalPages: number,
): number {
  const { regular, bold } = fonts;
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawBackground(page);

  let y = PAGE_HEIGHT - MARGIN - 30;

  // Ritual title (wrap if too long)
  const titleLines = wrapText(ritual.title, bold, FONT_SIZES.h2, CONTENT_WIDTH);
  for (const line of titleLines) {
    page.drawText(line, {
      x: MARGIN,
      y,
      size: FONT_SIZES.h2,
      font: bold,
      color: COLORS.stardust,
    });
    y -= FONT_SIZES.h2 * LINE_HEIGHT;
  }
  y -= SPACING.xs;

  if (ritual.timing) {
    page.drawText(ritual.timing, {
      x: MARGIN,
      y,
      size: FONT_SIZES.small,
      font: regular,
      color: COLORS.cosmicRose,
    });
    y -= SPACING.sm;
  }

  y = drawDivider(page, y);

  // Description
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

  // Materials
  if (ritual.materials && ritual.materials.length > 0) {
    page.drawText('Materials', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;

    for (const material of ritual.materials) {
      page.drawText('✦', {
        x: MARGIN,
        y,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.cosmicRose,
      });
      page.drawText(material, {
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

  // Steps
  page.drawText('Steps', {
    x: MARGIN,
    y,
    size: FONT_SIZES.h4,
    font: bold,
    color: COLORS.stardust,
  });
  y -= 20;

  for (let i = 0; i < ritual.steps.length; i++) {
    page.drawText(`${i + 1}.`, {
      x: MARGIN,
      y,
      size: FONT_SIZES.body,
      font: bold,
      color: COLORS.cosmicRose,
    });
    const stepLines = wrapText(
      ritual.steps[i],
      regular,
      FONT_SIZES.body,
      CONTENT_WIDTH - 25,
    );
    for (const line of stepLines) {
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

  // Affirmation
  if (ritual.affirmation) {
    y -= SPACING.sm;
    const padding = 18;
    const affLines = wrapText(
      ritual.affirmation,
      regular,
      FONT_SIZES.body,
      CONTENT_WIDTH - padding * 2 - 15,
    );
    const boxHeight =
      affLines.length * (FONT_SIZES.body * LINE_HEIGHT) + padding * 2;

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

    let affTextY = y - padding - FONT_SIZES.body;
    for (const line of affLines) {
      page.drawText(line, {
        x: MARGIN + padding + 8,
        y: affTextY,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.textMuted,
      });
      affTextY -= FONT_SIZES.body * LINE_HEIGHT;
    }
  }

  drawFooter(page, packTitle, pageNum, totalPages, regular);
  return pageNum + 1;
}

function buildCorrespondencesPage(
  pdfDoc: PDFDocument,
  correspondences: { crystals?: string[]; herbs?: string[]; colors?: string[] },
  planet: string,
  packTitle: string,
  fonts: { regular: PDFFont; bold: PDFFont },
  pageNum: number,
  totalPages: number,
): number {
  const { regular, bold } = fonts;
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawBackground(page);

  let y = PAGE_HEIGHT - MARGIN - 30;

  page.drawText(`${planet} Correspondences`, {
    x: MARGIN,
    y,
    size: FONT_SIZES.h2,
    font: bold,
    color: COLORS.stardust,
  });
  y -= 25;
  y = drawDivider(page, y);

  // Crystals
  if (correspondences.crystals && correspondences.crystals.length > 0) {
    page.drawText('Crystals', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;

    for (const crystal of correspondences.crystals) {
      page.drawText('✦', {
        x: MARGIN,
        y,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.cosmicRose,
      });
      page.drawText(crystal, {
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

  // Herbs
  if (correspondences.herbs && correspondences.herbs.length > 0) {
    page.drawText('Herbs', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;

    for (const herb of correspondences.herbs) {
      page.drawText('✦', {
        x: MARGIN,
        y,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.cosmicRose,
      });
      page.drawText(herb, {
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

  // Colors
  if (correspondences.colors && correspondences.colors.length > 0) {
    page.drawText('Colors', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;

    for (const color of correspondences.colors) {
      page.drawText('✦', {
        x: MARGIN,
        y,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.cosmicRose,
      });
      page.drawText(color, {
        x: MARGIN + 15,
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

  // Calculate total pages: cover + survival phases + rituals + correspondences + closing
  const ritualsPages = pack.rituals ? pack.rituals.length : 0;
  const correspondencesPages = pack.correspondences ? 1 : 0;
  const totalPages =
    1 + pack.survivalGuide.length + ritualsPages + correspondencesPages + 1;
  let pageNum = 1;

  buildRetrogradeCoverPage(pdfDoc, pack, fonts, logo);
  pageNum++;

  // Survival guide phases
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

  // Rituals
  if (pack.rituals && pack.rituals.length > 0) {
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
  }

  // Correspondences
  if (pack.correspondences) {
    pageNum = buildCorrespondencesPage(
      pdfDoc,
      pack.correspondences,
      pack.planet,
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

  closing.drawText('Surviving the storm', {
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
    'Thank you for navigating this retrograde with Lunary. Remember: retrogrades are invitations to slow down, reflect, and realign.';
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
    'I flow with retrograde cycles rather than against them. Slowdowns reveal what speed hides.';
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
    color: COLORS.cosmicRose,
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
