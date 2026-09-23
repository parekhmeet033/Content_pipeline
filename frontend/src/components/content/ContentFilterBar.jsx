import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import { useDebounce } from '../../hooks/useDebounce';
import { CONTENT_STATUSES, CONTENT_TYPES } from '../../constants';

export default function ContentFilterBar({ filters, onChange, categories = [] }) {
  const [search, setSearch] = useState(filters.search || '');
  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    onChange({ search: debouncedSearch || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
      <div className="flex-1">
        <Input
          label="Search"
          placeholder="Search by title, body, or keyword"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          containerClassName="relative"
        />
        <Search className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-slate-400" aria-hidden="true" />
      </div>
      <Select
        label="Status"
        placeholder="All statuses"
        options={CONTENT_STATUSES}
        value={filters.status || ''}
        onChange={(e) => onChange({ status: e.target.value || undefined })}
      />
      <Select
        label="Type"
        placeholder="All types"
        options={CONTENT_TYPES}
        value={filters.type || ''}
        onChange={(e) => onChange({ type: e.target.value || undefined })}
      />
      <Select
        label="Category"
        placeholder="All categories"
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
        value={filters.categoryId || ''}
        onChange={(e) => onChange({ categoryId: e.target.value || undefined })}
      />
    </div>
  );
}
