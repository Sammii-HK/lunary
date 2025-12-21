'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DailyThreadModule,
  DailyThreadModuleType,
} from '@/lib/daily-thread/types';
import { ModuleCard } from './ModuleCard';

interface QuickActionsProps {
  onModuleGenerated?: (module: DailyThreadModule) => void;
  className?: string;
}

export function QuickActions({
  onModuleGenerated,
  className,
}: QuickActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [generatedModule, setGeneratedModule] =
    useState<DailyThreadModule | null>(null);

  const handleAction = async (type: DailyThreadModuleType) => {
    try {
      setLoading(type);
      const response = await fetch(
        `/api/astral-chat/daily-thread?type=${type}&forceRefresh=true`,
      );
      const data = await response.json();
      if (data.modules && data.modules.length > 0) {
        const dailyModule = data.modules[0];
        setGeneratedModule(dailyModule);
        onModuleGenerated?.(dailyModule);
      }
    } catch (error) {
      console.error('[QuickActions] Error generating module:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleModuleAction = (action: DailyThreadModule['actions'][0]) => {
    if (action.intent === 'dismiss') {
      setGeneratedModule(null);
    }
  };

  return (
    <div className={className}>
      <div className='flex flex-wrap gap-2 mb-3'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => handleAction('memory')}
          disabled={loading !== null}
          className='text-xs'
        >
          {loading === 'memory' ? 'Loading...' : 'Show me a memory'}
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => handleAction('reflection')}
          disabled={loading !== null}
          className='text-xs'
        >
          {loading === 'reflection' ? 'Loading...' : 'Give me a prompt'}
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => handleAction('pattern')}
          disabled={loading !== null}
          className='text-xs'
        >
          {loading === 'pattern' ? 'Loading...' : 'Show pattern insight'}
        </Button>
      </div>

      {generatedModule && (
        <div className='mt-3'>
          <ModuleCard module={generatedModule} onAction={handleModuleAction} />
        </div>
      )}
    </div>
  );
}
