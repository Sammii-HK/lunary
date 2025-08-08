import { runesList } from '@/constants/runes';

const Runes = () => {
  const runes = Object.keys(runesList);
  return (
    <div>
      <h1 className='text-lg font-bold mb-3 pt-12'>Runes</h1>
      {runes.map((rune: string) => (
        <div key={rune} className='mb-3'>
          <h2 className='font-bold pb-1'>
            {runesList[rune as keyof typeof runesList].symbol}{' '}
            {runesList[rune as keyof typeof runesList].name}
          </h2>
          <p>{runesList[rune as keyof typeof runesList].meaning}</p>
          <p>{runesList[rune as keyof typeof runesList].magicalProperties}</p>
          <p className='pt-1'>
            {runesList[rune as keyof typeof runesList].notes}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Runes;
