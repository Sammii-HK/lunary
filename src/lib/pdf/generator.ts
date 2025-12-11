/**
 * Lunary PDF Generator
 *
 * Creates beautiful branded PDFs with custom fonts and theming.
 * Uses theme.ts for consistent styling and schema.ts for type safety.
 */

import {
  PDFDocument,
  PDFPage,
  PDFFont,
  PDFImage,
  StandardFonts,
} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {
  COLORS,
  FONT_SIZES,
  LINE_HEIGHT,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  MARGIN,
  CONTENT_WIDTH,
  SPACING,
} from './theme';
import {
  PdfPack,
  PdfSpell,
  DEFAULT_CLOSING_TEXT,
  DEFAULT_AFFIRMATION,
} from './schema';

// Logo URL (light version for dark backgrounds)
const LOGO_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://lunary.app/press-kit/lunary-logo-light.png'
    : 'http://localhost:3000/press-kit/lunary-logo-light.png';

// ============================================
// ASSET LOADING
// ============================================

async function loadLogo(pdfDoc: PDFDocument): Promise<PDFImage | null> {
  try {
    const response = await fetch(LOGO_URL);
    if (!response.ok) {
      console.warn('Logo fetch failed:', response.status);
      return null;
    }
    const logoBytes = await response.arrayBuffer();
    const logo = await pdfDoc.embedPng(logoBytes);
    return logo;
  } catch (error) {
    console.warn('Failed to load logo:', error);
    return null;
  }
}

async function loadRobotoMono(pdfDoc: PDFDocument): Promise<{
  regular: PDFFont;
  bold: PDFFont;
}> {
  pdfDoc.registerFontkit(fontkit);

  try {
    const regularUrl =
      'https://cdn.jsdelivr.net/fontsource/fonts/roboto-mono@latest/latin-400-normal.ttf';
    const boldUrl =
      'https://cdn.jsdelivr.net/fontsource/fonts/roboto-mono@latest/latin-700-normal.ttf';

    const [regularRes, boldRes] = await Promise.all([
      fetch(regularUrl),
      fetch(boldUrl),
    ]);

    if (!regularRes.ok || !boldRes.ok) {
      throw new Error('Font fetch failed');
    }

    const regularBytes = await regularRes.arrayBuffer();
    const boldBytes = await boldRes.arrayBuffer();

    const regular = await pdfDoc.embedFont(regularBytes, { subset: true });
    const bold = await pdfDoc.embedFont(boldBytes, { subset: true });

    return { regular, bold };
  } catch (error) {
    console.warn('Font loading failed, using fallback:', error);
    const regular = await pdfDoc.embedFont(StandardFonts.Courier);
    const bold = await pdfDoc.embedFont(StandardFonts.CourierBold);
    return { regular, bold };
  }
}

// ============================================
// DRAWING PRIMITIVES
// ============================================

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

function drawDivider(page: PDFPage, y: number): number {
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: MARGIN + CONTENT_WIDTH, y },
    thickness: 0.5,
    color: COLORS.border,
  });
  return y - SPACING.md;
}

/**
 * Draw an elegant centered ornament divider
 */
