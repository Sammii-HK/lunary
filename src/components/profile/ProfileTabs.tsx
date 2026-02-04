'use client';

import { User, Users, Settings } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';

export type ProfileTab = 'profile' | 'circle' | 'settings';

type ProfileTabsProps = {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
};

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const haptic = useHaptic();

  const handleTabChange = (tab: ProfileTab) => {
    if (tab !== activeTab) {
      haptic.light();
    }
    onTabChange(tab);
  };

  return (
    <div className='w-full max-w-3xl mb-8'>
      <div className='flex gap-1 p-1 rounded-lg bg-zinc-800/50 border border-zinc-700/50'>
        <button
          onClick={() => handleTabChange('profile')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors inline-flex items-center justify-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-lunary-primary-900/50 text-white border border-lunary-primary-700/50'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <User className='w-4 h-4' />
          Profile
        </button>
        <button
          onClick={() => handleTabChange('circle')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors inline-flex items-center justify-center gap-1.5 ${
            activeTab === 'circle'
              ? 'bg-lunary-primary-900/50 text-white border border-lunary-primary-700/50'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className='w-4 h-4' />
          Circle
        </button>
        <button
          onClick={() => handleTabChange('settings')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors inline-flex items-center justify-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-lunary-primary-900/50 text-white border border-lunary-primary-700/50'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Settings className='w-4 h-4' />
          Settings
        </button>
      </div>
    </div>
  );
}
