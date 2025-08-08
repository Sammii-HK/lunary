'use client';

import { useEffect, useState } from 'react';
import { syncSubscriptionToProfile } from '../../utils/subscription';

interface SyncResult {
  synced: boolean;
  loading: boolean;
  error?: string;
  data?: any;
}

export function useSubscriptionSync(
  profile: any,
  customerId?: string,
): SyncResult {
  const [syncResult, setSyncResult] = useState<SyncResult>({
    synced: false,
    loading: false,
  });

  useEffect(() => {
    async function checkAndSync() {
      // Only sync if we have a profile and customer ID, but no existing subscription
      if (!profile || !customerId || (profile as any).subscription) {
        return;
      }

      setSyncResult({ synced: false, loading: true });

      try {
        console.log(
          'Attempting to sync subscription for customer:',
          customerId,
        );

        const result = await syncSubscriptionToProfile(profile, customerId);

        if (result.success) {
          setSyncResult({
            synced: true,
            loading: false,
            data: result.data,
          });
          console.log('Subscription successfully synced to profile');
        } else {
          setSyncResult({
            synced: false,
            loading: false,
            error: result.message || 'Sync failed',
          });
        }
      } catch (error) {
        console.error('Error syncing subscription:', error);
        setSyncResult({
          synced: false,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    checkAndSync();
  }, [profile, customerId]);

  return syncResult;
}

// Hook to get customer ID from checkout session
export function useCustomerIdFromSession(sessionId?: string) {
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    async function fetchCustomerId() {
      setLoading(true);
      try {
        const response = await fetch(`/api/stripe/session/${sessionId}`);
        if (response.ok) {
          const sessionData = await response.json();
          // Extract customer ID from Stripe session
          if (sessionData.subscription) {
            // For subscriptions, we need to get the customer from the subscription
            const subResponse = await fetch(
              `/api/stripe/subscription/${sessionData.subscription.id}`,
            );
            if (subResponse.ok) {
              const subData = await subResponse.json();
              setCustomerId(subData.customer);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching customer ID:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomerId();
  }, [sessionId]);

  return { customerId, loading };
}
