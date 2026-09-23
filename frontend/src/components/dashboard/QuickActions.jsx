import { Link } from 'react-router-dom';
import { Sparkles, Library, Settings } from 'lucide-react';
import Card from '../common/Card';

const ACTIONS = [
  { to: '/generate', label: 'Generate content', description: 'Create a new piece with AI', icon: Sparkles },
  { to: '/content', label: 'View library', description: 'Browse and manage your content', icon: Library },
  { to: '/settings', label: 'Settings', description: 'Customize your ContentNova experience', icon: Settings },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {ACTIONS.map(({ to, label, description, icon: Icon }) => (
        <Card key={to} as={Link} to={to} className="flex items-start gap-3 p-4 transition-shadow hover:shadow-md">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
