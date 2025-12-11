/**
 * Anxiety Relief Crystals Pack
 *
 * A curated crystal pack for calming anxiety and promoting peace.
 */

import { PDFDocument, PDFFont, PDFImage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { StandardFonts } from 'pdf-lib';
import { PdfCrystalPack, PdfCrystal } from '../schema';
import { generateCrystalPackPdf } from '../templates/CrystalPackTemplate';
import { getCrystalsByIntention, Crystal } from '@/constants/grimoire/crystals';

const LOGO_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://lunary.app/press-kit/lunary-logo-light.png'
    : 'http://localhost:3000/press-kit/lunary-logo-light.png';

async function loadLogo(pdfDoc: PDFDocument): Promise<PDFImage | null> {
  try {
    const response = await fetch(LOGO_URL);
    if (!response.ok) return null;
    const logoBytes = await response.arrayBuffer();
    return pdfDoc.embedPng(logoBytes);
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
    const [regBytes, boldBytes] = await Promise.all([
      regRes.arrayBuffer(),
      boldRes.arrayBuffer(),
    ]);
    return {
      regular: await pdfDoc.embedFont(regBytes, { subset: true }),
      bold: await pdfDoc.embedFont(boldBytes, { subset: true }),
    };
  } catch {
    return {
      regular: await pdfDoc.embedFont(StandardFonts.Courier),
      bold: await pdfDoc.embedFont(StandardFonts.CourierBold),
    };
  }
}

function crystalToPdfCrystal(crystal: Crystal): PdfCrystal {
  return {
    id: crystal.id,
    name: crystal.name,
    chakras: crystal.chakras,
    element: crystal.elements[0] || 'Earth',
    zodiacSigns: crystal.zodiacSigns,
    properties: crystal.properties.slice(0, 6),
    howToUse: [
      crystal.workingWith.meditation,
      crystal.workingWith.healing,
      crystal.workingWith.manifestation,
    ]
      .filter(Boolean)
      .slice(0, 4),
    affirmation: crystal.correspondences.tarot?.[0]
      ? `Channel the energy of ${crystal.name} to find calm and clarity.`
      : `I am calm, grounded, and at peace with the support of ${crystal.name}.`,
    cleansing: crystal.careInstructions.cleansing[0],
  };
}

function buildAnxietyReliefPack(): PdfCrystalPack {
  const anxietyCrystals = getCrystalsByIntention('anxiety');
  const calmCrystals = getCrystalsByIntention('calm');
  const peaceCrystals = getCrystalsByIntention('peace');

  const allCrystals = [
    ...new Set([...anxietyCrystals, ...calmCrystals, ...peaceCrystals]),
  ];
  const selectedCrystals = allCrystals.slice(0, 6);

  if (selectedCrystals.length < 4) {
    const groundingCrystals = getCrystalsByIntention('grounding');
    selectedCrystals.push(
      ...groundingCrystals.slice(0, 6 - selectedCrystals.length),
    );
  }

  return {
    type: 'crystal',
    slug: 'anxiety-relief-crystals',
    title: 'Anxiety Relief Crystals',
    subtitle: 'Gentle stones for finding calm',
    moodText:
      'These crystals have been selected for their soothing, grounding properties. Each one offers a different pathway to peace, meeting you wherever you are.',
    perfectFor: [
      'Those navigating anxious thoughts',
      'Anyone seeking daily grounding rituals',
      'Sensitive souls who need energetic protection',
      'Building a calming crystal collection',
    ],
    introText:
      'Anxiety can feel all-encompassing, yet you are not alone. These crystals offer gentle support as you navigate challenging moments. Use them as companions for presence, not as substitutes for professional care.',
    crystals: selectedCrystals.map(crystalToPdfCrystal),
    closingText:
      'Thank you for exploring these crystals with Lunary. Remember: healing is not linear. These stones are companions on your journey, offering support as you learn to find calm within yourself.',
    optionalAffirmation:
      'I am safe in this moment. I breathe in peace and release what I cannot control.',
  };
}

export async function generateAnxietyReliefCrystalsPdf(): Promise<Uint8Array> {
  const pack = buildAnxietyReliefPack();
  return generateCrystalPackPdf(pack, loadFonts, loadLogo);
}

export { buildAnxietyReliefPack };
