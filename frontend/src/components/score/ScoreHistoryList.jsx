import { formatDistanceToNow } from 'date-fns';
import { History } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import Spinner from '../common/Spinner';

function colorFor(score) {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

export default function ScoreHistoryList({ scores, isLoading }) {
  if (isLoading) return <Spinner label="Loading analysis history" />;

  if (!scores?.length) {
    return (
      <EmptyState
        icon={History}
        title="Not analyzed yet"
        description="Run an analysis to see a perfection score, optimization breakdown, and correction notes."
      />
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
      {scores.map((s, idx) => (
        <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {idx === 0 ? 'Latest analysis' : 'Analysis'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
            </p>
          </div>
          <span className={`text-sm font-bold ${colorFor(s.overallScore)}`}>{s.overallScore}/100</span>
        </li>
      ))}
    </ul>
  );
}
