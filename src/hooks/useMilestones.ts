'use client';

import { useState, useEffect } from 'react';

interface UncelebratedMilestone {
  id: number;
  type: string;
  key: string;
  data: {
    title?: string;
    description?: string;
    [key: string]: unknown;
  };
  achievedAt: string;
}

export function useMilestones() {
  const [uncelebrated, setUncelebrated] =
    useState<UncelebratedMilestone | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMilestones = async () => {
      try {
        const res = await fetch('/api/milestones', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUncelebrated(data.uncelebrated || null);
        }
      } catch {
        // Silent
      } finally {
        setIsLoading(false);
      }
    };
    checkMilestones();
  }, []);

  const celebrate = async (milestoneId: number) => {
    try {
      await fetch('/api/milestones/celebrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ milestoneId }),
      });
      setUncelebrated(null);
    } catch {
      // Silent
    }
  };

  return { uncelebrated, isLoading, celebrate };
}
