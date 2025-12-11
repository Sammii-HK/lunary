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
      'Create a sacred space to honour those who have passed before you. This ritual strengthens your connection to ancestral wisdom and offers a moment of remembrance.',
    activities: [
      'Set up a small table or shelf as your altar space',
      'Add photos, mementos, or names of ancestors you wish to honour',
      'Light a white or black candle as a beacon for their presence',
      'Offer food and drink that your ancestors enjoyed',
      'Spend time in quiet reflection, speaking to them if you wish',
      'Thank them for their guidance before closing the ritual',
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
      'Samhain marks the Celtic new year. This ritual helps you release what no longer serves you, making space for new growth in the coming cycle.',
    activities: [
      'Write down what you wish to release on small pieces of paper',
      'Light a fire or a candle in a fireproof container',
      'Read each item aloud, acknowledging its role in your life',
      'Safely burn each paper, visualising the release',
      'Scatter the cooled ashes outside or bury them',
      'State an intention for what you wish to invite in',
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
      'A silent meal shared with the spirits of the departed. This ancient tradition honours the dead by setting a place for them at your table.',
    activities: [
      'Prepare a meal that would have pleased your ancestors',
      'Set an extra place at the table for the spirits',
      'Eat the meal in complete silence, focusing on memories',
      'Serve the ancestors first before taking your own portion',
      "Leave the ancestor's plate outside after the meal",
      'Break the silence only after the meal is complete',
    ],
  },
  {
    title: 'Divination Night',
    timing: 'Samhain, when the veil is thinnest',
    description:
      'Samhain is the most powerful night for divination. The thin veil allows clearer messages to come through from the spirit realm.',
    activities: [
      'Cleanse your divination tools with smoke or moonlight',
      'Create sacred space with candles and protective crystals',
      'Ask open-ended questions about the year ahead',
      'Use tarot, oracle cards, scrying, or pendulum work',
      'Record all messages and impressions in your journal',
      'Thank any spirits or guides who offered messages',
    ],
  },
];

function buildSamhainPack(): PdfSeasonalPack {
  return {
    type: 'seasonal',
    slug: 'samhain',
    title: 'Samhain',
    subtitle: 'Honouring the ancestors',
    sabbatDate: 'October 31 - November 1',
    theme: 'Endings, Ancestors, Divination',
    moodText:
      'As the veil thins between worlds, we honour those who walked before us. Samhain is a time for reflection, release, and connection with the unseen.',
    perfectFor: [
      'Those honouring ancestors and departed loved ones',
      'Anyone seeking powerful divination practice',
      'Releasing what no longer serves before the new cycle',
      'Deep shadow work and transformation',
    ],
    introText:
      'Samhain (pronounced SOW-in) marks the Celtic new year and the final harvest. It is a liminal time when the veil between worlds is at its thinnest, making it ideal for ancestral work, divination, and letting go of the old.',
    rituals: SAMHAIN_RITUALS,
    correspondences: SAMHAIN_CORRESPONDENCES,
    closingText:
      'Thank you for celebrating Samhain with Lunary. As the wheel turns and the year ends, may you find peace in release and connection with those who guide you from beyond.',
    optionalAffirmation:
      'I honour my ancestors and the wisdom they carry. I release what no longer serves me and welcome the new cycle with open arms.',
  };
}

export async function generateSamhainPdf(): Promise<Uint8Array> {
  const pack = buildSamhainPack();
  return generateSeasonalPackPdf(pack, loadFonts, loadLogo);
}

export { buildSamhainPack };
