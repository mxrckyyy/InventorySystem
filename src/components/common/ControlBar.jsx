import { ChevronDown, Download, History, Plus, Search } from 'lucide-react';

const QUICK_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'low', label: 'Low Stock' },
  { id: 'out', label: 'Out of Stock' }
];

const controlClass =
  'h-10 rounded-lg border border-[#273544] bg-[#0F161E] px-3 text-sm text-white placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';

export default function ControlBar({
  searchTerm = '',
  onSearchChange,
  categories = [],
  selectedCategory = 'all',
  onCategoryChange,
  onAddClick,
  onExportClick,
  onAuditLogsClick,
  quickFilter = 'all',
  onQuickFilterChange,
  resultCount,
  canWrite = true
}) {
  const secondaryBtn =
    'inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#273544] bg-[#0F161E] px-4 text-sm font-semibold text-slate-200 transition hover:border-emerald-500/60 hover:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500';

  return (
    <section className="rounded-2xl border border-[#222E3A] bg-[#151D24] p-6">
      <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-white">Inventory</h2>
        <p className="text-sm text-slate-300">Manage your products and stock.</p>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-[240px] flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder="Search products by name, SKU..."
              aria-label="Search products"
              className={`${controlClass} w-full pl-9 pr-4`}
            />
          </div>

          <div className="relative sm:w-44">
            <select
              value={selectedCategory}
              onChange={(event) => onCategoryChange?.(event.target.value)}
              aria-label="Filter by category"
              className={`${controlClass} w-full appearance-none pl-3 pr-9`}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          <div
            role="group"
            aria-label="Quick filters"
            className="flex flex-wrap items-center gap-2"
          >
            {QUICK_FILTERS.map((filter) => {
              const active = quickFilter === filter.id;

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => onQuickFilterChange?.(filter.id)}
                  aria-pressed={active}
                  className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    active
                      ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-400'
                      : 'border-[#273544] bg-[#0F161E] text-slate-300 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}

            {typeof resultCount === 'number' ? (
              <span className="pl-1 text-sm text-slate-400">
                {resultCount} result{resultCount === 1 ? '' : 's'}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <button type="button" onClick={onAuditLogsClick} className={secondaryBtn}>
            <History size={16} />
            Audit Logs
          </button>

          <button type="button" onClick={onExportClick} className={secondaryBtn}>
            <Download size={16} />
            Export Excel
          </button>

          <button
            type="button"
            onClick={onAddClick}
            disabled={!canWrite}
            title={canWrite ? undefined : 'Admin access required'}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#00D06C] px-4 text-sm font-bold text-slate-950 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#151D24] disabled:cursor-not-allowed disabled:bg-[#1E293B] disabled:text-slate-500 disabled:brightness-100"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Product
          </button>
        </div>
      </div>
    </section>
  );
}
