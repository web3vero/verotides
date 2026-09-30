import { MetadataRoute } from 'next';
import { getAllGuides } from '@/lib/verotide/guides';
import { upcomingMonths } from '@/lib/verotide/months';
import { indexableCams } from '@/lib/verotide/cams';

const BASE = 'https://verotides.com';

export default function sitemap(): MetadataRoute.Sitemap {
  // Google discards a lastmod that changes on every request, so use a fixed date and bump it only
  // when the content of these pages really changes. Monthly tide pages omit it (data, not edits).
  const CONTENT_UPDATED = new Date('2026-09-30');

  // Rolling 6-month tide calendar URLs, built with the shared NY-timezone helper (see months.ts).
  const monthlyTideUrls = upcomingMonths(6).map((m) => ({
    url: `${BASE}/tides/${m.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: CONTENT_UPDATED,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${BASE}/tides`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE}/fishing`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE}/weather`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: 'hourly',
      priority: 0.85,
    },
    {
      url: `${BASE}/vessels`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${BASE}/bridges`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE}/spoil-islands`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${BASE}/cams`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE}/about`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE}/guides`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  const guideUrls = getAllGuides().map(guide => ({
    url: `${BASE}/guides/${guide.slug}`,
    lastModified: CONTENT_UPDATED,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Watch pages for indexable cams only (link-out cams have no page of their own).
  const camUrls = indexableCams().map((cam) => ({
    url: `${BASE}/cams/${cam.slug}`,
    lastModified: CONTENT_UPDATED,
    changeFrequency: 'daily' as const,
    priority: 0.75,
  }));

  return [...staticUrls, ...monthlyTideUrls, ...guideUrls, ...camUrls];
}
