import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 0. Google AdSense & Ads.txt Crawler overrides
      {
        userAgent: 'Google-adstxt',
        allow: '/ads.txt',
      },
      {
        userAgent: 'Mediapartners-Google',
        allow: '/',
      },
      // 1. Search Agents (LLM search/retrieval engines that drive referral traffic)
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
      },
      {
        userAgent: 'cohere-training', // Cohere search & grounding
        allow: '/',
      },
      // 2. Training Scrapers (LLM training bots that scrape content without referral traffic)
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User', // Used for custom GPT actions / search, but often misused for bulk scraping
        disallow: '/',
      },
      {
        userAgent: 'ClaudeBot',
        disallow: '/',
      },
      {
        userAgent: 'Google-Extended', // Google Gemini training crawler
        disallow: '/',
      },
      {
        userAgent: 'Applebot-Extended', // Apple AI crawler
        disallow: '/',
      },
      {
        userAgent: 'FacebookBot', // Meta AI crawler
        disallow: '/',
      },
      {
        userAgent: 'CCBot', // Common Crawl training sets
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
      {
        userAgent: 'Cohere-ai',
        disallow: '/',
      },
      // 3. Default rules for standard search engines & human users
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: 'https://verotides.com/sitemap.xml',
  };
}
