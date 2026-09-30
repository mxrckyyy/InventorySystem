import {
  ChevronDown,
  Download,
  Filter,
  History,
  Plus,
  Search
} from 'lucide-react';

const QUICK_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'low', label: 'Low Stock' },
  { id: 'out', label: 'Out of Stock' }
];

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
  return (
    <section className="rounded-2xl border border-amber-500/20 bg-slate-900 p-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder="Search by name or SKU..."
              aria-label="Search products"
              className="min-h-[44px] w-full rounded-xl border border-slate-700 bg-slate-950/80 py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-400 outline-none transition focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/40"
            />
          </div>

          <div className="relative sm:w-56">
            <select
              value={selectedCategory}
              onChange={(event) => onCategoryChange?.(event.target.value)}
              aria-label="Filter by category"
              className="min-h-[44px] w-full appearance-none rounded-xl border border-slate-700 bg-slate-950/80 py-3 pl-4 pr-10 text-sm text-slate-100 outline-none transition focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/40"
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
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-800 pt-3 xl:border-l xl:border-t-0 xl:pl-4 xl:pt-0 2xl:flex-row 2xl:items-center">
          <div
            role="group"
            aria-label="Quick filters"
            className="flex flex-wrap items-center gap-2"
          >
            <span className="hidden items-center gap-1.5 pr-1 text-sm font-medium text-slate-400 sm:inline-flex">
              <Filter size={15} />
              Quick
            </span>

            {QUICK_FILTERS.map((filter) => {
              const active = quickFilter === filter.id;

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => onQuickFilterChange?.(filter.id)}
                  aria-pressed={active}
                  className={`inline-flex min-h-[44px] items-center rounded-xl border px-3.5 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                    active
                      ? 'border-amber-400/60 bg-amber-500/15 text-amber-200'
                      : 'border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-500 hover:text-slate-100'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}

            {typeof resultCount === 'number' ? (
              <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm font-medium text-slate-300">
                {resultCount} result{resultCount === 1 ? '' : 's'}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onAuditLogsClick}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-amber-500/50 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <History size={17} />
              Audit Logs
            </button>

            <button
              type="button"
              onClick={onExportClick}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-emerald-500/50 hover:text-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              <Download size={17} />
              Export Excel
            </button>

            <button
              type="button"
              onClick={onAddClick}
              disabled={!canWrite}
              title={canWrite ? undefined : 'Admin access required'}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-amber-500 bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 hover:shadow-[0_0_18px_rgba(251,191,36,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
            >
              <Plus size={17} strokeWidth={2.5} />
              Add Product
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
