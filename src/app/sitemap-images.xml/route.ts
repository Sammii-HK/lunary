import { NextResponse } from 'next/server';
import {
  ZODIAC_CORRESPONDENCES,
  PLANETARY_CORRESPONDENCES,
} from '@/constants/entity-relationships';
import { tarotSuits } from '@/constants/tarot';
import { crystalDatabase } from '@/constants/grimoire/crystals';

const BASE_URL = 'https://lunary.app';

interface ImageEntry {
  pageUrl: string;
  imageUrl: string;
  caption: string;
  title: string;
}

function generateImageEntries(): ImageEntry[] {
  const entries: ImageEntry[] = [];

  entries.push({
    pageUrl: '/',
    imageUrl: `${BASE_URL}/api/og/homepage`,
    caption: 'Lunary - Personalized Astrology & Cosmic Guidance',
    title: 'Lunary App',
  });

  Object.keys(ZODIAC_CORRESPONDENCES).forEach((sign) => {
    const signName = sign.charAt(0).toUpperCase() + sign.slice(1);
    entries.push({
      pageUrl: `/grimoire/zodiac/${sign}`,
      imageUrl: `${BASE_URL}/api/og/cosmic?title=${encodeURIComponent(signName)}`,
      caption: `${signName} Zodiac Sign - Lunary Astrology Guide`,
      title: `${signName} Zodiac Sign`,
    });
  });

  Object.keys(PLANETARY_CORRESPONDENCES).forEach((planet) => {
    const planetName = planet.charAt(0).toUpperCase() + planet.slice(1);
    entries.push({
      pageUrl: `/grimoire/astronomy/planets/${planet}`,
      imageUrl: `${BASE_URL}/api/og/cosmic?title=${encodeURIComponent(planetName)}`,
      caption: `${planetName} in Astrology - Lunary Guide`,
      title: `${planetName} in Astrology`,
    });
  });

  const majorArcana = [
    'The Fool',
    'The Magician',
    'The High Priestess',
    'The Empress',
    'The Emperor',
    'The Hierophant',
    'The Lovers',
    'The Chariot',
    'Strength',
    'The Hermit',
    'Wheel of Fortune',
    'Justice',
    'The Hanged Man',
    'Death',
    'Temperance',
    'The Devil',
    'The Tower',
    'The Star',
    'The Moon',
    'The Sun',
    'Judgement',
    'The World',
  ];

  majorArcana.forEach((card) => {
    const slug = card.toLowerCase().replace(/\s+/g, '-');
    entries.push({
      pageUrl: `/grimoire/tarot/${slug}`,
      imageUrl: `${BASE_URL}/api/og/cosmic?title=${encodeURIComponent(card)}`,
      caption: `${card} Tarot Card Meaning - Lunary`,
      title: card,
    });
  });

  Object.keys(tarotSuits).forEach((suit) => {
    for (let i = 1; i <= 14; i++) {
      const cardName =
        i === 1
          ? 'Ace'
          : i === 11
            ? 'Page'
            : i === 12
              ? 'Knight'
              : i === 13
                ? 'Queen'
                : i === 14
                  ? 'King'
                  : i.toString();
      const fullName = `${cardName} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`;
      const slug = fullName.toLowerCase().replace(/\s+/g, '-');
      entries.push({
        pageUrl: `/grimoire/tarot/${slug}`,
        imageUrl: `${BASE_URL}/api/og/cosmic?title=${encodeURIComponent(fullName)}`,
        caption: `${fullName} Tarot Card Meaning - Lunary`,
        title: fullName,
      });
    }
  });

  crystalDatabase.forEach((crystal) => {
    const slug = crystal.name.toLowerCase().replace(/\s+/g, '-');
    entries.push({
      pageUrl: `/grimoire/crystals/${slug}`,
      imageUrl: `${BASE_URL}/api/og/cosmic?title=${encodeURIComponent(crystal.name)}`,
      caption: `${crystal.name} Crystal Meaning & Properties - Lunary`,
      title: crystal.name,
    });
  });

  const moonPhases = [
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full Moon',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent',
  ];
  moonPhases.forEach((phase) => {
    entries.push({
      pageUrl: '/grimoire/moon-rituals',
      imageUrl: `${BASE_URL}/api/og/moon?phase=${encodeURIComponent(phase)}`,
      caption: `${phase} - Lunar Rituals & Meaning`,
      title: phase,
    });
  });

  return entries;
}

export async function GET() {
  const images = generateImageEntries();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${images
  .map(
    (img) => `  <url>
    <loc>${BASE_URL}${img.pageUrl}</loc>
    <image:image>
      <image:loc>${img.imageUrl}</image:loc>
      <image:caption>${escapeXml(img.caption)}</image:caption>
      <image:title>${escapeXml(img.title)}</image:title>
    </image:image>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
