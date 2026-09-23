import { forwardRef, useId } from 'react';
import clsx from 'clsx';

const TextArea = forwardRef(function TextArea(
  { label, error, hint, className, containerClassName, id, required, rows = 6, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
          {required && <span className="text-rose-500"> *</span>}
        </label>
      )}
      <textarea
        id={inputId}
        ref={ref}
        rows={rows}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={clsx(errorId, hintId) || undefined}
        className={clsx(
          'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
          'dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500',
          error ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700',
          className
        )}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
});

export default TextArea;
