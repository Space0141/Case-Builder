export default function StatCard({ title, value, accent = "text-accent", subtitle }) {
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wide text-slate-400">{title}</div>
      <div className={`mt-2 text-3xl font-semibold ${accent}`}>{value}</div>
      {subtitle ? <div className="text-sm text-slate-500 mt-1">{subtitle}</div> : null}
    </div>
  );
}
