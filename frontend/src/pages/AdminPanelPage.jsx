import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function AdminPanelPage() {
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({});

  const load = async () => {
    const [usersResp, settingsResp] = await Promise.all([api.get("/admin/users"), api.get("/admin/settings")]);
    setUsers(usersResp.data);
    const map = {};
    settingsResp.data.forEach((s) => {
      map[s.key] = s.value;
    });
    setSettings(map);
  };

  useEffect(() => {
    load();
  }, []);

  const setRole = async (userId, role) => {
    await api.put(`/admin/users/${userId}/role`, { role });
    load();
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    await api.put("/admin/settings", settings);
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Panel</h1>

      <div className="card p-4 overflow-auto">
        <h2 className="font-semibold mb-3">User Management</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400">
              <th className="p-2">Username</th>
              <th className="p-2">Discord ID</th>
              <th className="p-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-800">
                <td className="p-2">{u.username}</td>
                <td className="p-2 font-mono text-xs">{u.discord_id}</td>
                <td className="p-2">
                  <select className="input" value={u.role} onChange={(e) => setRole(u.id, e.target.value)}>
                    <option>Admin</option>
                    <option>Supervisor</option>
                    <option>Officer</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={saveSettings} className="card p-4 grid md:grid-cols-3 gap-3">
        <h2 className="md:col-span-3 font-semibold">System Settings</h2>
        <input className="input" placeholder="Department Name" value={settings.department_name || ""} onChange={(e) => setSettings({ ...settings, department_name: e.target.value })} />
        <input className="input" placeholder="Default Timezone" value={settings.default_timezone || ""} onChange={(e) => setSettings({ ...settings, default_timezone: e.target.value })} />
        <input className="input" placeholder="Retention Days" value={settings.retention_policy_days || ""} onChange={(e) => setSettings({ ...settings, retention_policy_days: e.target.value })} />
        <button className="button-primary">Save Settings</button>
      </form>
    </div>
  );
}
