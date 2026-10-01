// IndexNow submitter: tells Bing (and Yandex, Seznam, Naver) which URLs changed so they re-crawl
// within minutes instead of days. One POST to the shared endpoint covers all participating engines.
//
// How it proves ownership: the file public/<key>.txt (served at https://verotides.com/<key>.txt)
// contains the key, so only the site owner can submit URLs for this host.
//
// Usage (after a production deploy finishes):
//   bun scripts/indexnow.ts            # submit every URL in the live sitemap
//   bun scripts/indexnow.ts /lagoon /inlets   # submit specific paths only
//
// Google does NOT support IndexNow; use Search Console "Request indexing" for Google.

const HOST = 'verotides.com';
const SITE = `https://${HOST}`;
const KEY = '1d1ff1fe64abc0781ed23e441dbaac8a';
const KEY_LOCATION = `${SITE}/${KEY}.txt`;

async function urlsFromSitemap(): Promise<string[]> {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  const args = process.argv.slice(2);
  const urlList = args.length
    ? args.map((p) => (p.startsWith('http') ? p : `${SITE}${p.startsWith('/') ? p : '/' + p}`))
    : await urlsFromSitemap();

  // Sanity check first: if our key file isn't live, the engines will reject us with 403.
  const keyRes = await fetch(KEY_LOCATION);
  if (!keyRes.ok || (await keyRes.text()).trim() !== KEY) {
    console.error(`Key file not live at ${KEY_LOCATION} (HTTP ${keyRes.status}). Deploy first.`);
    process.exit(1);
  }

  const res = await fetch('https://api.indexnow.org/IndexNow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  });
  // 200 = accepted, 202 = accepted (key validation pending). 4xx means a problem with the request.
  console.log(`IndexNow: submitted ${urlList.length} URLs -> HTTP ${res.status} ${res.statusText}`);
  if (res.status >= 400) {
    console.error(await res.text());
    process.exit(1);
  }
}

main();
