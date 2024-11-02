import { annualFullMoons, FullMoon } from '@/constants/moon/annualFullMoons';
import { MonthlyMoonPhase, monthlyMoonPhases } from '../../../../utils/moon/monthlyPhases';
import { MoonPhase } from '../../../../utils/moon/moonPhases';
import { months } from '../../../../utils/months';

const Moon = () => {
  const moonPhases = Object.keys(monthlyMoonPhases);
  const fullMoonNames = Object.keys(annualFullMoons);
  return (
    <div className="h-[91vh] py-3">
      <h2 id="phases my-3" className="text-lg font-bold mb-4">Moon Phases</h2>
      <ul>
        {moonPhases.map((phase: string) => (
          <li className="mb-3 text-xs" key={phase}>
            {monthlyMoonPhases[phase as MoonPhase].symbol} {monthlyMoonPhases[phase as MoonPhase].information}
          </li>
        ))}
      </ul>
      <h2 id="full-moon-names" className="text-lg font-bold mb-4 mt-9">Annual Full Moons</h2>
      <ul className='my-3'>
        {fullMoonNames.map((fullMoon: string, index: number) => {
          const moon: FullMoon = annualFullMoons[fullMoon as keyof typeof annualFullMoons];
          return (
            <li key={moon.name} className='pb-3 text-xs'>
              <p className='font-bold'>{moon.name} - <span className='font-medium'>{months[index]}</span></p>
              {moon.description}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Moon;
