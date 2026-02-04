import { TarotCardSVG } from '@/components/tarot';

/**
 * Preview page for programmatic tarot card generation
 * Visit /tarot-preview to see the proof of concept
 */

const PREVIEW_CARDS = [
  { key: 'theFool', name: 'The Fool', number: 0, element: 'Air' },
  { key: 'theMagician', name: 'The Magician', number: 1, element: 'Air' },
  {
    key: 'theHighPriestess',
    name: 'The High Priestess',
    number: 2,
    element: 'Water',
  },
  { key: 'theEmpress', name: 'The Empress', number: 3, element: 'Earth' },
  { key: 'theEmperor', name: 'The Emperor', number: 4, element: 'Fire' },
  { key: 'theHierophant', name: 'The Hierophant', number: 5, element: 'Earth' },
  { key: 'theLovers', name: 'The Lovers', number: 6, element: 'Air' },
  { key: 'theChariot', name: 'The Chariot', number: 7, element: 'Water' },
  { key: 'strength', name: 'Strength', number: 8, element: 'Fire' },
  { key: 'theHermit', name: 'The Hermit', number: 9, element: 'Earth' },
  {
    key: 'wheelOfFortune',
    name: 'Wheel of Fortune',
    number: 10,
    element: 'Fire',
  },
  { key: 'justice', name: 'Justice', number: 11, element: 'Air' },
];

export default function TarotPreviewPage() {
  return (
    <div className='min-h-screen bg-lunary-bg p-8'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-3xl font-bold text-white mb-2'>
          Programmatic Tarot Cards
        </h1>
        <p className='text-zinc-400 mb-8'>
          Proof of concept: SVG-based tarot cards with procedural star fields
          and sacred geometry patterns. Each card uses seeded randomness for
          consistent rendering.
        </p>

        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6'>
          {PREVIEW_CARDS.map((card) => (
            <div key={card.key} className='flex flex-col items-center gap-2'>
              <TarotCardSVG
                cardKey={card.key}
                name={card.name}
                number={card.number}
                element={card.element}
                width={160}
                height={267}
                className='drop-shadow-lg hover:drop-shadow-2xl transition-all hover:scale-105'
              />
              <span className='text-xs text-zinc-500'>{card.element}</span>
            </div>
          ))}
        </div>

        <div className='mt-12 border-t border-zinc-800 pt-8'>
          <h2 className='text-xl font-semibold text-white mb-4'>
            Implementation Details
          </h2>
          <ul className='text-sm text-zinc-400 space-y-2'>
            <li>
              <span className='text-lunary-primary'>Star Field:</span> Reuses
              seeded random generator from video starfield-generator.ts
            </li>
            <li>
              <span className='text-lunary-primary'>Patterns:</span> Sacred
              geometry (radiating lines, concentric circles, spirals, waves,
              grids)
            </li>
            <li>
              <span className='text-lunary-primary'>Symbols:</span>{' '}
              Card-specific primary symbols (infinity, moon phases, scales,
              etc.)
            </li>
            <li>
              <span className='text-lunary-primary'>Colors:</span> Element-based
              with per-card overrides from brand palette
            </li>
            <li>
              <span className='text-lunary-primary'>Output:</span> Pure SVG -
              can be used for display, OG images, or PNG export
            </li>
          </ul>
        </div>

        <div className='mt-8 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800'>
          <h3 className='text-sm font-medium text-white mb-2'>Next Steps</h3>
          <ul className='text-sm text-zinc-400 space-y-1'>
            <li>
              1. Add more symbol types (lantern, tower, sun, wheel, chalice)
            </li>
            <li>2. Integrate with OG image route for social sharing</li>
            <li>3. Add optional animation (twinkling stars) for web display</li>
            <li>4. Complete visual mappings for all 78 cards</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
