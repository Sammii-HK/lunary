const BirthChart = () => {
  const planets = [
    {
      symbol: '☉',
      name: 'Sun',
      keywords: 'Purpose, vitality, self-expression',
      transitTone: 'Focus, visibility, ego, life direction',
    },
    {
      symbol: '☽',
      name: 'Moon',
      keywords: 'Feelings, needs, rhythms',
      transitTone: 'Emotional fluctuations, home/family',
    },
    {
      symbol: '☿',
      name: 'Mercury',
      keywords: 'Thinking, communication, travel',
      transitTone: 'Learning, exchanging ideas, planning',
    },
    {
      symbol: '♀',
      name: 'Venus',
      keywords: 'Love, pleasure, values',
      transitTone: 'Relationships, harmony, money',
    },
    {
      symbol: '♂',
      name: 'Mars',
      keywords: 'Action, drive, competition',
      transitTone: 'Motivation, conflict, assertiveness',
    },
    {
      symbol: '♃',
      name: 'Jupiter',
      keywords: 'Growth, optimism, opportunity',
      transitTone: 'Expansion, luck, abundance',
    },
    {
      symbol: '♄',
      name: 'Saturn',
      keywords: 'Structure, limits, responsibility',
      transitTone: 'Discipline, lessons, long-term effort',
    },
    {
      symbol: '♅',
      name: 'Uranus',
      keywords: 'Change, awakening, innovation',
      transitTone: 'Disruption, liberation, experimentation',
    },
    {
      symbol: '♆',
      name: 'Neptune',
      keywords: 'Imagination, compassion, illusion',
      transitTone: 'Spirituality, confusion, idealism',
    },
    {
      symbol: '♇',
      name: 'Pluto',
      keywords: 'Power, transformation, regeneration',
      transitTone: 'Deep change, endings, rebirth',
    },
  ];

  const houses = [
    { number: '1st', area: 'Identity, confidence, how you present yourself' },
    { number: '2nd', area: 'Finances, self-worth, possessions' },
    { number: '3rd', area: 'Communication, learning, siblings' },
    { number: '4th', area: 'Home, family, inner foundation' },
    { number: '5th', area: 'Creativity, joy, romance, children' },
    { number: '6th', area: 'Health, habits, work environment' },
    { number: '7th', area: 'Partnerships, marriage, collaboration' },
    { number: '8th', area: 'Intimacy, shared money, transformation' },
    { number: '9th', area: 'Travel, philosophy, beliefs, education' },
    { number: '10th', area: 'Career, reputation, leadership' },
    { number: '11th', area: 'Community, friends, social causes' },
    { number: '12th', area: 'Subconscious, solitude, healing' },
  ];

  return (
    <div className='w-full space-y-8'>
      <h2 id='birth-chart' className='pt-12 text-lg font-bold text-zinc-100'>
        Birth Chart
      </h2>

      {/* Planets Section */}
      <div>
        <h3
          id='planets'
          className='mt-8 mb-4 text-base font-bold text-zinc-100'
        >
          🪐 Planets — "The What"
        </h3>
        <div className='space-y-4'>
          {planets.map((planet) => (
            <div
              key={planet.name}
              className='border border-zinc-800/50 rounded-lg p-4 bg-zinc-900/30'
            >
              <div className='flex items-start gap-3'>
                <span className='text-2xl'>{planet.symbol}</span>
                <div className='flex-1'>
                  <h4 className='font-semibold text-zinc-100 mb-1'>
                    {planet.name}
                  </h4>
                  <p className='text-sm text-zinc-400 mb-2'>
                    <span className='font-medium text-zinc-300'>Keywords:</span>{' '}
                    {planet.keywords}
                  </p>
                  <p className='text-sm text-zinc-400'>
                    <span className='font-medium text-zinc-300'>
                      In Transits:
                    </span>{' '}
                    {planet.transitTone}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Houses Section */}
      <div>
        <h3 id='houses' className='mt-8 mb-4 text-base font-bold text-zinc-100'>
          🏠 Houses — "The Where"
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {houses.map((house) => (
            <div
              key={house.number}
              className='border border-zinc-800/50 rounded-lg p-4 bg-zinc-900/30'
            >
              <div className='flex items-start gap-3'>
                <span className='font-semibold text-zinc-100 text-sm'>
                  {house.number}
                </span>
                <p className='text-sm text-zinc-400 flex-1'>{house.area}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interpretation Guide */}
      <div className='mt-8 border border-purple-500/30 rounded-lg p-6 bg-purple-500/10'>
        <h3 className='text-base font-bold text-zinc-100 mb-3'>
          🧭 The Core Logic
        </h3>
        <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
          Each planet represents a type of energy or motivation, each house
          represents the life area affected, and the sign adds tone and style.
        </p>
        <div className='bg-zinc-900/50 rounded p-4 border border-zinc-800/50'>
          <p className='text-sm text-zinc-200 font-medium'>
            interpretation = planet.energy + sign.expression + house.context
          </p>
        </div>
      </div>
    </div>
  );
};

export default BirthChart;
