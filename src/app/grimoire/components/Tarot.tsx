import { tarotSpreads, tarotSuits } from '@/constants/tarot';

const Tarot = () => {
  const suits = Object.keys(tarotSuits);

  return (
    <div className='space-y-8 pb-20'>
      <div className='mb-6'>
        <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Tarot
        </h1>
        <p className='text-sm text-zinc-400'>
          Comprehensive guide to tarot cards, suits, and spreads
        </p>
      </div>

      <section id='arcana' className='space-y-6'>
        <h2 className='text-xl font-medium text-zinc-100'>Suits</h2>
        <div className='space-y-4'>
          {suits.map((suit: string) => (
            <div
              key={suit}
              className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                {tarotSuits[suit as keyof typeof tarotSuits].name}
              </h3>
              <p className='text-sm text-zinc-300 leading-relaxed'>
                {tarotSuits[suit as keyof typeof tarotSuits].mysticalProperties}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id='spreads' className='space-y-6'>
        <h2 className='text-xl font-medium text-zinc-100'>Spreads</h2>
        <div className='space-y-4'>
          {Object.keys(tarotSpreads).map((spread: string) => (
            <div
              key={spread}
              className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                {tarotSpreads[spread as keyof typeof tarotSpreads].name}
              </h3>
              <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
                {tarotSpreads[spread as keyof typeof tarotSpreads].description}
              </p>
              <p className='text-sm text-zinc-400'>
                {tarotSpreads[spread as keyof typeof tarotSpreads].instructions}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Tarot;
