import Card from '../common/Card';

export default function StatCard({ label, value, icon: Icon, accent = 'text-brand-600 bg-brand-50 dark:bg-brand-900/30 dark:text-brand-400' }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      {Icon && (
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${accent}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      )}
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      </div>
    </Card>
  );
}
