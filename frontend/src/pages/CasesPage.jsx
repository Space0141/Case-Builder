import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import CaseTable from "../components/CaseTable";

const initialFilters = {
  caseNumber: "",
  officer: "",
  suspectName: "",
  date: "",
  status: ""
};

export default function CasesPage({ user }) {
  const [cases, setCases] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [form, setForm] = useState({
    caseTitle: "",
    incidentType: "",
    incidentLocation: "",
    incidentDatetime: "",
    reportingOfficer: user?.username || "",
    unitsInvolved: "",
    caseStatus: "Open"
  });

  const load = async () => {
    const { data } = await api.get("/cases", { params: filters });
    setCases(data);
  };

  useEffect(() => {
    load();
  }, []);

  const createCase = async (event) => {
    event.preventDefault();
    await api.post("/cases", form);
    setForm({ ...form, caseTitle: "", incidentType: "", incidentLocation: "", incidentDatetime: "" });
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Cases</h1>

      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="card p-4 grid md:grid-cols-5 gap-3">
        <input className="input" placeholder="Case number" value={filters.caseNumber} onChange={(e) => setFilters({ ...filters, caseNumber: e.target.value })} />
        <input className="input" placeholder="Officer" value={filters.officer} onChange={(e) => setFilters({ ...filters, officer: e.target.value })} />
        <input className="input" placeholder="Suspect" value={filters.suspectName} onChange={(e) => setFilters({ ...filters, suspectName: e.target.value })} />
        <input className="input" type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
        <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Under Investigation">Under Investigation</option>
          <option value="Closed">Closed</option>
        </select>
        <button className="button-primary md:col-span-5">Search Cases</button>
      </form>

      <CaseTable cases={cases} />

      <form onSubmit={createCase} className="card p-4 grid md:grid-cols-2 gap-3">
        <h2 className="md:col-span-2 font-semibold">Create New Case</h2>
        <input className="input" placeholder="Case Title" required value={form.caseTitle} onChange={(e) => setForm({ ...form, caseTitle: e.target.value })} />
        <input className="input" placeholder="Incident Type" required value={form.incidentType} onChange={(e) => setForm({ ...form, incidentType: e.target.value })} />
        <input className="input" placeholder="Incident Location" required value={form.incidentLocation} onChange={(e) => setForm({ ...form, incidentLocation: e.target.value })} />
        <input className="input" type="datetime-local" required value={form.incidentDatetime} onChange={(e) => setForm({ ...form, incidentDatetime: e.target.value })} />
        <input className="input" placeholder="Reporting Officer" value={form.reportingOfficer} onChange={(e) => setForm({ ...form, reportingOfficer: e.target.value })} />
        <input className="input" placeholder="Units Involved" value={form.unitsInvolved} onChange={(e) => setForm({ ...form, unitsInvolved: e.target.value })} />
        <select className="input" value={form.caseStatus} onChange={(e) => setForm({ ...form, caseStatus: e.target.value })}>
          <option>Open</option>
          <option>Under Investigation</option>
          <option>Closed</option>
        </select>
        <button className="button-primary">Create Case</button>
      </form>

      <Link to="/evidence" className="text-accent text-sm hover:underline">Go to Evidence Locker</Link>
    </div>
  );
}
