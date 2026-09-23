import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Plus, FileText, Tag } from 'lucide-react';
import * as contentService from '../api/contentService';
import * as categoryService from '../api/categoryService';
import ContentFilterBar from '../components/content/ContentFilterBar';
import ContentTable from '../components/content/ContentTable';
import CategoryManagerModal from '../components/content/CategoryManagerModal';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';

const LIMIT = 12;

export default function ContentLibraryPage() {
  const [filters, setFilters] = useState({ page: 1 });
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoryService.listCategories });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['content', 'library', filters],
    queryFn: () => contentService.listContent({ ...filters, limit: LIMIT }),
    placeholderData: keepPreviousData,
  });

  function handleFilterChange(patch) {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Content Library</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">All your content in one place.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setCategoriesOpen(true)}>
            <Tag className="h-4 w-4" /> Categories
          </Button>
          <Button as={Link} to="/generate">
            <Plus className="h-4 w-4" /> New content
          </Button>
        </div>
      </div>

      <CategoryManagerModal open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />

      <ContentFilterBar filters={filters} onChange={handleFilterChange} categories={categories} />

      {isLoading ? (
        <Spinner label="Loading content" />
      ) : isError ? (
        <EmptyState title="Something went wrong" description="Could not load your content. Please try again." />
      ) : !data?.items?.length ? (
        <EmptyState
          icon={FileText}
          title="No content found"
          description="Try adjusting your filters, or generate your first piece of content."
          action={
            <Button as={Link} to="/generate" size="sm">
              Generate content
            </Button>
          }
        />
      ) : (
        <>
          <ContentTable items={data.items} />
          <Pagination page={data.page} pageCount={data.pageCount} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />
        </>
      )}
    </div>
  );
}
