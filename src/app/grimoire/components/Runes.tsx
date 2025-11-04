import { runesList } from '@/constants/runes';

const Runes = () => {
  const runes = Object.keys(runesList);
  return (
    <div className='space-y-6 pb-20'>
      <div className='mb-6'>
        <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Runes
        </h1>
        <p className='text-sm text-zinc-400'>
          Ancient runic alphabets and their meanings
        </p>
      </div>

      <div className='space-y-4'>
        {runes.map((rune: string) => (
          <div
            key={rune}
            id={rune}
            className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
          >
            <h2 className='text-lg font-medium text-zinc-100 mb-2'>
              {runesList[rune as keyof typeof runesList].symbol}{' '}
              {runesList[rune as keyof typeof runesList].name}
            </h2>
            <p className='text-sm text-zinc-300 leading-relaxed mb-1'>
              {runesList[rune as keyof typeof runesList].meaning}
            </p>
            <p className='text-sm text-zinc-300 leading-relaxed mb-1'>
              {runesList[rune as keyof typeof runesList].magicalProperties}
            </p>
            <p className='text-sm text-zinc-400'>
              {runesList[rune as keyof typeof runesList].notes}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Runes;
