import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import {
  CosmicReportData,
  CosmicReportRecord,
  CosmicReportSection,
} from './types';

const PAGE_MARGIN = 50;

function formatDateRange(dateRange?: { start?: string; end?: string }) {
  if (!dateRange?.start && !dateRange?.end) {
    return 'Timeless Cosmic Window';
  }

  const start = dateRange?.start
    ? new Date(dateRange.start).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : undefined;
  const end = dateRange?.end
    ? new Date(dateRange.end).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : undefined;

  if (start && end) {
    return `${start} – ${end}`;
  }
  return start || end || 'Timeless Cosmic Window';
}

function drawSection(
  page: ReturnType<PDFDocument['addPage']>,
  section: CosmicReportSection,
  fonts: {
    heading: any;
    body: any;
  },
  cursor: { y: number },
) {
  const lineHeight = 16;
  const sectionSpacing = 24;

  if (cursor.y < 120) {
    cursor.y = page.getSize().height - PAGE_MARGIN;
    return true;
  }

  page.drawText(section.title, {
    x: PAGE_MARGIN,
    y: cursor.y,
    size: 16,
    font: fonts.heading,
    color: rgb(0.8, 0.78, 1),
  });
  cursor.y -= lineHeight + 4;

  page.drawText(section.summary, {
    x: PAGE_MARGIN,
    y: cursor.y,
    size: 11,
    font: fonts.body,
    color: rgb(0.95, 0.95, 0.95),
    maxWidth: page.getSize().width - PAGE_MARGIN * 2,
    lineHeight,
  });
  cursor.y -= lineHeight * Math.ceil(section.summary.length / 70) + 6;

  section.highlights.forEach((highlight) => {
    page.drawText(`• ${highlight}`, {
      x: PAGE_MARGIN,
      y: cursor.y,
      size: 10,
      font: fonts.body,
      color: rgb(0.85, 0.85, 0.85),
      maxWidth: page.getSize().width - PAGE_MARGIN * 2,
      lineHeight,
    });
    cursor.y -= lineHeight;
  });

  if (section.actionSteps?.length) {
    page.drawText('Action Steps', {
      x: PAGE_MARGIN,
      y: cursor.y - 2,
      size: 11,
      font: fonts.heading,
      color: rgb(0.9, 0.83, 1),
    });
    cursor.y -= lineHeight + 2;

    section.actionSteps.forEach((step) => {
      page.drawText(`→ ${step}`, {
        x: PAGE_MARGIN + 4,
        y: cursor.y,
        size: 10,
        font: fonts.body,
        color: rgb(0.85, 0.85, 0.85),
        maxWidth: page.getSize().width - PAGE_MARGIN * 2,
        lineHeight,
      });
      cursor.y -= lineHeight;
    });
  }

  cursor.y -= sectionSpacing;
  return false;
}

export async function generateCosmicReportPdf(
  report: CosmicReportData | CosmicReportRecord,
) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter
  const headingFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.06, 0.06, 0.08),
  });

  page.drawText('Lunary Cosmic Report', {
    x: PAGE_MARGIN,
    y: height - PAGE_MARGIN,
    size: 12,
    font: bodyFont,
    color: rgb(0.75, 0.75, 0.93),
  });

  page.drawText(report.title, {
    x: PAGE_MARGIN,
    y: height - PAGE_MARGIN - 24,
    size: 26,
    font: headingFont,
    color: rgb(0.95, 0.95, 1),
  });

  page.drawText(report.subtitle, {
    x: PAGE_MARGIN,
    y: height - PAGE_MARGIN - 48,
    size: 14,
    font: bodyFont,
    color: rgb(0.78, 0.77, 0.95),
  });

  page.drawText(
    `${report.reportType.toUpperCase()} · ${formatDateRange(report.dateRange)}`,
    {
      x: PAGE_MARGIN,
      y: height - PAGE_MARGIN - 70,
      size: 11,
      font: bodyFont,
      color: rgb(0.7, 0.7, 0.9),
    },
  );

  if (report.generatedFor) {
    page.drawText(`Generated for ${report.generatedFor}`, {
      x: PAGE_MARGIN,
      y: height - PAGE_MARGIN - 86,
      size: 10,
      font: bodyFont,
      color: rgb(0.68, 0.68, 0.9),
    });
  }

  const cursor = { y: height - PAGE_MARGIN - 120 };

  report.sections.forEach((section, index) => {
    const overflowed = drawSection(
      page,
      section,
      {
        heading: headingFont,
        body: bodyFont,
      },
      cursor,
    );

    if (overflowed && index < report.sections.length - 1) {
      const newPage = pdfDoc.addPage([612, 792]);
      newPage.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(0.06, 0.06, 0.08),
      });
      cursor.y = height - PAGE_MARGIN;
      drawSection(
        newPage,
        section,
        {
          heading: headingFont,
          body: bodyFont,
        },
        cursor,
      );
    }
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
