import type { AiPlanId } from '@/lib/ai/types';

/**
 * Feature Announcements are now stored in the database.
 * Use the admin UI at /admin/announcements to manage them.
 *
 * This file contains type definitions for reference.
 */

export interface FeatureAnnouncement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name: Users, Sparkles, Star, Moon, Heart
  ctaLabel?: string | null;
  ctaHref?: string | null;
  requiredTier?: AiPlanId[]; // Empty = all users
  releasedAt: Date;
  isActive: boolean;
}

/**
 * Available icons for announcements.
 * Add more icons to AnnouncementModal.tsx iconMap if needed.
 */
export const AVAILABLE_ICONS = [
  'Users',
  'Sparkles',
  'Star',
  'Moon',
  'Heart',
] as const;

export type AnnouncementIcon = (typeof AVAILABLE_ICONS)[number];
