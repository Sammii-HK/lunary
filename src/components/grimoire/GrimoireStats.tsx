'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface GrimoireStatsProps {
  pagePath?: string;
  className?: string;
}

export function GrimoireStats({ pagePath, className }: GrimoireStatsProps) {
  const currentPath = usePathname();
  const path = pagePath || currentPath;

  const [stats, setStats] = useState<{
    viewsLast30Days: number;
    viewsAllTime: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!path || !path.startsWith('/grimoire')) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch(
          `/api/grimoire/stats?path=${encodeURIComponent(path)}`,
        );
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('[GrimoireStats] Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [path]);

  // Don't show if loading or no stats
  if (isLoading || !stats) {
    return null;
  }

  // Don't show if very few views (avoid looking empty)
  if (stats.viewsLast30Days < 10 && stats.viewsAllTime < 50) {
    return null;
  }

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toLocaleString();
  };

  return (
    <div
      className={`flex items-center gap-4 text-xs text-zinc-500 ${className}`}
    >
      <div className='flex items-center gap-1.5'>
        <Users className='w-3.5 h-3.5' />
        <span>{formatNumber(stats.viewsLast30Days)} readers this month</span>
      </div>
      {stats.viewsAllTime > stats.viewsLast30Days * 2 && (
        <div className='flex items-center gap-1.5'>
          <BookOpen className='w-3.5 h-3.5' />
          <span>{formatNumber(stats.viewsAllTime)} total reads</span>
        </div>
      )}
    </div>
  );
}
