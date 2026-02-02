'use client';

type ProfileTabsProps = {
  activeTab: 'profile' | 'settings';
  onTabChange: (tab: 'profile' | 'settings') => void;
};

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className='w-full max-w-3xl'>
      <div className='flex gap-1 p-1 rounded-lg bg-zinc-800/50 border border-zinc-700/50'>
        <button
          onClick={() => onTabChange('profile')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'profile'
              ? 'bg-lunary-primary-900/50 text-white border border-lunary-primary-700/50'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => onTabChange('settings')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'settings'
              ? 'bg-lunary-primary-900/50 text-white border border-lunary-primary-700/50'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Settings
        </button>
      </div>
    </div>
  );
}
