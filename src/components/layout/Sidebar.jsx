import { useEffect } from 'react';
import {
  Box,
  ChartColumnBig,
  LayoutDashboard,
  ScrollText,
  TriangleAlert,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'table', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: ChartColumnBig },
  { id: 'alerts', label: 'Low-Stock Alerts', icon: TriangleAlert },
  { id: 'logs', label: 'Audit Logs', icon: ScrollText }
];

function NavButton({ item, active, badge, onSelect }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      aria-current={active ? 'page' : undefined}
      className={`group relative flex min-h-[44px] w-full items-center gap-3 rounded-full px-4 py-2.5 text-left text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D131A] ${
        active
          ? 'bg-[#00D06C] text-black'
          : 'text-slate-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon
        size={19}
        strokeWidth={2}
        className={`shrink-0 ${active ? 'text-black' : 'text-slate-400 group-hover:text-white'}`}
      />

      <span className="min-w-0 flex-1 truncate">{item.label}</span>

      {badge > 0 ? (
        <span
          className={`inline-flex items-center justify-center rounded-full border px-1.5 py-0.5 text-sm font-bold ${
            active
              ? 'border-black/30 bg-black/15 text-black'
              : 'border-emerald-500/60 bg-emerald-500/15 text-emerald-400'
          } min-w-[1.5rem]`}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function SidebarContent({ view, alertCount, alertsActive, onNavigate, onOpenLogs }) {
  const handleSelect = (item) => {
    if (item.id === 'logs') {
      onOpenLogs?.();
      return;
    }
    onNavigate?.(item.id);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-[#222E3A] px-5 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/15 text-[#00D06C]">
          <Box size={22} strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">Inventory System</p>
          <p className="truncate text-sm text-slate-300">Stock control panel</p>
        </div>
      </div>

      <nav aria-label="Primary" className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={
              item.id === view || (item.id === 'alerts' && alertsActive && view === 'table')
            }
            badge={item.id === 'alerts' ? alertCount : 0}
            onSelect={handleSelect}
          />
        ))}
      </nav>

      <div className="border-t border-[#222E3A] px-5 py-4 text-sm text-slate-400">
        React + Vite + Supabase
      </div>
    </div>
  );
}

export default function Sidebar({
  view = 'table',
  alertCount = 0,
  alertsActive = false,
  onNavigate,
  onOpenLogs,
  mobileOpen = false,
  onMobileClose
}) {
  useEffect(() => {
    if (!mobileOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onMobileClose?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    const previousOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen, onMobileClose]);

  if (!mobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onMobileClose}
        className="absolute inset-0 h-full w-full cursor-pointer bg-black/70 backdrop-blur-sm"
      />

      <aside className="fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85%] animate-slide-in-left flex-col border-r border-[#222E3A] bg-[#0D131A] shadow-2xl">
        <button
          type="button"
          onClick={onMobileClose}
          aria-label="Close navigation menu"
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-lg border border-[#273544] bg-[#0F161E] text-slate-300 transition hover:border-emerald-500/60 hover:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <X size={18} />
        </button>

        <div className="h-full overflow-hidden">
          <SidebarContent
            view={view}
            alertCount={alertCount}
            alertsActive={alertsActive}
            onNavigate={(id) => {
              onNavigate?.(id);
              onMobileClose?.();
            }}
            onOpenLogs={() => {
              onOpenLogs?.();
              onMobileClose?.();
            }}
          />
        </div>
      </aside>
    </div>
  );
}
