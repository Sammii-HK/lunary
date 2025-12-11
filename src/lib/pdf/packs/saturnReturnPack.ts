/**
 * Saturn Return Pack
 *
 * An astrology pack for navigating your Saturn Return (ages 27-30, 56-60).
 */

import { PDFDocument, PDFFont, PDFImage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { StandardFonts } from 'pdf-lib';
import { PdfAstrologyPack, PdfAstrologySection } from '../schema';
import { generateAstrologyPackPdf } from '../templates/AstrologyPackTemplate';

const LOGO_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://lunary.app/press-kit/lunary-logo-light.png'
    : 'http://localhost:3000/press-kit/lunary-logo-light.png';

async function loadLogo(pdfDoc: PDFDocument): Promise<PDFImage | null> {
  try {
    const response = await fetch(LOGO_URL);
    if (!response.ok) return null;
    return pdfDoc.embedPng(await response.arrayBuffer());
  } catch {
    return null;
  }
}

async function loadFonts(
  pdfDoc: PDFDocument,
): Promise<{ regular: PDFFont; bold: PDFFont }> {
  pdfDoc.registerFontkit(fontkit);
  try {
    const [regRes, boldRes] = await Promise.all([
      fetch(
        'https://cdn.jsdelivr.net/fontsource/fonts/roboto-mono@latest/latin-400-normal.ttf',
      ),
      fetch(
        'https://cdn.jsdelivr.net/fontsource/fonts/roboto-mono@latest/latin-700-normal.ttf',
      ),
    ]);
    if (!regRes.ok || !boldRes.ok) throw new Error('Font fetch failed');
    return {
      regular: await pdfDoc.embedFont(await regRes.arrayBuffer(), {
        subset: true,
      }),
      bold: await pdfDoc.embedFont(await boldRes.arrayBuffer(), {
        subset: true,
      }),
    };
  } catch {
    return {
      regular: await pdfDoc.embedFont(StandardFonts.Courier),
      bold: await pdfDoc.embedFont(StandardFonts.CourierBold),
    };
  }
}

const SATURN_RETURN_SECTIONS: PdfAstrologySection[] = [
  {
    title: 'What Is Saturn Return?',
    description:
      'Saturn takes approximately 29.5 years to orbit the Sun, returning to the position it held at your birth. This cosmic homecoming marks a major life transition, often bringing challenges that catalyse profound growth and maturity.',
    practicalTips: [
      'Saturn Return typically begins when Saturn is within 5 degrees of your natal Saturn position.',
      'The exact return lasts about 2.5 years as Saturn moves through your natal Saturn sign.',
      'This is a time of reckoning: what you have built on shaky foundations may crumble; what is solid will endure.',
      'Major life decisions made during this time often define the next 29-year cycle.',
    ],
    journalPrompts: [
      'What structures in my life feel solid? Which feel unstable?',
      'What have I been avoiding that Saturn is now demanding I address?',
    ],
  },
  {
    title: 'Saturn Return by House',
    description:
      'The house where your natal Saturn resides determines the life area most affected by your Saturn Return. This is where you will face your greatest tests and achieve your most meaningful growth.',
    practicalTips: [
      '1st House: Identity, self-image, and how you present to the world.',
      '4th House: Home, family, emotional foundations, and roots.',
      '7th House: Partnerships, marriage, and committed relationships.',
      '10th House: Career, public reputation, and life direction.',
      'Check your birth chart to identify your Saturn placement.',
    ],
    journalPrompts: [
      'What lessons has Saturn been teaching me in this life area?',
      'How can I work with Saturn rather than against it?',
    ],
  },
  {
    title: 'The Three Phases',
    description:
      'Saturn Return unfolds in three distinct phases, each offering different opportunities for growth and restructuring.',
    practicalTips: [
      'Phase 1 - The Reckoning: Old patterns surface; you see clearly what is not working.',
      'Phase 2 - The Work: The hardest part. You must take action, set boundaries, and make difficult choices.',
      'Phase 3 - The Rebuild: You emerge with new foundations, clearer purpose, and greater maturity.',
      'Trust the process even when it feels uncomfortable. Saturn rewards effort and integrity.',
    ],
    journalPrompts: [
      'Which phase am I currently in?',
      'What action is Saturn asking me to take right now?',
    ],
  },
  {
    title: 'Survival Strategies',
    description:
      'Saturn Return is demanding but not punishing. These strategies help you navigate this transit with grace and emerge stronger.',
    practicalTips: [
      'Embrace responsibility: Saturn rewards accountability and exposes avoidance.',
      'Set boundaries: Learn to say no to what does not align with your authentic path.',
      'Embrace delayed gratification: Build slowly and sustainably.',
      'Seek mentorship: Connect with elders or guides who have walked this path.',
      'Practice patience: Saturn teaches through time. Trust the slow unfolding.',
      'Honour your body: Saturn rules bones and teeth; prioritise physical health.',
    ],
    journalPrompts: [
      'Where have I been avoiding responsibility?',
      'What boundaries do I need to set?',
    ],
  },
  {
    title: 'Life After Saturn Return',
    description:
      'Those who do the work of their Saturn Return emerge with a clearer sense of purpose, stronger foundations, and the wisdom that comes from meeting challenge with integrity.',
    practicalTips: [
      'The foundations you build now will support the next 29 years of your life.',
      'You may feel a renewed sense of purpose and direction.',
      'Relationships that survived Saturn Return are often deeper and more authentic.',
      'Your second Saturn Return (ages 56-60) will revisit these themes at a higher level.',
    ],
    journalPrompts: [
      'What do I want the next 29 years to look like?',
      'What am I most proud of building during this time?',
    ],
  },
];

function buildSaturnReturnPack(): PdfAstrologyPack {
  return {
    type: 'astrology',
    slug: 'saturn-return',
    title: 'Saturn Return',
    subtitle: 'Your cosmic coming of age',
    moodText:
      'Saturn Return is not a punishment; it is an invitation to grow up, take responsibility, and build a life aligned with your deepest truth.',
    perfectFor: [
      'Those approaching ages 27-30 or 56-60',
      'Anyone experiencing major life restructuring',
      'Those seeking to understand Saturnian lessons',
      'People navigating career, relationship, or identity shifts',
    ],
    introText:
      'Welcome to Saturn Return: one of the most significant astrological transits you will experience. This pack is your guide to understanding, navigating, and thriving through this transformative period.',
    sections: SATURN_RETURN_SECTIONS,
    practicalTips: [
      'Calculate your exact Saturn Return dates using your birth chart.',
      'Reflect on what you built in your twenties and what needs restructuring.',
      'Commit to the long game; Saturn rewards patience and persistence.',
    ],
    journalPrompts: [
      'What does growing up mean to me?',
      'What am I ready to take responsibility for?',
      'What legacy do I want to build?',
    ],
    closingText:
      'Thank you for navigating your Saturn Return with Lunary. This is not the end; it is a new beginning. You are building the foundation for the rest of your life. Trust the process, do the work, and know that you are exactly where you need to be.',
    optionalAffirmation:
      'I embrace the lessons of Saturn. I am building a life of integrity, purpose, and authentic alignment.',
  };
}

export async function generateSaturnReturnPdf(): Promise<Uint8Array> {
  const pack = buildSaturnReturnPack();
  return generateAstrologyPackPdf(pack, loadFonts, loadLogo);
}

export { buildSaturnReturnPack };
