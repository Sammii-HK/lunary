interface LuckyElementsProps {
  elements: string[];
}

export function LuckyElements({ elements }: LuckyElementsProps) {
  const colors = [
    'border-indigo-500/30 bg-indigo-500/10',
    'border-purple-500/30 bg-purple-500/10',
    'border-violet-500/30 bg-violet-500/10',
    'border-blue-500/30 bg-blue-500/10',
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
