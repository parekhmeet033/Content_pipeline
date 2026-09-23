import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Sparkles, Plus } from 'lucide-react';
import * as aiService from '../api/aiService';
import * as contentService from '../api/contentService';
import * as categoryService from '../api/categoryService';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import TextArea from '../components/common/TextArea';
import Select from '../components/common/Select';
import TagInput from '../components/common/TagInput';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import CategoryManagerModal from '../components/content/CategoryManagerModal';
import GenerationProgress from '../components/content/GenerationProgress';
import { CONTENT_TYPES, CONTENT_TONES, CONTENT_LENGTHS } from '../constants';

const INITIAL_FORM = {
  topic: '',
  contentType: 'BLOG_POST',
  targetAudience: '',
  tone: 'PROFESSIONAL',
  keywords: [],
  length: 'MEDIUM',
};

export default function ContentGeneratorPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [draft, setDraft] = useState(null);
  const [categoryId, setCategoryId] = useState('');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoryService.listCategories });

  const generateMutation = useMutation({
    mutationFn: () => aiService.generateContent(form),
    onSuccess: (result) => {
      setDraft({
        title: result.title || '',
        excerpt: result.excerpt || '',
        body: result.body || '',
        keywords: result.suggestedKeywords?.length ? result.suggestedKeywords : form.keywords,
      });
      toast.success('Draft generated! Review and save below.');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not generate content'),
  });

  const saveMutation = useMutation({
    mutationFn: (status) =>
      contentService.createContent({
        title: draft.title,
        body: draft.body,
        excerpt: draft.excerpt,
        type: form.contentType,
        tone: form.tone,
        targetAudience: form.targetAudience,
        keywords: draft.keywords,
        categoryId: categoryId || null,
        status,
        aiGenerated: true,
        aiPrompt: `topic: ${form.topic}; type: ${form.contentType}; tone: ${form.tone}; length: ${form.length}`,
      }),
    onSuccess: (content) => {
      toast.success('Content saved');
      navigate(`/content/${content.id}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not save content'),
  });

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleGenerate(e) {
    e.preventDefault();
    if (!form.topic.trim()) {
      toast.error('Enter a topic first');
      return;
    }
    generateMutation.mutate();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Content Generator</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Describe what you need and let AI draft it for you.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            <Input
              label="Topic"
              required
              placeholder="e.g. 5 benefits of remote work for small teams"
              value={form.topic}
              onChange={(e) => set('topic', e.target.value)}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Content type" options={CONTENT_TYPES} value={form.contentType} onChange={(e) => set('contentType', e.target.value)} />
              <Select label="Tone" options={CONTENT_TONES} value={form.tone} onChange={(e) => set('tone', e.target.value)} />
              <Select label="Length" options={CONTENT_LENGTHS} value={form.length} onChange={(e) => set('length', e.target.value)} />
              <Input
                label="Target audience"
                placeholder="e.g. startup founders"
                value={form.targetAudience}
                onChange={(e) => set('targetAudience', e.target.value)}
              />
            </div>
            <TagInput label="Keywords" value={form.keywords} onChange={(kw) => set('keywords', kw)} />
            <Button type="submit" loading={generateMutation.isPending} className="mt-2">
              <Sparkles className="h-4 w-4" /> Generate with AI
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          {generateMutation.isPending ? (
            <GenerationProgress />
          ) : !draft ? (
            <EmptyState
              icon={Sparkles}
              title="Your draft will appear here"
              description="Fill in the form and generate to see an editable preview."
            />
          ) : (
            <div className="flex flex-col gap-4">
              <Input label="Title" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
              <Input
                label="Excerpt"
                value={draft.excerpt}
                onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
              />
              <TextArea
                label="Body"
                rows={14}
                value={draft.body}
                onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              />
              <TagInput label="Keywords" value={draft.keywords} onChange={(kw) => setDraft((d) => ({ ...d, keywords: kw }))} />
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Category</span>
                  <button
                    type="button"
                    onClick={() => setCategoryModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                  >
                    <Plus className="h-3 w-3" /> New category
                  </button>
                </div>
                <Select
                  placeholder="No category"
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <Button variant="secondary" loading={saveMutation.isPending} onClick={() => saveMutation.mutate('DRAFT')}>
                  Save as draft
                </Button>
                <Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate('PUBLISHED')}>
                  Save & publish
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <CategoryManagerModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onCreated={(category) => {
          setCategoryId(category.id);
          setCategoryModalOpen(false);
        }}
      />
    </div>
  );
}
