import { useQuery } from '@tanstack/react-query';
import { FileText, Gauge, AlertTriangle, Sparkles } from 'lucide-react';
import * as scoreService from '../api/scoreService';
import * as contentService from '../api/contentService';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/dashboard/StatCard';
import RecentContentList from '../components/dashboard/RecentContentList';
import QuickActions from '../components/dashboard/QuickActions';
import Spinner from '../components/common/Spinner';
import Card from '../components/common/Card';
import PieChart from '../components/common/PieChart';
import ScoreGauge from '../components/score/ScoreGauge';
import { STATUS_COLORS_HEX } from '../constants';

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

  const statusPieData = Object.entries(STATUS_COLORS_HEX).map(([status, color]) => ({
    label: status.charAt(0) + status.slice(1).toLowerCase(),
    color,
    value: overview?.byStatus.find((s) => s.status === status)?.count || 0,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Welcome back, {user?.firstName}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Here's how your content is doing today.</p>
      </div>

      {overviewLoading ? (
        <Spinner label="Loading stats" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total content" value={overview?.totalContent ?? 0} icon={FileText} />
          <StatCard
            label="Avg. perfection score"
            value={overview?.totalAnalyzed ? `${overview.avgOverallScore}/100` : '—'}
            icon={Gauge}
          />
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Content by status</h3>
          {overviewLoading ? <Spinner label="Loading" /> : <PieChart data={statusPieData} />}
        </Card>
        <Card className="flex flex-col items-center justify-center p-5">
          <h3 className="mb-3 self-start text-sm font-semibold text-slate-900 dark:text-slate-100">
            Average perfection score
          </h3>
          {overviewLoading ? (
            <Spinner label="Loading" />
          ) : overview?.totalAnalyzed ? (
            <ScoreGauge score={overview.avgOverallScore} label="Across all analyzed content" />
          ) : (
            <p className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
              Analyze a piece of content to see your average score here.
            </p>
          )}
        </Card>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Recent content</h3>
        {recentLoading ? <Spinner label="Loading content" /> : <RecentContentList items={recent?.items} />}
      </div>
    </div>
  );
}
