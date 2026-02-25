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
