/**
 * Samhain Seasonal Pack
 *
 * A seasonal pack for celebrating Samhain (October 31 - November 1).
 */

import { PDFDocument, PDFFont, PDFImage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { StandardFonts } from 'pdf-lib';
import {
  PdfSeasonalPack,
  PdfSeasonalRitual,
  PdfCorrespondence,
} from '../schema';
import { generateSeasonalPackPdf } from '../templates/SeasonalPackTemplate';

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

const SAMHAIN_CORRESPONDENCES: PdfCorrespondence[] = [
  { type: 'Colors', items: ['Black', 'Orange', 'Purple', 'Silver', 'Gold'] },
  {
    type: 'Crystals',
    items: ['Obsidian', 'Smoky Quartz', 'Black Tourmaline', 'Amethyst'],
  },
  { type: 'Herbs', items: ['Mugwort', 'Rosemary', 'Sage', 'Apple', 'Pumpkin'] },
  {
    type: 'Themes',
    items: ['Ancestor work', 'Divination', 'Shadow integration', 'Letting go'],
  },
];

const SAMHAIN_RITUALS: PdfSeasonalRitual[] = [
  {
    title: 'Ancestor Altar Ritual',
    timing: 'Samhain Eve or during the three-day veil thinning period',
    description:
      'Create a sacred space to honour those who have passed before you. This ritual strengthens your connection to ancestral wisdom and offers a meaningful moment of remembrance.',
    activities: [
      'Choose a small table, shelf, or dedicated corner to serve as your altar.',
      'Gather photos, mementos, or written names of the ancestors you wish to honour.',
      'Light a white or black candle to act as a beacon for their presence.',
      'Place offerings of food or drink that your ancestors would have enjoyed.',
      'Sit quietly with the altar, speaking to your ancestors if it feels right.',
      'When you feel complete, thank them for their guidance and gently close the ritual.',
    ],
    correspondences: [
      {
        type: 'Tools',
        items: ['Candles', 'Photos', 'Food offerings', 'Incense'],
      },
    ],
  },
  {
    title: 'Releasing the Old Year',
    timing: 'Samhain evening, as the sun sets',
    description:
      'Samhain marks the Celtic new year. This ritual supports you in releasing what no longer serves you, creating space for new growth in the coming cycle.',
    activities: [
      'Write down what you are ready to release on small pieces of paper.',
      'Light a fire or place a candle safely in a fireproof container.',
      'Read each item aloud, acknowledging the role it has played in your life.',
      'Safely burn each paper while visualising the energy transforming.',
      'Once cooled, scatter the ashes outside or bury them in the earth.',
      'Close by stating an intention for what you wish to welcome in.',
    ],
    correspondences: [
      {
        type: 'Elements',
        items: ['Fire for transformation', 'Earth for grounding'],
      },
    ],
  },
  {
    title: 'Dumb Supper',
    timing: 'Samhain night, preferably in candlelight',
    description:
      'A silent meal shared with the spirits of the departed. This ancient tradition honours those who have passed by setting a place for them at your table.',
    activities: [
      'Prepare a meal that your ancestors would have enjoyed.',
      'Set an extra place at the table to welcome the spirits.',
      'Eat the meal in complete silence, allowing memories to surface.',
      'Serve the ancestors first, before taking your own portion.',
      "After the meal, leave the ancestor's plate outside as an offering.",
      'Break the silence only once the meal is fully complete.',
    ],
  },
  {
    title: 'Divination Night',
    timing: 'Samhain, when the veil is thinnest',
    description:
      'Samhain is considered the most powerful night of the year for divination. The thinning veil allows clearer messages to pass between realms.',
    activities: [
      'Cleanse your divination tools with smoke, moonlight, or sound.',
      'Create sacred space by lighting candles and placing protective crystals nearby.',
      'Ask open-ended questions about the year ahead, remaining receptive to answers.',
      'Use tarot cards, oracle decks, scrying, or a pendulum—whatever feels natural.',
      'Record all messages and impressions in your journal as they arise.',
      'Close the session by thanking any spirits or guides who offered insight.',
    ],
  },
];

function buildSamhainPack(): PdfSeasonalPack {
  return {
    type: 'seasonal',
    slug: 'samhain',
    title: 'Samhain',
    subtitle: 'Honouring the ancestors',
    sabbatDate: 'October 31 – November 1',
    theme: 'Endings, Ancestors, Divination',
    moodText:
      'As the veil thins between worlds, we honour those who walked before us. Samhain is a time for quiet reflection, conscious release, and connection with the unseen.',
    perfectFor: [
      'Those who wish to honour ancestors and departed loved ones',
      'Anyone seeking powerful divination and spirit communication',
      'Those ready to release what no longer serves before the new cycle',
      'Deep shadow work and personal transformation',
    ],
    introText:
      'Samhain (pronounced SOW-in) marks the Celtic new year and the final harvest. It is a liminal time when the veil between worlds is at its thinnest, making it ideal for ancestral work, divination, and the conscious release of what belongs to the past.',
    rituals: SAMHAIN_RITUALS,
    correspondences: SAMHAIN_CORRESPONDENCES,
    closingText:
      'Thank you for celebrating Samhain with Lunary. As the wheel turns and the year draws to a close, may you find peace in release and comfort in the presence of those who guide you from beyond the veil.',
    optionalAffirmation:
      'I honour my ancestors and the wisdom they carry. I release what no longer serves me and welcome the new cycle with an open heart.',
  };
}

export async function generateSamhainPdf(): Promise<Uint8Array> {
  const pack = buildSamhainPack();
  return generateSeasonalPackPdf(pack, loadFonts, loadLogo);
}

export { buildSamhainPack };
