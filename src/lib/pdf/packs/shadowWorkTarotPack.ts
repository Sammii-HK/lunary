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
      'This five-card spread illuminates the hidden aspects of your psyche that shape your behaviour, relationships, and self-perception. Use it when you sense something beneath the surface is asking to be seen.',
    cardCount: 5,
    positions: [
      {
        position: 1,
        name: 'The Mask',
        meaning: 'The version of yourself you present to the world.',
      },
      {
        position: 2,
        name: 'The Shadow',
        meaning:
          'The part of yourself you have hidden or rejected, now seeking acknowledgement.',
      },
      {
        position: 3,
        name: 'The Origin',
        meaning: 'Where this shadow aspect first took root in your story.',
      },
      {
        position: 4,
        name: 'The Gift',
        meaning: 'The hidden strength or wisdom held within this shadow.',
      },
      {
        position: 5,
        name: 'The Integration',
        meaning: 'How you might embrace and welcome this aspect home.',
      },
    ],
    bestFor: [
      'Deep self-reflection and inner exploration',
      'Understanding recurring patterns in your life',
      'Meaningful personal growth work',
    ],
    journalPrompts: [
      'When did I first learn to hide this part of myself?',
      'What might change if I embraced this shadow aspect fully?',
    ],
  },
  {
    name: 'Mirror Spread',
    description:
      'A three-card spread for exploring how your inner world reflects in your outer experiences. What you see outside often mirrors what lives within.',
    cardCount: 3,
    positions: [
      {
        position: 1,
        name: 'Inner Truth',
        meaning: 'Your authentic self, beneath the surface presentation.',
      },
      {
        position: 2,
        name: 'Outer Reflection',
        meaning: 'How your inner world is currently manifesting externally.',
      },
      {
        position: 3,
        name: 'The Lesson',
        meaning: 'What this mirror is inviting you to understand.',
      },
    ],
    bestFor: [
      'Quick shadow check-ins throughout the week',
      'Understanding projections onto others',
      'Daily or weekly practice',
    ],
  },
  {
    name: 'Wound Healing Spread',
    description:
      'A seven-card spread for gently examining old wounds that continue to shape your present. Approach this spread with tenderness and take breaks as needed.',
    cardCount: 7,
    positions: [
      {
        position: 1,
        name: 'The Wound',
        meaning: 'The core wound that is asking for your attention.',
      },
      {
        position: 2,
        name: 'The Protection',
        meaning: 'How you have guarded yourself from feeling this pain.',
      },
      {
        position: 3,
        name: 'The Cost',
        meaning: 'What this protective pattern has cost you over time.',
      },
      {
        position: 4,
        name: 'The Truth',
        meaning: 'What you are now ready to acknowledge.',
      },
      {
        position: 5,
        name: 'The Release',
        meaning: 'What is ready to be gently let go.',
      },
      {
        position: 6,
        name: 'The Healing',
        meaning: 'What will support your healing journey from here.',
      },
      {
        position: 7,
        name: 'The Transformation',
        meaning: 'Who you are becoming through this process.',
      },
    ],
    bestFor: [
      'Deep healing work with patience and care',
      'Processing difficult past experiences',
      'Breaking generational or personal cycles',
    ],
  },
  {
    name: 'Inner Critic Spread',
    description:
      'A four-card spread to understand the voice of your inner critic and discover how to transform it into a wiser, kinder ally.',
    cardCount: 4,
    positions: [
      {
        position: 1,
        name: 'The Voice',
        meaning: 'What your inner critic has been telling you.',
      },
      {
        position: 2,
        name: 'The Fear',
        meaning: 'The underlying fear that fuels this critical voice.',
      },
      {
        position: 3,
        name: 'The Protection',
        meaning: 'What your critic believes it is trying to protect you from.',
      },
      {
        position: 4,
        name: 'The Compassion',
        meaning: 'How you might respond to yourself with greater kindness.',
      },
    ],
    bestFor: [
      'Cultivating self-compassion and gentleness',
      'Working with negative self-talk',
      'Building a kinder inner dialogue',
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
      'The shadow holds our rejected selves, our hidden fears, and our unexpressed gifts. These spreads guide you gently into the depths, helping you reclaim the parts of yourself you may have learned to hide.',
    perfectFor: [
      'Those who feel ready for deep, honest inner work',
      'Experienced tarot readers seeking personal growth',
      'Anyone navigating a period of personal transformation',
      'Those who use journaling as a therapeutic practice',
    ],
    introText:
      'Shadow work is sacred inner work. Approach these spreads with patience and self-compassion. There is no need to uncover everything at once. Take breaks when you need them, and remember: meeting your shadow is an act of courage and self-love.',
    spreads: SHADOW_WORK_SPREADS,
    journalPrompts: [
      'What parts of myself have I learned to hide from others?',
      'What would I do differently if I were not afraid of being judged?',
      'What patterns keep repeating in my life, and what might they be teaching me?',
      'What do I criticise in others that I have yet to accept in myself?',
    ],
    closingText:
      'Thank you for doing this meaningful work with Lunary. Shadow work is not about fixing what is broken; it is about welcoming home what has been hidden. Every part of you belongs.',
    optionalAffirmation:
      'I embrace all parts of myself with compassion. My shadow holds wisdom, and I am brave enough to look within.',
  };
}

export async function generateShadowWorkTarotPdf(): Promise<Uint8Array> {
  const pack = buildShadowWorkTarotPack();
  return generateTarotPackPdf(pack, loadFonts, loadLogo);
}

export { buildShadowWorkTarotPack };
