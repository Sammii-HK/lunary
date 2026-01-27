import type { PlanId } from '../../../utils/entitlements';

export type TourId =
  | 'first_time_onboarding'
  | 'guide_chat_intro'
  | 'collections_discovery'
  | 'book_of_shadows_intro'
  | 'chat_limit_reached'
  | 'tarot_limit_reached'
  | 'journal_limit_reached'
  | 'moon_circles_unlock'
  | 'weekly_report_available';

export type TourTrigger =
  | 'first_visit' // First time loading /app
  | 'after_chat' // After sending N chat messages
  | 'after_tarot_draw' // After drawing tarot
  | 'limit_hit' // When hitting tier limit
  | 'milestone' // After N days of use
  | 'manual'; // User clicks "Take tour" link

export interface TourStep {
  target: string; // CSS selector to highlight
  title: string | ((tier: PlanId) => string);
  content: string | ((tier: PlanId) => string);
  icon?: string; // Lucide icon name
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    variant?: 'primary' | 'secondary' | 'outline';
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
  };
}

export interface FeatureTour {
  id: TourId;
  name: string;
  trigger: TourTrigger;
  triggerCondition?: (context: TourContext) => boolean;
  requiredTier?: PlanId[]; // Only show to these tiers
  excludedTier?: PlanId[]; // Don't show to these tiers
  showOnce?: boolean; // Only show once ever
  showUpgradePrompt?: boolean; // Show upgrade CTA
  steps: TourStep[];
}

export interface TourContext {
  userTier: PlanId;
  chatCount: number;
  tarotCount: number;
  journalCount: number;
  daysActive: number;
  hasSeenTour: (tourId: TourId) => boolean;
}

export interface TourProgress {
  userId: string;
  toursCompleted: TourId[];
  toursDismissed: TourId[];
  lastShownAt: Record<TourId, Date>;
}
