import { chakras } from '@/constants/chakras';

const Chakras = () => {
  const chakraList = Object.keys(chakras);
  return (
    <div className='space-y-6 pb-20'>
      <div className='mb-6'>
        <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Chakras
        </h1>
        <p className='text-sm text-zinc-400'>
          Understanding the seven chakras and their meanings
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {chakraList.map((chakra: string) => (
          <div
            key={chakra}
            className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 transition-colors'
          >
            <h2 className='text-lg font-medium text-zinc-100 mb-2'>
              {chakras[chakra as keyof typeof chakras].symbol}{' '}
              {chakras[chakra as keyof typeof chakras].name}
            </h2>
            <p className='text-sm text-zinc-300 leading-relaxed mb-1'>
              {chakras[chakra as keyof typeof chakras].properties}
            </p>
            <p className='text-sm text-zinc-400'>
              {chakras[chakra as keyof typeof chakras].mysticalProperties}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chakras;
