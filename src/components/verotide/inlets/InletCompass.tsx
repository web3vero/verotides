import { bearingLabel } from './format';

// A small server-rendered SVG that draws two bearings on a compass ring:
//   * the EBB direction (where outgoing water flows TOWARD), as a solid arrow from the centre, and
//   * the direction the WAVES are coming FROM, as a dashed arrow pointing in toward the centre.
// When the two arrows line up, waves are running head-on into the ebb. That is the one idea the
// graphic exists to show.
//
// Accessibility: the picture is never colour-only. The two arrows differ by line style (solid
// vs dashed) and by a letter badge ("E" / "W"), and everything is repeated as text in <title>,
// <desc> and the visible legend underneath, so a screen reader or a colour-blind reader gets
// the same information.
//
// Geometry note: compass bearings are measured clockwise from north, but SVG's y axis points
// DOWN. So for a bearing b the point at radius r is (cx + r*sin b, cy - r*cos b).

const SIZE = 240;
const C = SIZE / 2; // centre of the drawing
const RING = 70; // radius of the compass ring

/** Point at `r` from the centre along bearing `deg`, optionally nudged sideways by `side` px. */
function pt(deg: number, r: number, side = 0) {
  const a = (deg * Math.PI) / 180;
  // (sin a, -cos a) is the unit vector along the bearing; (cos a, sin a) is perpendicular to it.
  return {
    x: C + r * Math.sin(a) + side * Math.cos(a),
    y: C - r * Math.cos(a) + side * Math.sin(a),
  };
}

/** Triangle arrowhead whose tip is at (tip) and which points along bearing `deg`. */
function head(deg: number, r: number, side: number, forward: boolean) {
  // Build the head from three points: the tip, and two points set back from it.
  const dir = forward ? deg : deg + 180; // direction the arrow travels
  const tip = pt(deg, r, side);
  const a = (dir * Math.PI) / 180;
  const ux = Math.sin(a);
  const uy = -Math.cos(a); // unit vector of travel
  const back = 11; // how far behind the tip the base sits
  const half = 5; // half-width of the base
  const bx = tip.x - ux * back;
  const by = tip.y - uy * back;
  return `${tip.x},${tip.y} ${bx + uy * half},${by - ux * half} ${bx - uy * half},${by + ux * half}`;
}

export default function InletCompass({
  ebbToDeg,
  waveFromDeg,
}: {
  /** Bearing the ebb flows toward (NOAA lists about 77 degrees true at Fort Pierce). */
  ebbToDeg: number;
  /** Bearing the waves come FROM, or null if there is no fresh wave direction. */
  waveFromDeg: number | null;
}) {
  const cardinals: [string, number][] = [['N', 0], ['E', 90], ['S', 180], ['W', 270]];

  // Sideways offset so the two arrows do not draw on top of each other when they line up.
  const WAVE_SIDE = 12;

  const desc =
    waveFromDeg === null
      ? `Ebb current flows toward ${bearingLabel(ebbToDeg)}. Wave direction is unavailable right now.`
      : `Ebb current flows toward ${bearingLabel(ebbToDeg)}, drawn as a solid arrow marked E. Waves are coming from ${bearingLabel(waveFromDeg)}, drawn as a dashed arrow marked W pointing toward the centre.`;

  const ebbTip = pt(ebbToDeg, RING - 8);
  const ebbBadge = pt(ebbToDeg, 40);

  return (
    <figure className="flex flex-col items-center gap-2">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-labelledby="inlet-compass-title inlet-compass-desc"
        className="w-full max-w-[260px] h-auto"
      >
        <title id="inlet-compass-title">Compass: ebb direction versus wave direction</title>
        <desc id="inlet-compass-desc">{desc}</desc>

        {/* Ring and cardinal letters. currentColor lets the page theme decide the colour. */}
        <circle cx={C} cy={C} r={RING} fill="none" stroke="currentColor" strokeOpacity={0.35} strokeWidth={1} />
        {cardinals.map(([label, deg]) => {
          const p = pt(deg, RING + 12);
          return (
            <text
              key={label}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fill="currentColor"
              fillOpacity={0.7}
            >
              {label}
            </text>
          );
        })}

        {/* EBB: solid line from the centre out to where the water is heading, plus an "E" badge. */}
        <line
          x1={C}
          y1={C}
          x2={ebbTip.x}
          y2={ebbTip.y}
          stroke="currentColor"
          strokeWidth={3}
        />
        <polygon points={head(ebbToDeg, RING - 8, 0, true)} fill="currentColor" />
        <circle cx={ebbBadge.x} cy={ebbBadge.y} r={8} fill="#000" stroke="currentColor" strokeWidth={1.5} />
        <text x={ebbBadge.x} y={ebbBadge.y} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700} fill="currentColor">
          E
        </text>

        {/* WAVES: dashed line coming in from the FROM bearing toward the centre, plus a "W" badge. */}
        {waveFromDeg !== null && (
          <g>
            <line
              x1={pt(waveFromDeg, RING, WAVE_SIDE).x}
              y1={pt(waveFromDeg, RING, WAVE_SIDE).y}
              x2={pt(waveFromDeg, 30, WAVE_SIDE).x}
              y2={pt(waveFromDeg, 30, WAVE_SIDE).y}
              stroke="currentColor"
              strokeWidth={2.5}
              strokeDasharray="5 4"
            />
            {/* forward=false: the head sits at the inner end and points toward the centre. */}
            <polygon points={head(waveFromDeg, 30, WAVE_SIDE, false)} fill="currentColor" />
            {(() => {
              const b = pt(waveFromDeg, RING + 34, WAVE_SIDE);
              return (
                <g>
                  <rect x={b.x - 8} y={b.y - 8} width={16} height={16} transform={`rotate(45 ${b.x} ${b.y})`} fill="#000" stroke="currentColor" strokeWidth={1.5} />
                  <text x={b.x} y={b.y} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700} fill="currentColor">
                    W
                  </text>
                </g>
              );
            })()}
          </g>
        )}
      </svg>

      {/* Visible legend: the same facts as the <desc>, in plain text. */}
      <figcaption className="text-xs text-white/70 space-y-1 text-center">
        <p>
          <strong>E</strong> (solid arrow): ebb flows toward {bearingLabel(ebbToDeg)}.
        </p>
        <p>
          <strong>W</strong> (dashed arrow): waves come from{' '}
          {waveFromDeg === null ? 'an unavailable direction.' : `${bearingLabel(waveFromDeg)}.`}
        </p>
      </figcaption>
    </figure>
  );
}
