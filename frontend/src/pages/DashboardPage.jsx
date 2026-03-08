import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "../api/client";
import StatCard from "../components/StatCard";

const chartColors = ["#3cb4ff", "#f4b647", "#2adf93"];

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard/summary").then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="text-slate-400">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard title="Active Cases" value={data.totalActiveCases} />
        <StatCard title="Recent Updates" value={data.recentlyUpdatedCases.length} accent="text-warn" />
        <StatCard title="Evidence Uploads" value={data.evidenceUploads.length} accent="text-success" />
        <a href="/cases" className="card p-4 flex items-center justify-center button-primary text-center">
          Create / Open Case
        </a>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h2 className="font-semibold mb-3">Case Status Chart</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.caseStatistics} dataKey="total" nameKey="case_status" outerRadius={90}>
                  {data.caseStatistics.map((entry, idx) => (
                    <Cell key={entry.case_status} fill={chartColors[idx % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <h2 className="font-semibold mb-3">Case Activity Feed</h2>
          <div className="space-y-2">
            {data.recentlyUpdatedCases.map((item) => (
              <div key={item.id} className="border border-slate-800 rounded-md p-2 text-sm">
                <div className="font-medium">{item.case_number} - {item.case_title}</div>
                <div className="text-slate-400">{item.case_status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="font-semibold mb-3">Recent Evidence Uploads</h2>
        <ul className="space-y-2">
          {data.evidenceUploads.map((item) => (
            <li key={item.id} className="text-sm border-b border-slate-800 pb-2">
              {item.evidence_name} ({item.case_number})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
