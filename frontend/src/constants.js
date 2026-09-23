export const CONTENT_TYPES = [
  { value: 'BLOG_POST', label: 'Blog Post' },
  { value: 'SOCIAL_MEDIA', label: 'Social Media' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'AD_COPY', label: 'Ad Copy' },
  { value: 'PRODUCT_DESCRIPTION', label: 'Product Description' },
  { value: 'PRESS_RELEASE', label: 'Press Release' },
  { value: 'NEWSLETTER', label: 'Newsletter' },
  { value: 'VIDEO_SCRIPT', label: 'Video Script' },
  { value: 'OTHER', label: 'Other' },
];

export const CONTENT_TONES = [
  { value: 'PROFESSIONAL', label: 'Professional' },
  { value: 'CASUAL', label: 'Casual' },
  { value: 'FRIENDLY', label: 'Friendly' },
  { value: 'PERSUASIVE', label: 'Persuasive' },
  { value: 'INFORMATIVE', label: 'Informative' },
  { value: 'HUMOROUS', label: 'Humorous' },
  { value: 'AUTHORITATIVE', label: 'Authoritative' },
  { value: 'ENTHUSIASTIC', label: 'Enthusiastic' },
];

export const CONTENT_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export const CONTENT_LENGTHS = [
  { value: 'SHORT', label: 'Short (150-300 words)' },
  { value: 'MEDIUM', label: 'Medium (400-700 words)' },
  { value: 'LONG', label: 'Long (900-1300 words)' },
];

export const STATUS_COLORS = {
  DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  SCHEDULED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  PUBLISHED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  ARCHIVED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

// Hex equivalents of STATUS_COLORS for inline SVG charts, which can't use Tailwind classes.
export const STATUS_COLORS_HEX = {
  DRAFT: '#94a3b8',
  SCHEDULED: '#f59e0b',
  PUBLISHED: '#10b981',
  ARCHIVED: '#f43f5e',
};

export function labelFor(list, value) {
  return list.find((item) => item.value === value)?.label || value;
}
