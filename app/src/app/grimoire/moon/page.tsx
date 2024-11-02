import { MonthlyMoonPhase, monthlyMoonPhases } from '../../../../utils/moon/monthlyPhases';
import { MoonPhase } from '../../../../utils/moon/moonPhases';

const Moon = () => {
  const moonPhases = Object.keys(monthlyMoonPhases);
  return (
    <div className="h-[91vh] py-3">
      <h1 className="text-lg font-bold mb-4">Moon Phases</h1>
      <ul>
        {/* <li>Full Moon Names</li> */}
        {moonPhases.map((phase: string) => (
          <li className="mb-3" key={phase}>
            {monthlyMoonPhases[phase as MoonPhase].symbol} {monthlyMoonPhases[phase as MoonPhase].information}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Moon;
