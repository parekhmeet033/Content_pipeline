import clsx from 'clsx';

function initialsFor(firstName, lastName) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
}

export default function Avatar({ src, firstName, lastName, size = 'md', className }) {
  const dimension = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-lg' }[size];

  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName || ''} ${lastName || ''}`.trim() || 'Avatar'}
        className={clsx('rounded-full object-cover', dimension, className)}
      />
    );
  }

  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-full bg-brand-600 font-semibold text-white',
        dimension,
        className
      )}
      aria-hidden="true"
    >
      {initialsFor(firstName, lastName)}
    </div>
  );
}
