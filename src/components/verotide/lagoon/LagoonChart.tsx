// Server-rendered SVG chart for /lagoon: observed last ~48 h + forecast ~72 h with its error band.
//
// WHY INLINE SVG (no chart library): zero client JavaScript, no layout shift, crawlable text
// (<title>, <desc>, axis labels and the <details> table are all real DOM text), and it keeps the
// bundle small. The page is a server component, so this file is too: it only turns numbers into
// shapes.
//
// HONESTY RULES encoded here:
//  - Lagoon high/low markers are TIMES only. We draw them as vertical ticks, not as dots on the
//    curve, because the extremes carry no lagoon height (only the ocean height they came from).
//  - If the gauge reading is stale we draw NO forecast: it is anchored to that reading.
//  - Colour is never the only signal: observed = solid white line, forecast = dashed green line,
//    uncertainty = shaded band + legend text, extremes carry "H"/"L" letters, now = labelled line.

import type { LagoonSnapshot } from '@/lib/verotide/lagoon-types';
import { etHour, fmtDay, fmtFt, fmtStamp, fmtTime } from './format';

// Chart geometry in SVG user units (the viewBox scales it to any width).
const W = 640;
const H = 320;
const M = { l: 52, r: 14, t: 26, b: 44 }; // margins: room for y labels left, x labels bottom
const PW = W - M.l - M.r; // plot width
const PH = H - M.t - M.b; // plot height
const HOUR = 3_600_000;

const GREEN = '#00ff41'; // matches --primary in globals.css
const GRID = 'rgba(255,255,255,0.12)';
const MUTED = 'rgba(255,255,255,0.6)';

