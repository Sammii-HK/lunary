/**
 * Spell Pack PDF Template
 *
 * Generates PDFs for spell packs with steps, materials, and incantations.
 * This is the original template extracted from generator.ts
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
import { PdfSpellPack, PdfSpell, PdfPack } from '../schema';

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

function buildSpellCoverPage(
  pdfDoc: PDFDocument,
  pack: PdfSpellPack | PdfPack,
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
    'S P E L L   P A C K',
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

function buildSpellPage(
  pdfDoc: PDFDocument,
  spell: PdfSpell,
  packTitle: string,
  fonts: { regular: PDFFont; bold: PDFFont },
  pageNum: number,
  totalPages: number,
): number {
  const { regular, bold } = fonts;
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawBackground(page);

  let y = PAGE_HEIGHT - MARGIN - 30;
  // Spell title (wrap if too long)
  const titleLines = wrapText(spell.title, bold, FONT_SIZES.h2, CONTENT_WIDTH);
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

  const meta = [spell.level, spell.duration, spell.moonPhases?.join(', ')]
    .filter(Boolean)
    .join(' · ');
  if (meta) {
    page.drawText(meta, {
      x: MARGIN,
      y,
      size: FONT_SIZES.small,
      font: regular,
      color: COLORS.nebulaViolet,
    });
    y -= SPACING.sm;
  }

  y = drawDivider(page, y);

  const descLines = wrapText(
    spell.description,
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

  if (spell.materials.length > 0) {
    page.drawText('Materials Needed', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;
    for (const mat of spell.materials) {
      page.drawText('•', {
        x: MARGIN,
        y,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.nebulaViolet,
      });
      page.drawText(mat, {
        x: MARGIN + 15,
        y,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.textMuted,
      });
      y -= FONT_SIZES.body * LINE_HEIGHT;

      // Show substitutions if available
      if (
        spell.materialSubstitutions &&
        spell.materialSubstitutions[mat] &&
        spell.materialSubstitutions[mat].length > 0
      ) {
        const subText = `Substitutes: ${spell.materialSubstitutions[mat].join(', ')}`;
        const subLines = wrapText(
          subText,
          regular,
          FONT_SIZES.small,
          CONTENT_WIDTH - 40,
        );
        for (const line of subLines) {
          page.drawText(line, {
            x: MARGIN + 30,
            y,
            size: FONT_SIZES.small,
            font: regular,
            color: COLORS.textSoft,
          });
          y -= FONT_SIZES.small * LINE_HEIGHT;
        }
      }
    }
    y -= SPACING.md;
  }

  // Timing Recommendations
  if (spell.timing || spell.bestTime) {
    page.drawText('Timing Recommendations', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;

    if (spell.timing) {
      const timingLines = wrapText(
        spell.timing,
        regular,
        FONT_SIZES.body,
        CONTENT_WIDTH - 30,
      );
      for (const line of timingLines) {
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

    if (spell.bestTime) {
      page.drawText(`Best time: ${spell.bestTime}`, {
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

  if (spell.steps.length > 0) {
    page.drawText('Instructions', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;
    for (let i = 0; i < spell.steps.length; i++) {
      page.drawText(`${i + 1}.`, {
        x: MARGIN,
        y,
        size: FONT_SIZES.h4,
        font: bold,
        color: COLORS.nebulaViolet,
      });
      const lines = wrapText(
        spell.steps[i],
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
    y -= SPACING.sm;
  }

  // Visualization Guide
  if (spell.visualization) {
    page.drawText('Visualization Guide', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;

    const visLines = wrapText(
      spell.visualization,
      regular,
      FONT_SIZES.body,
      CONTENT_WIDTH - 30,
    );
    for (const line of visLines) {
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

  if (spell.incantation) {
    const padding = 18;
    const lines = wrapText(
      spell.incantation,
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
      color: COLORS.nebulaViolet,
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

export async function generateSpellPackPdf(
  pack: PdfSpellPack | PdfPack,
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

  const totalPages = 1 + pack.spells.length + 1;
  let pageNum = 1;

  buildSpellCoverPage(pdfDoc, pack, fonts, logo);
  pageNum++;

  for (const spell of pack.spells) {
    pageNum = buildSpellPage(
      pdfDoc,
      spell,
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
  y -= SPACING.lg;

  const closingText =
    pack.closingText ||
    'Thank you for practising with Lunary. You can always return to these rituals whenever you need to reconnect with yourself.';
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

  y -= SPACING.md;

  if (pack.optionalAffirmation) {
    const padding = 18;
    const affLines = wrapText(
      pack.optionalAffirmation,
      regular,
      FONT_SIZES.body,
      CONTENT_WIDTH - padding * 2 - 15,
    );
    const boxHeight =
      affLines.length * (FONT_SIZES.body * LINE_HEIGHT) + padding * 2;

    closing.drawRectangle({
      x: MARGIN,
      y: y - boxHeight,
      width: CONTENT_WIDTH,
      height: boxHeight,
      color: COLORS.backgroundAlt,
      borderColor: COLORS.border,
      borderWidth: 0.5,
    });
    closing.drawRectangle({
      x: MARGIN,
      y: y - boxHeight,
      width: 4,
      height: boxHeight,
      color: COLORS.nebulaViolet,
    });

    let textY = y - padding - FONT_SIZES.body;
    for (const line of affLines) {
      closing.drawText(line, {
        x: MARGIN + padding + 8,
        y: textY,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.textMuted,
      });
      textY -= FONT_SIZES.body * LINE_HEIGHT;
    }
  }

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
