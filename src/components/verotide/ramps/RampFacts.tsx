// RampFacts.tsx (server component)
// ---------------------------------------------------------------------------------------------
// A definition list of the facts the FWC Boat Ramp Inventory records for one ramp.
// Rule: every null field renders "not confirmed". We never fill a blank with a guess.
// ---------------------------------------------------------------------------------------------

import type { BoatRamp } from '@/lib/verotide/geo-types';

const NC = 'not confirmed';

export function feeText(r: BoatRamp): string {
  const f = r.fee;
  if (f.required === null) return NC;
  if (f.required === false) return 'No fee recorded';
  const how = f.collection ? ` (${f.collection.toLowerCase()})` : '';
  if (f.amount !== null && f.rate) return `$${f.amount} ${f.rate}${how}`;
  if (f.amount !== null) return `$${f.amount}${how}, unit not stated by FWC`;
  return `Fee recorded${how}, amount not stated`;
}

export function lanesText(r: BoatRamp): string {
  const { total, single, double } = r.lanes;
  if (total === null) return NC;
  const parts = [single ? `${single} single` : null, double ? `${double} double` : null].filter(Boolean);
  return parts.length ? `${total} (${parts.join(', ')})` : String(total);
}

/** Status exactly as the source reports it, tagged with the record date so it is not read as "today". */
export function statusText(r: BoatRamp): string {
  if (!r.status) return NC;
  const when = r.lastVerified ? ` (as reported by the source; record edited ${r.lastVerified})` : ' (as reported by the source)';
  return `${r.status}${when}`;
}

function Row({ label, value }: { label: string; value: string | null }) {
  const missing = value === null || value === NC;
  return (
    <div className="py-1.5 border-b border-white/10 sm:grid sm:grid-cols-[11rem_1fr] sm:gap-3">
      <dt className="text-[10px] uppercase tracking-widest text-white/50">{label}</dt>
      <dd className={missing ? 'text-white/40 italic text-sm' : 'text-white/85 text-sm'}>{value ?? NC}</dd>
    </div>
  );
}

export default function RampFacts({ ramp: r, compact = false }: { ramp: BoatRamp; compact?: boolean }) {
  const kindLabel: Record<string, string> = {
    'boat-ramp': 'Boat ramp',
    'hand-launch': 'Hand launch (paddlecraft)',
    'marina-ramp': 'Marina ramp',
    'airboat-ramp': 'Airboat ramp',
    other: 'Other access point',
  };
  const trailer = r.parking.trailerSpaces;
  return (
    <dl className="font-mono">
      <Row label="Type" value={kindLabel[r.kind] ?? r.rampType} />
      <Row label="Launch lanes" value={lanesText(r)} />
      <Row label="Fee" value={feeText(r)} />
      <Row label="Hours" value={r.hours ?? NC} />
      <Row label="Vehicle parking" value={r.parking.vehicleSpaces !== null ? `${r.parking.vehicleSpaces} spaces` : NC} />
      <Row label="Trailer parking" value={trailer !== null ? `${trailer} spaces` : NC} />
      <Row label="Status" value={statusText(r)} />
      {!compact && (
        <>
          <Row label="Operator" value={r.operator ? `${r.operator}${r.partner ? ` with ${r.partner}` : ''}` : NC} />
          <Row label="Address" value={r.address ? `${r.address}${r.city ? `, ${r.city}` : ''}${r.zip ? ` ${r.zip}` : ''}` : NC} />
          <Row label="Ramp surface" value={r.rampSurface ? `${r.rampSurface}${r.rampCondition ? `, ${r.rampCondition}` : ''}` : NC} />
          <Row label="Dock" value={r.dockType ?? NC} />
          <Row label="Restroom" value={r.restroom.type ? `${r.restroom.type}${r.restroom.accessible ? ' (accessible)' : ''}` : NC} />
          <Row label="Other amenities" value={r.amenities ? r.amenities.split(',').map((s) => s.trim()).join(', ') : NC} />
          <Row label="Accessibility" value={r.accessibilityLevel ?? NC} />
          <Row label="Phone" value={r.phone ?? NC} />
          <Row label="Record last edited" value={r.lastVerified ?? NC} />
        </>
      )}
    </dl>
  );
}
