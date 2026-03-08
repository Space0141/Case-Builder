import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import Timeline from "../components/Timeline";

const googleEnabled = import.meta.env.VITE_ENABLE_GOOGLE_EXPORT === "true";

export default function CaseDetailsPage() {
  const { id } = useParams();
  const [payload, setPayload] = useState(null);
  const [suspectForm, setSuspectForm] = useState({ fullName: "", alias: "", description: "", arrestStatus: "Not Arrested", notes: "" });
  const [chargeForm, setChargeForm] = useState({ suspectId: "", statuteCode: "", chargeTitle: "", statuteText: "", explanation: "" });

  const load = async () => {
    const { data } = await api.get(`/cases/${id}`);
    setPayload(data);
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!payload) return <div className="text-slate-400">Loading case...</div>;

  const addSuspect = async (e) => {
    e.preventDefault();
    await api.post(`/cases/${id}/suspects`, suspectForm);
    setSuspectForm({ fullName: "", alias: "", description: "", arrestStatus: "Not Arrested", notes: "" });
    load();
  };

  const addCharge = async (e) => {
    e.preventDefault();
    await api.post(`/cases/${id}/charges`, chargeForm);
    setChargeForm({ suspectId: "", statuteCode: "", chargeTitle: "", statuteText: "", explanation: "" });
    load();
  };

  const exportFile = async (kind) => {
    window.open(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}/exports/${id}/${kind}`, "_blank");
  };

  const exportGoogle = async () => {
    const { data } = await api.post(`/exports/${id}/google-doc`);
    window.open(data.link, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{payload.case.case_number} - {payload.case.case_title}</h1>
        <div className="flex gap-2">
          <button className="button-muted" onClick={() => exportFile("pdf")}>Export PDF</button>
          <button className="button-muted" onClick={() => exportFile("docx")}>Export DOCX</button>
          <button className="button-muted" onClick={() => exportFile("court-packet")}>Court Packet</button>
          {googleEnabled ? <button className="button-primary" onClick={exportGoogle}>Export Google Docs</button> : null}
        </div>
      </div>

      <div className="card p-4 grid md:grid-cols-4 gap-3 text-sm">
        <div><div className="text-slate-400">Incident Type</div>{payload.case.incident_type}</div>
        <div><div className="text-slate-400">Location</div>{payload.case.incident_location}</div>
        <div><div className="text-slate-400">Reporting Officer</div>{payload.case.reporting_officer}</div>
        <div><div className="text-slate-400">Status</div>{payload.case.case_status}</div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <form onSubmit={addSuspect} className="card p-4 grid gap-2">
          <h2 className="font-semibold">Add Suspect</h2>
          <input className="input" required placeholder="Full Name" value={suspectForm.fullName} onChange={(e) => setSuspectForm({ ...suspectForm, fullName: e.target.value })} />
          <input className="input" placeholder="Alias" value={suspectForm.alias} onChange={(e) => setSuspectForm({ ...suspectForm, alias: e.target.value })} />
          <input className="input" placeholder="Description" value={suspectForm.description} onChange={(e) => setSuspectForm({ ...suspectForm, description: e.target.value })} />
          <select className="input" value={suspectForm.arrestStatus} onChange={(e) => setSuspectForm({ ...suspectForm, arrestStatus: e.target.value })}>
            <option>Not Arrested</option><option>Arrested</option><option>At Large</option>
          </select>
          <textarea className="input" placeholder="Notes" value={suspectForm.notes} onChange={(e) => setSuspectForm({ ...suspectForm, notes: e.target.value })} />
          <button className="button-primary">Add Suspect</button>
        </form>

        <form onSubmit={addCharge} className="card p-4 grid gap-2">
          <h2 className="font-semibold">Add Charge</h2>
          <select className="input" required value={chargeForm.suspectId} onChange={(e) => setChargeForm({ ...chargeForm, suspectId: e.target.value })}>
            <option value="">Select suspect</option>
            {payload.suspects.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </select>
          <input className="input" required placeholder="Statute Code" value={chargeForm.statuteCode} onChange={(e) => setChargeForm({ ...chargeForm, statuteCode: e.target.value })} />
          <input className="input" required placeholder="Charge Title" value={chargeForm.chargeTitle} onChange={(e) => setChargeForm({ ...chargeForm, chargeTitle: e.target.value })} />
          <textarea className="input" placeholder="Statute Text" value={chargeForm.statuteText} onChange={(e) => setChargeForm({ ...chargeForm, statuteText: e.target.value })} />
          <textarea className="input" placeholder="Violation Explanation" value={chargeForm.explanation} onChange={(e) => setChargeForm({ ...chargeForm, explanation: e.target.value })} />
          <button className="button-primary">Add Charge</button>
        </form>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Suspects</h2>
          {payload.suspects.map((s) => (
            <div key={s.id} className="border-b border-slate-800 py-2 text-sm">
              <div className="font-medium">{s.full_name}</div>
              <div className="text-slate-400">{s.arrest_status}</div>
            </div>
          ))}
        </div>

        <div className="card p-4">
          <h2 className="font-semibold mb-2">Charges</h2>
          {payload.charges.map((c) => (
            <div key={c.id} className="border-b border-slate-800 py-2 text-sm">
              <div className="font-medium">{c.charge_title} ({c.statute_code})</div>
              <div className="text-slate-400">Suspect: {c.suspect_name}</div>
            </div>
          ))}
        </div>
      </div>

      <Timeline events={payload.timeline} />

      <Link className="button-primary inline-block" to={`/cases/${id}/report`}>Open Structured Report Editor</Link>
    </div>
  );
}
