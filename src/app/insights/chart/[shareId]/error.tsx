'use client';

import { ShareRouteError } from '@/components/states/ShareRouteError';

export default function SharedChartError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ShareRouteError {...props} boundary='insights-chart-share' />;
}
