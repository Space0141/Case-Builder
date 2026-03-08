import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Shield, LayoutDashboard, FolderKanban, FileStack, Archive, Settings, Users } from "lucide-react";
import { api } from "../api/client";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/cases", label: "Cases", icon: FolderKanban },
  { to: "/evidence", label: "Evidence Locker", icon: Archive },
  { to: "/settings", label: "Settings", icon: Settings }
];

export default function Layout({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.post("/auth/logout");
    onLogout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr]">
      <aside className="border-r border-slate-800 bg-[#0a0f1c] p-4">
        <Link to="/dashboard" className="flex items-center gap-2 text-accent font-semibold text-lg mb-8">
          <Shield size={20} />
          <span>Case Builder RMS</span>
        </Link>

        <nav className="space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                  isActive ? "bg-accent text-slate-950 font-semibold" : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}

          {user?.role === "Admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                  isActive ? "bg-accent text-slate-950 font-semibold" : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              <Users size={16} />
              Admin Panel
            </NavLink>
          )}
        </nav>

        <div className="mt-10 card p-3 space-y-2 text-sm">
          <div className="font-semibold">{user?.username}</div>
          <div className="text-slate-400">Role: {user?.role}</div>
          <button onClick={handleLogout} className="button-muted w-full">
            Sign Out
          </button>
        </div>
      </aside>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
