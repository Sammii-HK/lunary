import { tarotSuits } from '@/constants/tarot';

const Tarot = () => {
  const suits = Object.keys(tarotSuits);
  
  return (
    <div>
      <h1 id="tarot" className='text-lg font-bold mb-3'>Tarot</h1>
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
    </div>
  );
};

export default Tarot;
