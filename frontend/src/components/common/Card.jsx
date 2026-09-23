import clsx from 'clsx';

export default function Card({ className, children, as: Component = 'div', ...props }) {
  return (
    <Component
      className={clsx(
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        'dark:border-slate-800 dark:bg-slate-900',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
