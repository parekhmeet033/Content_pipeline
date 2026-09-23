const SIZE = 160;
const RADIUS = 72;
const CENTER = SIZE / 2;

function polarToCartesian(angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + RADIUS * Math.cos(angleRad),
    y: CENTER + RADIUS * Math.sin(angleRad),
  };
}

function describeSlice(startAngle, endAngle) {
  const start = polarToCartesian(endAngle);
  const end = polarToCartesian(startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

export default function PieChart({ data, emptyLabel = 'No data yet' }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (!total) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
          <circle cx={CENTER} cy={CENTER} r={RADIUS} className="fill-slate-100 dark:fill-slate-800" />
        </svg>
        <p className="text-xs text-slate-400 dark:text-slate-500">{emptyLabel}</p>
      </div>
    );
  }

  const slices = data
    .filter((d) => d.value > 0)
    .reduce((acc, d) => {
      const cumulative = acc.length ? acc[acc.length - 1].cumulative : 0;
      const startAngle = (cumulative / total) * 360;
      const nextCumulative = cumulative + d.value;
      const endAngle = (nextCumulative / total) * 360;
      acc.push({ ...d, cumulative: nextCumulative, path: total === d.value ? null : describeSlice(startAngle, endAngle) });
      return acc;
    }, []);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Pie chart">
        {slices.map((s) =>
          s.path ? (
            <path key={s.label} d={s.path} fill={s.color} />
          ) : (
            <circle key={s.label} cx={CENTER} cy={CENTER} r={RADIUS} fill={s.color} />
          )
        )}
        <circle cx={CENTER} cy={CENTER} r={RADIUS * 0.55} className="fill-white dark:fill-slate-900" />
      </svg>
      <ul className="flex flex-col gap-1.5 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-slate-600 dark:text-slate-300">{d.label}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {d.value} ({total ? Math.round((d.value / total) * 100) : 0}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
