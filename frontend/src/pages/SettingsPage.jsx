const googleEnabled = import.meta.env.VITE_ENABLE_GOOGLE_EXPORT === "true";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="card p-4 space-y-3">
        <h2 className="font-semibold">Google Docs Export</h2>
        {googleEnabled ? (
          <p className="text-sm text-slate-400">Google Docs export is enabled. Configure OAuth in backend env.</p>
        ) : (
          <p className="text-sm text-slate-400">Google Docs export is disabled for this deployment.</p>
        )}
      </div>
    </div>
  );
}
