import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Edit, Trash2, CalendarClock, Sparkles, CheckCircle2, AlertTriangle, RefreshCw, Wrench, Wand2 } from 'lucide-react';
import * as contentService from '../api/contentService';
import * as scoreService from '../api/scoreService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import PieChart from '../components/common/PieChart';
import StatusBadge from '../components/content/StatusBadge';
import VersionHistoryPanel from '../components/content/VersionHistoryPanel';
import GenerationProgress from '../components/content/GenerationProgress';
import ScoreGauge from '../components/score/ScoreGauge';
import SubScoreBars from '../components/score/SubScoreBars';
import ScoreHistoryList from '../components/score/ScoreHistoryList';
import EmptyState from '../components/common/EmptyState';
import { labelFor, CONTENT_TYPES, CONTENT_TONES } from '../constants';

const ANALYZE_STAGES = ['Reading your content...', 'Checking SEO, readability & structure...', 'Scoring and writing notes...'];
const IMPROVE_STAGES = [
  'Reviewing flagged issues...',
  'Rewriting to fix each issue...',
  'Saving as a new version...',
  'Re-analyzing the updated content...',
];

const ISSUE_COLORS = {
  SEO: '#6366f1',
  Readability: '#22c55e',
  Structure: '#f59e0b',
  Tone: '#ec4899',
  Grammar: '#0ea5e9',
};

