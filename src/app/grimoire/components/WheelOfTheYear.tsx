import { wheelOfTheYearSabbats } from '@/constants/sabbats';

const WheelOfTheYear = () => {
  return (
    <div>
      <h1 className='font-bold text-lg mb-4 pt-12'>Wheel of the Year</h1>
      {wheelOfTheYearSabbats.map((sabbat) => (
        <div key={sabbat.name} className='mb-3'>
          <h2 className='font-bold mb-1'>{sabbat.name}</h2>
          <p>{sabbat.description}</p>
        </div>
      ))}
    </div>
  );
};

export default WheelOfTheYear;
