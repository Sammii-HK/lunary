/**
 * Shadow Work Tarot Pack
 *
 * A tarot pack focused on shadow work and self-discovery.
 */

import { PDFDocument, PDFFont, PDFImage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { StandardFonts } from 'pdf-lib';
import { PdfTarotPack, PdfTarotSpread } from '../schema';
import { generateTarotPackPdf } from '../templates/TarotPackTemplate';

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

const SHADOW_WORK_SPREADS: PdfTarotSpread[] = [
  {
    name: 'The Shadow Self Spread',
    description:
      'This five-card spread helps illuminate the hidden aspects of your psyche that influence your behaviour, relationships, and self-perception.',
    cardCount: 5,
    positions: [
      {
        position: 1,
        name: 'The Mask',
        meaning: 'What you show the world; the persona you present to others.',
      },
      {
        position: 2,
        name: 'The Shadow',
        meaning:
          'What you hide from yourself; the rejected aspect seeking integration.',
      },
      {
        position: 3,
        name: 'The Origin',
        meaning: 'Where this shadow aspect originated; its root cause.',
      },
      {
        position: 4,
        name: 'The Gift',
        meaning: 'What hidden strength lies within this shadow.',
      },
      {
        position: 5,
        name: 'The Integration',
        meaning: 'How to embrace and integrate this aspect of yourself.',
      },
    ],
    bestFor: [
      'Deep self-reflection',
      'Understanding recurring patterns',
      'Personal growth work',
    ],
    journalPrompts: [
      'When did I first learn to hide this part of myself?',
      'What would change if I embraced this shadow aspect?',
    ],
  },
  {
    name: 'Mirror Spread',
    description:
      'A three-card spread for examining how your inner world reflects in your outer experiences.',
    cardCount: 3,
    positions: [
      {
        position: 1,
        name: 'Inner Truth',
        meaning: 'Your authentic self beneath the surface.',
      },
      {
        position: 2,
        name: 'Outer Reflection',
        meaning: 'How your inner world manifests externally.',
      },
      {
        position: 3,
        name: 'The Lesson',
        meaning: 'What this reflection is teaching you.',
      },
    ],
    bestFor: [
      'Quick shadow check-ins',
      'Understanding projections',
      'Daily practice',
    ],
  },
  {
    name: 'Wound Healing Spread',
    description:
      'A seven-card spread for examining and healing old wounds that still affect your present.',
    cardCount: 7,
    positions: [
      {
        position: 1,
        name: 'The Wound',
        meaning: 'The core wound requiring attention.',
      },
      {
        position: 2,
        name: 'The Protection',
        meaning: 'How you have protected yourself from this pain.',
      },
      {
        position: 3,
        name: 'The Cost',
        meaning: 'What this protection has cost you.',
      },
      {
        position: 4,
        name: 'The Truth',
        meaning: 'What you need to acknowledge.',
      },
      { position: 5, name: 'The Release', meaning: 'What needs to be let go.' },
      {
        position: 6,
        name: 'The Healing',
        meaning: 'What supports your healing journey.',
      },
      {
        position: 7,
        name: 'The Transformation',
        meaning: 'Who you become through this healing.',
      },
    ],
    bestFor: ['Deep healing work', 'Processing trauma', 'Breaking cycles'],
  },
  {
    name: 'Inner Critic Spread',
    description:
      'A four-card spread to understand and transform your inner critic into an ally.',
    cardCount: 4,
    positions: [
      {
        position: 1,
        name: 'The Voice',
        meaning: 'What your inner critic is saying.',
      },
      {
        position: 2,
        name: 'The Fear',
        meaning: 'What fear drives this criticism.',
      },
      {
        position: 3,
        name: 'The Protection',
        meaning: 'What your critic is trying to protect.',
      },
      {
        position: 4,
        name: 'The Compassion',
        meaning: 'How to respond with self-compassion.',
      },
    ],
    bestFor: [
      'Self-compassion practice',
      'Quieting negative self-talk',
      'Building inner kindness',
    ],
  },
];

function buildShadowWorkTarotPack(): PdfTarotPack {
  return {
    type: 'tarot',
    slug: 'shadow-work-tarot',
    title: 'Shadow Work Tarot',
    subtitle: 'Spreads for self-discovery',
    moodText:
      'The shadow holds our rejected selves, our hidden fears, and our unexpressed gifts. These spreads guide you gently into the depths, helping you reclaim the parts of yourself you have learned to hide.',
    perfectFor: [
      'Those ready for deep inner work',
      'Experienced tarot readers seeking growth',
      'Anyone navigating personal transformation',
      'Therapeutic journaling practice',
    ],
    introText:
      'Shadow work is sacred inner work. Approach these spreads with patience and compassion. There is no rush to uncover everything at once. Take breaks when needed, and remember: meeting your shadow is an act of courage.',
    spreads: SHADOW_WORK_SPREADS,
    journalPrompts: [
      'What parts of myself have I learned to hide?',
      'What would I do differently if I were not afraid of judgement?',
      'What patterns keep repeating in my life?',
      'What do I criticise in others that I have yet to accept in myself?',
    ],
    closingText:
      'Thank you for doing this deep work with Lunary. Shadow work is not about fixing what is broken; it is about embracing what has been hidden. Every part of you belongs.',
    optionalAffirmation:
      'I embrace all parts of myself with compassion. My shadow holds wisdom, and I am brave enough to look within.',
  };
}

export async function generateShadowWorkTarotPdf(): Promise<Uint8Array> {
  const pack = buildShadowWorkTarotPack();
  return generateTarotPackPdf(pack, loadFonts, loadLogo);
}

export { buildShadowWorkTarotPack };
