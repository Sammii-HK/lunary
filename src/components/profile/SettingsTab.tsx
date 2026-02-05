'use client';

import { useState, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { SectionTitle } from '@/components/ui/SectionTitle';

const SkeletonCard = () => (
  <div className='h-32 bg-zinc-800 animate-pulse rounded-xl' />
);

const SubscriptionManagement = dynamic(
  () => import('@/components/SubscriptionManagement'),
  { loading: () => <SkeletonCard /> },
);

const LocationRefresh = dynamic(
  () => import('@/components/LocationRefreshPanel'),
  { ssr: false },
);

const NotificationSettings = dynamic(
  () =>
    import('@/components/NotificationSettings').then((m) => ({
      default: m.NotificationSettings,
    })),
  { ssr: false },
);

const EmailSubscriptionSettings = dynamic(
  () =>
    import('@/components/EmailSubscriptionSettings').then((m) => ({
      default: m.EmailSubscriptionSettings,
    })),
  { ssr: false },
);

const ReferralProgram = dynamic(
  () =>
    import('@/components/ReferralProgram').then((m) => ({
      default: m.ReferralProgram,
    })),
  { ssr: false },
);

const NativeAppSettings = dynamic(
  () =>
    import('@/components/native/NativeAppSettings').then((m) => ({
      default: m.NativeAppSettings,
    })),
  { ssr: false },
);

type SettingSection = {
  id: string;
  title: string;
  description: string;
  content: ReactNode;
};

type SettingsTabProps = {
  stripeCustomerId?: string;
  subscriptionId?: string;
};

export function SettingsTab({
  stripeCustomerId,
  subscriptionId,
}: SettingsTabProps) {
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  const isSectionOpen = (sectionId: string) => openSections.includes(sectionId);

  const settingsSections: SettingSection[] = [
    {
      id: 'location',
      title: 'Location',
      description: 'Keep your coordinates current for precise readings.',
      content: <LocationRefresh variant='settings' />,
    },
    {
      id: 'email',
      title: 'Email Preferences',
      description: 'Manage horoscope updates and product news.',
      content: <EmailSubscriptionSettings />,
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      description: 'Control reminders and device alerts.',
      content: <NotificationSettings />,
    },
    {
      id: 'referrals',
      title: 'Referral Program',
      description: 'Share the magic and unlock rewards.',
      content: <ReferralProgram />,
    },
    {
      id: 'app',
      title: 'App Settings',
      description: 'Haptics, offline content, and app preferences.',
      content: <NativeAppSettings />,
    },
  ];

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        'Are you sure you want to delete your account? This will schedule your account for deletion in 30 days. You can cancel during this period.',
      )
    ) {
      return;
    }

    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reason: 'User requested deletion from profile',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to request deletion');
        return;
      }

      alert(
        `Account deletion scheduled for ${new Date(data.scheduledFor).toLocaleDateString()}. You can cancel this from your profile within 30 days.`,
      );
    } catch (error) {
      alert('Failed to request account deletion');
    }
  };

  return (
    <>
      {/* Preferences */}
      <div className='w-full max-w-3xl space-y-3'>
        <SectionTitle as='h2'>Preferences</SectionTitle>
        {settingsSections.map((section) => {
          const open = isSectionOpen(section.id);
          return (
            <div
              key={section.id}
              className='rounded-xl border border-zinc-700 bg-zinc-900/70 shadow-lg'
            >
              <button
                onClick={() => toggleSection(section.id)}
                className='flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-white transition-colors hover:bg-zinc-800/80'
              >
                <div>
                  <p>{section.title}</p>
                  {section.description && (
                    <p className='text-xs font-normal text-zinc-400'>
                      {section.description}
                    </p>
                  )}
                </div>
                <span className='text-lg font-semibold text-lunary-accent-200'>
                  {open ? '-' : '+'}
                </span>
              </button>
              {open && (
                <div className='border-t border-zinc-700/60 px-4 py-4 text-sm text-zinc-200'>
                  {section.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Subscription */}
      <div className='w-full max-w-3xl space-y-3'>
        <SectionTitle as='h2'>Subscription</SectionTitle>
        <SubscriptionManagement
          customerId={stripeCustomerId}
          subscriptionId={subscriptionId}
        />
      </div>

      {/* Data & Privacy */}
      <div className='w-full max-w-3xl'>
        <SectionTitle as='h2'>Data & Privacy</SectionTitle>
        <div className='mt-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4'>
          <div className='space-y-4'>
            {/* Export Data */}
            <div className='flex items-center justify-between p-4 rounded-lg bg-zinc-800/50'>
              <div>
                <h4 className='text-sm font-medium text-zinc-200'>
                  Export Your Data
                </h4>
                <p className='text-xs text-zinc-400'>
                  Download all your Lunary data as JSON
                </p>
              </div>
              <a
                href='/api/account/export'
                download
                className='px-4 py-2 text-sm font-medium text-lunary-accent hover:text-lunary-accent-300 border border-lunary-primary-700 rounded-lg hover:bg-lunary-primary-950 transition-colors'
              >
                Download
              </a>
            </div>

            {/* Delete Account */}
            <div className='flex items-center justify-between p-4 rounded-lg bg-lunary-error-900/10 border border-lunary-error-700'>
              <div>
                <h4 className='text-sm font-medium text-lunary-error-300'>
                  Delete Account
                </h4>
                <p className='text-xs text-zinc-400'>
                  Permanently delete your account and all data (30-day grace
                  period)
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className='px-4 py-2 text-sm font-medium text-lunary-error hover:text-lunary-error-300 border border-lunary-error-700 rounded-lg hover:bg-lunary-error-900 transition-colors'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
