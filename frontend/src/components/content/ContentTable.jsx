import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge';
import ContentCard from './ContentCard';
import { labelFor, CONTENT_TYPES } from '../../constants';

export default function ContentTable({ items }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 md:block">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Title</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Type</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Updated</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Words</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                <td className="max-w-xs truncate px-4 py-3 text-sm">
                  <Link to={`/content/${item.id}`} className="font-medium text-slate-900 hover:text-brand-600 dark:text-slate-100 dark:hover:text-brand-400">
                    {item.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{labelFor(CONTENT_TYPES, item.type)}</td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{format(new Date(item.updatedAt), 'MMM d, yyyy')}</td>
                <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{item.wordCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden">
        {items.map((item) => (
          <ContentCard key={item.id} content={item} />
        ))}
      </div>
    </>
  );
}
