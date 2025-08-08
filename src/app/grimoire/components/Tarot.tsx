import { tarotSpreads, tarotSuits } from '@/constants/tarot';

const Tarot = () => {
  const suits = Object.keys(tarotSuits);

  return (
    <div>
      <h2 id='tarot' className='text-lg font-bold mb-3 pt-12'>
        Tarot
      </h2>
      <h3 id='tarot-suits' className='text-md font-bold mb-3 pt-12'>
        Suits
      </h3>
      {suits.map((suit: string) => (
        <div key={suit} className='mb-3'>
          <h2 className='font-bold pb-1'>
            {tarotSuits[suit as keyof typeof tarotSuits].name}
          </h2>
          <p>
            {tarotSuits[suit as keyof typeof tarotSuits].mysticalProperties}
          </p>
        </div>
      ))}
      <h3 id='tarot-spreads' className='text-md font-bold mb-3 pt-12'>
        Spreads
      </h3>
      {Object.keys(tarotSpreads).map((spread: string) => (
        <div key={spread} className='mb-3'>
          <h2 className='font-bold pb-1'>
            {tarotSpreads[spread as keyof typeof tarotSpreads].name}
          </h2>
          <p>{tarotSpreads[spread as keyof typeof tarotSpreads].description}</p>
          <p>
            {tarotSpreads[spread as keyof typeof tarotSpreads].instructions}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Tarot;
