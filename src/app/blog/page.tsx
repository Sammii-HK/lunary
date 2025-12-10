import { BlogClient } from './BlogClient';

interface BlogPost {
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

function generateWeeks(): BlogPost[] {
  const weeks: BlogPost[] = [];
  const startOf2025 = new Date('2025-01-06');
  const today = new Date();

  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const currentWeekStart = getMonday(today);

  let weekDate = new Date(startOf2025);
  let weekNumber = 1;
  const year = 2025;

  const formatDate = (d: Date) => {
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
  };

  while (weekDate <= currentWeekStart) {
    const weekEnd = new Date(weekDate);
    weekEnd.setDate(weekEnd.getDate() + 6);

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
    weekNumber++;
  }

  return weeks;
}

export default function BlogPage() {
  const initialPosts = generateWeeks();

  return <BlogClient initialPosts={initialPosts} />;
}
