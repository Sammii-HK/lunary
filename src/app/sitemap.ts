import { MetadataRoute } from 'next';
import { grimoire } from '@/constants/grimoire';
import dayjs from 'dayjs';

export default function sitemap(): MetadataRoute.Sitemap {
  // Use canonical domain (non-www)
  const baseUrl = 'https://lunary.app';
  const now = new Date();

  // Static routes - ordered by priority
  const routes = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/welcome`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/comparison/best-personalized-astrology-apps`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/grimoire`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/comparison`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/horoscope`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tarot`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/birth-chart`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/book-of-shadows`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Generate all blog week posts (from start of 2025 to current week)
  const blogRoutes: MetadataRoute.Sitemap = [];
  const startOf2025 = dayjs('2025-01-06'); // First Monday of 2025
  const today = dayjs();
  const currentWeekStart = today.startOf('week').add(1, 'day'); // Get Monday of current week

  let weekDate = startOf2025;
  let weekNumber = 1;
  const year = 2025;

  while (
    weekDate.isBefore(currentWeekStart) ||
    weekDate.isSame(currentWeekStart, 'day')
  ) {
    const weekSlug = `week-${weekNumber}-${year}`;
    blogRoutes.push({
      url: `${baseUrl}/blog/week/${weekSlug}`,
      lastModified: weekDate.toDate(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    });

    weekDate = weekDate.add(7, 'day');
    weekNumber++;
  }

  // Add all grimoire sections
  const grimoireItems = Object.keys(grimoire);
  const grimoireRoutes = grimoireItems.map((item) => ({
    url: `${baseUrl}/grimoire/${item
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '')}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...routes, ...blogRoutes, ...grimoireRoutes];
}
