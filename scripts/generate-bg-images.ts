#!/usr/bin/env tsx
/**
 * Lunary Background Image Generator
 *
 * Generates a bank of cosmic/astrology-themed images using Grok Imagine Image
 * via the Vercel AI Gateway. Free through February 25th 2026.
 *
 * Use cases: app backgrounds, social post assets, thumbnails, OG images,
 * TikTok/Reel overlays, tarot card backdrops, article headers.
 *
 * Usage:
 *   pnpm tsx scripts/generate-bg-images.ts
 *   pnpm tsx scripts/generate-bg-images.ts --category moon
 *   pnpm tsx scripts/generate-bg-images.ts --size portrait   (1080x1920 for TikTok)
 *   pnpm tsx scripts/generate-bg-images.ts --size square     (1080x1080 for IG)
 *   pnpm tsx scripts/generate-bg-images.ts --size landscape  (1920x1080 for YouTube)
 *   pnpm tsx scripts/generate-bg-images.ts --dry-run
 *
 * Requires:
 *   AI_GATEWAY_API_KEY in .env.local
 */

import { config } from 'dotenv';
import { experimental_generateImage as generateImage, createGateway } from 'ai';
import * as fs from 'fs';
import * as path from 'path';

config({ path: '.env.local' });

// ─── CLI args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const categoryArg = args
  .find((a) => a.startsWith('--category='))
  ?.split('=')[1];
const sizeArg =
  args.find((a) => a.startsWith('--size='))?.split('=')[1] ?? 'portrait';
const limitArg = args.find((a) => a.startsWith('--limit='))?.split('=')[1];
const limit = limitArg ? parseInt(limitArg, 10) : Infinity;

const ASPECT_MAP: Record<string, string> = {
  portrait: '9:16', // TikTok / Reels
  square: '1:1', // Instagram feed / app
  landscape: '16:9', // YouTube / wide banners
};

const ASPECT_RATIO = ASPECT_MAP[sizeArg] ?? ASPECT_MAP.portrait;

const OUTPUT_DIR = path.join(process.cwd(), 'images', 'backgrounds', sizeArg);
const MANIFEST_PATH = path.join(
  process.cwd(),
  'images',
  'backgrounds',
  'manifest.json',
);

const MODEL = 'xai/grok-imagine-image';

// ─── Prompt library ──────────────────────────────────────────────────────────

interface ImagePrompt {
  id: string;
  category: string;
  prompt: string;
  tags: string[];
}

