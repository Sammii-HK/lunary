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
      'The shadow period begins approximately two weeks before Mercury stations retrograde. The themes that will dominate the retrograde start to emerge during this time. Consider it your opportunity to prepare.',
    doList: [
      'Back up all of your devices, files, and important data.',
      'Double-check any travel plans and reservations.',
      'Finalise pending contracts and agreements before the retrograde begins.',
      'Service your car and verify travel routes in advance.',
      'Update software and complete any necessary tech maintenance.',
    ],
    dontList: [
      'Avoid signing major contracts if you can wait.',
      'Avoid making large purchases, especially electronics.',
      'Avoid starting brand new projects during this period.',
      'Do not assume everyone has received your messages.',
    ],
    affirmation:
      'I prepare calmly for the retrograde ahead. I trust my ability to navigate whatever arises.',
  },
  {
    planet: 'Mercury',
    phase: 'Mercury Retrograde',
    description:
      'Mercury appears to move backward through the zodiac for approximately three weeks. Communication, technology, and travel are most affected during this period. This is a time for reflection, not bold action.',
    doList: [
      'Review, revise, and revisit old projects or unfinished work.',
      'Reconnect with people from your past who come to mind.',
      'Reflect honestly on your communication patterns.',
      'Rest and consciously slow down your pace.',
      'Research thoroughly before making any decisions.',
      'Re-read all messages carefully before sending them.',
    ],
    dontList: [
      'Avoid signing contracts without thorough review.',
      'Avoid buying new electronics or vehicles.',
      'Avoid launching new projects or businesses.',
      'Do not assume travel will go smoothly—build in extra time.',
      'Do not send important emails without proofreading.',
      'Avoid making assumptions in conversations.',
    ],
    affirmation:
      'I embrace the slowdown. Mercury retrograde invites me to reflect, not react.',
  },
  {
    planet: 'Mercury',
    phase: 'Direct Station',
    description:
      'Mercury stations direct, appearing to pause before resuming forward motion. This is a pivot point where things may feel stuck or particularly intense just before improvement arrives.',
    doList: [
      'Tie up any loose ends from the retrograde period.',
      'Take time to clarify any lingering miscommunications.',
      'Be patient as forward momentum slowly returns.',
      'Finalise decisions that emerged during your retrograde review.',
      'Express gratitude for the lessons this cycle has brought.',
    ],
    dontList: [
      'Do not rush into new projects immediately.',
      'Do not expect instant clarity—it returns gradually.',
      'Avoid making impulsive decisions.',
      'Do not ignore unresolved issues from the retrograde.',
    ],
    affirmation:
      'I move forward with the wisdom I have gained. The pause has served its purpose.',
  },
  {
    planet: 'Mercury',
    phase: 'Post-Retrograde Shadow',
    description:
      'The shadow period after retrograde lasts approximately two weeks. Mercury retraces its retrograde path, integrating lessons learned. Full forward momentum returns gradually during this time.',
    doList: [
      'Implement the insights you gained during the retrograde.',
      'Complete projects that were paused or delayed.',
      'Move forward confidently with new plans and contracts.',
      'Address anything that may have fallen through the cracks.',
      'Acknowledge your resilience in navigating another Mercury retrograde.',
    ],
    dontList: [
      'Do not forget the lessons you have learned.',
      'Avoid rushing back to full speed immediately.',
      'Do not ignore any lingering communication issues.',
    ],
    affirmation:
      'I integrate the lessons of this retrograde cycle. I move forward wiser and more aware.',
  },
  {
    planet: 'Mercury',
    phase: 'Mercury Retrograde by Element',
    description:
      'Mercury retrogrades in signs of the same element for approximately a year before shifting to a new element. The element colours the themes you will experience during each retrograde.',
    doList: [
      'Fire signs (Aries, Leo, Sagittarius): Review your passions, impulses, and enthusiasm.',
      'Earth signs (Taurus, Virgo, Capricorn): Review practical matters, resources, and routines.',
      'Air signs (Gemini, Libra, Aquarius): Review communication patterns and relationships.',
      'Water signs (Cancer, Scorpio, Pisces): Review emotional patterns and intuitive guidance.',
    ],
    dontList: [
      'Do not ignore the elemental themes showing up in your life.',
      'Do not miss the invitation to grow in these specific areas.',
    ],
    affirmation:
      'I pay attention to where Mercury is asking me to grow. Each element brings its own unique wisdom.',
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
      'Mercury retrograde is not a curse—it is an invitation to slow down, review, and reconnect. This guide helps you navigate each phase with awareness and grace.',
    perfectFor: [
      'Anyone who feels anxious about Mercury retrograde',
      'Those seeking practical navigation strategies',
      'Understanding the different phases of a retrograde cycle',
      'Turning retrograde challenges into genuine opportunities',
    ],
    introText:
      'Mercury retrograde occurs three to four times per year, lasting approximately three weeks each time. While it is often blamed for tech glitches and miscommunication, this transit offers valuable time for reflection and revision. This pack guides you through each phase with clarity.',
    survivalGuide: MERCURY_RX_PHASES,
    practicalTips: [
      'Always have a backup plan for travel during Mercury retrograde periods.',
      'Allow extra time for everything—conversations, travel, and major decisions.',
      'Lean into "re" words: review, revise, reconnect, reflect, and rest.',
      'Old friends and former partners may reappear; decide consciously how you wish to respond.',
      'Technology issues are common during this transit. Patience and regular backups are essential.',
    ],
    journalPrompts: [
      'What area of my life is calling for review and revision right now?',
      'Is there anyone from my past worth consciously reconnecting with?',
      'How can I slow down and become more present during this retrograde?',
      'What communication patterns in my life need attention?',
    ],
    closingText:
      'Thank you for navigating Mercury retrograde with Lunary. Remember: this transit is not about punishment—it is about pause. Every retrograde offers a chance to catch what you may have missed and return to what truly matters.',
    optionalAffirmation:
      'I flow with Mercury retrograde rather than fighting against it. Slowdowns reveal what speed so often hides.',
  };
}

export async function generateMercuryRetrogradePdf(): Promise<Uint8Array> {
  const pack = buildMercuryRetrogradePack();
  return generateRetrogradePackPdf(pack, loadFonts, loadLogo);
}

export { buildMercuryRetrogradePack };
