import { Navigate } from "react-router-dom";

export default function LoginPage({ user }) {
  if (user) return <Navigate to="/dashboard" replace />;

  const discordLoginUrl = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}/auth/discord`;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#070b16] via-[#0e1528] to-[#152845]">
      <div className="card w-full max-w-md p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Case Builder</h1>
        <p className="text-slate-400 mb-6">Law Enforcement Case Management and Report System</p>
        <a href={discordLoginUrl} className="button-primary inline-block w-full">
          Login with Discord
        </a>
      </div>
    </div>
  );
}
