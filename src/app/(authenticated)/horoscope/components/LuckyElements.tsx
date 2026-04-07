/**
 * @deprecated This component was removed from the horoscope page during the consolidation redesign.
 * Lucky Elements were deemed low value compared to Transit Impacts and Crystal recommendations.
 * This file can be safely deleted.
 */
interface LuckyElementsProps {
  elements: string[];
}

export function LuckyElements({ elements }: LuckyElementsProps) {
  const colors = [
    'border-lunary-primary-700 bg-surface-card',
    'border-lunary-primary-700 bg-layer-base/10',
    'border-lunary-highlight-700 bg-lunary-highlight-950',
    'border-lunary-secondary-700 bg-surface-card',
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
      {elements.map((element: string, index: number) => (
        <div
          key={index}
          className={`rounded-lg border ${colors[index % colors.length]} p-4 hover:opacity-80 transition-opacity`}
        >
          <p className='text-sm font-medium text-center text-content-primary'>
            {element}
          </p>
        </div>
      ))}
    </div>
  );
}
