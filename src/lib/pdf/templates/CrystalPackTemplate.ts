/**
 * Crystal Pack PDF Template
 *
 * Generates PDFs for crystal packs with properties, chakras, and usage guide.
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
import { PdfCrystalPack, PdfCrystal } from '../schema';

// Shared utilities (we'll import from generator later)
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
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth <= maxWidth) {
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
    color: COLORS.nebulaViolet,
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

function buildCrystalCoverPage(
  pdfDoc: PDFDocument,
  pack: PdfCrystalPack,
  fonts: { regular: PDFFont; bold: PDFFont },
  logo: PDFImage | null,
): void {
  const { regular, bold } = fonts;
  const cover = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawBackground(cover);

  if (logo) {
    const logoScale = 0.12;
    const logoWidth = logo.width * logoScale;
    const logoHeight = logo.height * logoScale;
    cover.drawImage(logo, {
      x: (PAGE_WIDTH - logoWidth) / 2,
      y: PAGE_HEIGHT - 100 - logoHeight,
      width: logoWidth,
      height: logoHeight,
    });
  }

  const centerY = PAGE_HEIGHT / 2 - 20;

  drawCenteredText(
    cover,
    'C R Y S T A L   P A C K',
    centerY + 80,
    regular,
    FONT_SIZES.meta,
    COLORS.galaxyHaze,
  );

  drawCenteredText(
    cover,
    pack.title,
    centerY + 40,
    bold,
    FONT_SIZES.h1,
    COLORS.stardust,
  );

  if (pack.subtitle) {
    drawCenteredText(
      cover,
      pack.subtitle,
      centerY,
      regular,
      FONT_SIZES.h4,
      COLORS.textMuted,
    );
  }

  const lineWidth = 80;
  cover.drawLine({
    start: { x: PAGE_WIDTH / 2 - lineWidth / 2, y: centerY - 30 },
    end: { x: PAGE_WIDTH / 2 + lineWidth / 2, y: centerY - 30 },
    thickness: 0.5,
    color: COLORS.galaxyHaze,
  });

  if (pack.moodText) {
    const descLines = wrapText(pack.moodText, regular, FONT_SIZES.body, 380);
    let descY = centerY - 60;
    for (const line of descLines.slice(0, 5)) {
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

function buildCrystalPage(
  pdfDoc: PDFDocument,
  crystal: PdfCrystal,
  packTitle: string,
  fonts: { regular: PDFFont; bold: PDFFont },
  pageNum: number,
  totalPages: number,
): number {
  const { regular, bold } = fonts;
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawBackground(page);

  let y = PAGE_HEIGHT - MARGIN - 30;

  // Crystal name (wrap if too long)
  const nameLines = wrapText(crystal.name, bold, FONT_SIZES.h2, CONTENT_WIDTH);
  for (const line of nameLines) {
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

  // Element and Chakras
  const meta = [crystal.element, crystal.chakras.join(', ')]
    .filter(Boolean)
    .join(' · ');

  if (meta) {
    page.drawText(meta, {
      x: MARGIN,
      y,
      size: FONT_SIZES.small,
      font: regular,
      color: COLORS.galaxyHaze,
    });
    y -= SPACING.sm;
  }

  y = drawDivider(page, y);

  // Properties section (horizontal, comma-separated)
  page.drawText('Properties', {
    x: MARGIN,
    y,
    size: FONT_SIZES.h4,
    font: bold,
    color: COLORS.stardust,
  });
  y -= 20;

  // Join properties with commas and wrap if needed
  const propertiesText = crystal.properties.slice(0, 6).join(', ');
  const propertiesLines = wrapText(
    propertiesText,
    regular,
    FONT_SIZES.body,
    CONTENT_WIDTH,
  );
  for (const line of propertiesLines) {
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

  // How to Use section
  if (crystal.howToUse && crystal.howToUse.length > 0) {
    page.drawText('How to Use', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;

    for (let i = 0; i < crystal.howToUse.length; i++) {
      const stepLines = wrapText(
        crystal.howToUse[i],
        regular,
        FONT_SIZES.body,
        CONTENT_WIDTH - 30,
      );

      page.drawText(`${i + 1}.`, {
        x: MARGIN,
        y,
        size: FONT_SIZES.h4,
        font: bold,
        color: COLORS.galaxyHaze,
      });

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
    y -= SPACING.md;
  }

  // Cleansing and Charging
  if (crystal.cleansing || crystal.charging) {
    y -= SPACING.sm;
    page.drawText('Cleansing and Charging', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;

    if (crystal.cleansing) {
      const cleansingLines = wrapText(
        `Cleansing: ${crystal.cleansing}`,
        regular,
        FONT_SIZES.body,
        CONTENT_WIDTH - 30,
      );
      for (const line of cleansingLines) {
        page.drawText(line, {
          x: MARGIN + 15,
          y,
          size: FONT_SIZES.body,
          font: regular,
          color: COLORS.textMuted,
        });
        y -= FONT_SIZES.body * LINE_HEIGHT;
      }
    }

    if (crystal.charging) {
      const chargingLines = wrapText(
        `Charging: ${crystal.charging}`,
        regular,
        FONT_SIZES.body,
        CONTENT_WIDTH - 30,
      );
      for (const line of chargingLines) {
        page.drawText(line, {
          x: MARGIN + 15,
          y,
          size: FONT_SIZES.body,
          font: regular,
          color: COLORS.textMuted,
        });
        y -= FONT_SIZES.body * LINE_HEIGHT;
      }
    }
    y -= SPACING.md;
  }

  // Meditation Practice
  if (crystal.meditation) {
    page.drawText('Meditation Practice', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;

    const meditationLines = wrapText(
      crystal.meditation,
      regular,
      FONT_SIZES.body,
      CONTENT_WIDTH - 30,
    );
    for (const line of meditationLines) {
      page.drawText(line, {
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

  // Crystal Grid Layout
  if (crystal.gridLayout) {
    page.drawText('Crystal Grid Layout', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;

    const gridLines = wrapText(
      crystal.gridLayout,
      regular,
      FONT_SIZES.body,
      CONTENT_WIDTH - 30,
    );
    for (const line of gridLines) {
      page.drawText(line, {
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

  // Ritual Applications
  if (crystal.ritualApplications && crystal.ritualApplications.length > 0) {
    page.drawText('Ritual Applications and Spell Correspondences', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;

    for (const app of crystal.ritualApplications) {
      page.drawText('✦', {
        x: MARGIN,
        y,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.galaxyHaze,
      });
      const appLines = wrapText(
        app,
        regular,
        FONT_SIZES.body,
        CONTENT_WIDTH - 30,
      );
      for (const line of appLines) {
        page.drawText(line, {
          x: MARGIN + 15,
          y,
          size: FONT_SIZES.body,
          font: regular,
          color: COLORS.textMuted,
        });
        y -= FONT_SIZES.body * LINE_HEIGHT;
      }
      y -= SPACING.xs;
    }
    y -= SPACING.md;
  }

  // Care Instructions
  if (crystal.careInstructions) {
    page.drawText('Care Instructions', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;

    const careLines = wrapText(
      crystal.careInstructions,
      regular,
      FONT_SIZES.body,
      CONTENT_WIDTH - 30,
    );
    for (const line of careLines) {
      page.drawText(line, {
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

  // Note: Ethics and affirmation sections removed from individual crystal pages
  // They were repetitive and getting cut off. Consider adding them once at the end of the pack if needed.

  drawFooter(page, packTitle, pageNum, totalPages, regular);
  return pageNum + 1;
}

export async function generateCrystalPackPdf(
  pack: PdfCrystalPack,
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

  const totalPages = 1 + pack.crystals.length + 1; // cover + crystals + closing
  let pageNum = 1;

  buildCrystalCoverPage(pdfDoc, pack, fonts, logo);
  pageNum++;

  for (const crystal of pack.crystals) {
    pageNum = buildCrystalPage(
      pdfDoc,
      crystal,
      pack.title,
      fonts,
      pageNum,
      totalPages,
    );
  }

  // Closing page with callout boxes
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

  closing.drawText('Working with your crystals', {
    x: MARGIN,
    y,
    size: FONT_SIZES.small,
    font: regular,
    color: COLORS.textMuted,
  });
  y -= SPACING.sm;

  y = drawDivider(closing, y);

  // Closing text callout
  const closingText =
    pack.closingText ||
    'Thank you for exploring these crystals with Lunary. May they support your journey with their gentle, grounding energy.';
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

  // Affirmation callout
  const affirmation =
    pack.optionalAffirmation ||
    'I am open to the healing energy of these crystals. I trust the wisdom of the Earth to support my journey.';
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
    color: COLORS.galaxyHaze,
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
