import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import RichTextSection from "../components/RichTextSection";

const sectionLabels = {
  incident_overview: "Incident Overview",
  dispatch_call_information: "Dispatch / Call Information",
  suspect_information: "Suspect Information",
  victim_information: "Victim Information",
  witness_statements: "Witness Statements",
  evidence_collected: "Evidence Collected",
  probable_cause: "Probable Cause",
  charges: "Charges",
  officer_narrative: "Officer Narrative",
  use_of_force: "Use of Force",
  arrest_details: "Arrest Details"
};

export default function ReportEditorPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState("Loading...");
  const timeoutRef = useRef(null);

  useEffect(() => {
    api.get(`/reports/${id}`).then((res) => setReport(res.data));
  }, [id]);

  const sectionKeys = useMemo(() => Object.keys(sectionLabels), []);

  const queueAutosave = (next) => {
    setReport(next);
    setStatus("Saving...");
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      await api.put(`/reports/${id}`, next);
      setStatus(`Saved at ${new Date().toLocaleTimeString()}`);
    }, 800);
  };

  if (!report) return <div className="text-slate-400">Loading report editor...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Structured Report Editor</h1>
        <span className="text-sm text-slate-400">{status}</span>
      </div>

      {sectionKeys.map((key) => (
        <RichTextSection
          key={key}
          label={sectionLabels[key]}
          value={report[key]}
          onChange={(html) => queueAutosave({ ...report, [key]: html })}
        />
      ))}
    </div>
  );
}
