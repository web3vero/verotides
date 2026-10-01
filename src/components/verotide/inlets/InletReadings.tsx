import type { InletSnapshot } from '@/lib/verotide/lagoon-types';
import { INLETS_PAGE } from '@/lib/verotide/lagoon-copy';
import { bearingLabel, etTime, oneDecimal } from './format';

// The "inputs grid": three cards (current, waves, wind). Each card is honest about its own
// state. If a feed is missing or stale the card says "unavailable" and the reason from
// snapshot.errors is shown in the notice under the grid. We never fill a gap with a guess.

/** Friendly names for the buoys, so the card says where the reading came from. */
const STATION_LABEL: Record<string, string> = {
  '41114': 'Fort Pierce',
  '41113': 'Cape Canaveral nearshore',
  '41009': 'Cape Canaveral',
  '41068': 'NDBC',
};

function stationLabel(id: string): string {
  const name = STATION_LABEL[id];
  return name ? `NDBC buoy ${id} (${name})` : `NDBC buoy ${id}`;
}

/** One labelled row inside a card. */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-white/10 py-1.5">
      <dt className="text-white/60">{label}</dt>
      <dd className="text-right font-bold text-white">{value}</dd>
    </div>
  );
}

function Card({ title, badge, children }: { title: string; badge: string; children: React.ReactNode }) {
  return (
    <section className="terminal-box p-4 font-mono text-sm">
      <h3 className="text-xs font-black text-primary uppercase tracking-widest">&gt; {title}</h3>
      {/* The badge states what KIND of data this is (predicted vs observed). */}
      <p className="mt-1 text-[11px] uppercase tracking-widest text-white/50">{badge}</p>
      <dl className="mt-3">{children}</dl>
    </section>
  );
}

function Unavailable({ what }: { what: string }) {
  return <p className="mt-3 text-white/80">{what}: unavailable.</p>;
}

export default function InletReadings({ snapshot }: { snapshot: InletSnapshot }) {
  const { current, nextSlack, waves, wind } = snapshot;

  // The wave card only needs SOME fields; each missing field shows "unavailable" on its own row.
  const waveDir = waves?.meanWaveDirDeg ?? null;

  return (
    <div className="space-y-3">
      <div className="grid gap-4 md:grid-cols-3">
        {/* ---- Current: always labelled predicted ---- */}
        <Card title="Current" badge="Predicted (NOAA FPI0901), not measured">
          {current ? (
            <>
              <Row label="Phase" value={current.phase} />
              <Row label="Speed" value={`${oneDecimal(current.speedKt)} kt (predicted)`} />
              <Row label="Flowing toward" value={bearingLabel(current.dirTrue)} />
              <Row label="Prediction time" value={etTime(current.t)} />
              <Row
                label="Next slack"
                value={
                  nextSlack
                    ? `${etTime(nextSlack.t)} (${nextSlack.type === 'slack-before-ebb' ? 'before ebb' : 'before flood'})`
                    : 'unavailable'
                }
              />
            </>
          ) : (
            <Unavailable what="Predicted current" />
          )}
          <p className="mt-3 text-[11px] text-white/50">{INLETS_PAGE.currentCaption}</p>
        </Card>

        {/* ---- Waves: observed by a buoy, so we print station id + observation time ---- */}
        <Card title="Waves" badge={waves ? `Observed, ${stationLabel(waves.station)}` : 'Observed (NDBC buoy)'}>
          {waves ? (
            <>
              <Row label="Height (Hs)" value={waves.hsFt !== null ? `${oneDecimal(waves.hsFt)} ft` : 'unavailable'} />
              <Row
                label="Period"
                value={waves.dominantPeriodS !== null ? `${Math.round(waves.dominantPeriodS)} s` : 'unavailable'}
              />
              <Row label="Coming from" value={waveDir !== null ? bearingLabel(waveDir) : 'unavailable'} />
              <Row label="Observed" value={etTime(waves.t)} />
            </>
          ) : (
            <Unavailable what="Buoy wave data" />
          )}
          <p className="mt-3 text-[11px] text-white/50">
            Offshore buoy reading, not measured at the inlet mouth. Period readings can jump between reports.
          </p>
        </Card>

        {/* ---- Wind ---- */}
        <Card title="Wind" badge={wind ? `Observed, ${stationLabel(wind.station)}` : 'Observed (NDBC buoy)'}>
          {wind ? (
            <>
              <Row label="Speed" value={wind.speedKt !== null ? `${oneDecimal(wind.speedKt)} kt` : 'unavailable'} />
              <Row
                label="Coming from"
                value={wind.dirFromDeg !== null ? bearingLabel(wind.dirFromDeg) : 'unavailable'}
              />
              <Row label="Station" value={stationLabel(wind.station)} />
              <Row label="Observed" value={etTime(wind.t)} />
            </>
          ) : (
            <Unavailable what="Buoy wind data" />
          )}
          <p className="mt-3 text-[11px] text-white/50">
            There is no wind sensor at the inlet itself; this is the nearest buoy that reports wind.
          </p>
        </Card>
      </div>

      {/* Why something is missing, in the data layer's own words. Only shown when there is a reason. */}
      {snapshot.errors.length > 0 && (
        <div role="status" className="terminal-box p-3 font-mono text-xs text-white/80">
          <p className="font-black uppercase tracking-widest text-primary">Data notices</p>
          <ul className="mt-1 list-disc pl-5 space-y-1">
            {snapshot.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