export default function LagoonChart({ snapshot }: { snapshot: LagoonSnapshot }) {
  const obs = snapshot.observed;
  const samples = obs?.samples ?? [];
  // Only draw the forecast when the gauge is fresh (see honesty rules above).
  const showForecast = !!obs && !obs.stale && snapshot.forecast.length > 0;
  const forecast = showForecast ? snapshot.forecast : [];

  if (samples.length === 0 && forecast.length === 0) {
    return (
      <p role="status" className="text-sm text-white/70">
        Chart unavailable: no recent Wabasso readings could be loaded.
      </p>
    );
  }

  // ---- scales ---------------------------------------------------------------------------
  const nowMs = new Date(snapshot.generatedAt).getTime();
  const tStart = samples.length ? new Date(samples[0].t).getTime() : nowMs - 48 * HOUR;
  const lastF = forecast.length ? new Date(forecast[forecast.length - 1].t).getTime() : 0;
  const lastS = samples.length ? new Date(samples[samples.length - 1].t).getTime() : nowMs;
  const tEnd = Math.max(lastF, lastS, tStart + HOUR);

  // Y range covers every plotted value, including the band edges, then snaps to a "nice" grid.
  const ys: number[] = [...samples.map((s) => s.ft), ...forecast.flatMap((f) => [f.lo, f.hi])];
  const rawMin = Math.min(...ys);
  const rawMax = Math.max(...ys);
  const step = rawMax - rawMin > 1.5 ? 0.5 : 0.25;
  const yMin = Math.floor((rawMin - 0.05) / step) * step;
  const yMax = Math.ceil((rawMax + 0.05) / step) * step;

  const x = (ms: number) => M.l + ((ms - tStart) / (tEnd - tStart)) * PW;
  const y = (ft: number) => M.t + (1 - (ft - yMin) / (yMax - yMin)) * PH;
  const pt = (ms: number, ft: number) => `${x(ms).toFixed(1)},${y(ft).toFixed(1)}`;

  // ---- shapes ---------------------------------------------------------------------------
  const obsPath = samples.map((s, i) => `${i ? 'L' : 'M'}${pt(new Date(s.t).getTime(), s.ft)}`).join(' ');
  const fcPath = forecast.map((f, i) => `${i ? 'L' : 'M'}${pt(new Date(f.t).getTime(), f.ft)}`).join(' ');
  // Band = upper edge left-to-right, then lower edge right-to-left, closed into one polygon.
  const bandPath = forecast.length
    ? 'M' +
      forecast.map((f) => pt(new Date(f.t).getTime(), f.hi)).join(' L') +
      ' L' +
      [...forecast].reverse().map((f) => pt(new Date(f.t).getTime(), f.lo)).join(' L') +
      ' Z'
    : '';

  // Y ticks every `step` feet.
  const yTicks: number[] = [];
  for (let v = yMin; v <= yMax + 1e-9; v += step) yTicks.push(Math.round(v * 100) / 100);

  // X ticks at 12 AM and 12 PM Eastern. ET offsets are whole hours, so stepping whole UTC hours
  // from the first hour boundary lands exactly on local midnight/noon.
  const xTicks: { ms: number; label: string; day?: string }[] = [];
  for (let ms = Math.ceil(tStart / HOUR) * HOUR; ms <= tEnd; ms += HOUR) {
    const h = etHour(ms);
    if (h === 0) xTicks.push({ ms, label: '12 AM', day: fmtDay(ms) });
    else if (h === 12) xTicks.push({ ms, label: '12 PM' });
  }

  // Lagoon highs/lows inside the plotted window (times only, see honesty rules).
  const extremes = snapshot.extremes.filter((e) => {
    const ms = new Date(e.t).getTime();
    return ms >= tStart && ms <= tEnd;
  });
  const nowInRange = nowMs >= tStart && nowMs <= tEnd;

  // ---- accessible description (read by screen readers, indexed as text) --------------------
  const latest = obs?.latest;
  const desc =
    `Line chart of Indian River Lagoon water level at Wabasso in feet relative to NAVD88, Eastern time. ` +
    (latest && !obs?.stale
      ? `The latest reading is ${fmtFt(latest.ft)} at ${fmtStamp(latest.t)}. `
      : 'The latest reading is unavailable. ') +
    (showForecast
      ? `A dashed forecast line with a shaded uncertainty band runs about ${Math.round(
          (lastF - lastS) / HOUR,
        )} hours ahead, ending near ${fmtFt(forecast[forecast.length - 1].ft)}. `
      : 'No forecast is drawn. ') +
    (extremes.length
      ? `Predicted lagoon highs and lows: ${extremes
          .map((e) => `${e.type === 'H' ? 'high' : 'low'} ${fmtStamp(e.t)}`)
          .join('; ')}.`
      : '');

  return (
    // overflow-x-auto + min-width on the svg: on very narrow phones the chart scrolls inside its
    // own box instead of shrinking its labels to unreadable size or widening the whole page.
    <div className="overflow-x-auto" tabIndex={0} aria-label="Water level chart, scrollable">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-labelledby="lagoon-chart-title lagoon-chart-desc"
        className="w-full h-auto min-w-[520px]"
        fontFamily="ui-monospace, monospace"
        fontSize="12"
      >
        <title id="lagoon-chart-title">Indian River Lagoon water level at Wabasso: last 48 hours and 72-hour forecast</title>
        <desc id="lagoon-chart-desc">{desc}</desc>

        {/* Horizontal grid + y-axis labels (feet NAVD88) */}
        {yTicks.map((v) => (
          <g key={`y${v}`}>
            <line x1={M.l} x2={W - M.r} y1={y(v)} y2={y(v)} stroke={GRID} strokeWidth="1" />
            <text x={M.l - 6} y={y(v) + 4} textAnchor="end" fill={MUTED}>
              {v.toFixed(2)}
            </text>
          </g>
        ))}
        <text x={12} y={M.t + PH / 2} fill={MUTED} textAnchor="middle" transform={`rotate(-90 12 ${M.t + PH / 2})`}>
          feet, NAVD88
        </text>

        {/* Vertical grid + x-axis labels (ET) */}
        {xTicks.map((t) => (
          <g key={`x${t.ms}`}>
            <line x1={x(t.ms)} x2={x(t.ms)} y1={M.t} y2={M.t + PH} stroke={GRID} strokeWidth="1" />
            <text x={x(t.ms)} y={H - 24} textAnchor="middle" fill={MUTED}>
              {t.label}
            </text>
            {t.day && (
              <text x={x(t.ms)} y={H - 10} textAnchor="middle" fill="#fff">
                {t.day}
              </text>
            )}
          </g>
        ))}
        <text x={W - M.r} y={H - 2} textAnchor="end" fill={MUTED} fontSize="10">
          times Eastern (ET)
        </text>

        {/* Uncertainty band: shaded area, drawn first so lines sit on top */}
        {bandPath && <path d={bandPath} fill={GREEN} fillOpacity="0.16" stroke="none" />}

        {/* Lagoon high/low markers: vertical ticks with H / L letters (shape + text, not colour) */}
        {extremes.map((e) => {
          const ms = new Date(e.t).getTime();
          const isHigh = e.type === 'H';
          return (
            <g key={e.t}>
              <line
                x1={x(ms)}
                x2={x(ms)}
                y1={M.t}
                y2={M.t + PH}
                stroke="#fff"
                strokeOpacity="0.35"
                strokeDasharray="2 4"
              />
              <rect x={x(ms) - 8} y={isHigh ? M.t - 2 : M.t + PH - 14} width="16" height="14" rx="2" fill="#000" stroke="#fff" strokeOpacity="0.6" />
              <text x={x(ms)} y={isHigh ? M.t + 9 : M.t + PH - 3} textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="11">
                {isHigh ? 'H' : 'L'}
              </text>
            </g>
          );
        })}

        {/* Forecast (dashed green) and observed (solid white) */}
        {fcPath && <path d={fcPath} fill="none" stroke={GREEN} strokeWidth="2" strokeDasharray="6 4" />}
        {obsPath && <path d={obsPath} fill="none" stroke="#fff" strokeWidth="2" />}

        {/* "Now" marker */}
        {nowInRange && (
          <g>
            <line x1={x(nowMs)} x2={x(nowMs)} y1={M.t - 8} y2={M.t + PH} stroke="#ffb000" strokeWidth="1.5" />
            <text x={x(nowMs)} y={M.t - 12} textAnchor="middle" fill="#ffb000" fontWeight="bold" fontSize="11">
              NOW {fmtTime(nowMs)}
            </text>
          </g>
        )}

        {/* Plot frame */}
        <rect x={M.l} y={M.t} width={PW} height={PH} fill="none" stroke="rgba(255,255,255,0.3)" />
      </svg>
    </div>
  );
}

/** Legend rendered as HTML under the chart (real text, so it wraps nicely on phones). */
export function LagoonChartLegend({ showForecast }: { showForecast: boolean }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/70 font-mono">
      <li>
        <span aria-hidden="true">&mdash;</span> White solid line: USGS observed (provisional)
      </li>
      {showForecast && (
        <>
          <li>
            <span aria-hidden="true">- - -</span> Green dashed line: forecast
          </li>
          <li>Shaded band: typical error range of the forecast</li>
        </>
      )}
      <li>H / L boxes: predicted lagoon high / low time</li>
      <li>Amber line: now</li>
    </ul>
  );
}
