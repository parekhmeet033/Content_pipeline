import { Check, X } from 'lucide-react';
import clsx from 'clsx';

export default function Toggle({ label, description, checked, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</p>
        {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative inline-flex h-7 w-[3.25rem] flex-shrink-0 items-center rounded-full border-2 border-transparent',
          'shadow-inner transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
          'disabled:cursor-not-allowed disabled:opacity-60',
          checked ? 'bg-brand-600 hover:bg-brand-700' : 'bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600'
        )}
      >
        <span
          className={clsx(
            'flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md ring-0',
            'transition-transform duration-200 ease-in-out',
            checked ? 'translate-x-[1.65rem]' : 'translate-x-0'
          )}
        >
          {checked ? (
            <Check className="h-3.5 w-3.5 text-brand-600" strokeWidth={3} aria-hidden="true" />
          ) : (
            <X className="h-3.5 w-3.5 text-slate-400" strokeWidth={3} aria-hidden="true" />
          )}
        </span>
      </button>
    </div>
  );
}
