/**
 * Loading skeleton for analytics dashboard
 * Provides visual feedback while data loads
 */

export function MetricCardSkeleton() {
  return (
    <div className='animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/40 p-6'>
      <div className='mb-2 h-4 w-24 rounded bg-zinc-700' />
      <div className='h-8 w-32 rounded bg-zinc-700' />
      <div className='mt-2 h-3 w-20 rounded bg-zinc-700' />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className='animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/40 p-6'>
      <div className='mb-4 h-6 w-48 rounded bg-zinc-700' />
      <div className='h-64 rounded-lg bg-zinc-700/50'>
        <div className='flex h-full items-end justify-around p-4'>
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className='w-8 rounded-t bg-zinc-600'
              style={{ height: `${Math.random() * 60 + 40}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className='animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/40 p-6'>
      <div className='mb-4 h-6 w-48 rounded bg-zinc-700' />
      <div className='space-y-3'>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className='flex gap-4'>
            <div className='h-4 w-32 rounded bg-zinc-700' />
            <div className='h-4 w-24 rounded bg-zinc-700' />
            <div className='h-4 w-20 rounded bg-zinc-700' />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsDashboardSkeleton() {
  return (
    <div className='mx-auto max-w-7xl space-y-8 px-4 py-6'>
      {/* Header Skeleton */}
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <div className='h-8 w-64 animate-pulse rounded bg-zinc-700' />
          <div className='h-4 w-96 animate-pulse rounded bg-zinc-700' />
        </div>
        <div className='flex gap-2'>
          <div className='h-10 w-32 animate-pulse rounded bg-zinc-700' />
          <div className='h-10 w-24 animate-pulse rounded bg-zinc-700' />
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>

      {/* Charts Section */}
      <div className='grid gap-6 lg:grid-cols-2'>
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Tables Section */}
      <TableSkeleton />
    </div>
  );
}
