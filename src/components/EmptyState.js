export default function EmptyState({ title, detail }) {
  return (
    <div className="border border-dashed border-line rounded p-8 text-center">
      <p className="text-sm font-medium mb-1">{title}</p>
      {detail && <p className="text-sm text-ink-soft">{detail}</p>}
    </div>
  );
}
