import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import { Sparkles, CheckCircle2, CalendarClock, Bell, Info } from 'lucide-react';

const ICONS = {
  CONTENT_GENERATED: Sparkles,
  CONTENT_PUBLISHED: CheckCircle2,
  CONTENT_SCHEDULED: CalendarClock,
  AI_SUGGESTION: Sparkles,
  SYSTEM: Info,
  ACCOUNT: Bell,
};

export default function NotificationItem({ notification, onMarkRead }) {
  const Icon = ICONS[notification.type] || Bell;

  return (
    <div
      className={clsx(
        'flex gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-none dark:border-slate-800',
        !notification.isRead && 'bg-brand-50/60 dark:bg-brand-900/10'
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-600 dark:text-brand-400" aria-hidden="true" />
      <div className="flex-1">
        <p className="font-medium text-slate-900 dark:text-slate-100">{notification.title}</p>
        <p className="text-slate-500 dark:text-slate-400">{notification.message}</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
      {!notification.isRead && (
        <button
          type="button"
          onClick={() => onMarkRead(notification.id)}
          className="self-start rounded-full bg-brand-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-brand-700"
        >
          Mark read
        </button>
      )}
    </div>
  );
}
