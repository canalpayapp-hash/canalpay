export function KpiCard({
  label,
  value,
  badge,
  accent = 'default',
}: {
  label: string;
  value: string | number;
  badge?: string;
  accent?: 'default' | 'error' | 'success';
}) {
  const border =
    accent === 'error'
      ? 'hover:border-cp-error'
      : accent === 'success'
        ? 'hover:border-cp-success'
        : 'hover:border-cp-primary';

  return (
    <div
      className={`rounded-xl border border-cp-outline-variant bg-cp-surface-container-lowest p-6 shadow-[0_4px_20px_rgba(15,23,42,0.05)] transition-colors ${border}`}
    >
      {badge ? (
        <span className="mb-3 inline-block rounded-full bg-cp-secondary-container px-2 py-0.5 text-xs font-bold text-cp-primary">
          {badge}
        </span>
      ) : null}
      <p className="text-xs font-semibold uppercase tracking-wide text-cp-on-surface-variant">{label}</p>
      <p className="mt-2 text-2xl font-bold text-cp-primary">{value}</p>
    </div>
  );
}
