import { useEffect } from 'react';
import {
  ChartColumnBig,
  ChevronRight,
  LayoutDashboard,
  Menu,
  ScrollText,
  TriangleAlert,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  {
    id: 'table',
    label: 'Dashboard',
    hint: 'Inventory table',
    icon: LayoutDashboard
  },
  {
    id: 'analytics',
    label: 'Analytics',
    hint: 'Charts & trends',
    icon: ChartColumnBig
  },
  {
    id: 'alerts',
    label: 'Low-Stock Alerts',
    hint: 'Reorder warnings',
    icon: TriangleAlert
  },
  {
    id: 'logs',
    label: 'Audit Logs',
    hint: 'Stock history',
    icon: ScrollText
  }
];

function NavButton({ item, active, badge, onSelect }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      aria-current={active ? 'page' : undefined}
      className={`group relative flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
        active
          ? 'bg-sky-500/15 text-sky-200'
          : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-50'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full transition ${
          active ? 'bg-sky-400' : 'bg-transparent group-hover:bg-slate-600'
        }`}
      />

      <Icon
        size={18}
        strokeWidth={2}
        className={active ? 'text-sky-300' : 'text-slate-400 group-hover:text-slate-200'}
      />

      <span className="min-w-0 flex-1">
        <span className="block truncate">{item.label}</span>
        <span
          className={`block truncate text-xs font-normal ${
            active ? 'text-sky-300/80' : 'text-slate-400'
          }`}
        >
          {item.hint}
        </span>
      </span>

      {badge > 0 ? (
        <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full border border-amber-400/50 bg-amber-500/15 px-1.5 py-0.5 text-xs font-bold text-amber-200">
          {badge}
        </span>
      ) : null}

      <ChevronRight
        size={16}
        className={active ? 'text-sky-300' : 'text-slate-500 opacity-0 transition group-hover:opacity-100'}
      />
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
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-300">
          <LayoutDashboard size={20} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-50">Inventory Console</p>
          <p className="truncate text-xs text-slate-400">Navigation</p>
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

      <div className="border-t border-slate-800 px-5 py-4 text-xs leading-relaxed text-slate-400">
        Use the sidebar to switch between the inventory table, analytics,
        low-stock alerts and the audit trail.
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

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-800 bg-slate-900/80 backdrop-blur lg:block">
        <SidebarContent
          view={view}
          alertCount={alertCount}
          alertsActive={alertsActive}
          onNavigate={onNavigate}
          onOpenLogs={onOpenLogs}
        />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={onMobileClose}
            className="absolute inset-0 h-full w-full cursor-pointer bg-slate-950/80 backdrop-blur-sm"
          />

          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col border-r border-slate-700 bg-slate-900 shadow-2xl">
            <button
              type="button"
              onClick={onMobileClose}
              aria-label="Close navigation menu"
              className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/70 text-slate-300 transition hover:border-slate-500 hover:text-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
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
          </div>
        </div>
      ) : null}
    </>
  );
}

export function SidebarMenuButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open navigation menu"
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 text-slate-300 transition hover:border-sky-500/50 hover:text-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 lg:hidden"
    >
      <Menu size={20} />
    </button>
  );
}
