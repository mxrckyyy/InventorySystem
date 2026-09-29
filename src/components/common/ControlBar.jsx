import { ChevronDown, Download, Plus, Search } from 'lucide-react';

export default function ControlBar({
  searchTerm = '',
  onSearchChange,
  categories = [],
  selectedCategory = 'all',
  onCategoryChange,
  onAddClick,
  onExportClick,
  canWrite = true
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="Search by name or SKU..."
            aria-label="Search products"
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        <div className="relative sm:w-56">
          <select
            value={selectedCategory}
            onChange={(event) => onCategoryChange?.(event.target.value)}
            aria-label="Filter by category"
            className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-4 pr-10 text-sm text-slate-100 outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
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
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:shrink-0">
        <button
          type="button"
          onClick={onExportClick}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          <Download size={18} strokeWidth={2} />
          Export CSV
        </button>

        <button
          type="button"
          onClick={onAddClick}
          disabled={!canWrite}
          title={canWrite ? undefined : 'Admin access required'}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/25 hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-900 disabled:text-slate-600 disabled:shadow-none"
        >
          <Plus size={18} strokeWidth={2.5} />
          Add Product
        </button>
      </div>
    </section>
  );
}
