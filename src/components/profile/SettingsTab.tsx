'use client';

import { useState, useEffect, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Capacitor } from '@capacitor/core';
import { ChevronDown } from 'lucide-react';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { hapticService } from '@/services/native/haptic-service';
import { CosmicSkeleton } from '@/components/states/CosmicSkeleton';
import { CosmicSpinner } from '@/components/states/CosmicSpinner';

const SkeletonCard = () => <CosmicSkeleton height={128} radius={12} />;

const SubscriptionManagement = dynamic(
  () => import('@/components/SubscriptionManagement'),
  { loading: () => <SkeletonCard /> },
);

const IOSSubscriptionSection = dynamic(
  () =>
    import('@/components/IOSSubscriptionSection').then((m) => ({
      default: m.IOSSubscriptionSection,
    })),
  { ssr: false, loading: () => <SkeletonCard /> },
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

const AppleAccountLink = dynamic(
  () =>
    import('@/components/native/AppleAccountLink').then((m) => ({
      default: m.AppleAccountLink,
    })),
  { ssr: false },
);

const CalendarSubscribeCard = dynamic(
  () =>
    import('@/components/profile/CalendarSubscribeCard').then((m) => ({
      default: m.default,
    })),
  { ssr: false, loading: () => <SkeletonCard /> },
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
  const [isNativeIOS, setIsNativeIOS] = useState(false);

  useEffect(() => {
    setIsNativeIOS(
      Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios',
    );
  }, []);

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
      id: 'appearance',
      title: 'Appearance',
      description: 'Switch between dark and light mode.',
      content: (
        <div className='flex items-center justify-between'>
          <span className='text-sm text-content-secondary'>Theme</span>
          <ThemeToggle />
        </div>
      ),
    },
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
    // Web push notifications — hidden on iOS (NativeAppSettings has its own push toggle)
    ...(!isNativeIOS
      ? [
          {
            id: 'notifications',
            title: 'Push Notifications',
            description: 'Control reminders and device alerts.',
            content: <NotificationSettings />,
          },
        ]
      : []),
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

  const [deleteState, setDeleteState] = useState<
    'idle' | 'confirming' | 'deleting' | 'success' | 'error'
  >('idle');
  const [deleteMessage, setDeleteMessage] = useState('');

  const handleDeleteAccount = () => {
    hapticService.warning();
    setDeleteState('confirming');
  };

  const confirmDeleteAccount = async () => {
    setDeleteState('deleting');
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
        hapticService.error();
        setDeleteMessage(data.error || 'Failed to request deletion');
        setDeleteState('error');
        return;
      }

      hapticService.success();
      setDeleteMessage(
        `Account deletion scheduled for ${new Date(data.scheduledFor).toLocaleDateString()}. You can cancel this from your profile within 30 days.`,
      );
      setDeleteState('success');
    } catch {
      hapticService.error();
      setDeleteMessage('Failed to request account deletion');
      setDeleteState('error');
    }
  };

  const cancelDelete = () => {
    setDeleteState('idle');
    setDeleteMessage('');
  };

  return (
    <>
      {/* Preferences */}
      <div className='w-full max-w-3xl space-y-3'>
        <SectionTitle as='h2'>Preferences</SectionTitle>
        <div className='rounded-xl border border-stroke-default/60 bg-surface-elevated/70 overflow-hidden'>
          {settingsSections.map((section, index) => {
            const open = isSectionOpen(section.id);
            return (
              <div key={section.id}>
                {index > 0 && (
                  <div className='mx-4 border-t border-stroke-subtle/80' />
                )}
                <button
                  onClick={() => toggleSection(section.id)}
                  className='flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-content-primary active:bg-surface-card/60'
                >
                  <div>
                    <p>{section.title}</p>
                    {section.description && (
                      <p className='text-xs font-normal text-content-muted'>
                        {section.description}
                      </p>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 text-content-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                  />
                </button>
                {open && (
                  <div className='border-t border-stroke-subtle/60 px-4 py-4 text-sm text-content-primary'>
                    {section.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Linking (iOS only) */}
      {isNativeIOS && (
        <div className='w-full max-w-3xl space-y-3'>
          <SectionTitle as='h2'>Linked Accounts</SectionTitle>
          <div className='rounded-xl border border-stroke-default bg-surface-elevated/70 shadow-lg p-4'>
            <AppleAccountLink />
          </div>
        </div>
      )}

      {/* Calendar Subscription */}
      <div className='w-full max-w-3xl space-y-3'>
        <SectionTitle as='h2'>Calendar</SectionTitle>
        <CalendarSubscribeCard />
      </div>

      {/* Subscription */}
      <div className='w-full max-w-3xl space-y-3'>
        <SectionTitle as='h2'>Subscription</SectionTitle>
        {isNativeIOS ? (
          <IOSSubscriptionSection />
        ) : (
          <SubscriptionManagement
            customerId={stripeCustomerId}
            subscriptionId={subscriptionId}
          />
        )}
      </div>

      {/* Data & Privacy */}
      <div className='w-full max-w-3xl space-y-3'>
        <SectionTitle as='h2'>Data & Privacy</SectionTitle>
        <div className='rounded-xl border border-stroke-default/60 bg-surface-elevated/70 overflow-hidden'>
          {/* Export Data */}
          <div className='flex items-center justify-between px-4 py-3.5'>
            <div>
              <p className='text-sm font-medium text-content-primary'>
                Export Your Data
              </p>
              <p className='text-xs text-content-muted'>
                Download all your Lunary data as JSON
              </p>
            </div>
            <a
              href='/api/account/export'
              download
              className='px-3 py-1.5 text-sm font-medium text-lunary-accent border border-lunary-primary-700 rounded-lg active:bg-layer-deep transition-colors'
            >
              Download
            </a>
          </div>

          <div className='mx-4 border-t border-stroke-subtle/80' />

          {/* Delete Account */}
          <div className='px-4 py-3.5'>
            {deleteState === 'idle' && (
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-lunary-error-300'>
                    Delete Account
                  </p>
                  <p className='text-xs text-content-muted'>
                    Permanently remove your account (30-day grace period)
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className='px-3 py-1.5 text-sm font-medium text-lunary-error border border-lunary-error-700 rounded-lg active:bg-layer-base transition-colors'
                >
                  Delete
                </button>
              </div>
            )}

            {deleteState === 'confirming' && (
              <div className='space-y-3'>
                <p className='text-sm text-lunary-error-300 font-medium'>
                  Are you sure you want to delete your account?
                </p>
                <p className='text-xs text-content-muted'>
                  This will schedule your account for deletion in 30 days. You
                  can cancel during this period.
                </p>
                <div className='flex gap-2'>
                  <button
                    onClick={cancelDelete}
                    className='flex-1 px-3 py-2 text-sm font-medium text-content-secondary border border-stroke-strong rounded-lg active:bg-surface-card transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteAccount}
                    className='flex-1 px-3 py-2 text-sm font-medium text-white bg-lunary-error-700 rounded-lg active:bg-lunary-error-800 transition-colors'
                  >
                    Yes, delete my account
                  </button>
                </div>
              </div>
            )}

            {deleteState === 'deleting' && (
              <div className='flex items-center gap-2 py-1'>
                <CosmicSpinner size='sm' />
                <p className='text-sm text-content-muted'>
                  Processing deletion request...
                </p>
              </div>
            )}

            {deleteState === 'success' && (
              <div className='space-y-2'>
                <p className='text-sm text-lunary-success font-medium'>
                  {deleteMessage}
                </p>
                <button
                  onClick={cancelDelete}
                  className='text-xs text-content-muted underline'
                >
                  Dismiss
                </button>
              </div>
            )}

            {deleteState === 'error' && (
              <div className='space-y-2'>
                <p className='text-sm text-lunary-error-300'>{deleteMessage}</p>
                <div className='flex gap-2'>
                  <button
                    onClick={cancelDelete}
                    className='text-xs text-content-muted underline'
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={confirmDeleteAccount}
                    className='text-xs text-lunary-error underline'
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
