// RampNotices.tsx (server component): the FWC credit line, not-for-navigation notice and
// data-date note. Shown at the bottom of every ramps page (FWC asks to be acknowledged).

import { CREDIT_LINE, DATA_DATE_NOTE, NOT_FOR_NAVIGATION } from '@/lib/verotide/ramps-copy';

export default function RampNotices() {
  return (
    <footer className="font-mono text-[11px] text-white/60 leading-relaxed border-t border-primary/20 pt-4 space-y-2 mb-8">
      <p className="font-black uppercase tracking-widest text-white/70">Disclaimer and credits</p>
      <p>{NOT_FOR_NAVIGATION}</p>
      <p>{DATA_DATE_NOTE}</p>
      <p>{CREDIT_LINE}</p>
      <p>Verotides is an independent information site and does not operate any boat ramp. Obey posted signs and contact the operator for current conditions.</p>
    </footer>
  );
}
