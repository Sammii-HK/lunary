'use client';

export function ConditionalMainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className='flex flex-col min-h-full w-full font-mono text-sm gap-4 overflow-auto px-4'>
      {children}
    </main>
  );
}
