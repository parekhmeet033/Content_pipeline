import { Bell } from 'lucide-react';
import Spinner from '../common/Spinner';
import EmptyState from '../common/EmptyState';
import NotificationItem from './NotificationItem';

export default function NotificationList({ notifications, isLoading, onMarkRead }) {
  if (isLoading) return <Spinner label="Loading notifications" />;

  if (!notifications?.length) {
    return <EmptyState icon={Bell} title="No notifications yet" description="You'll see updates here as you create and manage content." />;
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} onMarkRead={onMarkRead} />
      ))}
    </div>
  );
}
