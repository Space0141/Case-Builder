import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { getCurrentUser } from "./api/client";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CasesPage from "./pages/CasesPage";
import CaseDetailsPage from "./pages/CaseDetailsPage";
import EvidenceLockerPage from "./pages/EvidenceLockerPage";
import ReportEditorPage from "./pages/ReportEditorPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import SettingsPage from "./pages/SettingsPage";

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  if (user === undefined) {
    return <div className="p-8 text-slate-400">Loading Case Builder RMS...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage user={user} />} />
      <Route
        path="/"
        element={
          <ProtectedRoute user={user}>
            <Layout user={user} onLogout={() => setUser(null)} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="cases" element={<CasesPage user={user} />} />
        <Route path="cases/:id" element={<CaseDetailsPage />} />
        <Route path="cases/:id/report" element={<ReportEditorPage user={user} />} />
        <Route path="evidence" element={<EvidenceLockerPage />} />
        <Route
          path="admin"
          element={user?.role === "Admin" ? <AdminPanelPage /> : <Navigate to="/dashboard" replace />}
        />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}
