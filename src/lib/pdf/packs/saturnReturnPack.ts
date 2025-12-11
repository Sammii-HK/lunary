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
      'Saturn takes approximately 29.5 years to complete its orbit around the Sun, eventually returning to the position it held at your birth. This cosmic homecoming marks a significant life transition, often bringing challenges that catalyse profound growth and lasting maturity.',
    practicalTips: [
      'Your Saturn Return typically begins when Saturn comes within 5 degrees of your natal Saturn position.',
      'The transit lasts about 2.5 years as Saturn moves through your natal Saturn sign.',
      'This is a time of reckoning: what you have built on shaky foundations may crumble, while what is solid will endure.',
      'Major life decisions made during this period often define the trajectory of the next 29-year cycle.',
    ],
    journalPrompts: [
      'Which structures in my life feel solid? Which feel unstable?',
      'What have I been avoiding that Saturn is now asking me to address?',
    ],
  },
  {
    title: 'Saturn Return by House',
    description:
      'The house where your natal Saturn resides determines the life area most deeply affected by your Saturn Return. This is where you will face your greatest tests—and achieve your most meaningful growth.',
    practicalTips: [
      '1st House: Lessons around identity, self-image, physical body, and personal authority.',
      '2nd House: Lessons around finances, self-worth, personal values, and material security.',
      '3rd House: Lessons around communication, learning, relationships with siblings, and local community.',
      '4th House: Lessons around home, family, emotional foundations, and ancestral patterns.',
      '5th House: Lessons around creativity, romance, children, and authentic self-expression.',
      '6th House: Lessons around health, daily routines, work habits, and service to others.',
      '7th House: Lessons around partnerships, marriage, contracts, and committed relationships.',
      '8th House: Lessons around shared resources, intimacy, deep transformation, and endings.',
      '9th House: Lessons around higher education, travel, philosophy, and belief systems.',
      '10th House: Lessons around career, public reputation, legacy, and overall life direction.',
      '11th House: Lessons around friendships, community involvement, hopes, and long-term aspirations.',
      '12th House: Lessons around solitude, spirituality, hidden patterns, and deep inner work.',
    ],
    journalPrompts: [
      'What lessons has Saturn been teaching me in this area of my life?',
      "How might I work with Saturn's energy rather than against it?",
    ],
  },
  {
    title: 'The Three Phases',
    description:
      'Saturn Return unfolds in three distinct phases, each offering different opportunities for growth and restructuring.',
    practicalTips: [
      'Phase 1 – The Reckoning: Old patterns rise to the surface. You begin to see clearly what is no longer working.',
      'Phase 2 – The Work: This is often the most challenging phase. You must take action, establish boundaries, and make difficult choices.',
      'Phase 3 – The Rebuild: You emerge with new foundations, clearer purpose, and greater maturity than before.',
      'Trust the process, even when it feels uncomfortable. Saturn rewards sustained effort and integrity.',
    ],
    journalPrompts: [
      'Which phase do I believe I am currently in?',
      'What specific action is Saturn asking me to take right now?',
    ],
  },
  {
    title: 'Survival Strategies',
    description:
      'Saturn Return is demanding, but it is not punishing. These strategies can help you navigate this transit with grace and emerge stronger on the other side.',
    practicalTips: [
      'Embrace responsibility: Saturn rewards accountability and will expose patterns of avoidance.',
      'Set boundaries: Learn to say no to what does not align with your authentic path.',
      'Practice delayed gratification: Build slowly and sustainably rather than seeking quick fixes.',
      'Seek mentorship: Connect with elders, guides, or therapists who have walked a similar path.',
      'Cultivate patience: Saturn teaches through time. Trust the slow unfolding of your growth.',
      'Honour your body: Saturn rules bones, teeth, and structure. Prioritise your physical health.',
    ],
    journalPrompts: [
      'Where have I been avoiding responsibility in my life?',
      'What boundaries do I need to establish or reinforce?',
    ],
  },
  {
    title: 'Life After Saturn Return',
    description:
      'Those who commit to the work of their Saturn Return emerge with a clearer sense of purpose, stronger foundations, and the quiet wisdom that comes from meeting challenge with integrity.',
    practicalTips: [
      'The foundations you build during this period will support the next 29 years of your life.',
      'You may notice a renewed sense of purpose, direction, and self-trust.',
      'Relationships that survive Saturn Return often emerge deeper and more authentic.',
      'Your second Saturn Return (ages 56–60) will revisit these themes at a higher octave.',
    ],
    journalPrompts: [
      'What do I want the next 29 years of my life to look like?',
      'What am I most proud of building or becoming during this transit?',
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
      'Those approaching ages 27–30 or 56–60',
      'Anyone experiencing major life restructuring or transition',
      "Those seeking to understand Saturn's lessons in their chart",
      'People navigating significant career, relationship, or identity shifts',
    ],
    introText:
      'Welcome to your Saturn Return—one of the most significant astrological transits you will ever experience. This pack is your guide to understanding, navigating, and ultimately thriving through this transformative period.',
    sections: SATURN_RETURN_SECTIONS,
    practicalTips: [
      'Calculate your exact Saturn Return dates using your birth chart for precise timing.',
      'Reflect honestly on what you built in your twenties and what may need restructuring.',
      'Commit to the long game. Saturn rewards patience, persistence, and integrity.',
    ],
    journalPrompts: [
      'What does growing up truly mean to me?',
      'What am I finally ready to take full responsibility for?',
      'What legacy do I want to build over the next 29 years?',
    ],
    closingText:
      'Thank you for navigating your Saturn Return with Lunary. This is not an ending; it is a powerful new beginning. You are building the foundation for the rest of your life. Trust the process, do the work, and know that you are exactly where you need to be.',
    optionalAffirmation:
      'I embrace the lessons of Saturn. I am building a life of integrity, purpose, and authentic alignment.',
  };
}

export async function generateSaturnReturnPdf(): Promise<Uint8Array> {
  const pack = buildSaturnReturnPack();
  return generateAstrologyPackPdf(pack, loadFonts, loadLogo);
}

export { buildSaturnReturnPack };
