'use client';

import { useEffect, useState } from 'react';

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
  return {
    synced: true,
    loading: false,
  };
}

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
          if (sessionData.subscription) {
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
