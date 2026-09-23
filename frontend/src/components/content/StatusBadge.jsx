import Badge from '../common/Badge';
import { STATUS_COLORS, labelFor, CONTENT_STATUSES } from '../../constants';

export default function StatusBadge({ status }) {
  return <Badge color={STATUS_COLORS[status]}>{labelFor(CONTENT_STATUSES, status)}</Badge>;
}