export default function ContentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [restoringId, setRestoringId] = useState(null);

  const { data: content, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentService.getContent(id),
  });

  const { data: scores, isLoading: scoresLoading } = useQuery({
    queryKey: ['scores', id],
    queryFn: () => scoreService.getScoreHistory(id),
    enabled: Boolean(content),
  });

  const { data: versions, isLoading: versionsLoading } = useQuery({
    queryKey: ['content', id, 'versions'],
    queryFn: () => contentService.listVersions(id),
    enabled: Boolean(content),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['content', id] });
    queryClient.invalidateQueries({ queryKey: ['scores'] });
  };

  const statusMutation = useMutation({
    mutationFn: (status) => contentService.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated');
      invalidate();
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: () => contentService.scheduleContent(id, new Date(scheduledAt).toISOString()),
    onSuccess: () => {
      toast.success('Content scheduled');
      setScheduleOpen(false);
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => contentService.deleteContent(id),
    onSuccess: () => {
      toast.success('Content deleted');
      navigate('/content');
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: () => scoreService.analyzeContent(id),
    onSuccess: () => {
      toast.success('Analysis complete');
      queryClient.invalidateQueries({ queryKey: ['scores', id] });
      queryClient.invalidateQueries({ queryKey: ['scores', 'overview'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not analyze content'),
  });

  const improveMutation = useMutation({
    mutationFn: () => scoreService.improveContent(id),
    onSuccess: ({ score }) => {
      toast.success(`Content improved — new score: ${score.overallScore}/100`);
      queryClient.invalidateQueries({ queryKey: ['content', id] });
      queryClient.invalidateQueries({ queryKey: ['content', id, 'versions'] });
      queryClient.invalidateQueries({ queryKey: ['scores', id] });
      queryClient.invalidateQueries({ queryKey: ['scores', 'overview'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not improve content'),
  });

  const restoreMutation = useMutation({
    mutationFn: (versionId) => contentService.restoreVersion(id, versionId),
    onMutate: (versionId) => setRestoringId(versionId),
    onSuccess: () => {
      toast.success('Version restored');
      queryClient.invalidateQueries({ queryKey: ['content', id] });
      queryClient.invalidateQueries({ queryKey: ['content', id, 'versions'] });
    },
    onSettled: () => setRestoringId(null),
  });

  if (isLoading) return <Spinner label="Loading content" />;
  if (!content) return null;

  const latest = scores?.[0];
  const issueCounts = (latest?.issues || []).reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {});
  const issuePieData = Object.entries(ISSUE_COLORS).map(([label, color]) => ({
    label,
    color,
    value: issueCounts[label] || 0,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={content.status} />
            {content.category && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: `${content.category.color}20`, color: content.category.color }}
              >
                {content.category.name}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{content.title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {labelFor(CONTENT_TYPES, content.type)} · {labelFor(CONTENT_TONES, content.tone)} · {content.wordCount} words
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button as={Link} to={`/content/${id}/edit`} variant="secondary" size="sm">
            <Edit className="h-4 w-4" /> Edit
          </Button>
          {content.status !== 'PUBLISHED' && (
            <Button size="sm" onClick={() => statusMutation.mutate('PUBLISHED')} loading={statusMutation.isPending}>
              Publish now
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => setScheduleOpen(true)}>
            <CalendarClock className="h-4 w-4" /> Schedule
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Content quality</h3>
          {!analyzeMutation.isPending && !improveMutation.isPending && (
            <div className="flex gap-2">
              {latest && (
                <Button
                  size="sm"
                  onClick={() => improveMutation.mutate()}
                  disabled={analyzeMutation.isPending}
                >
                  <Wand2 className="h-4 w-4" /> Improve & re-analyze
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => analyzeMutation.mutate()}
                disabled={improveMutation.isPending}
              >
                {latest ? <RefreshCw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                {latest ? 'Re-analyze' : 'Analyze content'}
              </Button>
            </div>
          )}
        </div>

        {analyzeMutation.isPending ? (
          <GenerationProgress label="Analyzing your content" hint="This usually takes 5-20 seconds." stages={ANALYZE_STAGES} />
        ) : improveMutation.isPending ? (
          <GenerationProgress
            label="Improving your content"
            hint="This rewrites the content and re-analyzes it — usually 15-40 seconds."
            stages={IMPROVE_STAGES}
          />
        ) : scoresLoading ? (
          <Spinner label="Loading analysis" />
        ) : !latest ? (
          <EmptyState
            icon={Sparkles}
            title="Not analyzed yet"
            description="Run an AI analysis to get a perfection score, an optimization breakdown, and whether corrections are needed."
          />
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="flex flex-col items-center justify-center gap-3 lg:col-span-1">
                <ScoreGauge score={latest.overallScore} />
                {latest.needsCorrection ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    <AlertTriangle className="h-3.5 w-3.5" /> Correction required
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" /> No corrections needed
                  </span>
                )}
              </div>

              <div className="lg:col-span-2">
                <p className="mb-4 text-sm font-medium text-slate-700 dark:text-slate-200">Optimization breakdown</p>
                <SubScoreBars
                  scores={[
                    { label: 'SEO', value: latest.seoScore },
                    { label: 'Readability', value: latest.readabilityScore },
                    { label: 'Structure', value: latest.structureScore },
                    { label: 'Tone match', value: latest.toneScore },
                    { label: 'Grammar', value: latest.grammarScore },
                  ]}
                />
              </div>
            </div>

            {latest.summary && (
              <p className="border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                {latest.summary}
              </p>
            )}

            {(latest.issues?.length > 0 || latest.strengths?.length > 0) && (
              <>
              <div className="grid grid-cols-1 gap-6 border-t border-slate-100 pt-4 dark:border-slate-800 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Issues found {latest.issues?.length > 0 && `(${latest.issues.length})`}
                  </p>
                  {latest.issues?.length > 0 ? (
                    <ul className="flex flex-col gap-3">
                      {latest.issues.map((issue, idx) => (
                        <li key={idx} className="rounded-lg border border-slate-200 p-3 text-xs dark:border-slate-800">
                          <div className="mb-1.5 flex items-center gap-2">
                            <span
                              className="inline-block rounded-full px-2 py-0.5 font-medium text-white"
                              style={{ backgroundColor: ISSUE_COLORS[issue.category] || '#94a3b8' }}
                            >
                              {issue.category}
                            </span>
                          </div>
                          <p className="mb-2 text-slate-600 dark:text-slate-300">
                            <span className="font-medium text-slate-800 dark:text-slate-100">Problem: </span>
                            {issue.detail}
                          </p>
                          <p className="flex items-start gap-1.5 rounded-md bg-brand-50 p-2 text-brand-800 dark:bg-brand-900/20 dark:text-brand-300">
                            <Wrench className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                            <span>
                              <span className="font-medium">Recommended fix: </span>
                              {issue.recommendation}
                            </span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500">No issues found.</p>
                  )}
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">Issues by category</p>
                  <PieChart data={issuePieData} emptyLabel="No issues found" />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                <div>
                  <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">Strengths</p>
                  {latest.strengths?.length > 0 ? (
                    <ul className="flex flex-col gap-2">
                      {latest.strengths.map((s, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/10 dark:text-emerald-300"
                        >
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500">No strengths listed.</p>
                  )}
                </div>
              </div>
              </>
            )}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="prose prose-slate max-w-none whitespace-pre-wrap text-sm text-slate-700 dark:prose-invert dark:text-slate-300">
            {content.body}
          </div>
          {content.keywords?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              {content.keywords.map((kw) => (
                <span key={kw} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Version history</h3>
            <VersionHistoryPanel
              versions={versions}
              isLoading={versionsLoading}
              onRestore={(versionId) => restoreMutation.mutate(versionId)}
              restoringId={restoringId}
            />
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Analysis history</h3>
            <ScoreHistoryList scores={scores} isLoading={scoresLoading} />
          </Card>
        </div>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete this content?">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          This will permanently delete &quot;{content.title}&quot; and its version history. This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>
            Delete
          </Button>
        </div>
      </Modal>

      <Modal open={scheduleOpen} onClose={() => setScheduleOpen(false)} title="Schedule content">
        <Input
          label="Publish date & time"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setScheduleOpen(false)}>
            Cancel
          </Button>
          <Button loading={scheduleMutation.isPending} disabled={!scheduledAt} onClick={() => scheduleMutation.mutate()}>
            Schedule
          </Button>
        </div>
      </Modal>
    </div>
  );
}
