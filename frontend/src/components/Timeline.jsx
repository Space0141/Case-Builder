export default function Timeline({ events }) {
  return (
    <div className="card p-4">
      <h3 className="font-semibold mb-3">Case Timeline</h3>
      <ol className="space-y-3">
        {events.map((event) => (
          <li key={event.id} className="border-l-2 border-accent pl-3">
            <div className="text-sm font-medium">{event.event_type}</div>
            <div className="text-xs text-slate-400">{event.details}</div>
            <div className="text-xs text-slate-500">{new Date(event.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
