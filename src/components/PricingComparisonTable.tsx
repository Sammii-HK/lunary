'use client';

import { Check, X } from 'lucide-react';

export function PricingComparisonTable() {
  return (
    <div className='overflow-x-auto rounded-xl border border-zinc-800/60 bg-zinc-900/40'>
      <table className='w-full border-collapse text-sm'>
        <thead>
          <tr className='border-b border-zinc-800/50'>
            <th className='text-left py-4 px-4 md:px-6 font-light text-sm md:text-base text-zinc-200'>
              Feature
            </th>
            <th className='text-center py-4 px-3 md:px-4 font-light text-zinc-200'>
              <div className='text-sm md:text-base'>Free</div>
            </th>
            <th className='text-center py-4 px-3 md:px-4 font-light text-zinc-200'>
              <div className='text-sm md:text-base'>Lunary+</div>
              <div className='text-xs font-normal text-zinc-500'>$4.99/mo</div>
            </th>
            <th className='text-center py-4 px-3 md:px-4 font-light text-zinc-200'>
              <div className='text-sm md:text-base'>Pro</div>
              <div className='text-xs font-normal text-zinc-500'>$8.99/mo</div>
            </th>
            <th className='text-center py-4 px-3 md:px-4 font-light text-zinc-200'>
              <div className='text-sm md:text-base'>Pro Annual</div>
              <div className='text-xs font-normal text-zinc-500'>$89.99/yr</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Horoscope Section */}
          <tr className='border-b border-zinc-800/50'>
            <td
              colSpan={5}
              className='py-3 px-4 md:px-6 text-xs uppercase tracking-[0.2em] text-zinc-500 bg-zinc-900/60'
            >
              Horoscope & Transits
            </td>
          </tr>
          <Row
            feature='Daily horoscope'
            free='General'
            plus='General'
            pro='General'
            annual='General'
          />
          <Row
            feature='Transit list'
            free='2 transits'
            freePartial
            plus='All transits (5-10)'
            pro='All transits'
            annual='All transits'
          />
          <Row
            feature='Transit descriptions'
            free='Truncated'
            freePartial
            plus='Full details'
            pro='Full details'
            annual='Full details'
          />
          <Row
            feature='Personal transit analysis'
            free={false}
            plus='How transits affect YOUR chart'
            pro='+ Deeper insights'
            annual='+ Extended timeline'
          />

          {/* Tarot Section */}
          <tr className='border-b border-zinc-800/50'>
            <td
              colSpan={5}
              className='py-3 px-4 md:px-6 text-xs uppercase tracking-[0.2em] text-zinc-500 bg-zinc-900/60'
            >
              Tarot Readings
            </td>
          </tr>
          <Row
            feature='Daily card'
            free='Truncated interpretation'
            freePartial
            plus='Full interpretation'
            pro='+ Deeper meanings'
            annual='+ Deeper meanings'
          />
          <Row
            feature='Weekly card'
            free={false}
            plus='Full access'
            pro='Full access'
            annual='Full access'
          />
          <Row
            feature='Birth chart integration'
            free={false}
            plus='Cards seeded from your chart'
            pro='+ Transit connections'
            annual='+ Pattern analysis'
          />
          <Row
            feature='Chart connection ("In Your Chart")'
            free={false}
            plus='Daily + Weekly'
            pro='+ Transit analysis'
            annual='+ Transit analysis'
          />
          <Row
            feature='Spreads per month'
            free='1'
            plus='10'
            pro='10'
            annual='Unlimited'
          />
          <Row
            feature='Pattern analysis'
            free={false}
            plus='30 days'
            pro='90 days'
            annual='Year-over-year'
          />

          {/* Dashboard Section */}
          <tr className='border-b border-zinc-800/50'>
            <td
              colSpan={5}
              className='py-3 px-4 md:px-6 text-xs uppercase tracking-[0.2em] text-zinc-500 bg-zinc-900/60'
            >
              Dashboard Features
            </td>
          </tr>
          <Row
            feature="Today's cosmic energy"
            free='General'
            plus='General'
            pro='General'
            annual='General'
          />
          <Row
            feature='Your Day (personal horoscope)'
            free={false}
            plus='Personalized'
            pro='+ Custom rituals'
            annual='+ Extended'
          />
          <Row
            feature='Daily tarot card'
            free={false}
            plus='Full reading'
            pro='+ Deeper'
            annual='+ Deeper'
          />
          <Row
            feature='Crystal recommendation'
            free={false}
            plus='Personal match'
            pro='Personal match'
            annual='Personal match'
          />
          <Row
            feature='Next major transit'
            free={false}
            plus='Personal impact'
            pro='+ In-depth analysis'
            annual='+ 6-month timeline'
          />

          {/* Other Features */}
          <tr className='border-b border-zinc-800/50'>
            <td
              colSpan={5}
              className='py-3 px-4 md:px-6 text-xs uppercase tracking-[0.2em] text-zinc-500 bg-zinc-900/60'
            >
              Other Features
            </td>
          </tr>
          <Row
            feature='Astral Guide (chat)'
            free='3 messages/day'
            plus='50 messages/day'
            pro='300 messages/day'
            annual='300 messages/day'
          />
          <Row
            feature='Collections & saved content'
            free={false}
            plus={true}
            pro={true}
            annual={true}
          />
          <Row
            feature='Context memory'
            free={false}
            plus={true}
            pro={true}
            annual={true}
          />
          <Row
            feature='Weekly reports'
            free={false}
            plus={false}
            pro={true}
            annual={true}
          />
          <Row
            feature='PDF downloads'
            free={false}
            plus={false}
            pro={true}
            annual={true}
          />
          <Row
            feature='Yearly forecast'
            free={false}
            plus={false}
            pro={false}
            annual={true}
          />
        </tbody>
      </table>
    </div>
  );
}

function Row({
  feature,
  free,
  plus,
  pro,
  annual,
  freePartial = false,
}: {
  feature: string;
  free: boolean | string;
  plus: boolean | string;
  pro: boolean | string;
  annual: boolean | string;
  freePartial?: boolean;
}) {
  return (
    <tr className='border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors'>
      <td className='py-3 px-4 md:px-6 text-xs md:text-sm text-zinc-300'>
        {feature}
      </td>
      <Cell value={free} partial={freePartial} />
      <Cell value={plus} />
      <Cell value={pro} />
      <Cell value={annual} />
    </tr>
  );
}

function Cell({
  value,
  partial = false,
}: {
  value: boolean | string;
  partial?: boolean;
}) {
  if (value === true) {
    return (
      <td className='text-center py-3 px-3 md:px-4'>
        <Check
          className='w-4 h-4 text-lunary-primary-400 mx-auto'
          strokeWidth={2.5}
        />
      </td>
    );
  }

  if (value === false) {
    return (
      <td className='text-center py-3 px-3 md:px-4'>
        <X className='w-4 h-4 text-zinc-700 mx-auto' strokeWidth={2} />
      </td>
    );
  }

  return (
    <td
      className={`text-center py-3 px-3 md:px-4 text-xs ${partial ? 'text-amber-400/90' : 'text-zinc-400'}`}
    >
      {value}
    </td>
  );
}