const PROMPTS: ImagePrompt[] = [
  // MOON
  {
    id: 'moon-full-fog',
    category: 'moon',
    prompt:
      'A massive luminous full moon behind thin misty clouds. Deep indigo and navy sky. Soft moonlight halos. Photorealistic. Vertical orientation. No text. Dark mood, beautiful.',
    tags: ['moon', 'full-moon', 'fog'],
  },
  {
    id: 'moon-crescent-gold',
    category: 'moon',
    prompt:
      'A thin golden crescent moon against a velvety deep purple night sky. Thousands of tiny stars. The moon glows with warm gold light. Dreamy and mystical. No text.',
    tags: ['moon', 'crescent', 'gold'],
  },
  {
    id: 'moon-blood-eclipse',
    category: 'moon',
    prompt:
      'A blood moon during total lunar eclipse. Deep crimson and orange moon against a black star-filled sky. Dramatic and awe-inspiring. Photorealistic astrophotography style. No text.',
    tags: ['moon', 'eclipse', 'blood-moon'],
  },
  {
    id: 'moon-surface-close',
    category: 'moon',
    prompt:
      'Extreme close-up of the moon surface. Craters and highlands in sharp relief. Earthshine casts soft blue light on the dark limb. Deep space black background. NASA photography style. No text.',
    tags: ['moon', 'surface', 'close-up'],
  },
  {
    id: 'moon-phases-grid',
    category: 'moon',
    prompt:
      'All eight moon phases arranged in a vertical sequence on a deep black background. Each phase glows with soft silver light. Clean, scientific, beautiful. No text or labels.',
    tags: ['moon', 'phases', 'all'],
  },
  {
    id: 'moon-forest-silhouette',
    category: 'moon',
    prompt:
      'A giant full moon rising above the silhouette of a dark forest. The moon illuminates the treetops with silver light. Stars visible in the sky. Deep blues and silver tones. Magical. No text.',
    tags: ['moon', 'forest', 'silhouette'],
  },

  // STAR FIELDS
  {
    id: 'stars-milky-way-vertical',
    category: 'stars',
    prompt:
      'The Milky Way galaxy arching across a vertical night sky. Billions of stars visible in a thick luminous band. Purple and gold nebula tones. Desert landscape silhouette at the base. No text.',
    tags: ['stars', 'milky-way'],
  },
  {
    id: 'stars-deep-space-blue',
    category: 'stars',
    prompt:
      'Deep space filled with brilliant blue and white stars of varying sizes. Dense star clusters. Some stars with visible diffraction spikes. Pure black background. Hubble telescope aesthetic. No text.',
    tags: ['stars', 'deep-space', 'blue'],
  },
  {
    id: 'stars-golden-field',
    category: 'stars',
    prompt:
      'A warm golden star field. Hundreds of stars in amber, gold and cream tones against deep black space. Some stars brighter than others. Cosy and magical. No text.',
    tags: ['stars', 'golden', 'warm'],
  },
  {
    id: 'stars-shooting-streak',
    category: 'stars',
    prompt:
      'A dramatic shooting star leaving a long brilliant white streak across a dense star field. The Milky Way glows softly in the background. Long-exposure photography style. No text.',
    tags: ['stars', 'shooting', 'streak'],
  },

  // NEBULAE
  {
    id: 'nebula-purple-cosmic',
    category: 'nebula',
    prompt:
      'A breathtaking cosmic nebula in rich purples, magentas and deep blues. Luminous gas clouds with embedded stars. Looks like an oil painting of space. Hubble-style photography. No text.',
    tags: ['nebula', 'purple', 'cosmic'],
  },
  {
    id: 'nebula-rose-gold',
    category: 'nebula',
    prompt:
      'A rose gold nebula. Soft pink and gold gas clouds glowing in deep space. Stars sparkle throughout. Feminine and otherworldly. No text.',
    tags: ['nebula', 'rose', 'gold'],
  },
  {
    id: 'nebula-teal-electric',
    category: 'nebula',
    prompt:
      'An electric teal and cyan nebula against black space. Luminous gas tendrils curl outward. Stars glow white within the cloud. Vivid, almost neon cosmic colours. No text.',
    tags: ['nebula', 'teal', 'electric'],
  },
  {
    id: 'nebula-amber-warm',
    category: 'nebula',
    prompt:
      'A warm amber nebula glowing like embers in space. Rich ochre and gold tones. Gas filaments drift outward. Stars embedded within. Earthy cosmic beauty. No text.',
    tags: ['nebula', 'amber', 'warm'],
  },
  {
    id: 'nebula-pillars-creation',
    category: 'nebula',
    prompt:
      'The Pillars of Creation. Towering gas columns rising from a glowing nebula. Deep green, teal and gold. Stars forming within the pillars. Based on the famous Hubble/JWST image. No text.',
    tags: ['nebula', 'pillars', 'iconic'],
  },
  {
    id: 'nebula-butterfly-wings',
    category: 'nebula',
    prompt:
      'A butterfly nebula, two symmetrical wings of glowing gas spreading outward from a central star. Purple, blue and white. Stunning symmetry. Space photography aesthetic. No text.',
    tags: ['nebula', 'butterfly', 'symmetry'],
  },

  // PLANETS
  {
    id: 'planet-earth-limb',
    category: 'planets',
    prompt:
      'The curved limb of Earth from low orbit. Blue ocean, white cloud swirls, green-brown land. The atmosphere glows blue on the horizon. Deep black space above. Astronaut photography style. No text.',
    tags: ['planets', 'earth', 'orbit'],
  },
  {
    id: 'planet-saturn-full',
    category: 'planets',
    prompt:
      'Saturn with its stunning ring system. Golden banded planet, detailed rings casting a shadow. Star field background. Space telescope quality image. No text.',
    tags: ['planets', 'saturn', 'rings'],
  },
  {
    id: 'planet-moon-conjunction',
    category: 'planets',
    prompt:
      'The Moon and a bright planet (Venus) in close conjunction against a deep blue twilight sky. Both glowing brilliantly. Silhouette of hills below. Astrophotography style. No text.',
    tags: ['planets', 'moon', 'conjunction'],
  },
  {
    id: 'planet-jupiter-bands',
    category: 'planets',
    prompt:
      'Jupiter close up. Swirling amber and cream cloud bands. The Great Red Spot visible. Detailed atmospheric texture. Space probe photography quality. No text.',
    tags: ['planets', 'jupiter'],
  },

  // AURORA
  {
    id: 'aurora-green-reflection',
    category: 'aurora',
    prompt:
      'The Northern Lights in vivid green dancing above a perfectly still lake. The aurora is reflected in the water below creating a perfect mirror image. Stars above. Magical. No text.',
    tags: ['aurora', 'green', 'reflection'],
  },
  {
    id: 'aurora-rainbow-sky',
    category: 'aurora',
    prompt:
      'A full spectrum aurora borealis filling the entire sky. Ribbons of green, purple, pink and white light. Stars visible between the bands. Snowy landscape below. No text.',
    tags: ['aurora', 'rainbow', 'full-sky'],
  },
  {
    id: 'aurora-purple-peaks',
    category: 'aurora',
    prompt:
      'Deep purple and violet aurora above mountain peaks at night. The aurora spirals upward. Stars and the Milky Way visible. Snow-capped peaks in silhouette. No text.',
    tags: ['aurora', 'purple', 'mountains'],
  },

  // COSMIC AND MYSTICAL
  {
    id: 'cosmic-portal-opening',
    category: 'cosmic',
    prompt:
      'A circular cosmic portal opening in deep space. Stars and galaxies visible through it. Purple and gold energy at the edges. The portal glows. Mystical and interdimensional. No text.',
    tags: ['cosmic', 'portal'],
  },
  {
    id: 'cosmic-eye-nebula',
    category: 'cosmic',
    prompt:
      'A nebula shaped like a giant cosmic eye. The iris is a glowing golden nebula, the pupil is a dark region, surrounded by a blue gas ring. Otherworldly and symbolic. No text.',
    tags: ['cosmic', 'eye', 'symbolic'],
  },
  {
    id: 'cosmic-spiral-galaxy',
    category: 'cosmic',
    prompt:
      'A perfect face-on spiral galaxy. Blue and gold spiral arms. Dense bright core. Surrounded by deep space with distant background galaxies visible. Hubble quality. No text.',
    tags: ['cosmic', 'galaxy', 'spiral'],
  },
  {
    id: 'cosmic-stardust-gold',
    category: 'cosmic',
    prompt:
      'Gold stardust and cosmic particles drifting through deep space. Luminous golden motes against deep black. Like snow made of light. Magical and meditative. No text.',
    tags: ['cosmic', 'stardust', 'gold'],
  },
  {
    id: 'cosmic-event-horizon',
    category: 'cosmic',
    prompt:
      'A black hole with a glowing accretion disc of orange and gold plasma swirling around it. Light bends visibly around the event horizon. Dramatic, physics-accurate visualization. No text.',
    tags: ['cosmic', 'black-hole'],
  },

  // ZODIAC AND ASTROLOGY
  {
    id: 'zodiac-constellation-map',
    category: 'zodiac',
    prompt:
      'An ancient celestial map with zodiac constellations. Deep indigo background with gold star patterns and constellation lines. Vintage astronomical chart style, but set against real stars. No text.',
    tags: ['zodiac', 'constellation-map', 'vintage'],
  },
  {
    id: 'zodiac-wheel-gold',
    category: 'zodiac',
    prompt:
      'A golden zodiac wheel glowing against a deep blue cosmic background. All 12 signs as elegant minimal symbols around the circle. Stars and a faint nebula behind. Mystical and elegant. No text.',
    tags: ['zodiac', 'wheel', 'gold'],
  },
  {
    id: 'zodiac-scorpio-cosmic',
    category: 'zodiac',
    prompt:
      'The Scorpio zodiac constellation rendered in brilliant stars connected by golden lines against a deep space background. The scorpion shape clearly visible. A crimson nebula glows nearby. No text.',
    tags: ['zodiac', 'scorpio'],
  },
  {
    id: 'zodiac-pisces-cosmic',
    category: 'zodiac',
    prompt:
      'The Pisces zodiac sign as two fish drawn in stars and golden light against deep blue space. Soft blue and silver nebula nearby. Ethereal and dreamy. No text.',
    tags: ['zodiac', 'pisces'],
  },
  {
    id: 'zodiac-element-fire',
    category: 'zodiac',
    prompt:
      'Cosmic fire. Solar plasma erupting from the surface of the sun. Reds, oranges, golds. Sun prominence arcing into space. Dramatic, powerful, alive. No text.',
    tags: ['zodiac', 'fire', 'element', 'solar'],
  },
  {
    id: 'zodiac-element-water',
    category: 'zodiac',
    prompt:
      'Deep ocean surface with stars visible through it, as if the water and space merge. Bioluminescent blue. The boundary between sea and cosmos dissolves. Ethereal. No text.',
    tags: ['zodiac', 'water', 'element'],
  },
  {
    id: 'zodiac-element-earth',
    category: 'zodiac',
    prompt:
      'Rich dark earth soil with crystals and roots, viewed from above. Deep emerald moss, polished stones, amethyst clusters. Arranged like a mandala. Earthy and mystical. No text.',
    tags: ['zodiac', 'earth', 'element', 'crystals'],
  },
  {
    id: 'zodiac-element-air',
    category: 'zodiac',
    prompt:
      'Wispy clouds against a gradient sky from deep blue to pale silver. The clouds form swirling patterns like wind made visible. Ethereal and airy. No text.',
    tags: ['zodiac', 'air', 'element'],
  },

  // RITUAL AND MYSTICAL
  {
    id: 'ritual-crystal-ball',
    category: 'ritual',
    prompt:
      'A crystal ball reflecting a starry night sky. The sphere sits on a dark velvet surface. Stars and galaxies visible through the glass. Mystical golden light. No text.',
    tags: ['ritual', 'crystal-ball'],
  },
  {
    id: 'ritual-altar-cosmic',
    category: 'ritual',
    prompt:
      'A mystical altar from above. Crystals, candles, dried flowers, moon phase symbols arranged on dark cloth. Soft candlelight. Cosmic starfield visible through a window behind. No text.',
    tags: ['ritual', 'altar', 'above'],
  },
  {
    id: 'ritual-tarot-cards',
    category: 'ritual',
    prompt:
      'Three tarot cards face down on dark velvet. The backs show a celestial pattern of stars and moons. Candlelight glows from one side. Mysterious and beautiful. No text or labels.',
    tags: ['ritual', 'tarot'],
  },
  {
    id: 'ritual-smoke-sigil',
    category: 'ritual',
    prompt:
      'White smoke curling upward against a black background, forming abstract sigil-like shapes. The smoke glows faintly silver. Stars faintly visible in the background. Ethereal and mystical. No text.',
    tags: ['ritual', 'smoke', 'sigil'],
  },
  {
    id: 'ritual-moon-water-bowl',
    category: 'ritual',
    prompt:
      'A ceramic bowl of water reflecting a full moon perfectly. The bowl sits outdoors on a stone surface. Rose petals and crystals arranged around it. Moonlit and magical. No text.',
    tags: ['ritual', 'moon-water'],
  },
  {
    id: 'ritual-candles-stars',
    category: 'ritual',
    prompt:
      'Multiple white candles burning with a star-filled night sky behind them. The candle flames glow warm gold. Stars and the Milky Way visible. Deep blues and warm golds. No text.',
    tags: ['ritual', 'candles'],
  },

  // APP / UI BACKGROUNDS (clean, abstract)
  {
    id: 'app-bg-deep-cosmos',
    category: 'app',
    prompt:
      'A deep cosmic background suitable for a mobile app. Very dark navy and black with a faint star field. A subtle blue-purple nebula glow on one side. Clean, minimal, beautiful. No text.',
    tags: ['app', 'background', 'dark', 'minimal'],
  },
  {
    id: 'app-bg-gold-nebula',
    category: 'app',
    prompt:
      'A dark app background with a subtle warm gold nebula glow in one corner. Stars scattered lightly. Very dark overall, suitable for text overlay. Luxurious and cosmic. No text.',
    tags: ['app', 'background', 'gold'],
  },
  {
    id: 'app-bg-purple-mist',
    category: 'app',
    prompt:
      'A rich deep purple cosmic mist background. Subtle star field, faint purple and lavender gas clouds. Very dark. Suitable as an app background for white text overlay. No text.',
    tags: ['app', 'background', 'purple'],
  },
  {
    id: 'app-bg-moon-minimal',
    category: 'app',
    prompt:
      'A minimalist background with a faint crescent moon watermark in silver against very dark navy. Simple, elegant, suitable for text overlay. No text.',
    tags: ['app', 'background', 'moon', 'minimal'],
  },

  // CRYSTALS AND GEMSTONES
  {
    id: 'crystal-amethyst-cluster',
    category: 'crystals',
    prompt:
      'A stunning amethyst crystal cluster. Deep purple and violet points catching the light. Dark background. Macro photography style. Beautiful and mystical. No text.',
    tags: ['crystals', 'amethyst', 'purple'],
  },
  {
    id: 'crystal-clear-quartz',
    category: 'crystals',
    prompt:
      'Clear quartz crystal points, perfectly transparent, refracting light into tiny rainbows. Dark background. Close-up macro. Clean and magical. No text.',
    tags: ['crystals', 'quartz', 'clear'],
  },
  {
    id: 'crystal-labradorite',
    category: 'crystals',
    prompt:
      'A labradorite crystal showing its spectacular blue and gold iridescent flash. Dark background. Close up. The colours shift as if alive. Magical and ethereal. No text.',
    tags: ['crystals', 'labradorite', 'iridescent'],
  },
  {
    id: 'crystal-rose-quartz',
    category: 'crystals',
    prompt:
      'Rose quartz crystals in soft pink and blush tones. Glowing with warm light. Dark velvet background. Soft and romantic. Macro photography. No text.',
    tags: ['crystals', 'rose-quartz', 'pink'],
  },
  {
    id: 'crystal-obsidian-moon',
    category: 'crystals',
    prompt:
      'A polished black obsidian moon shape on dark fabric. Its surface reflects faint starlight. Mysterious and powerful. No text.',
    tags: ['crystals', 'obsidian', 'moon', 'black'],
  },
  {
    id: 'crystal-selenite-glow',
    category: 'crystals',
    prompt:
      'Selenite crystals glowing white and soft silver. Translucent and ethereal. Backlit so they glow from within. Dark background. Angelic and pure. No text.',
    tags: ['crystals', 'selenite', 'white', 'glow'],
  },
  {
    id: 'crystal-array-altar',
    category: 'crystals',
    prompt:
      'An array of various crystals arranged in a circle from above. Amethyst, rose quartz, citrine, obsidian, selenite, labradorite. Dark velvet surface. Top-down flat lay. Magical. No text.',
    tags: ['crystals', 'array', 'collection', 'flatlay'],
  },

  // MORE ZODIAC SIGNS
  {
    id: 'zodiac-aries-cosmic',
    category: 'zodiac',
    prompt:
      'Aries zodiac symbol — a ram made of stars glowing gold and red against deep space. Fiery energy. A faint red nebula behind. Bold and powerful. No text.',
    tags: ['zodiac', 'aries', 'fire'],
  },
  {
    id: 'zodiac-taurus-cosmic',
    category: 'zodiac',
    prompt:
      'Taurus zodiac symbol — a bull head formed from stars connected by golden lines. Deep green nebula behind. Earthy and grounded. Set against deep space. No text.',
    tags: ['zodiac', 'taurus', 'earth'],
  },
  {
    id: 'zodiac-gemini-cosmic',
    category: 'zodiac',
    prompt:
      'Gemini twins constellation. Two figures formed from stars, connected by golden lines. A swirling yellow nebula behind. Airy and intellectual. No text.',
    tags: ['zodiac', 'gemini', 'air'],
  },
  {
    id: 'zodiac-cancer-cosmic',
    category: 'zodiac',
    prompt:
      'Cancer zodiac — a crab formed from stars with a large full moon behind it. Silver and deep blue. The moon illuminates the cosmic crab. Emotional and powerful. No text.',
    tags: ['zodiac', 'cancer', 'moon', 'water'],
  },
  {
    id: 'zodiac-leo-cosmic',
    category: 'zodiac',
    prompt:
      'Leo constellation — a lion formed from golden glowing stars against deep space. A brilliant golden sun in the background. Regal and powerful. No text.',
    tags: ['zodiac', 'leo', 'fire', 'sun'],
  },
  {
    id: 'zodiac-virgo-cosmic',
    category: 'zodiac',
    prompt:
      'Virgo zodiac — a maiden figure formed from soft silver stars. A pastel green nebula behind. Precise and elegant. Deep space background. No text.',
    tags: ['zodiac', 'virgo', 'earth'],
  },
  {
    id: 'zodiac-libra-cosmic',
    category: 'zodiac',
    prompt:
      'Libra zodiac — balanced scales formed from glowing golden stars. A pink and lavender nebula behind them. Perfectly symmetrical. Elegant and beautiful. No text.',
    tags: ['zodiac', 'libra', 'air', 'scales'],
  },
  {
    id: 'zodiac-sagittarius-cosmic',
    category: 'zodiac',
    prompt:
      'Sagittarius — an archer formed from stars, golden arrow pointing upward toward a bright star. Deep purple space behind. Adventurous and bold. No text.',
    tags: ['zodiac', 'sagittarius', 'fire'],
  },
  {
    id: 'zodiac-capricorn-cosmic',
    category: 'zodiac',
    prompt:
      'Capricorn — a sea-goat formed from dark gold stars against a midnight blue cosmic backdrop. Mountains and ocean merge in the background. Ambitious and ancient. No text.',
    tags: ['zodiac', 'capricorn', 'earth'],
  },
  {
    id: 'zodiac-aquarius-cosmic',
    category: 'zodiac',
    prompt:
      'Aquarius — a water-bearer formed from electric blue stars. Water pours from a cosmic vessel into the stars below. Electric and visionary. No text.',
    tags: ['zodiac', 'aquarius', 'air', 'water'],
  },

  // COLOUR MOOD VARIATIONS
  {
    id: 'mood-dark-moody-cosmos',
    category: 'mood',
    prompt:
      'Extremely dark and moody cosmic scene. Deep charcoal and black with faint silver stars. A barely visible crescent moon. Gothic and dramatic. Suitable for dark text overlay. No text.',
    tags: ['mood', 'dark', 'moody', 'gothic'],
  },
  {
    id: 'mood-ethereal-pastel',
    category: 'mood',
    prompt:
      'Soft ethereal pastel cosmos. Baby pink, lavender and pale gold. Gentle star field. Dreamy clouds. Soft and romantic. Feminine and magical. No text.',
    tags: ['mood', 'pastel', 'ethereal', 'soft'],
  },
  {
    id: 'mood-midnight-blue',
    category: 'mood',
    prompt:
      'Rich midnight blue cosmos. Deep saturated blue sky filled with stars. A full moon casting silver light. Sophisticated and mysterious. No text.',
    tags: ['mood', 'midnight', 'blue', 'sophisticated'],
  },
  {
    id: 'mood-golden-hour-cosmos',
    category: 'mood',
    prompt:
      'Golden hour meets the cosmos. Warm amber and gold gradient sky fading into deep space. Stars visible above while golden sunset glow lights the horizon. Warm and magical. No text.',
    tags: ['mood', 'golden', 'warm', 'sunset'],
  },
  {
    id: 'mood-neon-cosmic',
    category: 'mood',
    prompt:
      'Neon cosmic scene. Vivid electric pink, cyan and purple nebula against black space. Almost cyberpunk meets cosmos. Vibrant and energetic. No text.',
    tags: ['mood', 'neon', 'vibrant', 'electric'],
  },
  {
    id: 'mood-monochrome-silver',
    category: 'mood',
    prompt:
      'Monochrome silver and white cosmos. A full moon, stars, and a wispy nebula all in silver and grey tones. Elegant and timeless. No text.',
    tags: ['mood', 'monochrome', 'silver', 'elegant'],
  },

  // SACRED GEOMETRY
  {
    id: 'sacred-flower-of-life',
    category: 'sacred',
    prompt:
      'The Flower of Life sacred geometry pattern glowing gold against a deep indigo background. Perfect circles interlocking. Stars visible behind. Ancient and cosmic. No text.',
    tags: ['sacred', 'flower-of-life', 'geometry', 'gold'],
  },
  {
    id: 'sacred-metatrons-cube',
    category: 'sacred',
    prompt:
      "Metatron's Cube sacred geometry. Complex geometric pattern of interlocking circles and lines glowing in silver and gold. Deep space background. Mystical and mathematical. No text.",
    tags: ['sacred', 'metatron', 'geometry'],
  },
  {
    id: 'sacred-sri-yantra',
    category: 'sacred',
    prompt:
      'A Sri Yantra mandala glowing in gold against a deep purple cosmic background. Interlocking triangles forming a perfect geometric pattern. Stars behind. Sacred and powerful. No text.',
    tags: ['sacred', 'sri-yantra', 'mandala', 'gold'],
  },
  {
    id: 'sacred-cosmic-mandala',
    category: 'sacred',
    prompt:
      'A cosmic mandala formed from stars and nebula gas. A perfect circle of cosmic matter, symmetrical and radiant. Gold and purple. Looks naturally formed by the universe. No text.',
    tags: ['sacred', 'mandala', 'cosmic', 'symmetry'],
  },

  // SEASONAL AND NATURE COSMIC
  {
    id: 'nature-autumn-stars',
    category: 'nature',
    prompt:
      'Autumn leaves falling against a star-filled night sky. Deep orange, red and gold leaves drift downward. Stars and a crescent moon above. Magical and seasonal. No text.',
    tags: ['nature', 'autumn', 'leaves', 'stars'],
  },
  {
    id: 'nature-winter-solstice',
    category: 'nature',
    prompt:
      'Winter solstice night. Snow-covered ground reflecting a brilliant full moon. Stars blazing overhead. Bare tree silhouettes. Magical and still. No text.',
    tags: ['nature', 'winter', 'solstice', 'snow'],
  },
  {
    id: 'nature-spring-cosmos',
    category: 'nature',
    prompt:
      'Cherry blossom petals floating upward into a starry night sky. Pink flowers merge with stars. The moon glows above. A magical spring evening. No text.',
    tags: ['nature', 'spring', 'blossom', 'stars'],
  },
  {
    id: 'nature-ocean-cosmos',
    category: 'nature',
    prompt:
      'Ocean waves under a star-filled sky. The Milky Way reflects in the wet sand. Bioluminescent blue waves glow. Where the earth meets the cosmos. No text.',
    tags: ['nature', 'ocean', 'milky-way', 'bioluminescent'],
  },
  {
    id: 'nature-forest-moonlight',
    category: 'nature',
    prompt:
      'Ancient forest bathed in moonlight. Silver light filters through tall trees. Mist at ground level. Stars visible through the canopy above. Mystical and primal. No text.',
    tags: ['nature', 'forest', 'moonlight', 'mist'],
  },

  // DEEP SPACE — JWST / HUBBLE STYLE
  {
    id: 'astro-jwst-deep-field',
    category: 'astronomical',
    prompt:
      'James Webb Space Telescope deep field image. Thousands of galaxies at various distances fill the frame. Some distorted by gravitational lensing. Rich gold and red infrared tones on black. Photorealistic. No text.',
    tags: ['astronomical', 'jwst', 'deep-field', 'galaxies'],
  },
  {
    id: 'astro-hubble-ultra-deep',
    category: 'astronomical',
    prompt:
      'Hubble Ultra Deep Field. Thousands of ancient galaxies in every shape — spiral, elliptical, irregular. Some 13 billion light years away. Deep black background. Humbling scale. No text.',
    tags: ['astronomical', 'hubble', 'deep-field', 'galaxies'],
  },
  {
    id: 'astro-orion-nebula',
    category: 'astronomical',
    prompt:
      'The Orion Nebula (M42) in full detail. A vast stellar nursery in pinks, purples and blue. Newborn stars glow at the centre. Gas and dust clouds surround them. JWST quality photography. No text.',
    tags: ['astronomical', 'orion', 'nebula', 'stellar-nursery'],
  },
  {
    id: 'astro-crab-nebula',
    category: 'astronomical',
    prompt:
      'The Crab Nebula supernova remnant. Tangled filaments of glowing gas in red and gold expand outward from a central pulsar. Blue synchrotron radiation glows at the heart. Dramatic. No text.',
    tags: ['astronomical', 'crab-nebula', 'supernova', 'pulsar'],
  },
  {
    id: 'astro-andromeda-galaxy',
    category: 'astronomical',
    prompt:
      'The Andromeda Galaxy (M31) filling the frame. A massive barred spiral galaxy with two smaller satellite galaxies nearby. Star-forming regions visible in the spiral arms. Photorealistic. No text.',
    tags: ['astronomical', 'andromeda', 'galaxy', 'spiral'],
  },
  {
    id: 'astro-sombrero-galaxy',
    category: 'astronomical',
    prompt:
      'The Sombrero Galaxy (M104) edge-on. A bright bulging core with a dark dust lane cutting through it and glowing halo. Deep black background. One of the most striking galaxies in the sky. No text.',
    tags: ['astronomical', 'sombrero', 'galaxy', 'edge-on'],
  },
  {
    id: 'astro-whirlpool-galaxy',
    category: 'astronomical',
    prompt:
      'The Whirlpool Galaxy (M51) and its companion galaxy. Two galaxies interacting — spiral arms distorted, a bridge of stars connecting them. Blue and pink star forming regions. Hubble quality. No text.',
    tags: ['astronomical', 'whirlpool', 'galaxy', 'interaction'],
  },
  {
    id: 'astro-eta-carinae',
    category: 'astronomical',
    prompt:
      'Eta Carinae, one of the most massive and luminous stars known. A brilliant blue hypergiant surrounded by the Homunculus Nebula, a bipolar cloud of gas and dust it ejected. JWST style. No text.',
    tags: ['astronomical', 'eta-carinae', 'hypergiant', 'nebula'],
  },

  // SOLAR SYSTEM — DETAILED
  {
    id: 'solar-corona-eclipse',
    category: 'astronomical',
    prompt:
      'A total solar eclipse. The sun fully blocked, its white corona blazing outward in delicate streamers and plumes. Deep black sky, a few bright stars visible. Photorealistic astrophotography. No text.',
    tags: ['astronomical', 'solar-eclipse', 'corona', 'sun'],
  },
  {
    id: 'solar-flare-prominence',
    category: 'astronomical',
    prompt:
      'A massive solar prominence arcing from the surface of the sun. Glowing plasma loops millions of kilometres into space. Deep reds and oranges. Space telescope imagery style. No text.',
    tags: ['astronomical', 'solar-flare', 'prominence', 'sun'],
  },
  {
    id: 'solar-sunspots-surface',
    category: 'astronomical',
    prompt:
      "Close up of the sun's surface showing sunspots and solar granulation. The granular texture of convection cells visible. Dark sunspot regions surrounded by bright plasma. Scientific and dramatic. No text.",
    tags: ['astronomical', 'sunspots', 'solar', 'granulation'],
  },
  {
    id: 'planet-europa-surface',
    category: 'astronomical',
    prompt:
      "Jupiter's moon Europa. A cracked icy surface crisscrossed with dark reddish lines over pale blue-white ice. A subsurface ocean hints beneath. Space probe photography style. No text.",
    tags: ['astronomical', 'europa', 'moon', 'jupiter'],
  },
  {
    id: 'planet-titan-atmosphere',
    category: 'astronomical',
    prompt:
      "Saturn's moon Titan seen from orbit. A hazy orange atmosphere obscures the surface. Saturn's rings visible in the background. Cassini spacecraft photography aesthetic. No text.",
    tags: ['astronomical', 'titan', 'moon', 'saturn'],
  },
  {
    id: 'planet-io-volcanic',
    category: 'astronomical',
    prompt:
      "Jupiter's moon Io. The most volcanically active body in the solar system. Bright yellow and orange sulphur deposits, dark volcanic calderas, active eruptions plume into space. Dramatic. No text.",
    tags: ['astronomical', 'io', 'volcanic', 'jupiter'],
  },
  {
    id: 'planet-neptune-triton',
    category: 'astronomical',
    prompt:
      "Neptune seen from near its moon Triton. The deep blue ice giant with its faint rings. Triton's pinkish-white surface in the foreground. The black void of the outer solar system. No text.",
    tags: ['astronomical', 'neptune', 'triton', 'ice-giant'],
  },
  {
    id: 'planet-uranus-rings',
    category: 'astronomical',
    prompt:
      'Uranus tilted on its side, its thin dark rings visible around the pale blue-green planet. Deep space background. Voyager 2 photography style. Otherworldly and lonely. No text.',
    tags: ['astronomical', 'uranus', 'rings', 'ice-giant'],
  },
  {
    id: 'planet-pluto-heart',
    category: 'astronomical',
    prompt:
      'Pluto showing its famous heart-shaped nitrogen ice plain (Tombaugh Regio). Pale pink and white terrain. Dark cratered regions contrast with the bright heart. New Horizons photography style. No text.',
    tags: ['astronomical', 'pluto', 'dwarf-planet', 'heart'],
  },

  // COMETS AND SMALL BODIES
  {
    id: 'astro-comet-tail',
    category: 'astronomical',
    prompt:
      'A brilliant comet with a long glowing tail stretching across the star field. The coma glows blue-green from ionised gas. The dust tail fans out in golden white behind it. Astrophotography. No text.',
    tags: ['astronomical', 'comet', 'tail', 'brilliant'],
  },
  {
    id: 'astro-asteroid-belt',
    category: 'astronomical',
    prompt:
      'The asteroid belt between Mars and Jupiter. Rocky asteroids of various sizes, some illuminated, some in shadow. Jupiter glows orange in the far background. Deep space. Cinematic. No text.',
    tags: ['astronomical', 'asteroid-belt', 'solar-system'],
  },

  // STELLAR PHENOMENA
  {
    id: 'stellar-red-giant',
    category: 'astronomical',
    prompt:
      'A massive red giant star fills the frame. Deep crimson and orange, its surface roiling with convection. A small companion star visible in the distance. Scale is immense. No text.',
    tags: ['astronomical', 'red-giant', 'star', 'massive'],
  },
  {
    id: 'stellar-white-dwarf-nebula',
    category: 'astronomical',
    prompt:
      'A planetary nebula — a dying star has shed its outer layers forming a beautiful glowing shell. A tiny white dwarf shines at the centre. Concentric rings of ionised gas in blue and pink. No text.',
    tags: ['astronomical', 'white-dwarf', 'planetary-nebula', 'dying-star'],
  },
  {
    id: 'stellar-star-cluster-open',
    category: 'astronomical',
    prompt:
      'The Pleiades open star cluster. Hot blue-white stars surrounded by wispy blue reflection nebula. Each star has diffraction spikes. Set against a rich star field. Astrophotography quality. No text.',
    tags: ['astronomical', 'pleiades', 'star-cluster', 'blue'],
  },
  {
    id: 'stellar-globular-cluster',
    category: 'astronomical',
    prompt:
      'A globular cluster — hundreds of thousands of ancient stars densely packed into a sphere. Stars grow impossibly dense toward the blazing core. Deep sky astrophotography. No text.',
    tags: ['astronomical', 'globular-cluster', 'dense', 'ancient'],
  },
  {
    id: 'stellar-neutron-star-pulsar',
    category: 'astronomical',
    prompt:
      'A neutron star pulsar spinning rapidly, emitting twin beams of blue-white radiation into space. A surrounding nebula glows from the energy. Dramatic scientific visualization. No text.',
    tags: ['astronomical', 'neutron-star', 'pulsar', 'radiation'],
  },
  {
    id: 'stellar-magnetar-storm',
    category: 'astronomical',
    prompt:
      'A magnetar — the most magnetic object in the universe — releasing a burst of gamma radiation. X-ray aurora ripples through surrounding gas. Violent and beautiful. Scientific visualization. No text.',
    tags: ['astronomical', 'magnetar', 'gamma-burst', 'extreme'],
  },

  // COSMIC LARGE SCALE STRUCTURE
  {
    id: 'astro-cosmic-web',
    category: 'astronomical',
    prompt:
      'The cosmic web — the large scale structure of the universe. Filaments of dark matter and galaxies connecting in a vast three-dimensional network. Looks like neurons or mycelium. Pale blue on black. No text.',
    tags: ['astronomical', 'cosmic-web', 'large-scale', 'structure'],
  },
  {
    id: 'astro-galaxy-cluster',
    category: 'astronomical',
    prompt:
      "A massive galaxy cluster. Hundreds of galaxies of all types at various distances. Gravitational lensing arcs visible — background galaxies stretched into blue arcs by the cluster's gravity. No text.",
    tags: ['astronomical', 'galaxy-cluster', 'gravitational-lensing'],
  },
  {
    id: 'astro-dark-matter-map',
    category: 'astronomical',
    prompt:
      'A visualisation of dark matter distribution in a galaxy cluster. Pale blue haze of invisible mass surrounding and connecting visible galaxies. Scientific and ethereal. No text.',
    tags: ['astronomical', 'dark-matter', 'galaxy-cluster', 'visualisation'],
  },

  // EARTH FROM SPACE
  {
    id: 'earth-city-lights-night',
    category: 'astronomical',
    prompt:
      'Earth at night from the ISS. City lights form glittering constellations across dark continents. Lightning storms flicker in clouds. The Milky Way visible above the curvature. No text.',
    tags: ['astronomical', 'earth', 'night', 'city-lights', 'ISS'],
  },
  {
    id: 'earth-aurora-from-iss',
    category: 'astronomical',
    prompt:
      'The aurora borealis seen from the International Space Station above Earth. Green and purple curtains of light ripple over the dark curved planet below. Stars beyond. No text.',
    tags: ['astronomical', 'aurora', 'earth', 'ISS', 'space'],
  },
  {
    id: 'earth-sunrise-limb',
    category: 'astronomical',
    prompt:
      "Sunrise over Earth's limb from orbit. A thin crescent of blue atmosphere glows on the horizon as the sun rises over the curved edge of the planet. Deep black space above. Breathtaking. No text.",
    tags: ['astronomical', 'earth', 'sunrise', 'atmosphere', 'orbit'],
  },

  // CANDLES AND FLAME — for candle-magic, spell, ritual content
  {
    id: 'candle-single-dark',
    category: 'candle',
    prompt:
      'A single white pillar candle burning against pure black. Extreme close-up of the flame. Warm amber glow. Wax drips slowly. Intimate and meditative. Macro photography. No text.',
    tags: ['candle', 'flame', 'dark', 'macro'],
  },
  {
    id: 'candle-black-spell',
    category: 'candle',
    prompt:
      'A black taper candle burning. Deep shadows around it. The flame burns bright gold against a very dark background. Mysterious and powerful. No text.',
    tags: ['candle', 'black', 'spell', 'dark'],
  },
  {
    id: 'candle-cluster-ritual',
    category: 'candle',
    prompt:
      'A cluster of candles of different heights burning together. Warm golden light pools between them. Dark background. Soft bokeh. Intimate ritual atmosphere. No text.',
    tags: ['candle', 'cluster', 'ritual', 'warm'],
  },
  {
    id: 'candle-purple-moon',
    category: 'candle',
    prompt:
      'A purple candle burning with a full moon visible through a dark window behind it. Moonlight and candlelight mix. Deep blue and gold tones. Mystical. No text.',
    tags: ['candle', 'purple', 'moon', 'window'],
  },
  {
    id: 'candle-flame-macro',
    category: 'candle',
    prompt:
      'Extreme macro close-up of a candle flame. The inner blue cone, the bright amber middle, the faint outer haze. Almost abstract. Beautiful and elemental. No text.',
    tags: ['candle', 'flame', 'macro', 'abstract'],
  },

  // MIST AND FOG — for mist wisps animated background
  {
    id: 'mist-forest-dawn',
    category: 'mist',
    prompt:
      'Dense morning mist rolling through a dark forest at dawn. Trees disappear into the fog. Pale light diffuses through. Eerie and beautiful. No text.',
    tags: ['mist', 'forest', 'dawn', 'fog'],
  },
  {
    id: 'mist-moonlit-field',
    category: 'mist',
    prompt:
      'Low mist drifting across a moonlit field at night. The moon illuminates the fog from above. Silvery and ethereal. Quiet and still. No text.',
    tags: ['mist', 'moonlit', 'field', 'silver'],
  },
  {
    id: 'mist-black-smoke',
    category: 'mist',
    prompt:
      'Thin wisps of white smoke drifting upward against a pure black background. Perfectly lit. Delicate and ethereal. No text.',
    tags: ['mist', 'smoke', 'black', 'wisps'],
  },
  {
    id: 'mist-cosmic-fog',
    category: 'mist',
    prompt:
      'Purple and blue cosmic mist drifting through deep space. Translucent gas clouds against black. Stars faintly visible behind. Ethereal and vast. No text.',
    tags: ['mist', 'cosmic', 'purple', 'space'],
  },

  // EMBERS AND FIRE — for ember particles / sabbat content
  {
    id: 'ember-bonfire-sparks',
    category: 'ember',
    prompt:
      'Hot orange embers and sparks rising from a bonfire against a dark sky. Long exposure so sparks trail upward like stars. Primal and beautiful. No text.',
    tags: ['ember', 'bonfire', 'sparks', 'fire'],
  },
  {
    id: 'ember-macro-coals',
    category: 'ember',
    prompt:
      'Extreme close-up of glowing red and orange embers. The surface is cracked with glowing fissures. Heat shimmer visible above. Dark background. Elemental and dramatic. No text.',
    tags: ['ember', 'macro', 'coals', 'glow'],
  },
  {
    id: 'ember-fire-hands',
    category: 'ember',
    prompt:
      'Hands held over a small fire, warm ember light illuminating them from below. Dark background. Intimate and ritual. No faces. No text.',
    tags: ['ember', 'fire', 'hands', 'ritual'],
  },
  {
    id: 'ember-wildfire-dark',
    category: 'ember',
    prompt:
      'Abstract wildfire. Bright orange and red flames against deep black. No smoke, just pure intense fire. Dramatic and powerful. No text.',
    tags: ['ember', 'wildfire', 'intense', 'abstract'],
  },

  // CHAKRAS — for meditation and manifestation content
  {
    id: 'chakra-crown-violet',
    category: 'chakra',
    prompt:
      'Crown chakra visualisation. A violet and white energy bloom above the head of a silhouetted figure. Sacred geometry patterns emerge from the centre. Cosmic and spiritual. No text.',
    tags: ['chakra', 'crown', 'violet', 'energy'],
  },
  {
    id: 'chakra-third-eye-indigo',
    category: 'chakra',
    prompt:
      'Third eye chakra. A glowing indigo and purple energy eye at the centre of the frame. Geometric patterns radiate outward. Cosmic background. All-seeing and mystical. No text.',
    tags: ['chakra', 'third-eye', 'indigo', 'eye'],
  },
  {
    id: 'chakra-heart-green',
    category: 'chakra',
    prompt:
      'Heart chakra. A radiating emerald green energy bloom in the shape of a lotus. Warm light at the centre. Soft and loving energy. Dark background. No text.',
    tags: ['chakra', 'heart', 'green', 'lotus'],
  },
  {
    id: 'chakra-solar-plexus-gold',
    category: 'chakra',
    prompt:
      'Solar plexus chakra. A blazing golden sun energy disc with radiating spokes. Warm amber and yellow. Powerful and confident energy. Dark background. No text.',
    tags: ['chakra', 'solar-plexus', 'gold', 'sun'],
  },
  {
    id: 'chakra-all-aligned',
    category: 'chakra',
    prompt:
      'All seven chakras shown as glowing orbs aligned vertically. Red at base through orange, yellow, green, blue, indigo to violet at crown. Each glows with its corresponding colour. Dark background. No text.',
    tags: ['chakra', 'all-seven', 'aligned', 'rainbow'],
  },

  // NUMEROLOGY AND ANGEL NUMBERS
  {
    id: 'numerology-111-stars',
    category: 'numerology',
    prompt:
      'The number 111 formed from tiny stars against a deep space background. Each digit is made of real star light, as if a constellation. Gold on deep black. No other text.',
    tags: ['numerology', '111', 'angel-number', 'stars'],
  },
  {
    id: 'numerology-333-cosmic',
    category: 'numerology',
    prompt:
      'The number 333 in golden light against a purple nebula background. Bold and glowing. The numbers seem to vibrate with cosmic energy. No other text.',
    tags: ['numerology', '333', 'angel-number', 'cosmic'],
  },
  {
    id: 'numerology-555-lightning',
    category: 'numerology',
    prompt:
      'The number 555 in electric blue light, crackling with energy like lightning. Dark background. Intense and electric. Signals change and transformation. No other text.',
    tags: ['numerology', '555', 'angel-number', 'electric'],
  },
  {
    id: 'numerology-777-gold',
    category: 'numerology',
    prompt:
      'The number 777 in warm gold light against a rich dark background with subtle stars. Glowing softly. Lucky and abundant energy. No other text.',
    tags: ['numerology', '777', 'angel-number', 'gold'],
  },
  {
    id: 'numerology-sacred-numbers',
    category: 'numerology',
    prompt:
      'Sacred numbers and mathematical constants — pi, phi, Fibonacci — written in glowing gold light floating against deep space. Ethereal and mathematical. No text labels.',
    tags: ['numerology', 'sacred', 'fibonacci', 'phi'],
  },

  // WHEEL OF THE YEAR — sabbat imagery
  {
    id: 'sabbat-samhain',
    category: 'sabbat',
    prompt:
      'Samhain night. Jack-o-lanterns glow orange against a full moon. Dead oak trees silhouetted. Mist at ground level. Stars visible above. Dark and atmospheric. No text.',
    tags: ['sabbat', 'samhain', 'halloween', 'autumn'],
  },
  {
    id: 'sabbat-yule-winter',
    category: 'sabbat',
    prompt:
      'Yule. A wreath of holly and evergreen with candles burning in a snowy landscape at night. Stars overhead. A single bright star (the solstice sun). Silver and gold. No text.',
    tags: ['sabbat', 'yule', 'winter-solstice', 'snow'],
  },
  {
    id: 'sabbat-imbolc-spring',
    category: 'sabbat',
    prompt:
      'Imbolc. Early snowdrops and crocuses pushing through snow. A single white candle burning. Pale winter light. The first signs of spring returning. Hopeful and gentle. No text.',
    tags: ['sabbat', 'imbolc', 'snowdrops', 'spring'],
  },
  {
    id: 'sabbat-ostara-equinox',
    category: 'sabbat',
    prompt:
      'Spring equinox / Ostara. Cherry blossoms, eggs, a rising sun on the horizon. Equal day and night. Fresh green growth. Pastel pinks and golds. Joyful renewal. No text.',
    tags: ['sabbat', 'ostara', 'spring-equinox', 'blossom'],
  },
  {
    id: 'sabbat-beltane-fire',
    category: 'sabbat',
    prompt:
      'Beltane. A great bonfire against a dark May night sky. Sparks fly upward like stars. Flowers and ribbons in the foreground. Celebration of life and fire. No text.',
    tags: ['sabbat', 'beltane', 'bonfire', 'may'],
  },
  {
    id: 'sabbat-litha-solstice',
    category: 'sabbat',
    prompt:
      'Summer solstice / Litha. The sun at its peak, golden and blazing in a midsummer sky. Sunflowers, lavender fields. The longest day. Warm, abundant, radiant. No text.',
    tags: ['sabbat', 'litha', 'summer-solstice', 'sunflowers'],
  },
  {
    id: 'sabbat-lughnasadh-harvest',
    category: 'sabbat',
    prompt:
      'Lughnasadh / Lammas. Golden wheat fields at sunset. The first harvest. Rich amber and gold. A waning sun on the horizon. Abundance and gratitude. No text.',
    tags: ['sabbat', 'lughnasadh', 'harvest', 'wheat'],
  },
  {
    id: 'sabbat-mabon-autumn',
    category: 'sabbat',
    prompt:
      'Autumn equinox / Mabon. A forest of red, orange and gold autumn leaves. Equal day and night. Fallen leaves spiral in the wind. Rich harvest tones. No text.',
    tags: ['sabbat', 'mabon', 'autumn-equinox', 'leaves'],
  },

  // RUNES AND ESOTERIC SYMBOLS
  {
    id: 'rune-stones-dark',
    category: 'rune',
    prompt:
      'A collection of dark rune stones scattered on black velvet. Each stone has a carved elder futhark symbol. Close-up. Moody and mysterious. Candlelight from one side. No text labels.',
    tags: ['rune', 'stones', 'futhark', 'dark'],
  },
  {
    id: 'rune-fehu-gold',
    category: 'rune',
    prompt:
      'A single rune carved in stone, glowing with inner gold light. Set against a dark background with faint star patterns. Ancient and powerful. No identifiable text.',
    tags: ['rune', 'carved', 'glowing', 'gold'],
  },
  {
    id: 'rune-circle-casting',
    category: 'rune',
    prompt:
      'Rune stones arranged in a circle on dark wood. Each stone catches candlelight differently. A casting cloth with subtle celestial patterns beneath. Witchy and grounded. No text.',
    tags: ['rune', 'circle', 'casting', 'witchcraft'],
  },

  // TAROT TEXTURES — rich backdrops for tarot content overlays
  {
    id: 'tarot-velvet-dark',
    category: 'tarot',
    prompt:
      'Rich dark velvet texture in deep indigo. The fabric catches light in waves. Luxurious and mysterious. Perfect as a background for text or card overlays. No text.',
    tags: ['tarot', 'velvet', 'indigo', 'texture'],
  },
  {
    id: 'tarot-celestial-fabric',
    category: 'tarot',
    prompt:
      'Dark fabric with subtle gold celestial print — stars, moons, suns. Like a tarot cloth. Deep navy with gold patterns. Elegant and mystical. No text.',
    tags: ['tarot', 'celestial-print', 'gold', 'fabric'],
  },
  {
    id: 'tarot-three-cards-cosmos',
    category: 'tarot',
    prompt:
      'Three tarot cards face down in a spread on dark velvet. Their backs show a beautiful celestial pattern. A nebula glows behind them out of focus. Stars above. No text or card names.',
    tags: ['tarot', 'three-card-spread', 'cards', 'cosmos'],
  },
  {
    id: 'tarot-major-arcana-glow',
    category: 'tarot',
    prompt:
      'A single tarot card face down on dark surface, its edges glowing with golden light from within. Stars and a faint nebula behind. Anticipation and mystery. No text.',
    tags: ['tarot', 'glowing', 'mystery', 'gold'],
  },

  // TAROT MAJOR ARCANA — individual card art
  {
    id: 'tarot-the-moon-card',
    category: 'tarot-arcana',
    prompt:
      'The Moon tarot card art. A luminous full moon between two dark towers. A wolf and a dog howl at it from below. A crayfish emerges from a pool. Deep indigo and silver. Mysterious and dreamlike. Dark atmospheric painting style. No text or card name.',
    tags: ['tarot', 'the-moon', 'major-arcana', 'dark'],
  },
  {
    id: 'tarot-the-star-card',
    category: 'tarot-arcana',
    prompt:
      'The Star tarot card art. A luminous woman kneeling at a pool beneath a vast star-filled sky. A bright central star above her, seven smaller stars around it. She pours water from two vessels. Hope and renewal. Ethereal and beautiful. No text or card name.',
    tags: ['tarot', 'the-star', 'major-arcana', 'hope'],
  },
  {
    id: 'tarot-the-sun-card',
    category: 'tarot-arcana',
    prompt:
      'The Sun tarot card art. A blazing radiant sun against a warm sky. Sunflowers below. Warm gold and amber. Pure joy and vitality. Painterly style, dramatic sun rays. No text or card name.',
    tags: ['tarot', 'the-sun', 'major-arcana', 'joy'],
  },
  {
    id: 'tarot-the-tower-card',
    category: 'tarot-arcana',
    prompt:
      'The Tower tarot card art. A tall stone tower struck by lightning. Figures falling from its crown. Flames burst from the windows. Dark stormy sky. Dramatic and powerful. Dark painterly style. No text or card name.',
    tags: ['tarot', 'the-tower', 'major-arcana', 'upheaval'],
  },
  {
    id: 'tarot-high-priestess-card',
    category: 'tarot-arcana',
    prompt:
      'The High Priestess tarot card art. A mysterious robed figure sits between two pillars — one black, one white. A crescent moon at her feet. A veil of pomegranates behind her. Deep blue and silver. Intuition and mystery. No text or card name.',
    tags: ['tarot', 'high-priestess', 'major-arcana', 'mystery'],
  },
  {
    id: 'tarot-the-world-card',
    category: 'tarot-arcana',
    prompt:
      'The World tarot card art. A dancing figure at the centre of a laurel wreath. Four corner figures: an angel, an eagle, a lion, a bull. Cosmic background. Completion and wholeness. Rich and symbolic. No text or card name.',
    tags: ['tarot', 'the-world', 'major-arcana', 'completion'],
  },
  {
    id: 'tarot-wheel-of-fortune-card',
    category: 'tarot-arcana',
    prompt:
      'The Wheel of Fortune tarot card art. A great spinning wheel of symbols against a cosmic sky. The wheel of fate turns in deep space. Gold and deep blue. Rich symbolism. No text or card name.',
    tags: ['tarot', 'wheel-of-fortune', 'major-arcana', 'fate'],
  },
  {
    id: 'tarot-the-hermit-card',
    category: 'tarot-arcana',
    prompt:
      'The Hermit tarot card art. A cloaked figure on a snowy mountain peak holds a lantern aloft in the darkness. Stars above. Isolated but illuminated. Deep shadow and a single point of golden light. No text or card name.',
    tags: ['tarot', 'the-hermit', 'major-arcana', 'solitude'],
  },
  {
    id: 'tarot-the-lovers-card',
    category: 'tarot-arcana',
    prompt:
      'The Lovers tarot card art. Two figures beneath a radiant angel in the sky above. A mountain behind them. The sun blazes warmly. Love, choice and union. Rich painterly style. No text or card name.',
    tags: ['tarot', 'the-lovers', 'major-arcana', 'love'],
  },
  {
    id: 'tarot-death-card',
    category: 'tarot-arcana',
    prompt:
      'The Death tarot card art. A skeletal figure in black armour on a pale horse. A sun rises on the horizon — transformation, not ending. Dark and dramatic but with a distant dawn. No text or card name.',
    tags: ['tarot', 'death', 'major-arcana', 'transformation'],
  },
  {
    id: 'tarot-the-empress-card',
    category: 'tarot-arcana',
    prompt:
      'The Empress tarot card art. A lush abundant figure seated on a throne of nature. Wheat, roses, a waterfall behind her. Crown of twelve stars. Rich greens, gold, warm tones. Fertility and abundance. No text or card name.',
    tags: ['tarot', 'the-empress', 'major-arcana', 'abundance'],
  },
  {
    id: 'tarot-the-magician-card',
    category: 'tarot-arcana',
    prompt:
      'The Magician tarot card art. A robed figure stands before a table with four tools: cup, wand, sword, pentacle. One hand points up, one down. A lemniscate above their head. Powerful and focused. Bright energy. No text or card name.',
    tags: ['tarot', 'the-magician', 'major-arcana', 'will'],
  },

  // AURA PHOTOGRAPHY — silhouette with glowing energy field
  {
    id: 'aura-purple-cosmic',
    category: 'aura',
    prompt:
      'A human silhouette surrounded by a glowing purple and violet aura. The energy field radiates outward in soft light. Deep black background. Stars faintly visible. Spiritual and ethereal. No faces, no text.',
    tags: ['aura', 'purple', 'spiritual', 'silhouette'],
  },
  {
    id: 'aura-gold-radiant',
    category: 'aura',
    prompt:
      'A human silhouette with a brilliant golden aura radiating outward. Warm gold and amber light. The aura pulses with divine energy. Dark background. Majestic and powerful. No faces, no text.',
    tags: ['aura', 'gold', 'radiant', 'divine'],
  },
  {
    id: 'aura-blue-electric',
    category: 'aura',
    prompt:
      'A human silhouette with an electric blue aura crackling with energy. Lightning-like tendrils extend from the body. Deep black background. Intense and vivid. No faces, no text.',
    tags: ['aura', 'blue', 'electric', 'energy'],
  },
  {
    id: 'aura-pink-love',
    category: 'aura',
    prompt:
      'A human silhouette with a soft rose pink aura glowing gently around them. Heart chakra energy radiating outward. Warm and loving. Dark background with faint stars. No faces, no text.',
    tags: ['aura', 'pink', 'love', 'heart'],
  },
  {
    id: 'aura-rainbow-full',
    category: 'aura',
    prompt:
      'A human silhouette with a full rainbow aura — all seven chakra colours radiating from the body in concentric bands. Red at the base through violet at the crown. Beautiful and balanced. Dark background. No faces, no text.',
    tags: ['aura', 'rainbow', 'chakra', 'full'],
  },
  {
    id: 'aura-green-healer',
    category: 'aura',
    prompt:
      'A human silhouette with a soft emerald green aura. Healing energy emanates outward in soft waves. Dark background. Calming and restorative. No faces, no text.',
    tags: ['aura', 'green', 'healing', 'emerald'],
  },
  {
    id: 'aura-white-angelic',
    category: 'aura',
    prompt:
      'A human silhouette surrounded by a brilliant white and silver angelic aura. Pure light radiates in all directions. Stars and cosmic light merge with the aura. Transcendent and divine. No faces, no text.',
    tags: ['aura', 'white', 'angelic', 'transcendent'],
  },

  // MOON PHASES — individual phase portraits
  {
    id: 'phase-new-moon',
    category: 'moon-phase',
    prompt:
      'New moon. Just a faint dark circle visible against a dense star field. The moon is barely there — only its dark outline against the night. Deep black sky, thousands of stars. New beginnings. No text.',
    tags: ['moon-phase', 'new-moon', 'dark', 'stars'],
  },
  {
    id: 'phase-waxing-crescent',
    category: 'moon-phase',
    prompt:
      'Waxing crescent moon. A thin sliver of silver light on the right side of the moon. Deep blue night sky. Stars around it. The moon is young and growing. Hopeful and delicate. No text.',
    tags: ['moon-phase', 'waxing-crescent', 'crescent'],
  },
  {
    id: 'phase-first-quarter',
    category: 'moon-phase',
    prompt:
      'First quarter moon. Exactly half the moon illuminated on the right, half in shadow. The terminator line crisp. Craters visible in the lit half. Deep blue-black sky. Action and momentum. No text.',
    tags: ['moon-phase', 'first-quarter', 'half-moon'],
  },
  {
    id: 'phase-waxing-gibbous',
    category: 'moon-phase',
    prompt:
      'Waxing gibbous moon. More than half illuminated, building toward fullness. Bright and luminous. Surface detail visible. Deep indigo sky. Anticipation and building energy. No text.',
    tags: ['moon-phase', 'waxing-gibbous', 'building'],
  },
  {
    id: 'phase-full-moon-solo',
    category: 'moon-phase',
    prompt:
      'Full moon at its peak. A perfect luminous circle. Bright and detailed surface features. The moon fills much of the frame against a deep black star-filled sky. Peak energy and power. No text.',
    tags: ['moon-phase', 'full-moon', 'peak', 'power'],
  },
  {
    id: 'phase-waning-gibbous',
    category: 'moon-phase',
    prompt:
      'Waning gibbous moon. Still mostly bright, now the left side begins to shadow. Beautiful detailed surface. Dark sky and stars. Release and reflection beginning. No text.',
    tags: ['moon-phase', 'waning-gibbous', 'release'],
  },
  {
    id: 'phase-last-quarter',
    category: 'moon-phase',
    prompt:
      'Last quarter moon. Left half illuminated, right in shadow. Mirror of the first quarter. Stars in the dark sky. Letting go and surrendering. No text.',
    tags: ['moon-phase', 'last-quarter', 'half-moon'],
  },
  {
    id: 'phase-waning-crescent',
    category: 'moon-phase',
    prompt:
      'Waning crescent moon. A thin silver sliver on the left side, barely visible. Dark sky blazing with stars. The moon resting before renewal. Rest and surrender. No text.',
    tags: ['moon-phase', 'waning-crescent', 'surrender'],
  },

  // ABSTRACT COLOUR WASHES — clean backgrounds for text overlay
  {
    id: 'wash-deep-indigo',
    category: 'wash',
    prompt:
      'A deep indigo gradient background. Very dark at the top, softening toward deep blue-purple at the bottom. Almost no detail — pure colour atmosphere. Subtle texture like velvet. Perfect for text overlay. No text.',
    tags: ['wash', 'indigo', 'gradient', 'background'],
  },
  {
    id: 'wash-obsidian-black',
    category: 'wash',
    prompt:
      'A near-black background with the faintest hint of deep charcoal texture. Rich and velvety. The darkest possible background with just enough life to not feel flat. Perfect for white text overlay. No text.',
    tags: ['wash', 'black', 'obsidian', 'dark'],
  },
  {
    id: 'wash-rose-gold',
    category: 'wash',
    prompt:
      'A rose gold gradient background. Soft blush pink fading to warm gold at the edges. Smooth and luxurious. Subtle shimmering metallic texture. Feminine and elegant. Perfect for text overlay. No text.',
    tags: ['wash', 'rose-gold', 'pink', 'gradient'],
  },
  {
    id: 'wash-midnight-nebula',
    category: 'wash',
    prompt:
      'A very dark midnight blue background with the faintest wisp of purple nebula in one corner and scattered tiny stars. Mostly dark — minimal, elegant, cosmic. Ideal text overlay background. No text.',
    tags: ['wash', 'midnight', 'blue', 'minimal'],
  },
  {
    id: 'wash-sage-forest',
    category: 'wash',
    prompt:
      'A dark sage green gradient background. Deep forest green fading to almost black. Earthy and grounded. Very dark, minimal texture. Suitable for text overlay. No text.',
    tags: ['wash', 'sage', 'green', 'earth'],
  },
  {
    id: 'wash-gold-shimmer',
    category: 'wash',
    prompt:
      'A dark background with a warm golden shimmer emanating from the centre. Like candlelight seen through dark glass. Luxurious and magical. Very dark at edges, warm gold at heart. No text.',
    tags: ['wash', 'gold', 'shimmer', 'luxury'],
  },
  {
    id: 'wash-deep-crimson',
    category: 'wash',
    prompt:
      'A deep crimson and burgundy gradient background. Dark blood red, rich and intense. The colour of wine and roses in darkness. Perfect dramatic background for text. No text.',
    tags: ['wash', 'crimson', 'red', 'deep'],
  },
  {
    id: 'wash-silver-mist',
    category: 'wash',
    prompt:
      'A cool silver and light grey gradient. Like early morning mist before dawn. Smooth, soft, minimal. Almost colourless but beautifully textured. Clean background for dark text. No text.',
    tags: ['wash', 'silver', 'mist', 'minimal'],
  },

  // ZODIAC CREATURE PORTRAITS — dark dramatic art style
  {
    id: 'zodiac-aries-ram-portrait',
    category: 'zodiac-creature',
    prompt:
      'A dramatic dark portrait of a ram — Aries. The ram stands against a fiery red and gold cosmic background. Its horns glow like embers. Powerful and primal. Dark fantasy art style. No text.',
    tags: ['zodiac', 'aries', 'ram', 'portrait', 'fire'],
  },
  {
    id: 'zodiac-taurus-bull-portrait',
    category: 'zodiac-creature',
    prompt:
      'A dramatic dark portrait of a bull — Taurus. Deep earthy tones, dark green and gold cosmic background. The bull exudes strength and patience. Dark fantasy art style. No text.',
    tags: ['zodiac', 'taurus', 'bull', 'portrait', 'earth'],
  },
  {
    id: 'zodiac-cancer-crab-portrait',
    category: 'zodiac-creature',
    prompt:
      'A dramatic portrait of a crab — Cancer. Silver and deep blue tones, a full moon behind it. The crab shimmers with moonlight. Emotional and mysterious. Dark fantasy art style. No text.',
    tags: ['zodiac', 'cancer', 'crab', 'portrait', 'moon'],
  },
  {
    id: 'zodiac-leo-lion-portrait',
    category: 'zodiac-creature',
    prompt:
      'A dramatic portrait of a lion — Leo. A magnificent mane catches golden sunlight against a dark cosmic background. Regal and powerful. Gold and deep amber tones. Dark fantasy art style. No text.',
    tags: ['zodiac', 'leo', 'lion', 'portrait', 'sun'],
  },
  {
    id: 'zodiac-scorpio-scorpion-portrait',
    category: 'zodiac-creature',
    prompt:
      'A dramatic portrait of a scorpion — Scorpio. Deep crimson, black and dark teal background. The scorpion radiates intensity and power. Its tail poised. Dark fantasy art style. No text.',
    tags: ['zodiac', 'scorpio', 'scorpion', 'portrait', 'intense'],
  },
  {
    id: 'zodiac-sagittarius-centaur-portrait',
    category: 'zodiac-creature',
    prompt:
      'A dramatic portrait of a centaur archer — Sagittarius. Drawing a bow aimed at a distant star. Purple and gold cosmic background. Wild and free. Dark fantasy art style. No text.',
    tags: ['zodiac', 'sagittarius', 'centaur', 'portrait', 'archer'],
  },
  {
    id: 'zodiac-capricorn-goat-portrait',
    category: 'zodiac-creature',
    prompt:
      'A dramatic portrait of a sea-goat — Capricorn. Half goat, half fish emerging from dark ocean waves under a starry sky. Dark teal and gold tones. Ancient and mythical. Dark fantasy art style. No text.',
    tags: ['zodiac', 'capricorn', 'sea-goat', 'portrait', 'mythical'],
  },
  {
    id: 'zodiac-pisces-fish-portrait',
    category: 'zodiac-creature',
    prompt:
      'A dramatic portrait of two fish swimming in opposite directions — Pisces. Deep ocean blues and silvers. The fish trail stardust and light. Ethereal and dreamy. Dark fantasy art style. No text.',
    tags: ['zodiac', 'pisces', 'fish', 'portrait', 'ocean'],
  },

  // PLANET CLOSE-UPS — additional detail shots
  {
    id: 'planet-saturn-rings-edge',
    category: 'planets',
    prompt:
      "Saturn's rings seen perfectly edge-on. A razor-thin line of ice and rock extending across the frame. Saturn's banded surface above and below. Deep space black. Elegant and precise. No text.",
    tags: ['planets', 'saturn', 'rings', 'edge-on'],
  },
  {
    id: 'planet-jupiter-grs-macro',
    category: 'planets',
    prompt:
      'The Great Red Spot on Jupiter, close up. The vast storm system swirls in amber, orange and cream. Smaller storms around it. Atmospheric bands curve away. Dramatic and beautiful. No text.',
    tags: ['planets', 'jupiter', 'great-red-spot', 'storm'],
  },
  {
    id: 'planet-mars-surface',
    category: 'planets',
    prompt:
      'Mars surface at sunset. Red and ochre terrain with dust devils in the distance. Twin moons (Phobos and Deimos) faintly visible in the pinkish sky. Curiosity rover aesthetic. No text.',
    tags: ['planets', 'mars', 'surface', 'sunset'],
  },
  {
    id: 'planet-neptune-storms',
    category: 'planets',
    prompt:
      "Neptune's deep blue surface swirling with storm systems. The Great Dark Spot, white cirrus clouds, and bands of dark blue weather. The most alien-looking planet in the solar system. No text.",
    tags: ['planets', 'neptune', 'storms', 'blue'],
  },
  {
    id: 'planet-saturn-rings-golden',
    category: 'planets',
    prompt:
      "Saturn from below its rings. Looking up through the ring plane — ice and rock particles catch the distant sunlight in gold and amber. Saturn's golden globe in the background. Stunning perspective. No text.",
    tags: ['planets', 'saturn', 'rings', 'perspective', 'gold'],
  },
  {
    id: 'planet-venus-clouds',
    category: 'planets',
    prompt:
      'Venus from orbit. Thick swirling yellow and cream cloud cover. UV photography reveals complex atmospheric patterns. An alien world hidden beneath eternal storms. No text.',
    tags: ['planets', 'venus', 'clouds', 'atmosphere'],
  },

  // MISSING ZODIAC CREATURES — completing the 12
  {
    id: 'zodiac-gemini-twins-portrait',
    category: 'zodiac-creature',
    prompt:
      'A dramatic dark portrait of the Gemini twins — two mirrored figures made of stars and light, one reaching toward light, one toward shadow. Electric yellow and deep purple cosmic background. Duality and intelligence. Dark fantasy art style. No text.',
    tags: ['zodiac', 'gemini', 'twins', 'portrait', 'duality'],
  },
  {
    id: 'zodiac-virgo-maiden-portrait',
    category: 'zodiac-creature',
    prompt:
      'A dramatic portrait of the Virgo maiden — an ethereal figure in flowing robes of stars and wheat. She holds a sheaf of golden grain. Deep forest green and gold cosmic background. Pure and precise. Dark fantasy art style. No text.',
    tags: ['zodiac', 'virgo', 'maiden', 'portrait', 'harvest'],
  },
  {
    id: 'zodiac-libra-scales-portrait',
    category: 'zodiac-creature',
    prompt:
      'A dramatic portrait of the Libra scales — enormous golden cosmic scales perfectly balanced in deep space. Rose and lavender nebula behind. Feathers and stars on the pans. Justice and harmony. Dark fantasy art style. No text.',
    tags: ['zodiac', 'libra', 'scales', 'portrait', 'balance'],
  },
  {
    id: 'zodiac-aquarius-bearer-portrait',
    category: 'zodiac-creature',
    prompt:
      'A dramatic portrait of the Aquarius water-bearer — a figure pouring an endless stream of cosmic water that becomes stars as it falls. Electric blue and silver. Visionary and electric. Dark fantasy art style. No text.',
    tags: ['zodiac', 'aquarius', 'water-bearer', 'portrait', 'electric'],
  },

  // MORE ANGEL NUMBERS
  {
    id: 'numerology-000-void',
    category: 'numerology',
    prompt:
      'The number 000 in soft white light against a deep black void. Pure and infinite. Like the universe before creation. Glowing gently, vast and silent. No other text.',
    tags: ['numerology', '000', 'angel-number', 'infinite'],
  },
  {
    id: 'numerology-222-balance',
    category: 'numerology',
    prompt:
      'The number 222 in soft silver and moonlight against a midnight blue background with a crescent moon. Balance and harmony. Gentle and reassuring energy. No other text.',
    tags: ['numerology', '222', 'angel-number', 'balance'],
  },
  {
    id: 'numerology-444-earth',
    category: 'numerology',
    prompt:
      'The number 444 in deep green and gold light, grounded energy emanating from it. Earth tones and stability. Surrounded by subtle sacred geometry patterns. No other text.',
    tags: ['numerology', '444', 'angel-number', 'stability'],
  },
  {
    id: 'numerology-888-abundance',
    category: 'numerology',
    prompt:
      'The number 888 in warm golden abundance energy. Rich and glowing against deep space. Flowing wealth energy in spirals around the numbers. Infinite loops of gold. No other text.',
    tags: ['numerology', '888', 'angel-number', 'abundance'],
  },
  {
    id: 'numerology-999-completion',
    category: 'numerology',
    prompt:
      'The number 999 in violet and white light. End of a cycle, completion and transformation. The numbers glow like a dying star before rebirth. Deep cosmic background. No other text.',
    tags: ['numerology', '999', 'angel-number', 'completion'],
  },
  {
    id: 'numerology-1111-portal',
    category: 'numerology',
    prompt:
      'The number 1111 blazing in bright white and gold. A portal opening behind the numbers. The alignment gateway. Four pillars of light. Electric and powerful. No other text.',
    tags: ['numerology', '1111', 'angel-number', 'portal', 'alignment'],
  },

  // GODDESS ARCHETYPES — spiritual figures
  {
    id: 'goddess-hecate-night',
    category: 'goddess',
    prompt:
      'Hecate, goddess of the crossroads and witchcraft. A dark cloaked female figure at a three-way crossroads at midnight. Three torches burning. The full moon above. Owls in the shadows. Dark fantasy art, no face visible. No text.',
    tags: ['goddess', 'hecate', 'witchcraft', 'dark'],
  },
  {
    id: 'goddess-isis-wings',
    category: 'goddess',
    prompt:
      'Isis, Egyptian goddess. A majestic winged female silhouette with vast golden wings spread wide. A solar disc and horns crown her head. Deep indigo sky filled with stars. Ancient and powerful. No face, no text.',
    tags: ['goddess', 'isis', 'egyptian', 'wings'],
  },
  {
    id: 'goddess-artemis-moon',
    category: 'goddess',
    prompt:
      'Artemis, goddess of the moon and hunt. A silver archer silhouette with a crescent moon crown, drawing a bow against a full moon sky. A stag visible in the forest below. Ancient Greek aesthetic. No face, no text.',
    tags: ['goddess', 'artemis', 'moon', 'hunt'],
  },
  {
    id: 'goddess-persephone-underworld',
    category: 'goddess',
    prompt:
      'Persephone, queen of the underworld. A figure half in light (spring flowers, sunlight) and half in shadow (pomegranates, dark flowers). The transition between worlds. Dark and beautiful. No face, no text.',
    tags: ['goddess', 'persephone', 'duality', 'underworld'],
  },
  {
    id: 'goddess-kali-cosmic',
    category: 'goddess',
    prompt:
      'Kali, goddess of time and destruction. A powerful many-armed silhouette against a cosmos of dying stars and supernovae. Dark purples and electric blue. Primal, fearless energy. No face, no text.',
    tags: ['goddess', 'kali', 'destruction', 'transformation'],
  },
  {
    id: 'goddess-aphrodite-venus',
    category: 'goddess',
    prompt:
      'Aphrodite / Venus rising. A luminous female silhouette emerging from glowing sea foam, roses floating around her. Venus the planet glows above. Pink, rose gold and warm gold tones. Love and beauty. No face, no text.',
    tags: ['goddess', 'aphrodite', 'venus', 'love'],
  },
  {
    id: 'goddess-triple-moon',
    category: 'goddess',
    prompt:
      'The Triple Goddess — maiden, mother, crone — represented as three female silhouettes beneath a waxing crescent, full moon, and waning crescent. Silver and indigo. Ancient and sacred. No faces, no text.',
    tags: ['goddess', 'triple-goddess', 'maiden-mother-crone', 'moon'],
  },
  {
    id: 'goddess-lilith-dark',
    category: 'goddess',
    prompt:
      'Lilith, first woman and dark goddess. A fierce winged silhouette against a blood moon sky. Owls perch on her arms. Her wings are those of a night bird. Raw feminine power. Dark fantasy art. No face, no text.',
    tags: ['goddess', 'lilith', 'dark', 'wings', 'power'],
  },

  // SPIRIT ANIMALS — viral TikTok content
  {
    id: 'spirit-wolf-moon',
    category: 'spirit-animal',
    prompt:
      'A lone wolf silhouette howling at a massive full moon against a star-filled sky. Snow-covered ground. Moonlight on its coat. Wild and primal. Deep blues and silver. No text.',
    tags: ['spirit-animal', 'wolf', 'moon', 'howling'],
  },
  {
    id: 'spirit-owl-cosmic',
    category: 'spirit-animal',
    prompt:
      'An ethereal owl in flight against a cosmic nebula background. Its wings span wide, feathers detailed and luminous. Stars in its eyes. Wisdom and mystery. Deep space behind it. No text.',
    tags: ['spirit-animal', 'owl', 'wisdom', 'cosmic'],
  },
  {
    id: 'spirit-raven-dark',
    category: 'spirit-animal',
    prompt:
      'A raven perched on a twisted branch, moonlight catching its iridescent feathers. Deep blue-black plumage. Stars visible behind bare winter trees. Mystical and intelligent. No text.',
    tags: ['spirit-animal', 'raven', 'dark', 'mystical'],
  },
  {
    id: 'spirit-deer-stars',
    category: 'spirit-animal',
    prompt:
      'A deer standing in a forest clearing at night, antlers filled with tiny stars like a constellation. The Milky Way above. Soft silver light. Gentle and magical. No text.',
    tags: ['spirit-animal', 'deer', 'stars', 'antlers'],
  },
  {
    id: 'spirit-serpent-cosmic',
    category: 'spirit-animal',
    prompt:
      'A great cosmic serpent coiling through deep space, its scales like stars and galaxies. An ouroboros — the snake eating its own tail. Eternal cycle and cosmic wisdom. Gold and deep black. No text.',
    tags: ['spirit-animal', 'serpent', 'ouroboros', 'cosmic'],
  },
  {
    id: 'spirit-butterfly-cosmos',
    category: 'spirit-animal',
    prompt:
      'A luminous butterfly with wings made of nebula gas and stars. Iridescent and cosmic. It hovers against a dark space background, wings shifting with galaxy colours. Transformation and beauty. No text.',
    tags: ['spirit-animal', 'butterfly', 'transformation', 'nebula'],
  },
  {
    id: 'spirit-phoenix-rising',
    category: 'spirit-animal',
    prompt:
      'A phoenix rising from flames against a deep black sky. Gold, orange and red fire trails upward as the bird ascends. Rebirth and transformation. Dramatic and powerful. No text.',
    tags: ['spirit-animal', 'phoenix', 'rebirth', 'fire'],
  },
  {
    id: 'spirit-fox-aurora',
    category: 'spirit-animal',
    prompt:
      'A silver fox trotting across a snowy landscape beneath a vivid aurora borealis. The Northern Lights dance overhead in green and violet. Magical and otherworldly. No text.',
    tags: ['spirit-animal', 'fox', 'aurora', 'silver'],
  },
  {
    id: 'spirit-black-cat-moon',
    category: 'spirit-animal',
    prompt:
      'A sleek black cat sitting perfectly still, silhouetted against a huge full moon. Its eyes reflect the moonlight as two golden orbs. Stars around the moon. Witchy and magical. No text.',
    tags: ['spirit-animal', 'black-cat', 'moon', 'witchy'],
  },
  {
    id: 'spirit-hummingbird-flowers',
    category: 'spirit-animal',
    prompt:
      'A tiny luminous hummingbird hovering at glowing flowers at dusk. Stars beginning to appear above. Its wings create a blur of iridescent colour. Joy and magic made visible. No text.',
    tags: ['spirit-animal', 'hummingbird', 'joy', 'luminous'],
  },

  // MORE CRYSTALS — popular ones we missed
  {
    id: 'crystal-citrine-sunstone',
    category: 'crystals',
    prompt:
      'Citrine crystals glowing warm yellow and amber. Bright and sunny energy. Facets catch the light in golden flashes. Dark background. Abundance and joy. Macro photography. No text.',
    tags: ['crystals', 'citrine', 'yellow', 'abundance'],
  },
  {
    id: 'crystal-moonstone-glow',
    category: 'crystals',
    prompt:
      'Moonstone crystals with their characteristic adularescence — a ghostly blue-white light shifting and moving within the stone. Set against dark velvet. Mysterious and lunar. Macro photography. No text.',
    tags: ['crystals', 'moonstone', 'adularescence', 'lunar'],
  },
  {
    id: 'crystal-black-tourmaline',
    category: 'crystals',
    prompt:
      'Black tourmaline crystal columns, deep black with vertical striations catching faint light. Set against a dark background. Protective and grounding energy. Macro photography. No text.',
    tags: ['crystals', 'tourmaline', 'black', 'protection'],
  },
  {
    id: 'crystal-lapis-lazuli',
    category: 'crystals',
    prompt:
      'Lapis lazuli — rich royal blue with gold pyrite flecks glittering like stars in a night sky. Dark background. Ancient and regal. The stone of pharaohs and seers. Macro photography. No text.',
    tags: ['crystals', 'lapis', 'blue', 'gold', 'ancient'],
  },
  {
    id: 'crystal-tigers-eye',
    category: 'crystals',
    prompt:
      "Tiger's eye crystals. Rich brown and gold chatoyancy — the optical effect that makes the stone appear to have a moving band of light like an eye. Dark background. Macro photography. No text.",
    tags: ['crystals', 'tigers-eye', 'chatoyancy', 'gold'],
  },
  {
    id: 'crystal-pyrite-gold',
    category: 'crystals',
    prompt:
      "Pyrite (fool's gold) — cubic crystals glittering metallic gold. Faceted and brilliant against a dark background. Manifestation and abundance energy. Looks like solid gold. Macro photography. No text.",
    tags: ['crystals', 'pyrite', 'gold', 'abundance'],
  },
  {
    id: 'crystal-malachite-green',
    category: 'crystals',
    prompt:
      'Malachite with its distinctive deep green banding patterns. Swirling dark and light green concentric rings. A stone of transformation. Dark background. Macro photography. No text.',
    tags: ['crystals', 'malachite', 'green', 'transformation'],
  },
  {
    id: 'crystal-selenite-wand',
    category: 'crystals',
    prompt:
      'A selenite wand, long and translucent white. Backlit so light passes through it, creating an angelic glow. Delicate fibrous texture. Dark background. Cleansing and angelic energy. No text.',
    tags: ['crystals', 'selenite', 'wand', 'white', 'angelic'],
  },

  // SPIRITUAL SYMBOLS — none yet
  {
    id: 'symbol-triple-moon',
    category: 'symbol',
    prompt:
      'The triple moon symbol — waxing crescent, full moon, waning crescent — glowing silver against a deep indigo sky. Stars behind. Ancient symbol of the goddess and the three phases of womanhood. No text.',
    tags: ['symbol', 'triple-moon', 'goddess', 'silver'],
  },
  {
    id: 'symbol-pentacle-star',
    category: 'symbol',
    prompt:
      'A five-pointed star (pentacle) drawn in golden light against deep black space with a circle of stars around it. Sacred geometry and elemental balance. Ancient and powerful. No text.',
    tags: ['symbol', 'pentacle', 'five-pointed', 'gold'],
  },
  {
    id: 'symbol-eye-of-horus',
    category: 'symbol',
    prompt:
      'The Eye of Horus in gold and blue against a deep lapis background. Ornate Egyptian design. Stars and hieroglyphic patterns faintly visible around it. Ancient protection and wisdom. No text.',
    tags: ['symbol', 'eye-of-horus', 'egyptian', 'gold'],
  },
  {
    id: 'symbol-ankh-cosmic',
    category: 'symbol',
    prompt:
      'An ankh — the Egyptian symbol of life — glowing gold against a deep cosmic background. Stars visible through it. The loop at the top shines brighter than the cross below. Eternal life. No text.',
    tags: ['symbol', 'ankh', 'life', 'egyptian', 'gold'],
  },
  {
    id: 'symbol-om-sacred',
    category: 'symbol',
    prompt:
      'The Om (Aum) symbol in warm gold light against a deep purple and indigo background. Sacred vibration made visible as soft ripples of light emanate from the symbol. Sanskrit and cosmic. No text.',
    tags: ['symbol', 'om', 'aum', 'sacred', 'vibration'],
  },
  {
    id: 'symbol-hamsa-hand',
    category: 'symbol',
    prompt:
      'A Hamsa hand — the hand of Fatima — in ornate gold against a deep teal background. Intricate patterns within the hand. An eye at the centre. Protective and beautiful. No text.',
    tags: ['symbol', 'hamsa', 'protection', 'eye', 'gold'],
  },
  {
    id: 'symbol-vesica-piscis',
    category: 'symbol',
    prompt:
      'The Vesica Piscis — two overlapping circles creating the ancient sacred geometry symbol. Glowing gold on deep indigo. The intersection glows brightest. Creation and union of opposites. No text.',
    tags: ['symbol', 'vesica-piscis', 'sacred-geometry', 'gold'],
  },

  // MORE SACRED GEOMETRY
  {
    id: 'sacred-torus-energy',
    category: 'sacred',
    prompt:
      'A torus — the fundamental shape of energy fields — visualised as glowing gold light looping in a continuous donut shape against deep space. Energy flows through it endlessly. No text.',
    tags: ['sacred', 'torus', 'energy', 'geometry'],
  },
  {
    id: 'sacred-golden-spiral',
    category: 'sacred',
    prompt:
      "The golden ratio spiral made of stars and nebula gas. Fibonacci proportions revealed in cosmic structure. Gold and deep blue. The universe's most fundamental pattern. No text.",
    tags: ['sacred', 'golden-ratio', 'fibonacci', 'spiral'],
  },
  {
    id: 'sacred-64-tetrahedron',
    category: 'sacred',
    prompt:
      'A 64 tetrahedron grid — 64 interlocking tetrahedra forming a perfect sphere of sacred geometry. Glowing white and gold against black space. The blueprint of the vacuum of space. No text.',
    tags: ['sacred', '64-tetrahedron', 'geometry', 'grid'],
  },
  {
    id: 'sacred-tree-of-life',
    category: 'sacred',
    prompt:
      'The Kabbalistic Tree of Life. Ten glowing spheres (sephiroth) connected by 22 paths in gold on deep indigo. Stars behind. Ancient wisdom made visual. The structure of existence. No text.',
    tags: ['sacred', 'tree-of-life', 'kabbalah', 'sephiroth'],
  },

  // REMAINING TAROT MAJOR ARCANA — completing the 22
  {
    id: 'tarot-the-fool-card',
    category: 'tarot-arcana',
    prompt:
      'The Fool tarot card art. A carefree figure stepping off a cliff edge toward a vast open sky, small dog at their heels, bindle over shoulder. A sun blazes above. Infinite potential and new beginnings. Painterly style. No text or card name.',
    tags: ['tarot', 'the-fool', 'major-arcana', 'beginning'],
  },
  {
    id: 'tarot-the-emperor-card',
    category: 'tarot-arcana',
    prompt:
      'The Emperor tarot card art. A commanding armoured figure on a stone throne. Ram heads on the throne arms. Mountains behind. A sceptre and orb in hand. Authority and structure. Deep red and gold. No text or card name.',
    tags: ['tarot', 'the-emperor', 'major-arcana', 'authority'],
  },
  {
    id: 'tarot-the-hierophant-card',
    category: 'tarot-arcana',
    prompt:
      'The Hierophant tarot card art. A robed religious figure on a throne between two pillars, hand raised in blessing. Two followers kneel before him. Gold and deep burgundy. Tradition and sacred knowledge. No text or card name.',
    tags: ['tarot', 'the-hierophant', 'major-arcana', 'tradition'],
  },
  {
    id: 'tarot-the-chariot-card',
    category: 'tarot-arcana',
    prompt:
      'The Chariot tarot card art. A warrior in armour rides a chariot pulled by two sphinxes — one black, one white. Stars on the canopy above. A walled city behind. Triumph and will. Dramatic and powerful. No text or card name.',
    tags: ['tarot', 'the-chariot', 'major-arcana', 'triumph'],
  },
  {
    id: 'tarot-strength-card',
    category: 'tarot-arcana',
    prompt:
      'The Strength tarot card art. A woman gently tames a lion, closing its jaws with bare hands. A lemniscate (infinity symbol) floats above her head. Soft floral landscape. Inner strength and compassion. No text or card name.',
    tags: ['tarot', 'strength', 'major-arcana', 'courage'],
  },
  {
    id: 'tarot-justice-card',
    category: 'tarot-arcana',
    prompt:
      'The Justice tarot card art. A stern figure seated on a throne, holding balanced scales in one hand, a double-edged sword raised in the other. Red robes, grey pillars. Truth and fairness. No text or card name.',
    tags: ['tarot', 'justice', 'major-arcana', 'truth'],
  },
  {
    id: 'tarot-hanged-man-card',
    category: 'tarot-arcana',
    prompt:
      'The Hanged Man tarot card art. A serene figure hanging upside down from a living T-shaped tree by one foot. The other leg crosses. A halo of light around his head. Surrender and new perspective. No text or card name.',
    tags: ['tarot', 'hanged-man', 'major-arcana', 'surrender'],
  },
  {
    id: 'tarot-temperance-card',
    category: 'tarot-arcana',
    prompt:
      'The Temperance tarot card art. An angelic figure pours water between two golden cups. One foot in a river, one on land. A radiant sun rises over mountains in the distance. Balance and alchemy. No text or card name.',
    tags: ['tarot', 'temperance', 'major-arcana', 'balance'],
  },
  {
    id: 'tarot-the-devil-card',
    category: 'tarot-arcana',
    prompt:
      'The Devil tarot card art. A horned goat-like figure on a black cube, two chained figures below. Torch burning downward. Dark and intense but not evil — illusion and attachment. Deep black and red. No text or card name.',
    tags: ['tarot', 'the-devil', 'major-arcana', 'shadow'],
  },
  {
    id: 'tarot-judgement-card',
    category: 'tarot-arcana',
    prompt:
      'The Judgement tarot card art. An angel blows a trumpet from the clouds, figures rising from coffins below with arms raised. Dawn light breaking. Awakening, rebirth and calling. Dramatic sky. No text or card name.',
    tags: ['tarot', 'judgement', 'major-arcana', 'awakening'],
  },

  // ASTROLOGY PLANET GLYPHS — cosmic symbol art
  {
    id: 'glyph-sun-symbol',
    category: 'glyph',
    prompt:
      'The astrological Sun symbol ☉ — a circle with a dot at its centre — rendered in blazing gold light against deep black space. Solar corona energy radiates outward from it. Sacred and powerful. No other text.',
    tags: ['glyph', 'sun', 'astrology', 'gold'],
  },
  {
    id: 'glyph-moon-symbol',
    category: 'glyph',
    prompt:
      'The astrological Moon symbol ☽ — a crescent — rendered in silver light against deep indigo. Stars cluster around it. Soft and luminous. Sacred lunar energy. No other text.',
    tags: ['glyph', 'moon', 'astrology', 'silver'],
  },
  {
    id: 'glyph-mercury-symbol',
    category: 'glyph',
    prompt:
      'The Mercury astrological glyph ☿ glowing in quicksilver light against a dark background. Electric and communicative energy. Subtle geometric patterns around it. No other text.',
    tags: ['glyph', 'mercury', 'astrology', 'silver'],
  },
  {
    id: 'glyph-venus-symbol',
    category: 'glyph',
    prompt:
      'The Venus astrological glyph ♀ glowing in rose gold and soft pink. A circle above a cross, radiating love and beauty. Flowers and soft light around it. No other text.',
    tags: ['glyph', 'venus', 'astrology', 'rose-gold'],
  },
  {
    id: 'glyph-mars-symbol',
    category: 'glyph',
    prompt:
      'The Mars astrological glyph ♂ blazing in deep red and orange energy. Bold and aggressive. Flames and sparks radiate from it. Power and drive. No other text.',
    tags: ['glyph', 'mars', 'astrology', 'red'],
  },
  {
    id: 'glyph-jupiter-symbol',
    category: 'glyph',
    prompt:
      'The Jupiter astrological glyph ♃ in royal blue and gold. Large and expansive energy. Cosmic abundance radiating from it. Ancient and wise. No other text.',
    tags: ['glyph', 'jupiter', 'astrology', 'blue-gold'],
  },
  {
    id: 'glyph-saturn-symbol',
    category: 'glyph',
    prompt:
      'The Saturn astrological glyph ♄ in deep indigo and dark gold. Ancient, disciplined energy. Rings echo the planet behind it. Time and structure. No other text.',
    tags: ['glyph', 'saturn', 'astrology', 'dark'],
  },
  {
    id: 'glyph-uranus-symbol',
    category: 'glyph',
    prompt:
      'The Uranus astrological glyph in electric blue and cyan. Lightning energy crackles around it. Revolutionary and unexpected. Vivid and striking. No other text.',
    tags: ['glyph', 'uranus', 'astrology', 'electric'],
  },
  {
    id: 'glyph-neptune-symbol',
    category: 'glyph',
    prompt:
      'The Neptune astrological glyph ♆ — a trident — in deep sea blue and aquamarine. Ocean waves and cosmic mist surround it. Dreamy and spiritual. No other text.',
    tags: ['glyph', 'neptune', 'astrology', 'ocean-blue'],
  },
  {
    id: 'glyph-pluto-symbol',
    category: 'glyph',
    prompt:
      'The Pluto astrological glyph ♇ in deep black and dark crimson. Transformation energy. The underworld meets the cosmos. Intense and primal. No other text.',
    tags: ['glyph', 'pluto', 'astrology', 'dark'],
  },

  // MORE SPIRIT ANIMALS
  {
    id: 'spirit-bear-cave',
    category: 'spirit-animal',
    prompt:
      'A great bear silhouette standing on its hind legs against a full moon. Forested mountains behind. Power and protection. Deep winter night. Stars blazing above. Primal and ancient. No text.',
    tags: ['spirit-animal', 'bear', 'moon', 'power'],
  },
  {
    id: 'spirit-dragon-cosmic',
    category: 'spirit-animal',
    prompt:
      'A vast cosmic dragon coiling through deep space, its scales like galaxies and nebulae. Wings spread across star fields. Ancient and powerful beyond measure. Gold and deep purple. No text.',
    tags: ['spirit-animal', 'dragon', 'cosmic', 'ancient'],
  },
  {
    id: 'spirit-eagle-sun',
    category: 'spirit-animal',
    prompt:
      'A golden eagle soaring against a blazing sun. Wings spread wide, feathers catching fire in the light. Below are mountains and vast sky. Strength, clarity and freedom. No text.',
    tags: ['spirit-animal', 'eagle', 'sun', 'freedom'],
  },
  {
    id: 'spirit-whale-cosmos',
    category: 'spirit-animal',
    prompt:
      'A humpback whale swimming through a cosmic ocean — water and space merge, stars visible beneath the surface. The whale is enormous and graceful. Deep blues and blacks. Wisdom and depth. No text.',
    tags: ['spirit-animal', 'whale', 'cosmic-ocean', 'wisdom'],
  },
  {
    id: 'spirit-jaguar-dark',
    category: 'spirit-animal',
    prompt:
      'A black jaguar stalking through a moonlit jungle. Its golden eyes glow in the darkness. Stars visible through the canopy above. Stealth and power. Dark and beautiful. No text.',
    tags: ['spirit-animal', 'jaguar', 'dark', 'moon'],
  },
  {
    id: 'spirit-tiger-fire',
    category: 'spirit-animal',
    prompt:
      'A white tiger walking through darkness, its stripes glowing faintly with blue energy. Stars and a nebula behind it. Mystical and powerful. No text.',
    tags: ['spirit-animal', 'tiger', 'white', 'cosmic'],
  },
  {
    id: 'spirit-peacock-cosmos',
    category: 'spirit-animal',
    prompt:
      'A peacock with its magnificent tail fanned open, each eye in the tail feathers containing a tiny galaxy. Deep blues and gold. Cosmic beauty and self-expression. No text.',
    tags: ['spirit-animal', 'peacock', 'cosmos', 'beauty'],
  },
  {
    id: 'spirit-horse-nebula',
    category: 'spirit-animal',
    prompt:
      'A white horse running free through cosmic clouds and nebula. Its mane flows like stardust. Stars trail behind hooves. Freedom and power made cosmic. No text.',
    tags: ['spirit-animal', 'horse', 'freedom', 'stardust'],
  },

  // MORE GODDESSES
  {
    id: 'goddess-freya-ravens',
    category: 'goddess',
    prompt:
      'Freya, Norse goddess of love and war. A powerful silhouette with two ravens perched on her shoulders. A full moon behind her. Her cloak of feathers spreads wide. Norse forests at night. No face, no text.',
    tags: ['goddess', 'freya', 'norse', 'ravens'],
  },
  {
    id: 'goddess-brigid-flame',
    category: 'goddess',
    prompt:
      'Brigid, Celtic goddess of fire and healing. A silhouette with a flame burning in her outstretched hand. Snowdrops bloom around her feet. The promise of spring after winter. Dawn light. No face, no text.',
    tags: ['goddess', 'brigid', 'celtic', 'fire', 'spring'],
  },
  {
    id: 'goddess-selene-moon',
    category: 'goddess',
    prompt:
      'Selene, Greek goddess of the moon. A luminous silhouette in a chariot of silver, driving two pale horses across the night sky. The full moon behind her. Stars all around. No face, no text.',
    tags: ['goddess', 'selene', 'moon', 'greek'],
  },
  {
    id: 'goddess-nyx-night',
    category: 'goddess',
    prompt:
      'Nyx, goddess of the night. A vast dark silhouette whose robes are made of deep space and stars. She spreads her arms wide and night falls across the cosmos. Primal and ancient darkness. No face, no text.',
    tags: ['goddess', 'nyx', 'night', 'cosmos', 'dark'],
  },
  {
    id: 'goddess-circe-magic',
    category: 'goddess',
    prompt:
      'Circe, goddess sorceress. A silhouette raising a wand of glowing light, surrounded by transformed creatures. An island at night, stars above the ocean. Magic and transformation. No face, no text.',
    tags: ['goddess', 'circe', 'magic', 'sorceress'],
  },
  {
    id: 'goddess-morgan-le-fay',
    category: 'goddess',
    prompt:
      'Morgan le Fay, enchantress of Avalon. A dark silhouette on a misty isle, apple trees heavy with fruit behind her. The moon reflects on still water. Mystery and ancient power. No face, no text.',
    tags: ['goddess', 'morgan-le-fay', 'avalon', 'celtic'],
  },

  // ANCIENT SACRED SITES
  {
    id: 'site-stonehenge-stars',
    category: 'sacred-site',
    prompt:
      'Stonehenge at night under the Milky Way. The ancient standing stones silhouetted against a blazing star field. The galaxy arches overhead. Timeless and mysterious. No text.',
    tags: ['sacred-site', 'stonehenge', 'milky-way', 'ancient'],
  },
  {
    id: 'site-pyramids-cosmos',
    category: 'sacred-site',
    prompt:
      'The Egyptian pyramids of Giza at night under a magnificent starry sky. The Milky Way visible above. Stars reflect in desert sands. Timeless, aligned with the cosmos. No text.',
    tags: ['sacred-site', 'pyramids', 'egypt', 'stars'],
  },
  {
    id: 'site-mayan-temple-dawn',
    category: 'sacred-site',
    prompt:
      'A Mayan pyramid temple at dawn. The sun rises directly over the apex as the solstice alignment occurs. Jungle surrounds it. Pink and gold sky. Ancient astronomical precision. No text.',
    tags: ['sacred-site', 'mayan', 'temple', 'solstice'],
  },
  {
    id: 'site-greek-temple-moon',
    category: 'sacred-site',
    prompt:
      'Ancient Greek marble temple columns under a full moon. White marble glows silver in the moonlight. Stars above. Timeless and sacred. Mediterranean night. No text.',
    tags: ['sacred-site', 'greek', 'temple', 'moon'],
  },
  {
    id: 'site-nazca-lines-above',
    category: 'sacred-site',
    prompt:
      'The Nazca lines seen from above at night. The giant geoglyphs glow faintly as if lit from within against the dark Peruvian desert. Stars overhead. Ancient mystery. No text.',
    tags: ['sacred-site', 'nazca', 'lines', 'mystery'],
  },
  {
    id: 'site-angkor-wat-sunrise',
    category: 'sacred-site',
    prompt:
      'Angkor Wat temple at sunrise. The massive temple complex reflected perfectly in the still moat. Pink and gold sky. Silhouetted towers. Ancient Khmer architecture at its most magical. No text.',
    tags: ['sacred-site', 'angkor-wat', 'sunrise', 'reflection'],
  },

  // COSMIC EVENTS — extreme phenomena
  {
    id: 'event-supernova-explosion',
    category: 'cosmic-event',
    prompt:
      'A supernova explosion. A massive star detonates in a blinding flash of light, expanding shockwave of plasma and gas in gold, white and blue. The most powerful explosion in the universe. No text.',
    tags: ['cosmic-event', 'supernova', 'explosion', 'stellar'],
  },
  {
    id: 'event-quasar-beam',
    category: 'cosmic-event',
    prompt:
      'A quasar — the most luminous object in the universe. A blazing point of light with twin jets of energy blasting out in opposite directions for millions of light years. Intense and cosmic. No text.',
    tags: ['cosmic-event', 'quasar', 'jets', 'luminous'],
  },
  {
    id: 'event-neutron-star-merger',
    category: 'cosmic-event',
    prompt:
      'Two neutron stars spiralling toward each other and merging in a kilonova explosion. Gold and platinum-coloured light erupts from the collision. Gravitational waves visualised as ripples. No text.',
    tags: ['cosmic-event', 'neutron-star', 'kilonova', 'merger'],
  },
  {
    id: 'event-gamma-ray-burst',
    category: 'cosmic-event',
    prompt:
      'A gamma-ray burst — the most energetic explosion in the universe. A blinding beam of energy cuts across the cosmos. The source glows impossibly bright. Dramatic scientific visualisation. No text.',
    tags: ['cosmic-event', 'gamma-ray', 'burst', 'extreme'],
  },
  {
    id: 'event-solar-flare-extreme',
    category: 'cosmic-event',
    prompt:
      'An X-class solar flare erupting from the sun. A titanic arch of plasma millions of kilometres high. The corona boils. CME shockwave expands outward. Dramatic and beautiful. No text.',
    tags: ['cosmic-event', 'solar-flare', 'x-class', 'plasma'],
  },

  // ELEMENTS DEEP DIVE
  {
    id: 'element-underwater-bioluminescent',
    category: 'elements',
    prompt:
      'Deep ocean bioluminescence at night. Glowing blue and cyan sea creatures, jellyfish and plankton light the dark water. Looking upward, stars are visible through the surface. Magical and otherworldly. No text.',
    tags: ['elements', 'water', 'bioluminescence', 'ocean'],
  },
  {
    id: 'element-volcanic-cosmos',
    category: 'elements',
    prompt:
      "A volcanic eruption at night. Lava flows red and orange against a black sky filled with stars. Lava bombs arc through the air like shooting stars. Earth's primal fire under the cosmos. No text.",
    tags: ['elements', 'fire', 'volcanic', 'lava'],
  },
  {
    id: 'element-lightning-storm',
    category: 'elements',
    prompt:
      'A dramatic lightning storm at night. Multiple lightning bolts fork across a dark sky filled with stars above the storm. The bolts illuminate purple-black clouds. Raw elemental power. No text.',
    tags: ['elements', 'air', 'lightning', 'storm'],
  },
  {
    id: 'element-desert-sandstorm',
    category: 'elements',
    prompt:
      'A desert sandstorm at dusk. A massive wall of ochre and red sand rolls across the landscape. Stars visible above the storm where the sky is still clear. Ancient and elemental. No text.',
    tags: ['elements', 'earth', 'sandstorm', 'desert'],
  },

  // MASTER NUMBERS AND SEQUENCES
  {
    id: 'numerology-11-master',
    category: 'numerology',
    prompt:
      'The master number 11 in brilliant white light against a starfield. Two pillars of light. Intuition and illumination. Gateway energy. No other text.',
    tags: ['numerology', '11', 'master-number', 'intuition'],
  },
  {
    id: 'numerology-22-master',
    category: 'numerology',
    prompt:
      'The master number 22 in deep gold light. The master builder. Four equal pillars of energy. Foundation and manifestation on the largest scale. No other text.',
    tags: ['numerology', '22', 'master-number', 'builder'],
  },
  {
    id: 'numerology-33-master',
    category: 'numerology',
    prompt:
      'The master number 33 in radiant rose and gold light. The master teacher. Love and compassion radiating outward. The highest master number. No other text.',
    tags: ['numerology', '33', 'master-number', 'compassion'],
  },
  {
    id: 'numerology-123-sequence',
    category: 'numerology',
    prompt:
      'The number sequence 123 in ascending steps of light — each number brighter than the last. Staircase of stars. Progress and growth upward. No other text.',
    tags: ['numerology', '123', 'sequence', 'progress'],
  },
  {
    id: 'numerology-456-sequence',
    category: 'numerology',
    prompt:
      'The number sequence 456 in warm amber and green light. Stability building toward change. Earth tones with cosmic background. No other text.',
    tags: ['numerology', '456', 'sequence', 'stability'],
  },
  {
    id: 'numerology-789-sequence',
    category: 'numerology',
    prompt:
      'The number sequence 789 in violet and gold light. Completion, wisdom and universal love. The final steps before return to zero. No other text.',
    tags: ['numerology', '789', 'sequence', 'completion'],
  },

  // ZODIAC SIGN GLYPHS — each sign as glowing cosmic art
  {
    id: 'sign-aries-glyph',
    category: 'sign-glyph',
    prompt:
      'The Aries zodiac glyph ♈ rendered in blazing crimson and gold energy against deep black space. Ram horns forming the symbol. Fire energy radiates outward. Bold and powerful. No other text.',
    tags: ['sign-glyph', 'aries', 'fire', 'red'],
  },
  {
    id: 'sign-taurus-glyph',
    category: 'sign-glyph',
    prompt:
      'The Taurus zodiac glyph ♉ in deep green and gold against a dark earthy cosmic background. The bull circle and horns glow steadily. Grounded and sensual energy. No other text.',
    tags: ['sign-glyph', 'taurus', 'earth', 'green'],
  },
  {
    id: 'sign-gemini-glyph',
    category: 'sign-glyph',
    prompt:
      'The Gemini zodiac glyph ♊ in electric yellow and silver. Two parallel lines connected — duality made visible. Quick intellectual energy crackles around it. Deep space behind. No other text.',
    tags: ['sign-glyph', 'gemini', 'air', 'yellow'],
  },
  {
    id: 'sign-cancer-glyph',
    category: 'sign-glyph',
    prompt:
      'The Cancer zodiac glyph ♋ in soft silver and moonlit blue. The two interlocking spirals glow with lunar energy. A full moon shimmers behind it. Emotional and intuitive. No other text.',
    tags: ['sign-glyph', 'cancer', 'water', 'moon'],
  },
  {
    id: 'sign-leo-glyph',
    category: 'sign-glyph',
    prompt:
      "The Leo zodiac glyph ♌ blazing in gold and amber. The lion's tail curling symbol radiates solar warmth. A sun glows behind it. Regal and radiant. No other text.",
    tags: ['sign-glyph', 'leo', 'fire', 'gold'],
  },
  {
    id: 'sign-virgo-glyph',
    category: 'sign-glyph',
    prompt:
      'The Virgo zodiac glyph ♍ in soft sage green and silver. The precise angular symbol glows with quiet intelligence. Wheat and stars in the background. Refined and pure. No other text.',
    tags: ['sign-glyph', 'virgo', 'earth', 'green'],
  },
  {
    id: 'sign-libra-glyph',
    category: 'sign-glyph',
    prompt:
      'The Libra zodiac glyph ♎ in rose gold and lavender. The scales symbol balanced perfectly. Symmetrical light emanates from both sides equally. Justice and harmony. No other text.',
    tags: ['sign-glyph', 'libra', 'air', 'rose-gold'],
  },
  {
    id: 'sign-scorpio-glyph',
    category: 'sign-glyph',
    prompt:
      'The Scorpio zodiac glyph ♏ in deep crimson and black. The M with the scorpion tail arrow pulses with intense energy. Dark and magnetic power. No other text.',
    tags: ['sign-glyph', 'scorpio', 'water', 'dark'],
  },
  {
    id: 'sign-sagittarius-glyph',
    category: 'sign-glyph',
    prompt:
      'The Sagittarius zodiac glyph ♐ in deep purple and gold. An arrow pointing upward and to the right — always aiming higher. Stars scatter in its wake. Freedom and adventure. No other text.',
    tags: ['sign-glyph', 'sagittarius', 'fire', 'purple'],
  },
  {
    id: 'sign-capricorn-glyph',
    category: 'sign-glyph',
    prompt:
      'The Capricorn zodiac glyph ♑ in dark indigo and aged gold. The sea-goat symbol glows with ancient ambition. Mountains and ocean in the dark background. Disciplined power. No other text.',
    tags: ['sign-glyph', 'capricorn', 'earth', 'indigo'],
  },
  {
    id: 'sign-aquarius-glyph',
    category: 'sign-glyph',
    prompt:
      'The Aquarius zodiac glyph ♒ in electric blue and cyan. Two wavy lines — water waves or electric current — crackle with revolutionary energy. Stars and lightning behind. No other text.',
    tags: ['sign-glyph', 'aquarius', 'air', 'electric'],
  },
  {
    id: 'sign-pisces-glyph',
    category: 'sign-glyph',
    prompt:
      'The Pisces zodiac glyph ♓ in deep ocean blue and silver. Two fish connected by a cord — flowing in opposite directions. The symbol pulses like breathing tides. No other text.',
    tags: ['sign-glyph', 'pisces', 'water', 'ocean'],
  },

  // MEDITATION AND SOUND HEALING
  {
    id: 'meditation-lotus-silhouette',
    category: 'meditation',
    prompt:
      'A human silhouette seated in lotus meditation pose. A radiant cosmic background behind them. All seven chakra colours glow along the spine. Stars and nebula surround the figure. Peace and transcendence. No face, no text.',
    tags: ['meditation', 'lotus', 'silhouette', 'chakra'],
  },
  {
    id: 'meditation-singing-bowl',
    category: 'meditation',
    prompt:
      'A Tibetan singing bowl struck with a mallet. Sound waves visible as glowing rings expanding outward from the bowl. Deep gold and amber. Dark background. The vibration is visible. Sound healing. No text.',
    tags: ['meditation', 'singing-bowl', 'sound', 'healing'],
  },
  {
    id: 'meditation-kundalini-rising',
    category: 'meditation',
    prompt:
      'Kundalini energy rising. A serpent of pure energy coiling upward through seven chakra points along a human spine silhouette. Each chakra blazes in its colour. Cosmic background. No face, no text.',
    tags: ['meditation', 'kundalini', 'serpent', 'chakra'],
  },
  {
    id: 'meditation-third-eye-open',
    category: 'meditation',
    prompt:
      'A glowing eye opening on a forehead. Indigo and violet light floods outward as the third eye awakens. Sacred geometry patterns radiate. Stars and cosmos visible within the eye. No face, no text.',
    tags: ['meditation', 'third-eye', 'awakening', 'indigo'],
  },
  {
    id: 'meditation-sound-bath',
    category: 'meditation',
    prompt:
      'Multiple crystal and Tibetan singing bowls arranged in a circle, all vibrating simultaneously. Sound waves from each bowl create interference patterns of light. Deep and resonant. Dark background. No text.',
    tags: ['meditation', 'sound-bath', 'bowls', 'vibration'],
  },
  {
    id: 'meditation-breathwork',
    category: 'meditation',
    prompt:
      'An abstract visualisation of breathwork. Expanding and contracting circles of light, like lungs breathing in cosmic energy. Blue and silver light. Calming and rhythmic. Dark background. No text.',
    tags: ['meditation', 'breathwork', 'breath', 'expanding'],
  },

  // WITCHCRAFT TOOLS
  {
    id: 'witch-cauldron-smoke',
    category: 'witchcraft',
    prompt:
      'A cast iron cauldron with green and purple smoke curling from within. Moonlight illuminates it from above. Dark background with stars. Mysterious herbs hanging nearby. Witch aesthetic. No text.',
    tags: ['witchcraft', 'cauldron', 'smoke', 'dark'],
  },
  {
    id: 'witch-spell-jar',
    category: 'witchcraft',
    prompt:
      'A glass spell jar filled with herbs, crystals and a rolled intention scroll. Sealed with wax, surrounded by candles on dark cloth. Warm candlelight. Magical and intentional. No text.',
    tags: ['witchcraft', 'spell-jar', 'herbs', 'crystals'],
  },
  {
    id: 'witch-herb-bundles',
    category: 'witchcraft',
    prompt:
      'Dried sage, lavender and rosemary bundles tied with twine on a dark wooden surface. Crystals and moon symbols nearby. Soft natural light. Earthy and magical witchcraft aesthetic. No text.',
    tags: ['witchcraft', 'herbs', 'sage', 'lavender'],
  },
  {
    id: 'witch-book-of-shadows',
    category: 'witchcraft',
    prompt:
      'An old leather-bound grimoire / Book of Shadows open to pages of handwritten spells and sigils. Moonlight illuminates the pages. A quill, candle and crystals nearby. Dark and magical. No text.',
    tags: ['witchcraft', 'grimoire', 'book', 'spells'],
  },
  {
    id: 'witch-pendulum-divination',
    category: 'witchcraft',
    prompt:
      'A crystal pendulum suspended above a divination board. It glows at the tip. Moonlight and candlelight. The pendulum swings with intention. Mystical and focused. No text.',
    tags: ['witchcraft', 'pendulum', 'divination', 'crystal'],
  },
  {
    id: 'witch-altar-flatlay',
    category: 'witchcraft',
    prompt:
      'A witchcraft altar from above. Triple moon symbol, black candles, crystals, dried flowers, rune stones, a small cauldron — all arranged on dark cloth. Perfect flat lay. Magical aesthetic. No text.',
    tags: ['witchcraft', 'altar', 'flatlay', 'aesthetic'],
  },

  // MYTHOLOGY — male archetypes and creatures
  {
    id: 'myth-medusa-portrait',
    category: 'mythology',
    prompt:
      'Medusa, the gorgon — a powerful silhouette with serpents for hair, each snake glowing with energy. She radiates primal feminine power, not fear. Deep teal and gold. No face shown, no text.',
    tags: ['mythology', 'medusa', 'gorgon', 'serpents'],
  },
  {
    id: 'myth-pegasus-stars',
    category: 'mythology',
    prompt:
      'Pegasus, the winged horse, soaring through a cosmic nebula. Its white wings catch starlight. Trails of stardust follow its path. Ancient and free. Deep space background. No text.',
    tags: ['mythology', 'pegasus', 'winged-horse', 'cosmos'],
  },
  {
    id: 'myth-atlas-cosmos',
    category: 'mythology',
    prompt:
      'Atlas holding the entire cosmos — a glowing sphere of stars and galaxies — on his shoulders. A dark silhouette of immense strength. The universe itself rests on him. No face, no text.',
    tags: ['mythology', 'atlas', 'cosmos', 'strength'],
  },
  {
    id: 'myth-hermes-wings',
    category: 'mythology',
    prompt:
      'Hermes / Mercury, messenger of the gods. A winged silhouette in motion, moving between worlds. His caduceus glows with intertwining serpents. Quick and cosmic. Deep blue and gold. No face, no text.',
    tags: ['mythology', 'hermes', 'messenger', 'caduceus'],
  },
  {
    id: 'myth-cerberus-dark',
    category: 'mythology',
    prompt:
      'Cerberus, the three-headed hound of the underworld. Three silhouetted heads against deep crimson and black. Each head with glowing eyes. Guardian of the threshold. Dark and powerful. No text.',
    tags: ['mythology', 'cerberus', 'underworld', 'hound'],
  },
  {
    id: 'myth-odin-ravens',
    category: 'mythology',
    prompt:
      'Odin, the All-Father, silhouetted against the Norse cosmos. Two ravens (Huginn and Muninn) circle his shoulders. A single eye glows beneath his wide-brimmed hat. Stars and aurora behind. No face, no text.',
    tags: ['mythology', 'odin', 'norse', 'ravens'],
  },
  {
    id: 'myth-thor-lightning',
    category: 'mythology',
    prompt:
      'Thor raising Mjölnir above his head as lightning erupts across a dramatic sky. A powerful silhouette against storm clouds and stars. Norse energy. Primal and electric. No face, no text.',
    tags: ['mythology', 'thor', 'lightning', 'norse'],
  },

  // MORE SPIRIT ANIMALS
  {
    id: 'spirit-elephant-cosmos',
    category: 'spirit-animal',
    prompt:
      'A great elephant silhouetted against a vast star field. Its tusks glow silver in the cosmic light. Ancient wisdom and memory. Deep and calm. A galaxy visible in the background. No text.',
    tags: ['spirit-animal', 'elephant', 'wisdom', 'ancient'],
  },
  {
    id: 'spirit-dolphin-bioluminescent',
    category: 'spirit-animal',
    prompt:
      'Dolphins leaping through bioluminescent ocean waves at night. Their paths trail electric blue light. Stars above, glowing water below. Joy and intelligence made luminous. No text.',
    tags: ['spirit-animal', 'dolphin', 'bioluminescent', 'joy'],
  },
  {
    id: 'spirit-stag-forest',
    category: 'spirit-animal',
    prompt:
      'A magnificent stag standing in a moonlit forest clearing. Enormous antlers silhouetted against a full moon. Stars blazing above. Ancient and noble. Silver and deep forest tones. No text.',
    tags: ['spirit-animal', 'stag', 'antlers', 'moon'],
  },
  {
    id: 'spirit-crow-moon',
    category: 'spirit-animal',
    prompt:
      'A crow perched on a bare branch against a huge luminous moon. Its feathers catch iridescent blue-black light. Stars around the moon. Intelligence and magic. No text.',
    tags: ['spirit-animal', 'crow', 'moon', 'intelligence'],
  },
  {
    id: 'spirit-octopus-cosmic',
    category: 'spirit-animal',
    prompt:
      'A cosmic octopus floating through deep space, its tentacles reaching across star fields. Each sucker glows with bioluminescent light. Deep intelligence and mystery. Deep blue and black. No text.',
    tags: ['spirit-animal', 'octopus', 'cosmic', 'intelligence'],
  },
  {
    id: 'spirit-dragonfly-light',
    category: 'spirit-animal',
    prompt:
      'A dragonfly with iridescent wings catching rainbow light, hovering above a still moonlit water surface. Stars reflected below. Change and transformation in delicate beauty. No text.',
    tags: ['spirit-animal', 'dragonfly', 'iridescent', 'transformation'],
  },
  {
    id: 'spirit-snow-leopard',
    category: 'spirit-animal',
    prompt:
      'A snow leopard silhouetted on a mountain peak at night. Stars blazing overhead. Its spotted coat faintly visible in moonlight. Elusive and powerful. High altitude solitude. No text.',
    tags: ['spirit-animal', 'snow-leopard', 'mountain', 'elusive'],
  },
  {
    id: 'spirit-polar-bear-aurora',
    category: 'spirit-animal',
    prompt:
      'A polar bear standing on arctic ice, illuminated by a vivid aurora borealis above. Green and violet Northern Lights dance above the white bear. Primal and magical. No text.',
    tags: ['spirit-animal', 'polar-bear', 'aurora', 'arctic'],
  },

  // TAROT SUITS — concept art
  {
    id: 'tarot-suit-cups',
    category: 'tarot-suit',
    prompt:
      'The suit of Cups. A golden chalice overflowing with water that becomes stars as it falls. Deep blue ocean and night sky behind. Emotion, love and intuition. Rich and symbolic. No text.',
    tags: ['tarot', 'cups', 'suit', 'water', 'emotion'],
  },
  {
    id: 'tarot-suit-wands',
    category: 'tarot-suit',
    prompt:
      'The suit of Wands. A wooden staff wreathed in living flames and leaves, set against a deep red and gold cosmic sky. Fire, passion and creative energy. Bold and alive. No text.',
    tags: ['tarot', 'wands', 'suit', 'fire', 'passion'],
  },
  {
    id: 'tarot-suit-swords',
    category: 'tarot-suit',
    prompt:
      'The suit of Swords. A gleaming double-edged sword pointing upward into storm clouds and stars. Lightning flickers. Truth, intellect and conflict. Silver and electric blue. No text.',
    tags: ['tarot', 'swords', 'suit', 'air', 'truth'],
  },
  {
    id: 'tarot-suit-pentacles',
    category: 'tarot-suit',
    prompt:
      'The suit of Pentacles. A gold pentacle coin resting on dark earth surrounded by autumn leaves, moss and crystals. Earthy abundance. Deep greens and gold. Material wealth and nature. No text.',
    tags: ['tarot', 'pentacles', 'suit', 'earth', 'abundance'],
  },

  // ASTROLOGY CHART AESTHETICS
  {
    id: 'astro-natal-chart-wheel',
    category: 'astrology',
    prompt:
      'A birth chart / natal chart wheel. Twelve houses, zodiac glyphs, planetary symbols arranged in a beautiful circular diagram. Gold lines on deep indigo. Sacred geometry of a life. No text labels.',
    tags: ['astrology', 'natal-chart', 'wheel', 'houses'],
  },
  {
    id: 'astro-planetary-alignment',
    category: 'astrology',
    prompt:
      'All planets of the solar system in a perfect alignment — lined up in a row against the black void of space. From Mercury to Neptune, each glowing in its true colour. Rare and cosmic. No text.',
    tags: ['astrology', 'planetary-alignment', 'solar-system', 'rare'],
  },
  {
    id: 'astro-mercury-retrograde',
    category: 'astrology',
    prompt:
      'Mercury retrograde aesthetic. Mercury appears to move backward across a star field, leaving a looping trail of light. Chaos and communication disruption visualised. Electric and glitchy. No text.',
    tags: ['astrology', 'mercury-retrograde', 'chaos', 'electric'],
  },

  // MORE CRYSTALS
  {
    id: 'crystal-smoky-quartz',
    category: 'crystals',
    prompt:
      'Smoky quartz crystals. Dark translucent brown and grey points, smoke-like inclusions within. Grounding and protective energy. Dark background, macro photography. Earthy and mysterious. No text.',
    tags: ['crystals', 'smoky-quartz', 'brown', 'grounding'],
  },
  {
    id: 'crystal-fluorite-rainbow',
    category: 'crystals',
    prompt:
      'Fluorite crystals in purple and green banding. The natural colour zoning creates stunning patterns. Translucent and glowing. Macro photography, dark background. Mental clarity energy. No text.',
    tags: ['crystals', 'fluorite', 'purple-green', 'banding'],
  },
  {
    id: 'crystal-aquamarine-blue',
    category: 'crystals',
    prompt:
      'Aquamarine crystals in pale blue-green. Clear and oceanic, like frozen seawater. Macro photography on dark background. Calm and communicative energy. Elegant and serene. No text.',
    tags: ['crystals', 'aquamarine', 'blue', 'ocean'],
  },
  {
    id: 'crystal-carnelian-fire',
    category: 'crystals',
    prompt:
      'Carnelian crystals glowing deep orange-red. Like fire captured in stone. Translucent and warm. Dark background, macro photography. Courage and vitality energy. Bold and beautiful. No text.',
    tags: ['crystals', 'carnelian', 'orange', 'fire'],
  },
  {
    id: 'crystal-sunstone-golden',
    category: 'crystals',
    prompt:
      'Sunstone crystals with their glittery aventurescence — gold and copper metallic flecks sparkling within warm orange stone. Macro photography, dark background. Solar joy and optimism. No text.',
    tags: ['crystals', 'sunstone', 'gold', 'sparkle'],
  },
  {
    id: 'crystal-tanzanite-violet',
    category: 'crystals',
    prompt:
      'Tanzanite gems in deep violet-blue. Rare and magnificent, shifting between blue and purple as light moves. Dark background, macro. Found only near Kilimanjaro. Spiritual elevation. No text.',
    tags: ['crystals', 'tanzanite', 'violet', 'rare'],
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface ManifestEntry {
  id: string;
  file: string;
  size: string;
  model: string;
  generatedAt: string;
  prompt: string;
  category: string;
  tags: string[];
}

interface Manifest {
  version: number;
  entries: ManifestEntry[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadManifest(): Manifest {
  if (fs.existsSync(MANIFEST_PATH)) {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')) as Manifest;
  }
  return { version: 1, entries: [] };
}

function saveManifest(manifest: Manifest): void {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function ensureOutputDir(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey && !isDryRun) {
    console.error('Error: AI_GATEWAY_API_KEY is not set in .env.local');
    process.exit(1);
  }

  ensureOutputDir();
  const manifest = loadManifest();

  // Key includes size so we can regenerate in different sizes
  const generatedKeys = new Set(
    manifest.entries.map((e) => `${e.id}__${e.size}`),
  );

  let prompts = PROMPTS;
  if (categoryArg) {
    prompts = PROMPTS.filter((p) => p.category === categoryArg);
    if (prompts.length === 0) {
      const categories = [...new Set(PROMPTS.map((p) => p.category))].join(
        ', ',
      );
      console.error(
        `Unknown category "${categoryArg}". Available: ${categories}`,
      );
      process.exit(1);
    }
  }

  const todo = prompts.filter(
    (p) => !generatedKeys.has(`${p.id}__${ASPECT_RATIO}`),
  );

  console.log(`\nLunary Background Image Generator`);
  console.log(`──────────────────────────────────`);
  console.log(`Model:    ${MODEL}`);
  console.log(`Aspect:   ${ASPECT_RATIO} (${sizeArg})`);
  console.log(`Output:   ${OUTPUT_DIR}`);
  console.log(
    `Prompts:  ${prompts.length} total, ${todo.length} to generate, ${generatedKeys.size} already done`,
  );
  if (categoryArg) console.log(`Category: ${categoryArg}`);
  if (isDryRun) console.log(`Mode:     DRY RUN (no API calls)`);
  console.log('');

  if (todo.length === 0) {
    console.log('All images already generated for this size. Nothing to do.');
    return;
  }

  const batch = todo.slice(0, limit === Infinity ? todo.length : limit);

  const gateway = apiKey ? createGateway({ apiKey }) : null;

  let successCount = 0;
  let failCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < batch.length; i++) {
    const prompt = batch[i];
    const filename = `${prompt.id}__${sizeArg}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);
    const progressPrefix = `[${i + 1}/${batch.length}]`;

    console.log(`${progressPrefix} ${prompt.id}`);
    console.log(
      `  Category: ${prompt.category} | Tags: ${prompt.tags.join(', ')}`,
    );

    if (isDryRun) {
      console.log(`  → DRY RUN: would save to ${filename}\n`);
      continue;
    }

    const genStart = Date.now();

    try {
      console.log(`  → Generating...`);

      const result = await generateImage({
        model: gateway!.image(MODEL),
        prompt: prompt.prompt,
        aspectRatio: ASPECT_RATIO as `${number}:${number}`,
      });

      const genTime = formatDuration(Date.now() - genStart);

      // Save image
      const imageData = result.image.uint8Array;
      fs.writeFileSync(filepath, imageData);

      console.log(`  → Saved: ${filename} (${genTime})\n`);

      const entry: ManifestEntry = {
        id: prompt.id,
        file: filename,
        size: ASPECT_RATIO,
        model: MODEL,
        generatedAt: new Date().toISOString(),
        prompt: prompt.prompt,
        category: prompt.category,
        tags: prompt.tags,
      };
      manifest.entries.push(entry);
      saveManifest(manifest);

      successCount++;

      if (i < batch.length - 1) {
        await sleep(1000);
      }
    } catch (err) {
      const genTime = formatDuration(Date.now() - genStart);
      console.error(
        `  → FAILED after ${genTime}: ${err instanceof Error ? err.message : String(err)}\n`,
      );
      failCount++;

      if (i < batch.length - 1) {
        await sleep(5000);
      }
    }
  }

  const totalTime = formatDuration(Date.now() - startTime);
  console.log('──────────────────────────────────');
  console.log(`Done in ${totalTime}`);
  console.log(
    `Generated: ${successCount} | Failed: ${failCount} | Total in bank: ${manifest.entries.length}`,
  );

  if (failCount > 0) {
    console.log(`\nRe-run to retry failed images.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
