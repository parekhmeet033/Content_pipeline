import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Trash2, Tag } from 'lucide-react';
import * as categoryService from '../../api/categoryService';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import Spinner from '../common/Spinner';

const DEFAULT_COLOR = '#6366F1';

export default function CategoryManagerModal({ open, onClose, onCreated }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', color: DEFAULT_COLOR });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.listCategories,
    enabled: open,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories'] });

  const createMutation = useMutation({
    mutationFn: () => categoryService.createCategory(form),
    onSuccess: (category) => {
      setForm({ name: '', color: DEFAULT_COLOR });
      invalidate();
      toast.success('Category created');
      onCreated?.(category);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not create category'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryService.deleteCategory(id),
    onSuccess: () => {
      invalidate();
      toast.success('Category deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not delete category'),
  });

  function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    createMutation.mutate();
  }

  return (
    <Modal open={open} onClose={onClose} title="Manage categories" size="md">
      <form onSubmit={handleCreate} className="flex items-end gap-3">
        <Input
          label="New category"
          placeholder="e.g. Marketing"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          containerClassName="flex-1"
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category-color" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Color
          </label>
          <input
            id="category-color"
            type="color"
            value={form.color}
            onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
            className="h-9 w-12 cursor-pointer rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <Button type="submit" loading={createMutation.isPending}>
          Add
        </Button>
      </form>

      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
        {isLoading ? (
          <Spinner label="Loading categories" />
        ) : !categories.length ? (
          <EmptyState icon={Tag} title="No categories yet" description="Create one above to start organizing your content." />
        ) : (
          <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center justify-between py-2.5">
                <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    · {cat._count?.contents ?? 0} item{cat._count?.contents === 1 ? '' : 's'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(cat.id)}
                  aria-label={`Delete ${cat.name}`}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
