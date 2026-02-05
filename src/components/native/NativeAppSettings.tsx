'use client';

import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  Smartphone,
  Vibrate,
  Download,
  Trash2,
  Bell,
  BellOff,
} from 'lucide-react';
import { hapticService } from '@/services/native/haptic-service';
import { offlineService } from '@/services/native/offline-service';
import { nativePushService } from '@/services/native/push-service';
import { useUser } from '@/context/UserContext';

interface PushPreferences {
  daily_card?: boolean;
  moon_phase?: boolean;
  transit?: boolean;
  weekly_report?: boolean;
}

export function NativeAppSettings() {
  const { user } = useUser();
  const [isNative, setIsNative] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [cacheSize, setCacheSize] = useState('Calculating...');
  const [isPrecaching, setIsPrecaching] = useState(false);
  const [precacheResult, setPrecacheResult] = useState<string | null>(null);

  // Native push state
  const [pushRegistered, setPushRegistered] = useState(false);
  const [pushPreferences, setPushPreferences] = useState<PushPreferences>({
    daily_card: true,
    moon_phase: true,
    transit: true,
    weekly_report: true,
  });
  const [isPushLoading, setIsPushLoading] = useState(false);

  const fetchPushPreferences = useCallback(async () => {
    try {
      const response = await fetch('/api/push/preferences', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPushRegistered(data.registered);
        if (data.preferences) {
          setPushPreferences({
            daily_card: data.preferences.daily_card !== false,
            moon_phase: data.preferences.moon_phase !== false,
            transit: data.preferences.transit !== false,
            weekly_report: data.preferences.weekly_report !== false,
          });
        }
      }
    } catch (error) {
      console.debug('[NativeAppSettings] Could not fetch push preferences');
    }
  }, []);

  useEffect(() => {
    const isNativePlatform = Capacitor.isNativePlatform();
    setIsNative(isNativePlatform);
    setHapticsEnabled(hapticService.isEnabled());
    offlineService.getCacheSize().then(setCacheSize);

    // Fetch native push preferences if on native platform
    if (isNativePlatform) {
      fetchPushPreferences();
    }
  }, [fetchPushPreferences]);

  const updatePushPreference = async (
    key: keyof PushPreferences,
    value: boolean,
  ) => {
    setIsPushLoading(true);
    hapticService.light();

    const newPreferences = { ...pushPreferences, [key]: value };
    setPushPreferences(newPreferences);

    try {
      const response = await fetch('/api/push/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ preferences: { [key]: value } }),
      });

      if (!response.ok) {
        // Revert on failure
        setPushPreferences(pushPreferences);
        hapticService.error();
      } else {
        hapticService.success();
      }
    } catch (error) {
      setPushPreferences(pushPreferences);
      hapticService.error();
    } finally {
      setIsPushLoading(false);
    }
  };

  const handleEnablePush = async () => {
    if (!user?.id) return;

    setIsPushLoading(true);
    hapticService.light();

    try {
      const success = await nativePushService.initialize(user.id);
      if (success) {
        setPushRegistered(true);
        hapticService.success();
        // Refresh preferences after registration
        await fetchPushPreferences();
      } else {
        hapticService.error();
      }
    } catch (error) {
      console.error('[NativeAppSettings] Failed to enable push:', error);
      hapticService.error();
    } finally {
      setIsPushLoading(false);
    }
  };

  const handleDisablePush = async () => {
    if (!user?.id) return;

    setIsPushLoading(true);
    hapticService.light();

    try {
      const success = await nativePushService.unregister(user.id);
      if (success) {
        setPushRegistered(false);
        hapticService.success();
      } else {
        hapticService.error();
      }
    } catch (error) {
      console.error('[NativeAppSettings] Failed to disable push:', error);
      hapticService.error();
    } finally {
      setIsPushLoading(false);
    }
  };

  const toggleHaptics = (enabled: boolean) => {
    setHapticsEnabled(enabled);
    hapticService.setEnabled(enabled);
  };

  const handlePrecache = async () => {
    setIsPrecaching(true);
    setPrecacheResult(null);

    try {
      const result = await offlineService.precacheEssentials();
      const newSize = await offlineService.getCacheSize();
      setCacheSize(newSize);
      setPrecacheResult(
        `Cached ${result.cached} pages${result.failed > 0 ? ` (${result.failed} unavailable)` : ''}`,
      );
    } catch (error) {
      setPrecacheResult('Failed to cache content');
    } finally {
      setIsPrecaching(false);
    }
  };

  const handleClearCache = async () => {
    await offlineService.clearCache();
    setCacheSize('0 MB');
    setPrecacheResult('Cache cleared');
  };

  // Show minimal version for web users
  if (!isNative) {
    return (
      <div className='space-y-4'>
        {/* Offline content - available for all */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Download className='w-5 h-5 text-lunary-primary-400' />
              <div>
                <p className='text-sm font-medium text-white'>
                  Offline Content
                </p>
                <p className='text-xs text-zinc-400'>
                  Download grimoire for offline reading
                </p>
              </div>
            </div>
            <span className='text-xs text-zinc-500'>{cacheSize}</span>
          </div>

          <div className='flex gap-2'>
            <button
              onClick={handlePrecache}
              disabled={isPrecaching}
              className='flex-1 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white py-2 px-3 rounded-lg text-sm transition-colors'
            >
              {isPrecaching ? 'Downloading...' : 'Download'}
            </button>
            <button
              onClick={handleClearCache}
              className='p-2 text-zinc-400 hover:text-red-400 transition-colors'
              title='Clear cache'
            >
              <Trash2 className='w-4 h-4' />
            </button>
          </div>

          {precacheResult && (
            <p className='text-xs text-zinc-400'>{precacheResult}</p>
          )}
        </div>

        <p className='text-xs text-zinc-500 pt-2 border-t border-zinc-700'>
          <Smartphone className='w-3 h-3 inline mr-1' />
          More settings available in the Lunary app
        </p>
      </div>
    );
  }

  // Toggle component for preferences
  const ToggleSwitch = ({
    enabled,
    onChange,
    disabled,
  }: {
    enabled: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <button
      onClick={() => onChange(!enabled)}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${
        enabled ? 'bg-lunary-primary-600' : 'bg-zinc-600'
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
          enabled ? 'translate-x-5' : ''
        }`}
      />
    </button>
  );

  // Full native settings
  return (
    <div className='space-y-6'>
      {/* Haptic Feedback */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Vibrate className='w-5 h-5 text-lunary-primary-400' />
          <div>
            <p className='text-sm font-medium text-white'>Haptic Feedback</p>
            <p className='text-xs text-zinc-400'>
              Feel vibrations when interacting
            </p>
          </div>
        </div>
        <ToggleSwitch enabled={hapticsEnabled} onChange={toggleHaptics} />
      </div>

      {/* Native Push Notifications */}
      <div className='space-y-4 pt-4 border-t border-zinc-700'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            {pushRegistered ? (
              <Bell className='w-5 h-5 text-lunary-primary-400' />
            ) : (
              <BellOff className='w-5 h-5 text-zinc-500' />
            )}
            <div>
              <p className='text-sm font-medium text-white'>
                Push Notifications
              </p>
              <p className='text-xs text-zinc-400'>
                {pushRegistered
                  ? 'Receive cosmic alerts on this device'
                  : 'Enable to receive notifications'}
              </p>
            </div>
          </div>
          {!pushRegistered ? (
            <button
              onClick={handleEnablePush}
              disabled={isPushLoading}
              className='bg-lunary-primary-600 hover:bg-lunary-primary-700 disabled:opacity-50 text-white py-1.5 px-3 rounded-lg text-sm transition-colors'
            >
              {isPushLoading ? 'Enabling...' : 'Enable'}
            </button>
          ) : (
            <button
              onClick={handleDisablePush}
              disabled={isPushLoading}
              className='text-zinc-400 hover:text-red-400 text-sm transition-colors'
            >
              Disable
            </button>
          )}
        </div>

        {/* Push Preference Toggles - only show if registered */}
        {pushRegistered && (
          <div className='space-y-3 pl-8'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-zinc-200'>Daily Tarot Card</p>
                <p className='text-xs text-zinc-500'>Morning card of the day</p>
              </div>
              <ToggleSwitch
                enabled={pushPreferences.daily_card ?? true}
                onChange={(v) => updatePushPreference('daily_card', v)}
                disabled={isPushLoading}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-zinc-200'>Moon Phases</p>
                <p className='text-xs text-zinc-500'>New & full moon alerts</p>
              </div>
              <ToggleSwitch
                enabled={pushPreferences.moon_phase ?? true}
                onChange={(v) => updatePushPreference('moon_phase', v)}
                disabled={isPushLoading}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-zinc-200'>Transit Alerts</p>
                <p className='text-xs text-zinc-500'>Major planetary shifts</p>
              </div>
              <ToggleSwitch
                enabled={pushPreferences.transit ?? true}
                onChange={(v) => updatePushPreference('transit', v)}
                disabled={isPushLoading}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-zinc-200'>Weekly Report</p>
                <p className='text-xs text-zinc-500'>Sunday cosmic summary</p>
              </div>
              <ToggleSwitch
                enabled={pushPreferences.weekly_report ?? true}
                onChange={(v) => updatePushPreference('weekly_report', v)}
                disabled={isPushLoading}
              />
            </div>
          </div>
        )}
      </div>

      {/* Offline Content */}
      <div className='space-y-3 pt-4 border-t border-zinc-700'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Download className='w-5 h-5 text-lunary-primary-400' />
            <div>
              <p className='text-sm font-medium text-white'>Offline Content</p>
              <p className='text-xs text-zinc-400'>
                Download grimoire for offline access
              </p>
            </div>
          </div>
          <span className='text-xs text-zinc-500'>{cacheSize}</span>
        </div>

        <div className='flex gap-2'>
          <button
            onClick={handlePrecache}
            disabled={isPrecaching}
            className='flex-1 bg-lunary-primary-600 hover:bg-lunary-primary-700 disabled:opacity-50 text-white py-2 px-3 rounded-lg text-sm transition-colors'
          >
            {isPrecaching ? 'Downloading...' : 'Download Offline Content'}
          </button>
          <button
            onClick={handleClearCache}
            className='p-2 text-zinc-400 hover:text-red-400 transition-colors'
            title='Clear cache'
          >
            <Trash2 className='w-4 h-4' />
          </button>
        </div>

        {precacheResult && (
          <p className='text-xs text-zinc-400'>{precacheResult}</p>
        )}
      </div>
    </div>
  );
}
