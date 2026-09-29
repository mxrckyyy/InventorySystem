import { Boxes, CircleDot, Eye, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Header({ productCount = 0 }) {
  const { user, role, logout } = useAuth();
  const isAdmin = role === 'Admin';

  return (
    <header className="flex flex-col gap-3 border-b border-slate-800/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.25)]">
          <Boxes size={22} strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-50 sm:text-2xl">
            Inventory Management System
          </h1>
          <p className="text-xs text-slate-500 sm:text-sm">
            Real-time stock control powered by Supabase
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
          <CircleDot size={12} className="animate-neon-pulse" />
          {productCount} item{productCount === 1 ? '' : 's'} synced
        </span>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
            isAdmin
              ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
              : 'border-slate-700 bg-slate-950/60 text-slate-400'
          }`}
        >
          {isAdmin ? <ShieldCheck size={12} /> : <Eye size={12} />}
          {role}
        </span>

        <span
          className="hidden max-w-[11rem] truncate rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-500 sm:inline-flex"
          title={user?.email || ''}
        >
          {user?.email}
        </span>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-rose-500/50 hover:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
        >
          <LogOut size={12} />
          Logout
        </button>
      </div>
    </header>
  );
}