function drawOrnamentDivider(
  page: PDFPage,
  y: number,
  font: PDFFont,
  color = COLORS.nebulaViolet,
): number {
  const ornament = '·  ✦  ·';
  drawCenteredText(page, ornament, y, font, 10, color);
  return y - SPACING.lg;
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

// ============================================
// LAYOUT COMPONENTS
// ============================================

/**
 * Draw a callout box with left accent border and soft styling
 */
function drawCallout(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  accentColor = COLORS.nebulaViolet,
): number {
  const padding = 18;
  const lineHeight = FONT_SIZES.body * LINE_HEIGHT;

  const lines = wrapText(
    text,
    font,
    FONT_SIZES.body,
    CONTENT_WIDTH - padding * 2 - 15,
  );
  const textHeight = lines.length * lineHeight;
  const boxHeight = textHeight + padding * 2;

  // Background with subtle border
  page.drawRectangle({
    x: MARGIN,
    y: y - boxHeight,
    width: CONTENT_WIDTH,
    height: boxHeight,
    color: COLORS.backgroundAlt,
    borderColor: COLORS.border,
    borderWidth: 0.5,
  });

  // Left accent border (thicker for emphasis)
  page.drawRectangle({
    x: MARGIN,
    y: y - boxHeight,
    width: 4,
    height: boxHeight,
    color: accentColor,
  });

  // Text with better padding
  let textY = y - padding - FONT_SIZES.body;
  for (const line of lines) {
    page.drawText(line, {
      x: MARGIN + padding + 8,
      y: textY,
      size: FONT_SIZES.body,
      font,
      color: COLORS.textMuted,
    });
    textY -= lineHeight;
  }

  return y - boxHeight - SPACING.md;
}

/**
 * Draw elegant section divider between spells
 */
function drawSectionDivider(
  page: PDFPage,
  y: number,
  color = COLORS.nebulaViolet,
): number {
  const lineWidth = 60;
  const centerX = PAGE_WIDTH / 2;

  // Left line
  page.drawLine({
    start: { x: centerX - lineWidth - 8, y },
    end: { x: centerX - 8, y },
    thickness: 0.5,
    color,
  });

  // Center dot
  page.drawCircle({
    x: centerX,
    y,
    size: 2.5,
    color,
  });

  // Right line
  page.drawLine({
    start: { x: centerX + 8, y },
    end: { x: centerX + lineWidth + 8, y },
    thickness: 0.5,
    color,
  });

  return y - SPACING.xl;
}

/**
 * Draw page footer with branding and page number
 */
function drawFooter(
  page: PDFPage,
  packTitle: string,
  pageNum: number,
  totalPages: number,
  font: PDFFont,
) {
  const y = 35;

  // Left: Lunary branding
  page.drawText('Lunary', {
    x: MARGIN,
    y,
    size: FONT_SIZES.tiny,
    font,
    color: COLORS.nebulaViolet,
  });

  const dotWidth = font.widthOfTextAtSize(' · ', FONT_SIZES.tiny);
  const lunaryWidth = font.widthOfTextAtSize('Lunary', FONT_SIZES.tiny);

  page.drawText(' · lunary.app', {
    x: MARGIN + lunaryWidth,
    y,
    size: FONT_SIZES.tiny,
    font,
    color: COLORS.textSoft,
  });

  // Right: Page number
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

// ============================================
// PAGE BUILDERS
// ============================================

function buildCoverPage(
  pdfDoc: PDFDocument,
  pack: PdfPack,
  fonts: { regular: PDFFont; bold: PDFFont },
  logo: PDFImage | null,
): void {
  const { regular, bold } = fonts;
  const cover = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawBackground(cover);

  // Logo at top if available
  let contentStartY = PAGE_HEIGHT - 120;
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
    contentStartY = PAGE_HEIGHT - 140 - logoHeight;
  }

  const centerY = PAGE_HEIGHT / 2 - 20;

  // Category badge with letter spacing
  drawCenteredText(
    cover,
    'S P E L L   P A C K',
    centerY + 80,
    regular,
    FONT_SIZES.meta,
    COLORS.nebulaViolet,
  );

  // Title - centered with breathing room
  drawCenteredText(
    cover,
    pack.title,
    centerY + 40,
    bold,
    FONT_SIZES.h1,
    COLORS.stardust,
  );

  // Subtitle
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

  // Elegant divider line
  const lineWidth = 80;
  cover.drawLine({
    start: { x: PAGE_WIDTH / 2 - lineWidth / 2, y: centerY - 30 },
    end: { x: PAGE_WIDTH / 2 + lineWidth / 2, y: centerY - 30 },
    thickness: 0.5,
    color: COLORS.nebulaViolet,
  });

  // Mood text / description - below center
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

  // Bottom branding
  drawCenteredText(
    cover,
    'lunary.app',
    60,
    regular,
    FONT_SIZES.tiny,
    COLORS.textSoft,
  );
}

function buildIntroPage(
  pdfDoc: PDFDocument,
  pack: PdfPack,
  fonts: { regular: PDFFont; bold: PDFFont },
  pageNum: number,
  totalPages: number,
): number {
  const { regular, bold } = fonts;
  const intro = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawBackground(intro);

  let y = PAGE_HEIGHT - MARGIN - 30;

  // Header
  intro.drawText('Welcome to Your Pack', {
    x: MARGIN,
    y,
    size: FONT_SIZES.h2,
    font: bold,
    color: COLORS.stardust,
  });
  y -= 25;

  intro.drawText(`${pack.spells.length} rituals curated for you`, {
    x: MARGIN,
    y,
    size: FONT_SIZES.small,
    font: regular,
    color: COLORS.textMuted,
  });
  y -= SPACING.sm;

  y = drawDivider(intro, y);

  // Intro text
  if (pack.introText) {
    const introLines = wrapText(
      pack.introText,
      regular,
      FONT_SIZES.body,
      CONTENT_WIDTH,
    );
    for (const line of introLines) {
      intro.drawText(line, {
        x: MARGIN,
        y,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.textMuted,
      });
      y -= FONT_SIZES.body * LINE_HEIGHT;
    }
    y -= SPACING.sm;
  }

  // Before you begin callout
  if (pack.beforeYouBegin) {
    y = drawCallout(
      intro,
      pack.beforeYouBegin,
      y,
      regular,
      COLORS.nebulaViolet,
    );
  }

  // Perfect for
  if (pack.perfectFor && pack.perfectFor.length > 0) {
    y -= SPACING.md;
    intro.drawText('Perfect For', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 25;

    for (const item of pack.perfectFor) {
      intro.drawText('>', {
        x: MARGIN,
        y,
        size: FONT_SIZES.body,
        font: bold,
        color: COLORS.nebulaViolet,
      });
      intro.drawText(item, {
        x: MARGIN + 15,
        y,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.textMuted,
      });
      y -= FONT_SIZES.body * LINE_HEIGHT;
    }
  }

  drawFooter(intro, pack.title, pageNum, totalPages, regular);
  return pageNum + 1;
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
  const spellPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawBackground(spellPage);

  let y = PAGE_HEIGHT - MARGIN - 30;

  // Spell title
  spellPage.drawText(spell.title, {
    x: MARGIN,
    y,
    size: FONT_SIZES.h2,
    font: bold,
    color: COLORS.stardust,
  });
  y -= 25;

  // Meta info (level, duration, moon phases)
  const moonText = spell.moonPhases?.join(', ') || '';
  const meta = [spell.level, spell.duration, moonText]
    .filter(Boolean)
    .join(' • ');
  if (meta) {
    spellPage.drawText(meta, {
      x: MARGIN,
      y,
      size: FONT_SIZES.small,
      font: regular,
      color: COLORS.galaxyHaze,
    });
    y -= SPACING.sm;
  }

  y = drawDivider(spellPage, y);

  // Description
  const descLines = wrapText(
    spell.description,
    regular,
    FONT_SIZES.body,
    CONTENT_WIDTH,
  );
  for (const line of descLines) {
    spellPage.drawText(line, {
      x: MARGIN,
      y,
      size: FONT_SIZES.body,
      font: regular,
      color: COLORS.textMuted,
    });
    y -= FONT_SIZES.body * LINE_HEIGHT;
  }
  y -= SPACING.md;

  // Materials box with refined styling
  if (spell.materials && spell.materials.length > 0) {
    const padding = 18;
    const titleHeight = 26;
    const itemHeight = FONT_SIZES.body * LINE_HEIGHT;
    const materialsHeight =
      padding + titleHeight + spell.materials.length * itemHeight + padding;

    // Box background
    spellPage.drawRectangle({
      x: MARGIN,
      y: y - materialsHeight,
      width: CONTENT_WIDTH,
      height: materialsHeight,
      color: COLORS.backgroundAlt,
      borderColor: COLORS.border,
      borderWidth: 0.5,
    });

    // Top accent line
    spellPage.drawLine({
      start: { x: MARGIN, y: y },
      end: { x: MARGIN + CONTENT_WIDTH, y: y },
      thickness: 2,
      color: COLORS.galaxyHaze,
      opacity: 0.3,
    });

    spellPage.drawText('Materials Needed', {
      x: MARGIN + padding,
      y: y - padding - FONT_SIZES.h4,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.nebulaViolet,
    });

    let matY = y - padding - titleHeight - FONT_SIZES.body;
    for (const material of spell.materials) {
      spellPage.drawText('•', {
        x: MARGIN + padding,
        y: matY,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.galaxyHaze,
      });
      spellPage.drawText(material, {
        x: MARGIN + padding + 15,
        y: matY,
        size: FONT_SIZES.body,
        font: regular,
        color: COLORS.textMuted,
      });
      matY -= itemHeight;
    }

    y = y - materialsHeight - SPACING.md;
  }

  // Steps
  if (spell.steps && spell.steps.length > 0) {
    spellPage.drawText('Instructions', {
      x: MARGIN,
      y,
      size: FONT_SIZES.h4,
      font: bold,
      color: COLORS.stardust,
    });
    y -= 25;

    for (let i = 0; i < spell.steps.length; i++) {
      const stepLines = wrapText(
        spell.steps[i],
        regular,
        FONT_SIZES.body,
        CONTENT_WIDTH - 30,
      );

      spellPage.drawText(`${i + 1}.`, {
        x: MARGIN,
        y,
        size: FONT_SIZES.h4,
        font: bold,
        color: COLORS.nebulaViolet,
      });

      for (const line of stepLines) {
        spellPage.drawText(line, {
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

  // Incantation
  if (spell.incantation) {
    y = drawCallout(
      spellPage,
      spell.incantation,
      y,
      regular,
      COLORS.galaxyHaze,
    );
  }

  y = drawSectionDivider(spellPage, y - SPACING.md);

  drawFooter(spellPage, packTitle, pageNum, totalPages, regular);
  return pageNum + 1;
}

function buildOutroPage(
  pdfDoc: PDFDocument,
  pack: PdfPack,
  fonts: { regular: PDFFont; bold: PDFFont },
  pageNum: number,
  totalPages: number,
  logo: PDFImage | null,
): void {
  const { regular, bold } = fonts;
  const closing = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawBackground(closing);

  let y = PAGE_HEIGHT - MARGIN - 30;

  // Header - gentle, modern
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

  // Closing text
  const closingText = pack.closingText || DEFAULT_CLOSING_TEXT;
  y = drawCallout(closing, closingText, y, regular, COLORS.cosmicRose);

  // Optional affirmation
  const affirmation = pack.optionalAffirmation || DEFAULT_AFFIRMATION;
  y -= SPACING.md;
  y = drawCallout(closing, affirmation, y, regular, COLORS.nebulaViolet);

  y -= SPACING.xl;

  // Final message
  drawCenteredText(
    closing,
    'Thank you for practising with Lunary.',
    y,
    regular,
    FONT_SIZES.body,
    COLORS.textMuted,
  );
  y -= SPACING.lg;

  // Logo or text branding
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
  } else {
    drawCenteredText(
      closing,
      'lunary.app',
      y,
      regular,
      FONT_SIZES.body,
      COLORS.textMuted,
    );
    y -= SPACING.xl;

    drawCenteredText(
      closing,
      'LUNARY',
      y,
      bold,
      FONT_SIZES.h4,
      COLORS.nebulaViolet,
    );
  }

  drawFooter(closing, pack.title, pageNum, totalPages, regular);
}

// ============================================
// MAIN GENERATOR
// ============================================

function calculateTotalPages(pack: PdfPack): number {
  let total = 1; // Cover page

  if (pack.introText || pack.perfectFor?.length || pack.beforeYouBegin) {
    total++; // Intro page
  }

  total += pack.spells.length; // One page per spell

  if (pack.closingText !== null) {
    total++; // Outro page
  }

  return total;
}

export async function generatePackPdf(pack: PdfPack): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const [fonts, logo] = await Promise.all([
    loadRobotoMono(pdfDoc),
    loadLogo(pdfDoc),
  ]);

  const totalPages = calculateTotalPages(pack);
  let pageNum = 1;

  // Cover page (always rendered - no footer)
  buildCoverPage(pdfDoc, pack, fonts, logo);
  pageNum++;

  // Intro page (optional - rendered if introText or perfectFor exists)
  if (pack.introText || pack.perfectFor?.length || pack.beforeYouBegin) {
    pageNum = buildIntroPage(pdfDoc, pack, fonts, pageNum, totalPages);
  }

  // Spell pages
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

  // Outro page (optional - rendered if closingText exists or by default)
  if (pack.closingText !== null) {
    buildOutroPage(pdfDoc, pack, fonts, pageNum, totalPages, logo);
  }

  return pdfDoc.save();
}

// Legacy export for backward compatibility
export { generatePackPdf as generateSpellPackPDF };
