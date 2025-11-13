'use client';

export function ConditionalMainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className='flex flex-col h-full w-full font-mono text-base gap-4 overflow-auto px-4'>
      {children}
    </main>
  );
}
