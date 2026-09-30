import { Boxes, CircleDot, Eye, LogOut, Menu, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Header({ productCount = 0, onToggleSidebar }) {
  const { user, role, logout } = useAuth();
  const isAdmin = role === 'Admin';

  return (
    <header className="flex flex-col gap-3 border-b border-[#1E293B] pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {onToggleSidebar ? (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            title="Open / close sidebar"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#273544] bg-[#0F161E] text-slate-300 transition hover:border-emerald-500 hover:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Menu size={20} />
          </button>
        ) : null}

        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/15 text-emerald-400">
          <Boxes size={22} strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Inventory Management System
          </h1>
          <p className="text-sm text-slate-300">
            Real-time stock control powered by Supabase
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400">
          <CircleDot size={14} className="animate-neon-pulse" />
          {productCount} item{productCount === 1 ? '' : 's'} synced
        </span>

        <span
          className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium ${
            isAdmin
              ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
              : 'border-[#273544] bg-[#151D24] text-slate-300'
          }`}
        >
          {isAdmin ? <ShieldCheck size={14} /> : <Eye size={14} />}
          {role}
        </span>

        <span
          className="hidden max-w-[12rem] truncate rounded-full border border-[#273544] bg-[#151D24] px-4 py-2 text-sm text-slate-300 sm:inline-flex"
          title={user?.email || ''}
        >
          {user?.email}
        </span>

        <button
          type="button"
          onClick={logout}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[#273544] bg-[#151D24] px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-red-500/60 hover:text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  );
}
