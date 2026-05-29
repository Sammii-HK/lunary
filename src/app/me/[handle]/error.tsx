'use client';

import { ShareRouteError } from '@/components/states/ShareRouteError';

export default function PublicProfileError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ShareRouteError {...props} boundary='public-profile' />;
}
