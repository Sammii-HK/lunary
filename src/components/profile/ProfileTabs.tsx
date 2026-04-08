'use client';

import { User, Users, Settings } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';

export type ProfileTab = 'profile' | 'circle' | 'settings';

type ProfileTabsProps = {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
};

const tabs: { id: ProfileTab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'circle', label: 'Circle', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

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
      <div className='relative flex p-0.5 rounded-xl bg-surface-card/60 border border-stroke-default/40'>
        {/* Animated background indicator */}
        <div
          className='absolute top-0.5 bottom-0.5 rounded-[10px] bg-surface-overlay/80 transition-all duration-200 ease-out'
          style={{
            width: `calc(${100 / tabs.length}% - 2px)`,
            left: `calc(${(tabs.findIndex((t) => t.id === activeTab) * 100) / tabs.length}% + 1px)`,
          }}
        />
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative z-10 flex-1 px-3 py-2 text-sm font-medium rounded-[10px] transition-colors inline-flex items-center justify-center gap-1.5 ${
                activeTab === tab.id
                  ? 'text-content-primary'
                  : 'text-content-muted'
              }`}
            >
              <Icon className='w-3.5 h-3.5' />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
