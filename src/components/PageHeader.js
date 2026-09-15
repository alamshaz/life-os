export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-8 gap-4">
      <div>
        <h1 className="font-display text-3xl">{title}</h1>
        {subtitle && <p className="text-ink-soft text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
