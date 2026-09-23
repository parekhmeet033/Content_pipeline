function colorFor(score) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-rose-500';
}

export default function SubScoreBars({ scores }) {
  return (
    <ul className="flex flex-col gap-3">
      {scores.map(({ label, value }) => (
        <li key={label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
            <span className="text-slate-500 dark:text-slate-400">{value}/100</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${colorFor(value)}`}
              style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
