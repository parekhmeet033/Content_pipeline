import { useState } from 'react';
import { Plus } from 'lucide-react';
import Input from '../common/Input';
import TextArea from '../common/TextArea';
import Select from '../common/Select';
import TagInput from '../common/TagInput';
import Button from '../common/Button';
import CategoryManagerModal from './CategoryManagerModal';
import { CONTENT_TYPES, CONTENT_TONES, CONTENT_STATUSES } from '../../constants';

export default function ContentForm({ initialValues, categories = [], onSubmit, submitting, submitLabel = 'Save' }) {
  const [values, setValues] = useState(() => ({
    title: '',
    body: '',
    excerpt: '',
    type: 'BLOG_POST',
    tone: 'PROFESSIONAL',
    targetAudience: '',
    keywords: [],
    categoryId: '',
    status: 'DRAFT',
    ...initialValues,
  }));
  const [errors, setErrors] = useState({});
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  function set(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!values.title.trim()) next.title = 'Title is required';
    if (!values.body.trim()) next.body = 'Content body is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...values, categoryId: values.categoryId || null });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <Input
        label="Title"
        required
        value={values.title}
        onChange={(e) => set('title', e.target.value)}
        error={errors.title}
        maxLength={300}
      />

      <TextArea
        label="Body"
        required
        rows={12}
        value={values.body}
        onChange={(e) => set('body', e.target.value)}
        error={errors.body}
        hint="Use '## ' at the start of a line for subheadings."
      />

      <Input
        label="Excerpt"
        value={values.excerpt || ''}
        onChange={(e) => set('excerpt', e.target.value)}
        hint="A short summary shown in listings (optional)"
        maxLength={500}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Content type" options={CONTENT_TYPES} value={values.type} onChange={(e) => set('type', e.target.value)} />
        <Select label="Tone" options={CONTENT_TONES} value={values.tone} onChange={(e) => set('tone', e.target.value)} />
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
            value={values.categoryId || ''}
            onChange={(e) => set('categoryId', e.target.value)}
          />
        </div>
        <Select label="Status" options={CONTENT_STATUSES} value={values.status} onChange={(e) => set('status', e.target.value)} />
      </div>

      <Input
        label="Target audience"
        value={values.targetAudience || ''}
        onChange={(e) => set('targetAudience', e.target.value)}
        placeholder="e.g. small business owners"
      />

      <TagInput label="Keywords" value={values.keywords || []} onChange={(kw) => set('keywords', kw)} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>

      <CategoryManagerModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onCreated={(category) => {
          set('categoryId', category.id);
          setCategoryModalOpen(false);
        }}
      />
    </form>
  );
}
