/**
 * Generate Pack PDF API
 *
 * Generates a beautiful branded PDF for a pack
 *
 * Usage:
 *   GET /api/shop/packs/generate-pdf?packSlug=self-love-ritual-pack
 *   POST /api/shop/packs/generate-pdf { packSlug: "self-love-ritual-pack" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/shop/generators';
import { generateSpellPackPDF, SpellPackData } from '@/lib/pdf/generator';
import { spells as spellsFromConstants } from '@/constants/spells';
import spellsJson from '@/data/spells.json';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Combine spell sources
const allSpells = [...spellsJson, ...spellsFromConstants];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const packSlug = searchParams.get('packSlug');

  if (!packSlug) {
    return NextResponse.json({ error: 'packSlug required' }, { status: 400 });
  }

  return generatePackPDF(packSlug);
}

export async function POST(request: NextRequest) {
  const { packSlug } = await request.json();

  if (!packSlug) {
    return NextResponse.json({ error: 'packSlug required' }, { status: 400 });
  }

  return generatePackPDF(packSlug);
}

async function generatePackPDF(packSlug: string) {
  try {
    // Get pack data
    const pack = getProductBySlug(packSlug);

    if (!pack) {
      return NextResponse.json({ error: 'Pack not found' }, { status: 404 });
    }

    console.log(`📄 Generating PDF for: ${pack.title}`);

    // Get content based on pack category
    let pdfBuffer: Uint8Array;

    if (pack.category === 'spell') {
      pdfBuffer = await generateSpellPackPDFContent(pack);
    } else {
      // For now, use spell template as base for other categories
      // TODO: Add crystal, tarot, etc. templates
      pdfBuffer = await generateSpellPackPDFContent(pack);
    }

    console.log(`✅ PDF generated: ${Math.round(pdfBuffer.length / 1024)}KB`);

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${packSlug}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('❌ PDF generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 },
    );
  }
}

async function generateSpellPackPDFContent(pack: any): Promise<Uint8Array> {
  // Find spells for this pack based on tags/keywords
  const packKeywords = [
    ...(pack.tags || []),
    ...(pack.keywords || []),
    pack.category,
  ]
    .map((k: string) => k?.toLowerCase())
    .filter(Boolean);

  // Match spells by category or keywords
  const matchedSpells = allSpells
    .filter((spell: any) => {
      const spellCategory = spell.category?.toLowerCase() || '';
      const spellTags = (spell.tags || []).map((t: string) => t?.toLowerCase());
      const spellTitle = spell.title?.toLowerCase() || '';

      // Check if any keyword matches
      return packKeywords.some(
        (keyword) =>
          spellCategory.includes(keyword) ||
          spellTags.some((t: string) => t?.includes(keyword)) ||
          spellTitle.includes(keyword),
      );
    })
    .slice(0, 8); // Limit to 8 spells per pack

  // If no matches, get some general spells
  const spellsToUse =
    matchedSpells.length > 0 ? matchedSpells : allSpells.slice(0, 5);

  // Ensure all strings are actually strings (not objects)
  const safeString = (val: any): string => {
    if (typeof val === 'string') return val;
    if (val === null || val === undefined) return '';
    if (Array.isArray(val)) return val.join(', '); // Handle arrays like moonPhase
    if (typeof val === 'object') {
      // Handle ingredient/material objects
      if (val.name) {
        const parts = [val.name];
        if (val.amount) parts.push(`(${val.amount})`);
        return parts.join(' ');
      }
      return JSON.stringify(val);
    }
    return String(val);
  };

  const safeStringArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && item.name) {
          // Format ingredient objects: "Rose Quartz (1 piece)"
          const parts = [item.name];
          if (item.amount) parts.push(`(${item.amount})`);
          return parts.join(' ');
        }
        return safeString(item);
      })
      .filter(Boolean);
  };

  // Format moon phase properly
  const formatMoonPhase = (spell: any): string => {
    const moonPhase = spell.moonPhase || spell.timing?.moonPhase;
    if (!moonPhase) return '';
    if (Array.isArray(moonPhase)) return moonPhase.join(', ');
    return String(moonPhase);
  };

  const packData: SpellPackData = {
    title: safeString(pack.title),
    tagline: safeString(pack.tagline),
    description: safeString(pack.description),
    category: safeString(pack.category),
    perfectFor: safeStringArray(pack.perfectFor),
    introduction: `This ${safeString(pack.title)} has been carefully curated to support your magical practice. Each spell has been selected for its alignment with ${safeStringArray(pack.tags).join(', ') || 'your intentions'}.`,
    spells: spellsToUse.map((spell: any) => ({
      id: safeString(spell.id || spell.title || 'spell'),
      title: safeString(spell.title || spell.name || 'Untitled Spell'),
      description: safeString(
        spell.description ||
          spell.information ||
          'A magical spell for transformation.',
      ),
      category: safeString(spell.category),
      difficulty: safeString(spell.difficulty),
      duration: safeString(spell.duration),
      moonPhase: formatMoonPhase(spell),
      materials: safeStringArray(spell.materials || spell.ingredients),
      steps: safeStringArray(spell.steps || spell.instructions),
      incantation: safeString(spell.incantation || spell.chant),
    })),
  };

  console.log('📋 Pack data prepared:', {
    title: packData.title,
    spellCount: packData.spells.length,
    firstSpell: packData.spells[0]?.title,
  });

  // Generate PDF
  return generateSpellPackPDF(packData);
}
