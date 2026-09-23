import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Card from '../common/Card';
import StatusBadge from '../content/StatusBadge';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';

export default function RecentContentList({ items }) {
  if (!items?.length) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={FileText}
          title="No content yet"
          description="Generate your first piece of AI-powered content to see it here."
          action={
            <Button as={Link} to="/generate" size="sm">
              Generate content
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-slate-100 dark:divide-slate-800">
      {items.map((item) => (
        <Link
          key={item.id}
          to={`/content/${item.id}`}
          className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Updated {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
            </p>
          </div>
          <StatusBadge status={item.status} />
        </Link>
      ))}
    </Card>
  );
}
