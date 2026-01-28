import { prisma } from '@/lib/prisma';
import type { TourId } from './tour-system';

/**
 * Check if a user has completed or dismissed a tour
 */
export async function hasCompletedTour(
  userId: string,
  tourId: TourId,
): Promise<boolean> {
  const progress = await prisma.tourProgress.findUnique({
    where: {
      user_tour_unique: {
        userId,
        tourId,
      },
    },
  });

  return progress?.status === 'COMPLETED' || progress?.status === 'DISMISSED';
}

/**
 * Get all tour progress for a user
 */
export async function getUserTourProgress(userId: string) {
  const progress = await prisma.tourProgress.findMany({
    where: { userId },
  });

  return {
    completed: progress
      .filter((p) => p.status === 'COMPLETED')
      .map((p) => p.tourId),
    dismissed: progress
      .filter((p) => p.status === 'DISMISSED')
      .map((p) => p.tourId),
    lastShownAt: progress.reduce(
      (acc, p) => {
        if (p.lastShownAt) {
          acc[p.tourId] = p.lastShownAt;
        }
        return acc;
      },
      {} as Record<string, Date>,
    ),
  };
}

/**
 * Helper to create hasSeenTour function for tour context
 */
export function createHasSeenTourFn(
  completedTours: string[],
  dismissedTours: string[],
) {
  return (tourId: TourId) => {
    return completedTours.includes(tourId) || dismissedTours.includes(tourId);
  };
}

/**
 * Get tour context for a user
 */
export async function getUserTourContext(
  userId: string,
  userTier: string,
  chatCount: number,
  tarotCount: number,
  journalCount: number,
  daysActive: number,
) {
  const progress = await getUserTourProgress(userId);

  return {
    userTier: userTier as any,
    chatCount,
    tarotCount,
    journalCount,
    daysActive,
    // Return arrays instead of function since this will be serialized to JSON
    completedTours: progress.completed,
    dismissedTours: progress.dismissed,
  };
}
