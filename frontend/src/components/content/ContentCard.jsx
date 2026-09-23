import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { FileText } from 'lucide-react';
import Card from '../common/Card';
import StatusBadge from './StatusBadge';
import { labelFor, CONTENT_TYPES } from '../../constants';

export default function ContentCard({ content }) {
  return (
    <Card className="flex flex-col gap-3 p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/content/${content.id}`} className="line-clamp-2 font-semibold text-slate-900 hover:text-brand-600 dark:text-slate-100 dark:hover:text-brand-400">
          {content.title}
        </Link>
        <StatusBadge status={content.status} />
      </div>
      <p className="line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
        {content.excerpt || content.body}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
        <span className="inline-flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" /> {labelFor(CONTENT_TYPES, content.type)}
        </span>
        {content.category && (
          <span
            className="rounded-full px-2 py-0.5 font-medium"
            style={{ backgroundColor: `${content.category.color}20`, color: content.category.color }}
          >
            {content.category.name}
          </span>
        )}
        <span className="ml-auto">{content.wordCount} words</span>
        <span>· updated {formatDistanceToNow(new Date(content.updatedAt), { addSuffix: true })}</span>
      </div>
    </Card>
  );
}
