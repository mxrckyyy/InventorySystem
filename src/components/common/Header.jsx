import { Boxes, CircleDot, Eye, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { SidebarMenuButton } from '../layout/Sidebar.jsx';

export default function Header({ productCount = 0, onMenuClick }) {
  const { user, role, logout } = useAuth();
  const isAdmin = role === 'Admin';

  return (
    <header className="flex flex-col gap-3 border-b border-slate-800/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {onMenuClick ? <SidebarMenuButton onClick={onMenuClick} /> : null}

        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-300">
          <Boxes size={22} strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-50 sm:text-2xl">
            Inventory Management System
          </h1>
          <p className="text-sm text-slate-300">
            Real-time stock control powered by Supabase
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200">
          <CircleDot size={14} className="animate-neon-pulse" />
          {productCount} item{productCount === 1 ? '' : 's'} synced
        </span>

        <span
          className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium ${
            isAdmin
              ? 'border-sky-500/40 bg-sky-500/10 text-sky-200'
              : 'border-slate-600 bg-slate-900/70 text-slate-200'
          }`}
        >
          {isAdmin ? <ShieldCheck size={14} /> : <Eye size={14} />}
          {role}
        </span>

        <span
          className="hidden max-w-[12rem] truncate rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-300 sm:inline-flex"
          title={user?.email || ''}
        >
          {user?.email}
        </span>

        <button
          type="button"
          onClick={logout}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-slate-600 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-rose-400/60 hover:text-rose-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  );
}
