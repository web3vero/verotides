import type { Cam } from '@/lib/verotide/cams';

// One-line source credit shown under every cam. Always names the operator and links to
// their own page, and states plainly that Verotides does not host or record the feed.
// rel="nofollow": we are crediting, not endorsing or passing link equity.
export default function CamCredit({ cam }: { cam: Cam }) {
  return (
    <p className="text-[11px] text-white/60 font-mono">
      {cam.creditLine}{' '}
      <a href={cam.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline">
        {cam.operator}
      </a>
      . Verotides does not host, record or re-serve this feed.
    </p>
  );
}
