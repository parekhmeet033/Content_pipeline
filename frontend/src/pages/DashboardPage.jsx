import { useQuery } from '@tanstack/react-query';
import { FileText, AlertTriangle, Sparkles } from 'lucide-react';
import * as scoreService from '../api/scoreService';
import * as contentService from '../api/contentService';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/dashboard/StatCard';
import RecentContentList from '../components/dashboard/RecentContentList';
import QuickActions from '../components/dashboard/QuickActions';
import Spinner from '../components/common/Spinner';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['scores', 'overview'],
    queryFn: scoreService.getScoresOverview,
  });

  const { data: recent, isLoading: recentLoading } = useQuery({
    queryKey: ['content', 'recent'],
    queryFn: () => contentService.listContent({ limit: 5, sortBy: 'updatedAt', sortDir: 'desc' }),
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Welcome back, {user?.firstName}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Here's how your content is doing today.</p>
      </div>

      {overviewLoading ? (
        <Spinner label="Loading stats" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total content" value={overview?.totalContent ?? 0} icon={FileText} />
          <StatCard
            label="Needs correction"
            value={overview?.needsCorrectionCount ?? 0}
            icon={AlertTriangle}
            accent="text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400"
          />
          <StatCard label="Content analyzed" value={overview?.totalAnalyzed ?? 0} icon={Sparkles} />
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Quick actions</h3>
        <QuickActions />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Recent content</h3>
        {recentLoading ? <Spinner label="Loading content" /> : <RecentContentList items={recent?.items} />}
      </div>
    </div>
  );
}
