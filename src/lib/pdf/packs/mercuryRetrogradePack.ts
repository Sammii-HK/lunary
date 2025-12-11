/**
 * Mercury Retrograde Pack
 *
 * A retrograde survival pack for navigating Mercury retrograde periods.
 */

import { PDFDocument, PDFFont, PDFImage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { StandardFonts } from 'pdf-lib';
import { PdfRetrogradePack, PdfRetrogradeSurvival } from '../schema';
import { generateRetrogradePackPdf } from '../templates/RetrogradePackTemplate';

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

const MERCURY_RX_PHASES: PdfRetrogradeSurvival[] = [
  {
    planet: 'Mercury',
    phase: 'Pre-Retrograde Shadow',
    description:
      'The shadow period begins about two weeks before Mercury stations retrograde. Themes that will dominate the retrograde start to emerge. This is your warning period to prepare.',
    doList: [
      'Back up all devices, files, and important data',
      'Double-check travel plans and reservations',
      'Finish pending contracts and agreements',
      'Service your car and check travel routes',
      'Update software and handle tech maintenance',
    ],
    dontList: [
      'Sign major contracts if avoidable',
      'Make large purchases (especially electronics)',
      'Start brand new projects',
      'Assume everyone received your message',
    ],
    affirmation:
      'I prepare calmly for the retrograde ahead. I trust my ability to navigate whatever arises.',
  },
  {
    planet: 'Mercury',
    phase: 'Mercury Retrograde',
    description:
      'Mercury appears to move backward through the zodiac for about three weeks. Communication, technology, and travel are most affected. This is a time for reflection, not action.',
    doList: [
      'Review, revise, and revisit old projects',
      'Reconnect with people from your past',
      'Reflect on communication patterns',
      'Rest and slow down your pace',
      'Research before making decisions',
      'Re-read all messages before sending',
    ],
    dontList: [
      'Sign contracts without careful review',
      'Buy new electronics or vehicles',
      'Launch new projects or businesses',
      'Assume travel will go smoothly',
      'Send important emails without proofreading',
      'Make assumptions in conversations',
    ],
    affirmation:
      'I embrace the slowdown. Mercury retrograde invites me to reflect, not react.',
  },
  {
    planet: 'Mercury',
    phase: 'Direct Station',
    description:
      'Mercury stations direct, appearing to pause before moving forward again. This is a pivot point where things may feel stuck or particularly intense before improvement.',
    doList: [
      'Tie up loose ends from the retrograde',
      'Clarify any miscommunications',
      'Be patient as things slowly resume',
      'Finalise decisions made during retrograde review',
      'Express gratitude for lessons learned',
    ],
    dontList: [
      'Rush into new projects immediately',
      'Expect instant clarity',
      'Make impulsive decisions',
      'Ignore unresolved issues from the retrograde',
    ],
    affirmation:
      'I move forward with the wisdom I have gained. The pause has served its purpose.',
  },
  {
    planet: 'Mercury',
    phase: 'Post-Retrograde Shadow',
    description:
      'The shadow period after retrograde lasts about two weeks. Mercury retraces its retrograde path, integrating lessons. Full forward momentum returns gradually.',
    doList: [
      'Implement insights from the retrograde period',
      'Complete projects that were paused',
      'Move forward with new plans and contracts',
      'Address anything that fell through the cracks',
      'Acknowledge your resilience through another Mercury Rx',
    ],
    dontList: [
      'Forget the lessons you learned',
      'Rush back to full speed immediately',
      'Ignore lingering communication issues',
    ],
    affirmation:
      'I integrate the lessons of this retrograde cycle. I move forward wiser and more aware.',
  },
  {
    planet: 'Mercury',
    phase: 'Mercury Retrograde by Element',
    description:
      'Mercury retrogrades in signs of the same element for about a year before shifting. The element colours the retrograde themes you experience.',
    doList: [
      'Fire signs (Aries, Leo, Sagittarius): Review your passions and impulses',
      'Earth signs (Taurus, Virgo, Capricorn): Review practical matters and resources',
      'Air signs (Gemini, Libra, Aquarius): Review communication and relationships',
      'Water signs (Cancer, Scorpio, Pisces): Review emotional patterns and intuition',
    ],
    dontList: [
      'Ignore the element themes in your life',
      'Miss the invitation to grow in these areas',
    ],
    affirmation:
      'I pay attention to where Mercury is asking me to grow. Each element brings unique wisdom.',
  },
];

function buildMercuryRetrogradePack(): PdfRetrogradePack {
  return {
    type: 'retrograde',
    slug: 'mercury-retrograde',
    title: 'Mercury Retrograde',
    subtitle: 'Your survival guide',
    planet: 'Mercury',
    moodText:
      'Mercury retrograde is not a curse; it is an invitation to slow down, review, and reconnect. This guide helps you navigate each phase with grace.',
    perfectFor: [
      'Anyone anxious about Mercury retrograde',
      'Those wanting practical navigation strategies',
      'Understanding the different retrograde phases',
      'Turning retrograde challenges into opportunities',
    ],
    introText:
      'Mercury retrograde happens three to four times per year, lasting about three weeks each time. While infamous for tech glitches and miscommunication, this transit offers valuable time for reflection and revision. This pack guides you through each phase.',
    survivalGuide: MERCURY_RX_PHASES,
    practicalTips: [
      'Always have a backup plan for travel during Mercury retrograde.',
      'Allow extra time for everything: conversations, travel, decisions.',
      'Use "re" words: review, revise, reconnect, reflect, rest.',
      'Old friends and exes may reappear; decide consciously how to respond.',
      'Technology issues are common; patience and backups are essential.',
    ],
    journalPrompts: [
      'What area of my life needs review and revision?',
      'Who from my past might be worth reconnecting with?',
      'How can I slow down and be more present this retrograde?',
      'What communication patterns need attention?',
    ],
    closingText:
      'Thank you for navigating Mercury retrograde with Lunary. Remember: this transit is not about punishment; it is about pause. Every retrograde offers a chance to catch what you missed and return to what matters.',
    optionalAffirmation:
      'I flow with Mercury retrograde rather than fighting against it. Slowdowns reveal what speed hides.',
  };
}

export async function generateMercuryRetrogradePdf(): Promise<Uint8Array> {
  const pack = buildMercuryRetrogradePack();
  return generateRetrogradePackPdf(pack, loadFonts, loadLogo);
}

export { buildMercuryRetrogradePack };
