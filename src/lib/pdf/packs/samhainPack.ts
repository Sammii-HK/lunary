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
import { watermarkTemplate } from '@/utils/steganography';
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
  {
    type: 'Colours',
    items: ['Black', 'Deep orange', 'Burgundy', 'Silver', 'Gold'],
  },
  {
    type: 'Crystals',
    items: [
      'Obsidian (psychic protection)',
      'Smoky quartz (grounding)',
      'Black tourmaline (warding)',
      'Amethyst (spirit communication)',
      'Labradorite (thinning the veil)',
    ],
  },
  {
    type: 'Herbs and plants',
    items: [
      'Mugwort (prophetic dreams, divination)',
      'Rosemary (remembrance of the dead)',
      'Sage (clearing and protection)',
      'Apple (the fruit of the otherworld)',
      'Hawthorn (a hedge between worlds)',
    ],
  },
  {
    type: 'Altar items',
    items: [
      'Photographs of ancestors and departed loved ones',
      'Personal objects that belonged to those you are honouring',
      'A black or white pillar candle as a beacon',
      'A bowl of apples, pomegranate seeds, or dark berries',
      'Your tarot or oracle deck for Samhain divination',
      'A cup of water or whisky as an offering',
    ],
  },
  {
    type: "Journal prompts for the year's end",
    items: [
      'What is the most significant thing I learned about myself this year?',
      'What have I been carrying that I am finally ready to put down?',
      'Which relationships grew me and which ones diminished me?',
      'What am I proud of that I never said aloud?',
      'What do I want to carry forward into the new cycle, and what do I leave at this threshold?',
      'If my ancestors could see the life I am living, what would they most want me to know?',
    ],
  },
  {
    type: 'What to release vs carry forward',
    items: [
      'Release: guilt that has already taught you its lesson',
      'Release: relationships you have outgrown',
      'Release: the version of yourself you no longer are',
      "Carry forward: hard-won wisdom from this year's struggles",
      'Carry forward: the people who showed up when it mattered',
      'Carry forward: the parts of yourself you are still becoming',
    ],
  },
];

