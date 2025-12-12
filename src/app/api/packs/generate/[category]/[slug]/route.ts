/**
 * Universal PDF Pack Generator API
 *
 * Generates PDFs for any product on demand based on category and slug.
 * This allows all ~120 products to have PDFs without maintaining individual files.
 */

import { NextRequest, NextResponse } from 'next/server';

// Import content generators
import { generateSpellPackContent } from '@/lib/pdf/content-generators/spell-content';
import { generateCrystalPackContent } from '@/lib/pdf/content-generators/crystal-content';
import { generateTarotPackContent } from '@/lib/pdf/content-generators/tarot-content';
import { generateSeasonalPackContent } from '@/lib/pdf/content-generators/seasonal-content';
import {
  generateZodiacSeasonContent,
  generateSaturnReturnContent,
  generateJupiterExpansionContent,
} from '@/lib/pdf/content-generators/astrology-content';
import {
  generateRisingSignContent,
  generateMoonSignContent,
  generateHouseMeaningsContent,
} from '@/lib/pdf/content-generators/birthchart-content';
import { generateRetrogradePackContent } from '@/lib/pdf/content-generators/retrograde-content';

// Import PDF templates
import { generateSpellPackPdf } from '@/lib/pdf/templates/SpellPackTemplate';
import { generateCrystalPackPdf } from '@/lib/pdf/templates/CrystalPackTemplate';
import { generateTarotPackPdf } from '@/lib/pdf/templates/TarotPackTemplate';
import { generateSeasonalPackPdf } from '@/lib/pdf/templates/SeasonalPackTemplate';
import { generateAstrologyPackPdf } from '@/lib/pdf/templates/AstrologyPackTemplate';
import { generateBirthChartPackPdf } from '@/lib/pdf/templates/BirthChartPackTemplate';
import { generateRetrogradePackPdf } from '@/lib/pdf/templates/RetrogradePackTemplate';

// Import shop product configs for data
import { getSpellPackBySlug } from '@/lib/shop/generators/spell-packs';
import { getCrystalPackBySlug } from '@/lib/shop/generators/crystal-packs';
import { getTarotPackBySlug } from '@/lib/shop/generators/tarot-packs';

import { PDFDocument, PDFFont, PDFImage, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

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

type Params = Promise<{ category: string; slug: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const { category, slug } = await params;
    let pdfBytes: Uint8Array;

    switch (category) {
      case 'spell': {
        const shopProduct = getSpellPackBySlug(slug);
        if (!shopProduct) {
          return NextResponse.json(
            { error: 'Spell pack not found' },
            { status: 404 },
          );
        }
        const content = generateSpellPackContent({
          id: shopProduct.id,
          slug: shopProduct.slug,
          title: shopProduct.title,
          tagline: shopProduct.tagline,
          descriptionTemplate: shopProduct.description,
          spellCategories: shopProduct.tags?.filter((t) =>
            [
              'manifestation',
              'protection',
              'love',
              'healing',
              'banishing',
              'divination',
              'cleansing',
            ].includes(t),
          ) || ['manifestation'],
          keywords: shopProduct.keywords || [],
          perfectFor: shopProduct.perfectFor,
        });
        pdfBytes = await generateSpellPackPdf(content, loadFonts, loadLogo);
        break;
      }

      case 'crystal': {
        const shopProduct = getCrystalPackBySlug(slug);
        if (!shopProduct) {
          return NextResponse.json(
            { error: 'Crystal pack not found' },
            { status: 404 },
          );
        }
        const content = generateCrystalPackContent({
          id: shopProduct.id,
          slug: shopProduct.slug,
          title: shopProduct.title,
          tagline: shopProduct.tagline,
          description: shopProduct.description,
          crystalSelectionMethod: 'intention',
          selectionValue: shopProduct.tags?.[0] || 'calm',
          perfectFor: shopProduct.perfectFor,
        });
        pdfBytes = await generateCrystalPackPdf(content, loadFonts, loadLogo);
        break;
      }

      case 'tarot': {
        const shopProduct = getTarotPackBySlug(slug);
        if (!shopProduct) {
          return NextResponse.json(
            { error: 'Tarot pack not found' },
            { status: 404 },
          );
        }
        // We need to extract spreads from somewhere - for now use a basic structure
        const content = generateTarotPackContent({
          id: shopProduct.id,
          slug: shopProduct.slug,
          title: shopProduct.title,
          tagline: shopProduct.tagline,
          description: shopProduct.description,
          spreads: [], // Will be generated with defaults
          ritual: 'Create sacred space before your reading.',
          journalPrompts: [
            'What insights arose from this reading?',
            'What action am I called to take?',
          ],
          perfectFor: shopProduct.perfectFor,
        });
        pdfBytes = await generateTarotPackPdf(content, loadFonts, loadLogo);
        break;
      }

      case 'seasonal': {
        const sabbatName =
          slug.replace('-seasonal-pack', '').charAt(0).toUpperCase() +
          slug.replace('-seasonal-pack', '').slice(1);
        const content = generateSeasonalPackContent(sabbatName);
        pdfBytes = await generateSeasonalPackPdf(content, loadFonts, loadLogo);
        break;
      }

      case 'astrology': {
        if (slug.includes('saturn-return')) {
          const content = generateSaturnReturnContent();
          pdfBytes = await generateAstrologyPackPdf(
            content,
            loadFonts,
            loadLogo,
          );
        } else if (slug.includes('jupiter')) {
          const content = generateJupiterExpansionContent();
          pdfBytes = await generateAstrologyPackPdf(
            content,
            loadFonts,
            loadLogo,
          );
        } else {
          // Zodiac season pack
          const sign =
            slug.replace('-season-pack', '').charAt(0).toUpperCase() +
            slug.replace('-season-pack', '').slice(1);
          const content = generateZodiacSeasonContent(sign);
          pdfBytes = await generateAstrologyPackPdf(
            content,
            loadFonts,
            loadLogo,
          );
        }
        break;
      }

      case 'birthchart': {
        if (slug.includes('rising')) {
          const content = generateRisingSignContent();
          pdfBytes = await generateBirthChartPackPdf(
            content,
            loadFonts,
            loadLogo,
          );
        } else if (slug.includes('moon')) {
          const content = generateMoonSignContent();
          pdfBytes = await generateBirthChartPackPdf(
            content,
            loadFonts,
            loadLogo,
          );
        } else if (slug.includes('house')) {
          const content = generateHouseMeaningsContent();
          pdfBytes = await generateBirthChartPackPdf(
            content,
            loadFonts,
            loadLogo,
          );
        } else {
          return NextResponse.json(
            { error: 'Birth chart pack not found' },
            { status: 404 },
          );
        }
        break;
      }

      case 'retrograde': {
        const planet = slug.includes('mercury')
          ? 'Mercury'
          : slug.includes('venus')
            ? 'Venus'
            : slug.includes('mars')
              ? 'Mars'
              : null;
        if (!planet) {
          return NextResponse.json(
            { error: 'Retrograde pack not found' },
            { status: 404 },
          );
        }
        const content = generateRetrogradePackContent(planet);
        pdfBytes = await generateRetrogradePackPdf(
          content,
          loadFonts,
          loadLogo,
        );
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Unknown category' },
          { status: 404 },
        );
    }

    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${slug}.pdf"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: String(error) },
      { status: 500 },
    );
  }
}
