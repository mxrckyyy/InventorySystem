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

const inputClass =
  'min-h-[44px] w-full rounded-lg border border-[#273544] bg-[#0F161E] px-3 py-2 text-sm text-white placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';

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
    <section className="rounded-2xl border border-[#222E3A] bg-[#151D24] p-6">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Inventory</h2>
          <p className="text-sm text-slate-300">Manage your products and stock.</p>
        </div>
        {typeof resultCount === 'number' ? (
          <span className="rounded-full border border-[#273544] bg-[#0F161E] px-3 py-2 text-sm font-medium text-slate-300">
            {resultCount} result{resultCount === 1 ? '' : 's'}
          </span>
        ) : null}
      </div>

      <div className="relative mb-4">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder="Search product name, ID, or category..."
          aria-label="Search products"
          className={`${inputClass} pl-10 pr-4`}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-[#1E293B] pt-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative sm:w-56">
            <select
              value={selectedCategory}
              onChange={(event) => onCategoryChange?.(event.target.value)}
              aria-label="Filter by category"
              className={`${inputClass} appearance-none pl-4 pr-10`}
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
            <span className="hidden items-center gap-1.5 pr-1 text-sm font-medium text-slate-300 sm:inline-flex">
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
                  className={`inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    active
                      ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-400'
                      : 'border-[#273544] bg-[#0F161E] text-slate-300 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAuditLogsClick}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#273544] bg-[#0F161E] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-emerald-500/60 hover:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <History size={17} />
            Audit Logs
          </button>

          <button
            type="button"
            onClick={onExportClick}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#273544] bg-[#0F161E] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-emerald-500/60 hover:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Download size={17} />
            Export Excel
          </button>

          <button
            type="button"
            onClick={onAddClick}
            disabled={!canWrite}
            title={canWrite ? undefined : 'Admin access required'}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#00D06C] px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#151D24] disabled:cursor-not-allowed disabled:bg-[#1E293B] disabled:text-slate-500 disabled:brightness-100"
          >
            <Plus size={17} strokeWidth={2.5} />
            Add Product
          </button>
        </div>
      </div>
    </section>
  );
}
