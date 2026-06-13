const EmptyState = ({ title, body, action }) => (
  <div className="rounded-xl border border-border bg-card p-10 text-center shadow-soft">
    <p className="text-lg font-black text-ink">{title}</p>
    <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">{body}</p>
    {action && <div className="mt-6 flex justify-center">{action}</div>}
  </div>
);

export default EmptyState;
