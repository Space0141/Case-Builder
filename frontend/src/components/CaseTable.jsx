import { Link } from "react-router-dom";

export default function CaseTable({ cases }) {
  return (
    <div className="card overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-900/80 text-slate-300">
          <tr>
            <th className="text-left p-3">Case #</th>
            <th className="text-left p-3">Title</th>
            <th className="text-left p-3">Officer</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Date</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((item) => (
            <tr key={item.id} className="border-t border-slate-800">
              <td className="p-3 font-mono text-xs">{item.case_number}</td>
              <td className="p-3">{item.case_title}</td>
              <td className="p-3">{item.reporting_officer}</td>
              <td className="p-3">{item.case_status}</td>
              <td className="p-3">{new Date(item.incident_datetime).toLocaleDateString()}</td>
              <td className="p-3">
                <Link className="text-accent hover:underline" to={`/cases/${item.id}`}>
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
