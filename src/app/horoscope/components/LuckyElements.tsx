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
    'border-lunary-primary-700 bg-lunary-primary-950',
    'border-purple-500/30 bg-purple-500/10',
    'border-lunary-highlight-700 bg-lunary-highlight-950',
    'border-lunary-secondary-700 bg-lunary-secondary-950',
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
      {elements.map((element: string, index: number) => (
        <div
          key={index}
          className={`rounded-lg border ${colors[index % colors.length]} p-4 hover:opacity-80 transition-opacity`}
        >
          <p className='text-sm font-medium text-center text-zinc-100'>
            {element}
          </p>
        </div>
      ))}
    </div>
  );
}
