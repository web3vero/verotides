import { MetadataRoute } from 'next';
import { getAllGuides } from '@/lib/verotide/guides';
import { upcomingMonths } from '@/lib/verotide/months';

const BASE = 'https://verotides.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Rolling 6-month tide calendar URLs, built with the shared NY-timezone helper (see months.ts).
  const monthlyTideUrls = upcomingMonths(6).map((m) => ({
    url: `${BASE}/tides/${m.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${BASE}/tides`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE}/fishing`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE}/weather`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.85,
    },
    {
      url: `${BASE}/vessels`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${BASE}/bridges`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE}/spoil-islands`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE}/guides`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  const guideUrls = getAllGuides().map(guide => ({
    url: `${BASE}/guides/${guide.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticUrls, ...monthlyTideUrls, ...guideUrls];
}
