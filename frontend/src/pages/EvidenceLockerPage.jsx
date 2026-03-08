import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function EvidenceLockerPage() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState("");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ evidenceName: "", description: "", suspectId: "", file: null });

  useEffect(() => {
    api.get("/cases").then((res) => {
      setCases(res.data);
      if (res.data[0]) setSelectedCase(String(res.data[0].id));
    });
  }, []);

  useEffect(() => {
    if (!selectedCase) return;
    api.get(`/evidence/${selectedCase}`).then((res) => setItems(res.data));
  }, [selectedCase]);

  const upload = async (event) => {
    event.preventDefault();
    const payload = new FormData();
    payload.append("evidenceName", form.evidenceName);
    payload.append("description", form.description);
    payload.append("suspectId", form.suspectId);
    payload.append("file", form.file);

    await api.post(`/evidence/${selectedCase}/upload`, payload, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    setForm({ evidenceName: "", description: "", suspectId: "", file: null });
    const { data } = await api.get(`/evidence/${selectedCase}`);
    setItems(data);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Evidence Locker</h1>

      <div className="card p-4 grid md:grid-cols-2 gap-3 items-end">
        <div>
          <label className="text-sm text-slate-400">Case</label>
          <select className="input" value={selectedCase} onChange={(e) => setSelectedCase(e.target.value)}>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>{c.case_number} - {c.case_title}</option>
            ))}
          </select>
        </div>
        {selectedCase ? (
          <Link className="button-muted text-center" to={`/cases/${selectedCase}`}>
            Open Case Details
          </Link>
        ) : null}
      </div>

      <form onSubmit={upload} className="card p-4 grid md:grid-cols-2 gap-3">
        <h2 className="md:col-span-2 font-semibold">Upload Evidence</h2>
        <input className="input" required placeholder="Evidence Name" value={form.evidenceName} onChange={(e) => setForm({ ...form, evidenceName: e.target.value })} />
        <input className="input" placeholder="Linked Suspect ID (optional)" value={form.suspectId} onChange={(e) => setForm({ ...form, suspectId: e.target.value })} />
        <textarea className="input md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="input md:col-span-2" type="file" required onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} />
        <button className="button-primary">Upload</button>
      </form>

      <div className="card p-4">
        <h2 className="font-semibold mb-3">Evidence Viewer</h2>
        <div className="space-y-3">
          {items.map((item) => {
            const fileUrl = item.file_path.replace(/\\/g, "/").split("backend/")[1] || "";
            const src = `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:4000"}/${fileUrl}`;
            return (
              <div key={item.id} className="border border-slate-800 rounded-md p-3">
                <div className="font-medium">{item.evidence_name}</div>
                <div className="text-sm text-slate-400 mb-2">{item.description}</div>
                {item.file_type.startsWith("image/") ? (
                  <img src={src} alt={item.evidence_name} className="max-h-60 rounded" />
                ) : (
                  <a className="text-accent hover:underline" href={src} target="_blank">Open File</a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
