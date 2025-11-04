import { wheelOfTheYearSabbats } from '@/constants/sabbats';

const WheelOfTheYear = () => {
  return (
    <div className='space-y-6 pb-20'>
      <div className='mb-6'>
        <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Wheel of the Year
        </h1>
        <p className='text-sm text-zinc-400'>
          Discover the Wheel of the Year, Sabbats, and seasonal celebrations
        </p>
      </div>

      <div className='space-y-4'>
        {wheelOfTheYearSabbats.map((sabbat) => (
          <div
            key={sabbat.name}
            className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'
          >
            <h2 className='text-lg font-medium text-zinc-100 mb-2'>
              {sabbat.name}
            </h2>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              {sabbat.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WheelOfTheYear;
