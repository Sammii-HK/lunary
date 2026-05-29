'use client';

import { ShareRouteError } from '@/components/states/ShareRouteError';

export default function SkyOfTheDayError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ShareRouteError {...props} boundary='sky-of-the-day' />;
}