const SAMHAIN_RITUALS: PdfSeasonalRitual[] = [
  {
    title: 'Building Your Ancestor Altar',
    timing: 'October 29-31, leaving it up through November 1',
    description:
      'The ancestor altar is the heart of Samhain. It creates a focal point for your remembrance and a welcoming space for those who have passed to draw near. You do not need to have had a perfect relationship with your ancestors to honour them -- you can also call in chosen ancestors, spiritual lineages, or those who came before in your community.',
    activities: [
      'Choose a small table, shelf, or windowsill and cover it with a dark cloth -- black, deep purple, or burgundy works well.',
      'Place photographs of ancestors and departed loved ones at the centre. If you have no photos, write their names on paper and fold them neatly.',
      'Add personal objects: a piece of jewellery, a handwritten letter, a coin from their time -- anything that carries their energy.',
      'Light a white pillar candle to serve as a beacon. White calls them home without inviting anything uninvited.',
      'Fill a small offering dish with something they would have enjoyed -- a favourite food, a shot of whisky, a cup of tea left to cool.',
      'Place protective crystals around the perimeter: black tourmaline at the four corners, obsidian or smoky quartz at the centre.',
      'Sit before the altar for at least five minutes in silence each day of the Samhain period. You do not need to speak aloud -- presence is the offering.',
      'On November 1, remove the food offerings, thank your ancestors, and close the altar with gratitude. The photos and objects may remain if you want to keep the connection open.',
    ],
    correspondences: [
      {
        type: 'Materials needed',
        items: [
          'Dark altar cloth (black, burgundy, or purple)',
          'Photographs or written names of ancestors',
          'White pillar candle',
          'Food and drink offerings',
          'Black tourmaline and obsidian',
          'Rosemary or frankincense incense',
        ],
      },
    ],
  },
  {
    title: 'Releasing the Old Year',
    timing: 'Samhain evening, at or after sunset on October 31',
    description:
      'Samhain is the Celtic new year -- the old cycle ends and the new one begins in darkness, not light. Before anything new can take root, you must consciously release what belongs to the year that is ending. This is not about pretending things were easy. It is about acknowledging what happened, finding the lesson, and choosing to travel lighter.',
    activities: [
      'Gather several small strips of paper, a pen, and a fireproof bowl or cauldron. If you cannot safely burn paper, a bowl of water works for dissolving.',
      'Sit quietly for five minutes and let the year pass through your mind -- the losses, the disappointments, the patterns you kept repeating.',
      'On each strip of paper, write one specific thing you are releasing. Not "negativity" but the belief underneath it. Not "bad relationships" but the pattern or the person.',
      'Light a black or dark candle. Read each strip aloud before burning or tearing it. Say: "I acknowledge you. I release you. You have served your purpose."',
      'Burn each strip safely in your fireproof bowl, or tear the paper into small pieces and dissolve them in water.',
      'Once the fire is out or the water is still, sit quietly for a few moments. Notice how you feel -- lighter, perhaps sad, perhaps both.',
      'Close by writing three things you are choosing to carry into the new cycle. Keep these in your journal.',
    ],
    correspondences: [
      {
        type: 'Elements at work',
        items: [
          'Fire: transformation and release',
          'Earth: grounding and burial',
          'Water: dissolution and cleansing',
          'Air: the breath of intention',
        ],
      },
    ],
  },
  {
    title: 'The Dumb Supper',
    timing: 'Samhain night, by candlelight, ideally after dark',
    description:
      'The Dumb Supper is one of the oldest Samhain traditions: a silent meal shared with those who have died. "Dumb" here means silent. The meal is eaten in complete quiet, creating space for the dead to draw near. You are not summoning anything. You are simply setting a place and being open. This ritual is particularly meaningful for those who have lost someone recently, or who feel disconnected from their lineage.',
    activities: [
      'Prepare a simple meal -- something that connects you to your family or heritage, or simply something warm and honest.',
      'Set your table and add one extra place setting for the ancestors. This plate will receive a small portion of everything you eat.',
      'Light candles only -- no electric lights. The meal should be dim and soft.',
      'Before you sit, speak aloud: "I set this place for those who came before me. You are welcome at my table tonight."',
      "Serve the ancestors' plate first, before your own.",
      'Eat in complete silence. Let memories arise without chasing them. If emotion surfaces, let it move through you.',
      "When the meal is complete, take the ancestors' plate outside and leave it on the earth -- a doorstep, a windowsill, anywhere between inside and out.",
      'Break the silence with something simple: "Thank you for coming. Travel well." Then clear the table.',
    ],
  },
  {
    title: 'Samhain Divination',
    timing: 'Samhain night, between 11pm and midnight if possible',
    description:
      'The hours around midnight on Samhain are considered the most potent time of year for divination. The veil is at its thinnest, intuition is sharpest, and messages tend to be unusually clear. Work with whatever tool you trust most -- tarot, oracle, runes, scrying, or journalling with open questions. The key is to ask from genuine curiosity rather than anxiety.',
    activities: [
      'Cleanse your tools the night before: pass them through mugwort smoke, leave them under moonlight, or sound-cleanse with a singing bowl.',
      'Create a contained space. Sit at a cleared table with a candle in front of you and protective crystals on either side -- obsidian and labradorite work well together.',
      'Ground yourself first. Feel your feet on the floor. Take seven slow breaths before you begin.',
      'Call in only what is benevolent: "I ask only for guidance that is truthful, loving, and serves my highest good."',
      'Work with one focused question rather than many scattered ones. Strong Samhain questions: "What is most important for me to understand about the year ahead?" or "What has this year been trying to teach me?"',
      'For tarot: pull a three-card spread -- the year ending, the threshold you stand at now, and what the new cycle holds.',
      'For scrying: sit with a dark mirror or a bowl of still dark water. Soften your gaze and note whatever arises -- images, words, impressions, feelings.',
      'Record everything in your journal immediately after, without editing. Meaning often surfaces in the days that follow.',
      'Close by thanking your guides and snuffing the candle -- do not blow it out. Snuffing keeps the energy contained.',
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
      'As the veil thins between worlds, we remember those who walked before us. Samhain is a time for honest reflection, conscious release, and the kind of stillness that only comes when you stop pretending the dead are entirely gone.',
    perfectFor: [
      'Those who want to honour ancestors and departed loved ones with real intention',
      'Anyone seeking powerful divination on the most potent night of the year',
      'Those ready to consciously release what has weighed on them all year',
      'People drawn to shadow work and honest year-end reckoning',
    ],
    introText:
      'Samhain is pronounced "SAH-win" or "SOW-in." It falls on October 31 and marks the Celtic new year: the final harvest, the end of the growing season, and the beginning of the dark half of the year. At Samhain, the veil between the living and the dead is at its thinnest. This is not a metaphor for most practitioners -- it is an observable shift in the quality of the nights, the sharpness of dreams, and the ease with which memory surfaces unbidden. This pack contains four rituals to work with that thinning: building an ancestor altar, releasing the old year, sharing a silent meal with the dead, and divining by candlelight. You do not need to believe in any particular cosmology to find these practices meaningful. Grief is real. Memory is real. The need to mark endings is deeply human. Samhain gives those things a container.',
    rituals: SAMHAIN_RITUALS,
    correspondences: SAMHAIN_CORRESPONDENCES,
    closingText: watermarkTemplate(
      'Thank you for celebrating Samhain with Lunary. As the wheel turns and the year closes, may you find some peace in what you are releasing and some warmth in the company of those you are remembering. The new cycle begins in darkness, which means it begins with potential. Trust that.',
      'samhain',
    ),
    optionalAffirmation:
      'I honour those who came before me and carry their wisdom forward. I release what this year asked me to carry, and I cross the threshold into the new cycle lighter, and more myself.',
  };
}

export async function generateSamhainPdf(): Promise<Uint8Array> {
  const pack = buildSamhainPack();
  return generateSeasonalPackPdf(pack, loadFonts, loadLogo);
}

export { buildSamhainPack };
