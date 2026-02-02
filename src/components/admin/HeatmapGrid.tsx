interface HeatmapEntry {
  feature: string;
  value: number;
}

interface HeatmapRow {
  date: string;
  entries: HeatmapEntry[];
}

interface HeatmapGridProps {
  data: HeatmapRow[];
}

export function HeatmapGrid({ data }: HeatmapGridProps) {
  if (!data.length) {
    return (
      <div className='text-sm text-zinc-400'>
        No feature usage data available.
      </div>
    );
  }

  const featureKeys = data[0].entries.map((entry) => entry.feature);
  const max = Math.max(
    ...data.flatMap((row) => row.entries.map((entry) => entry.value)),
    1,
  );

  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-left text-xs text-zinc-400'>
        <thead>
          <tr>
            <th className='pb-2'>Date</th>
            {featureKeys.map((feature) => {
              const featureName =
                feature === '$pageview'
                  ? 'Page Views'
                  : feature
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (c) => c.toUpperCase());
              return (
                <th key={feature} className='pb-2'>
                  {featureName}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.date}>
              <td className='py-2 text-zinc-400'>{row.date.slice(5)}</td>
              {row.entries.map((entry) => {
                const intensity = entry.value / max;
                return (
                  <td key={entry.feature} className='py-1'>
                    <div
                      className='h-6 rounded-md text-center text-xs font-semibold text-white'
                      style={{
                        backgroundColor: `rgba(147,51,234,${Math.max(
                          0.1,
                          intensity,
                        )})`,
                      }}
                    >
                      {entry.value}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
