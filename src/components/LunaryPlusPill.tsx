'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';
import { getABTestMetadataFromVariant } from '@/lib/ab-test-tracking';
import { trackEvent } from '@/lib/analytics';
import { useAuthStatus } from './AuthStatus';
import { UpgradePrompt } from './UpgradePrompt';

const PILL_DESTINATION_TEST = 'pill_destination_v1';

interface LunaryPlusPillProps {
  /**
   * Feature context used for tracking and for scoping the UpgradePrompt
   * modal (e.g. "personalised-horoscope", "full-tarot-reading"). Passed
   * through to metadata so admin analytics can bucket by feature.
   */
  featureName: string;
  /** Optional extra classes applied to the pill surface. */
  className?: string;
  /** Optional label override. Defaults to "Lunary+". */
  label?: string;
}

/**
 * The Lunary+ pill that overlays gated previews. Click destination is
 * A/B tested via pill_destination_v1:
 *   - control (default when flag absent): navigate to /pricing?nav=app
 *   - modal: open UpgradePrompt modal in-place so the user does not
 *     lose their current context.
 *
 * Renders as a span when inside a Link so it does not produce nested
 * anchors; when used standalone pass it a ref/container that does not
 * wrap it in an <a>.
 */
export function LunaryPlusPill({
  featureName,
  className,
  label = 'Lunary+',
}: LunaryPlusPillProps) {
  const authState = useAuthStatus();
  const variantRaw = useFeatureFlagVariant(PILL_DESTINATION_TEST);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const variant = typeof variantRaw === 'string' ? variantRaw : 'control';
  const useModal = variant === 'modal';

  const fireClickEvent = () => {
    const abMetadata = getABTestMetadataFromVariant(
      PILL_DESTINATION_TEST,
      variantRaw,
    );

    trackEvent('upgrade_clicked', {
      featureName,
      metadata: {
        surface: 'lunary_plus_pill',
        variant,
        ...(abMetadata ?? {}),
      },
    });
  };

  const pillClasses = cn(
    'inline-flex items-center gap-1 text-[10px] bg-layer-base/80 border border-lunary-primary-700/50 px-2 py-0.5 rounded text-content-brand',
    className,
  );

  if (useModal) {
    return (
      <>
        <button
          type='button'
          className={pillClasses}
          onClick={(e) => {
            // Stop bubbling so a wrapping <Link> does not also navigate.
            e.preventDefault();
            e.stopPropagation();
            fireClickEvent();
            setIsModalOpen(true);
          }}
        >
          <Sparkles className='w-2.5 h-2.5' />
          {label}
        </button>
        <UpgradePrompt
          variant='modal'
          featureName={featureName}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  // Control: navigate to /pricing (preserves prior behaviour).
  const href = authState.isAuthenticated ? '/pricing?nav=app' : '/auth';
  return (
    <Link
      href={href}
      className={pillClasses}
      onClick={(e) => {
        e.stopPropagation();
        fireClickEvent();
      }}
    >
      <Sparkles className='w-2.5 h-2.5' />
      {label}
    </Link>
  );
}
