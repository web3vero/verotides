import { MetadataRoute } from 'next';

// Crawler policy, in plain English:
//  - Search/citation bots and user-triggered fetchers are ALLOWED: they send readers to the site
//    or fetch a page because a person asked for it (this is how AI answers cite Verotides).
//  - Pure training crawlers stay BLOCKED (unchanged from the previous config).
//  - Important robots.txt quirk: a crawler obeys only the MOST SPECIFIC group matching its name,
//    and ignores the "*" group. So "Disallow: /api/" must be repeated in every allowed group,
//    otherwise named bots could wander into the API proxies.
const API_BLOCK = ['/api/'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Google AdSense & ads.txt crawlers
      { userAgent: 'Google-adstxt', allow: '/ads.txt' },
      { userAgent: 'Mediapartners-Google', allow: '/', disallow: API_BLOCK },

      // AI search bots (index pages to cite them) and user-triggered fetchers
      // (open a page because a human pasted/asked for it).
      {
        userAgent: [
          'OAI-SearchBot',
          'ChatGPT-User',
          'Claude-SearchBot',
          'Claude-User',
          'Claude-Web', // legacy Anthropic UA, kept as it was already allowed
          'PerplexityBot',
          'Perplexity-User',
          'cohere-training', // kept as previously configured
        ],
        allow: '/',
        disallow: API_BLOCK,
      },

      // Training-only crawlers: blocked entirely (as before).
      {
        userAgent: [
          'GPTBot',
          'ClaudeBot',
          'Google-Extended', // Gemini training opt-out (does not affect Google Search / AI Overviews)
          'Applebot-Extended',
          'FacebookBot',
          'CCBot',
          'anthropic-ai',
          'Cohere-ai',
        ],
        disallow: '/',
      },

      // Everyone else (normal search engines, humans).
      { userAgent: '*', allow: '/', disallow: API_BLOCK },
    ],
    sitemap: 'https://verotides.com/sitemap.xml',
  };
}
