import { Link, Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Button from '../common/Button';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">ContentNova</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Button as={Link} to="/register" variant="secondary" size="sm" className="hidden sm:inline-flex">
              Try now
            </Button>
            <Button as={Link} to="/login" variant="ghost" size="sm">
              Log in
            </Button>
            <Button as={Link} to="/register" variant="primary" size="sm">
              Sign up
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        © {new Date().getFullYear()} ContentNova. All rights reserved.
      </footer>
    </div>
  );
}
