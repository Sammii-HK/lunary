import { getISOWeek, getISOWeekYear } from 'date-fns';

export interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  weekStart: string;
  weekEnd: string;
  weekNumber: number;
  year: number;
  generatedAt: string;
  contentSummary: {
    planetaryHighlights: number;
    retrogradeChanges: number;
    majorAspects: number;
    moonPhases: number;
  };
  slug: string;
}

export const POSTS_PER_PAGE = 8;

export function formatDate(d: Date): string {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

export function generateWeeks(): BlogPost[] {
  const weeks: BlogPost[] = [];
  const startOf2025 = new Date('2025-01-06');
  const today = new Date();
  const currentWeekStart = getMonday(today);

  let weekDate = new Date(startOf2025);

  while (weekDate <= currentWeekStart) {
    const weekEnd = new Date(weekDate);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Use ISO week numbering - resets each year
    const weekNumber = getISOWeek(weekDate);
    const year = getISOWeekYear(weekDate);

    weeks.push({
      id: `week-${weekNumber}-${year}`,
      title: `Week ${weekNumber} Forecast - ${formatDate(weekDate)} - ${formatDate(weekEnd)}, ${weekEnd.getFullYear()}`,
      subtitle: `Cosmic guidance for week ${weekNumber} of ${year}`,
      summary: `Discover the planetary movements, moon phases, and cosmic energies shaping week ${weekNumber} of ${year}.`,
      weekStart: weekDate.toISOString(),
      weekEnd: weekEnd.toISOString(),
      weekNumber,
      year,
      generatedAt: new Date().toISOString(),
      contentSummary: {
        planetaryHighlights: 0,
        retrogradeChanges: 0,
        majorAspects: 0,
        moonPhases: 0,
      },
      slug: `week-${weekNumber}-${year}`,
    });

    weekDate = new Date(weekDate);
    weekDate.setDate(weekDate.getDate() + 7);
  }

  return weeks;
}

export function getSortedPosts(): BlogPost[] {
  return generateWeeks().sort((a, b) => {
    const dateA = new Date(a.weekStart).getTime();
    const dateB = new Date(b.weekStart).getTime();
    return dateB - dateA;
  });
}

export function getPaginatedPosts(page: number): {
  posts: BlogPost[];
  totalPages: number;
  totalPosts: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} {
  const allPosts = getSortedPosts();
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const validPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (validPage - 1) * POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  return {
    posts,
    totalPages,
    totalPosts,
    currentPage: validPage,
    hasNextPage: validPage < totalPages,
    hasPrevPage: validPage > 1,
  };
}
