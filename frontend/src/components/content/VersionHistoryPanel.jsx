import { formatDistanceToNow } from 'date-fns';
import { History, RotateCcw } from 'lucide-react';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import Spinner from '../common/Spinner';

export default function VersionHistoryPanel({ versions, isLoading, onRestore, restoringId }) {
  if (isLoading) return <Spinner label="Loading version history" />;

  if (!versions?.length) {
    return <EmptyState icon={History} title="No version history yet" description="Edits you save will appear here." />;
  }

  return (
    <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
      {versions.map((version, idx) => (
        <li key={version.id} className="flex items-start justify-between gap-3 py-3">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Version {version.versionNum}
              {idx === 0 && (
                <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                  Latest
                </span>
              )}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
              {version.changeNote ? ` · ${version.changeNote}` : ''}
            </p>
          </div>
          {idx !== 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onRestore(version.id)}
              loading={restoringId === version.id}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restore
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
