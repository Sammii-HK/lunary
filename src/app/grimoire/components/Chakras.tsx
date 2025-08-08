import { chakras } from '@/constants/chakras';

const Chakras = () => {
  const chakraList = Object.keys(chakras);
  return (
    <div>
      <h1 className='text-lg font-bold mb-3 pt-12'>Chakras</h1>
      {chakraList.map((chakra: string) => (
        <div key={chakra} className='mb-3'>
          <h2 className='font-bold pb-1'>
            {chakras[chakra as keyof typeof chakras].symbol}{' '}
            {chakras[chakra as keyof typeof chakras].name}
          </h2>
          {/* <p>{chakras[chakra as keyof typeof chakras].meaning}</p> */}
          <p>{chakras[chakra as keyof typeof chakras].properties}</p>
          <p className='pt-1'>
            {chakras[chakra as keyof typeof chakras].mysticalProperties}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Chakras;
