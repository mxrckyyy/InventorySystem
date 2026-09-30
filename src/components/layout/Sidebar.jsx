import { useEffect } from 'react';
import {
  Box,
  ChartColumnBig,
  ChevronsLeft,
  ChevronsRight,
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

function NavButton({ item, active, badge, collapsed, onSelect }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
      className={`group relative flex min-h-[44px] w-full items-center gap-3 rounded-full py-2.5 text-left text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1015] ${
        collapsed ? 'justify-center px-0' : 'px-4'
      } ${
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

      {!collapsed ? (
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
      ) : null}

      {badge > 0 ? (
        <span
          className={`inline-flex items-center justify-center rounded-full border px-1.5 py-0.5 text-sm font-bold ${
            active
              ? 'border-black/30 bg-black/15 text-black'
              : 'border-emerald-500/60 bg-emerald-500/15 text-emerald-400'
          } ${collapsed ? 'absolute right-1 top-1 min-w-[1.25rem]' : 'min-w-[1.5rem]'}`}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function SidebarContent({
  view,
  alertCount,
  alertsActive,
  collapsed,
  onToggleCollapse,
  onNavigate,
  onOpenLogs
}) {
  const handleSelect = (item) => {
    if (item.id === 'logs') {
      onOpenLogs?.();
      return;
    }
    onNavigate?.(item.id);
  };

  return (
    <div className="flex h-full flex-col">
      <div
        className={`flex items-center gap-3 border-b border-[#1E293B] px-5 py-5 ${
          collapsed ? 'justify-center px-0' : ''
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/15 text-[#00D06C]">
          <Box size={22} strokeWidth={2.25} />
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">Inventory System</p>
            <p className="truncate text-sm text-slate-300">Stock control panel</p>
          </div>
        ) : null}
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
            collapsed={collapsed}
            onSelect={handleSelect}
          />
        ))}
      </nav>

      <div className="border-t border-[#1E293B] p-3">
        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[#273544] bg-[#0F161E] text-sm font-semibold text-slate-300 transition hover:border-emerald-500/60 hover:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            {!collapsed ? <span>Collapse</span> : null}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function Sidebar({
  view = 'table',
  alertCount = 0,
  alertsActive = false,
  collapsed = false,
  onToggleCollapse,
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
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-[#1E293B] bg-[#0d131a] transition-[width] duration-300 ease-out lg:block ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent
          view={view}
          alertCount={alertCount}
          alertsActive={alertsActive}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          onNavigate={onNavigate}
          onOpenLogs={onOpenLogs}
        />
      </aside>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
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

          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col border-r border-[#1E293B] bg-[#0d131a] shadow-2xl">
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
                collapsed={false}
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
