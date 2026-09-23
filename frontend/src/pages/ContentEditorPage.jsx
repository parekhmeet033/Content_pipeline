import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Lightbulb } from 'lucide-react';
import * as contentService from '../api/contentService';
import * as categoryService from '../api/categoryService';
import * as aiService from '../api/aiService';
import ContentForm from '../components/content/ContentForm';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import GenerationProgress from '../components/content/GenerationProgress';

const SUGGESTION_STAGES = ['Reading your content...', 'Analyzing clarity, SEO & structure...', 'Writing suggestions...'];

export default function ContentEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [suggestions, setSuggestions] = useState(null);

  const { data: content, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentService.getContent(id),
  });

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoryService.listCategories });

  const updateMutation = useMutation({
    mutationFn: (values) => contentService.updateContent(id, values),
    onSuccess: (updated) => {
      toast.success('Content updated');
      queryClient.invalidateQueries({ queryKey: ['content', id] });
      navigate(`/content/${updated.id}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not save changes'),
  });

  const suggestMutation = useMutation({
    mutationFn: () => aiService.getSuggestions({ mode: 'improve', contentId: id }),
    onSuccess: (result) => setSuggestions(result.suggestions || []),
    onError: (err) => toast.error(err.response?.data?.message || 'Could not fetch suggestions'),
  });

  if (isLoading) return <Spinner label="Loading content" />;
  if (!content) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Edit content</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Update your content and save a new version.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <ContentForm
            initialValues={{
              title: content.title,
              body: content.body,
              excerpt: content.excerpt || '',
              type: content.type,
              tone: content.tone,
              targetAudience: content.targetAudience || '',
              keywords: content.keywords || [],
              categoryId: content.categoryId || '',
              status: content.status,
            }}
            categories={categories}
            submitting={updateMutation.isPending}
            submitLabel="Save changes"
            onSubmit={(values) => updateMutation.mutate(values)}
          />
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI suggestions</h3>
            <Button size="sm" variant="secondary" loading={suggestMutation.isPending} onClick={() => suggestMutation.mutate()}>
              <Lightbulb className="h-4 w-4" /> Get ideas
            </Button>
          </div>
          {suggestMutation.isPending ? (
            <GenerationProgress label="Analyzing your content" hint="This usually takes 5-15 seconds." stages={SUGGESTION_STAGES} />
          ) : !suggestions ? (
            <EmptyState
              icon={Lightbulb}
              title="No suggestions yet"
              description="Get AI-powered ideas to improve clarity, SEO, and structure."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {suggestions.map((s, idx) => (
                <li key={idx} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{s.title}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{s.detail}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
