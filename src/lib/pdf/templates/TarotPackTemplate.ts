/**
 * Tarot Pack PDF Template
 *
 * Generates PDFs for tarot packs with spreads, positions, and journal prompts.
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
import { PdfTarotPack, PdfTarotSpread, PdfTarotCard } from '../schema';

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
    color: COLORS.cosmicRose,
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

function buildTarotCoverPage(
  pdfDoc: PDFDocument,
  pack: PdfTarotPack,
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
    'T A R O T   P A C K',
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
    color: COLORS.cosmicRose,
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

function buildSpreadPage(
  pdfDoc: PDFDocument,
  spread: PdfTarotSpread,
  packTitle: string,
  fonts: { regular: PDFFont; bold: PDFFont },
  pageNum: number,
  totalPages: number,
): number {
  const { regular, bold } = fonts;
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawBackground(page);

  let y = PAGE_HEIGHT - MARGIN - 30;

  // Spread name (wrap if too long)
  const spreadNameLines = wrapText(
    spread.name,
    bold,
    FONT_SIZES.h2,
    CONTENT_WIDTH,
  );
  for (const line of spreadNameLines) {
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

  // Card count
  page.drawText(`${spread.cardCount} cards`, {
    x: MARGIN,
    y,
    size: FONT_SIZES.small,
    font: regular,
    color: COLORS.cosmicRose,
  });
  y -= SPACING.sm;

  y = drawDivider(page, y);

  // Description
  const descLines = wrapText(
    spread.description,
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

  // Card Positions
  page.drawText('Card Positions', {
    x: MARGIN,
    y,
    size: FONT_SIZES.h4,
    font: bold,
    color: COLORS.stardust,
  });
  y -= 20;

  for (const pos of spread.positions) {
    page.drawText(`${pos.position}.`, {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.cosmicRose,
    });
    page.drawText(pos.name, {
      x: MARGIN + 25,
      y,
      size: FONT_SIZES.body,
      font: bold,
      color: COLORS.stardust,
    });
    y -= FONT_SIZES.body * LINE_HEIGHT;

    const meaningLines = wrapText(
      pos.meaning,
      regular,
      FONT_SIZES.body,
      CONTENT_WIDTH - 30,
    );
    for (const line of meaningLines) {
      page.drawText(line, {
        x: MARGIN + 25,
        y,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.textMuted,
      });
      y -= FONT_SIZES.body * LINE_HEIGHT;
    }
    y -= SPACING.sm;
  }

  // Best For section
  if (spread.bestFor && spread.bestFor.length > 0) {
    y -= SPACING.sm;
    page.drawText('Best For', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;

    for (const item of spread.bestFor) {
      page.drawText('✦', {
        x: MARGIN,
        y,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.cosmicRose,
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
  }

  drawFooter(page, packTitle, pageNum, totalPages, regular);
  return pageNum + 1;
}

function buildCardPage(
  pdfDoc: PDFDocument,
  card: PdfTarotCard,
  packTitle: string,
  fonts: { regular: PDFFont; bold: PDFFont },
  pageNum: number,
  totalPages: number,
): number {
  const { regular, bold } = fonts;
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawBackground(page);

  let y = PAGE_HEIGHT - MARGIN - 30;

  // Card name
  page.drawText(card.name, {
    x: MARGIN,
    y,
    size: FONT_SIZES.h2,
    font: bold,
    color: COLORS.stardust,
  });
  y -= 25;

  // Card number and suit
  const cardInfo = [
    card.number !== undefined ? `Card ${card.number}` : null,
    card.suit || null,
  ]
    .filter(Boolean)
    .join(' · ');
  if (cardInfo) {
    page.drawText(cardInfo, {
      x: MARGIN,
      y,
      size: FONT_SIZES.small,
      font: regular,
      color: COLORS.cosmicRose,
    });
    y -= SPACING.sm;
  }

  y = drawDivider(page, y);

  // Keywords
  if (card.keywords && card.keywords.length > 0) {
    page.drawText('Keywords', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;

    const keywordsText = card.keywords.join(' · ');
    const keywordsLines = wrapText(
      keywordsText,
      regular,
      FONT_SIZES.body,
      CONTENT_WIDTH,
    );
    for (const line of keywordsLines) {
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
  }

  // Upright Meaning
  if (card.uprightMeaning) {
    page.drawText('Upright Meaning', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;

    const uprightLines = wrapText(
      card.uprightMeaning,
      regular,
      FONT_SIZES.body,
      CONTENT_WIDTH,
    );
    for (const line of uprightLines) {
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
  }

  // Reversed Meaning
  if (card.reversedMeaning) {
    page.drawText('Reversed Meaning', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 20;

    const reversedLines = wrapText(
      card.reversedMeaning,
      regular,
      FONT_SIZES.body,
      CONTENT_WIDTH,
    );
    for (const line of reversedLines) {
      page.drawText(line, {
        x: MARGIN,
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

function buildCardsIndexPage(
  pdfDoc: PDFDocument,
  cards: PdfTarotCard[],
  packTitle: string,
  fonts: { regular: PDFFont; bold: PDFFont },
  pageNum: number,
  totalPages: number,
): number {
  const { regular, bold } = fonts;
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawBackground(page);

  let y = PAGE_HEIGHT - MARGIN - 30;

  page.drawText('Tarot Cards', {
    x: MARGIN,
    y,
    size: FONT_SIZES.h2,
    font: bold,
    color: COLORS.stardust,
  });
  y -= 25;

  page.drawText(`${cards.length} cards`, {
    x: MARGIN,
    y,
    size: FONT_SIZES.small,
    font: regular,
    color: COLORS.cosmicRose,
  });
  y -= SPACING.sm;

  y = drawDivider(page, y);

  // List all cards
  for (const card of cards) {
    const cardName =
      card.number !== undefined ? `${card.number}. ${card.name}` : card.name;

    page.drawText('✦', {
      x: MARGIN,
      y,
      size: FONT_SIZES.body,
      font: regular,
      color: COLORS.cosmicRose,
    });
    page.drawText(cardName, {
      x: MARGIN + 15,
      y,
      size: FONT_SIZES.body,
      font: bold,
      color: COLORS.stardust,
    });
    y -= FONT_SIZES.body * LINE_HEIGHT;

    if (card.keywords && card.keywords.length > 0) {
      const keywordsText = card.keywords.slice(0, 3).join(' · ');
      page.drawText(keywordsText, {
        x: MARGIN + 15,
        y,
        size: FONT_SIZES.small,
        font: regular,
        color: COLORS.textMuted,
      });
      y -= FONT_SIZES.small * LINE_HEIGHT;
    }
    y -= SPACING.xs;
  }

  drawFooter(page, packTitle, pageNum, totalPages, regular);
  return pageNum + 1;
}

export async function generateTarotPackPdf(
  pack: PdfTarotPack,
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

  // Calculate total pages: cover + spreads + cards index + individual card pages + closing
  const hasCards = pack.cards && pack.cards.length > 0;
  const cardsPages = hasCards ? 1 + (pack.cards?.length ?? 0) : 0; // Index + one page per card
  const totalPages = 1 + pack.spreads.length + cardsPages + 1;
  let pageNum = 1;

  buildTarotCoverPage(pdfDoc, pack, fonts, logo);
  pageNum++;

  // Spread pages
  for (const spread of pack.spreads) {
    pageNum = buildSpreadPage(
      pdfDoc,
      spread,
      pack.title,
      fonts,
      pageNum,
      totalPages,
    );
  }

  // Cards section
  if (hasCards && pack.cards) {
    // Cards index page
    pageNum = buildCardsIndexPage(
      pdfDoc,
      pack.cards,
      pack.title,
      fonts,
      pageNum,
      totalPages,
    );

    // Individual card pages
    for (const card of pack.cards) {
      pageNum = buildCardPage(
        pdfDoc,
        card,
        pack.title,
        fonts,
        pageNum,
        totalPages,
      );
    }
  }

  // Closing page
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

  closing.drawText('After your readings', {
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
    'Thank you for exploring these spreads with Lunary. May your readings bring clarity, insight, and gentle guidance.';
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
    'I trust my intuition to guide me. The cards reflect wisdom I already carry within.';
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
