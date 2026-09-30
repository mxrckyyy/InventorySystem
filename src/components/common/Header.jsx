import { Boxes, CircleDot, Eye, LogOut, Menu, PanelLeftClose, PanelLeftOpen, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Header({
  productCount = 0,
  sidebarCollapsed = false,
  onToggleSidebar
}) {
  const { user, role, logout } = useAuth();
  const isAdmin = role === 'Admin';

  return (
    <header className="flex flex-col gap-3 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {onToggleSidebar ? (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Open navigation menu'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar / menu'}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-amber-500/60 hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <span className="lg:hidden">
              <Menu size={20} />
            </span>
            <span className="hidden lg:inline">
              {sidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </span>
          </button>
        ) : null}

        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/15 text-amber-400">
          <Boxes size={22} strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-50 sm:text-2xl">
            Inventory Management System
          </h1>
          <p className="text-sm text-slate-400">
            Real-time stock control powered by Supabase
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
          <CircleDot size={14} className="animate-neon-pulse" />
          {productCount} item{productCount === 1 ? '' : 's'} synced
        </span>

        <span
          className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium ${
            isAdmin
              ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
              : 'border-slate-600 bg-slate-900 text-slate-300'
          }`}
        >
          {isAdmin ? <ShieldCheck size={14} /> : <Eye size={14} />}
          {role}
        </span>

        <span
          className="hidden max-w-[12rem] truncate rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 sm:inline-flex"
          title={user?.email || ''}
        >
          {user?.email}
        </span>

        <button
          type="button"
          onClick={logout}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-slate-600 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-rose-400/60 hover:text-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  );
}
