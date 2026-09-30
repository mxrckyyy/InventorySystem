import { useState } from 'react';
import {
  Bell,
  BellRing,
  ChevronDown,
  Crosshair,
  ListFilter,
  TriangleAlert
} from 'lucide-react';

export default function LowStockBanner({
  products = [],
  highlightActive = false,
  onToggleHighlight,
  onLocate,
  onShowAll
}) {
  const [expanded, setExpanded] = useState(false);

  const critical = products.filter((product) => {
    const quantity = Number(product.quantity) || 0;
    const minLevel = Number(product.min_reorder_level) || 0;
    return quantity <= minLevel;
  });

  if (critical.length === 0) return null;

  const outOfStock = critical.filter(
    (product) => (Number(product.quantity) || 0) === 0
  ).length;

  const isCritical = outOfStock > 0;
  const visible = expanded ? critical : critical.slice(0, 6);
  const hidden = critical.length - visible.length;

  const expandBtnClass = expanded
    ? isCritical
      ? 'border-rose-400/60 bg-rose-500/20 text-rose-100 focus-visible:ring-rose-300'
      : 'border-amber-400/60 bg-amber-500/20 text-amber-100 focus-visible:ring-amber-300'
    : 'border-amber-500 bg-amber-500 text-slate-950 hover:bg-amber-400 focus-visible:ring-amber-400';

  return (
    <section
      className={`rounded-2xl border px-4 py-3.5 backdrop-blur ${
        isCritical
          ? 'border-rose-500/40 bg-rose-500/[0.08]'
          : 'border-amber-500/40 bg-amber-500/[0.08]'
      }`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
              isCritical
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
            }`}
          >
            <TriangleAlert size={18} className="animate-neon-pulse" />
          </div>

          <div className="min-w-0">
            <p
              className={`text-sm font-semibold ${
                isCritical ? 'text-rose-200' : 'text-amber-200'
              }`}
            >
              {critical.length} item{critical.length === 1 ? '' : 's'} at or below reorder
              level
              {outOfStock > 0 ? ` · ${outOfStock} out of stock` : ''}
            </p>

            {!expanded ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {visible.map((product) => {
                  const quantity = Number(product.quantity) || 0;
                  const minLevel = Number(product.min_reorder_level) || 0;
                  const dead = quantity === 0;

                  return (
                    <span
                      key={product.id}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${
                        dead
                          ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                          : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      <span className="font-medium">{product.name}</span>
                      <span className="opacity-70">
                        {quantity}/{minLevel}
                      </span>
                    </span>
                  );
                })}

                {hidden > 0 ? (
                  <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950/60 px-2.5 py-1 text-xs text-slate-400">
                    +{hidden} more
                  </span>
                ) : null}
              </div>
            ) : (
              <p className="mt-1 text-sm text-slate-300">
                Click any product below to jump to it in the inventory table.
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleHighlight}
            aria-pressed={highlightActive}
            className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
              highlightActive
                ? 'border-amber-400/60 bg-amber-500/20 text-amber-100 focus-visible:ring-amber-300'
                : 'border-slate-600 bg-slate-950/60 text-slate-200 hover:border-amber-500/50 hover:text-amber-200 focus-visible:ring-slate-400'
            }`}
          >
            {highlightActive ? <BellRing size={16} /> : <Bell size={16} />}
            {highlightActive ? 'Alerts Highlighting On' : 'Alert Manager'}
          </button>

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            aria-controls="low-stock-drawer"
            className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${expandBtnClass}`}
          >
            {expanded
              ? 'Hide Alerts'
              : `View ${critical.length} Alert${critical.length === 1 ? '' : 's'}`}
            <ChevronDown
              size={16}
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {expanded ? (
        <div id="low-stock-drawer" className="mt-3 border-t border-slate-800/80 pt-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold uppercase tracking-widest text-slate-300">
              Critical Products
            </span>
            <button
              type="button"
              onClick={onShowAll}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-950/60 px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:border-amber-500/50 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <ListFilter size={15} />
              Show all in table
            </button>
          </div>

          <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {critical.map((product) => {
              const quantity = Number(product.quantity) || 0;
              const minLevel = Number(product.min_reorder_level) || 0;
              const dead = quantity === 0;

              return (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => onLocate?.(product)}
                    className={`group flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition focus:outline-none focus-visible:ring-2 ${
                      dead
                        ? 'border-rose-500/30 bg-rose-500/[0.06] hover:border-rose-400/60 focus:ring-rose-400/40'
                        : 'border-amber-500/30 bg-amber-500/[0.06] hover:border-amber-400/60 focus:ring-amber-400/40'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-100">
                        {product.name}
                      </span>
                      <span className="block truncate font-mono text-sm text-slate-400">
                        {product.sku}
                        {product.category ? ` · ${product.category}` : ''}
                      </span>
                    </span>

                    <span className="flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                          dead
                            ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                            : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                        }`}
                      >
                        {quantity}/{minLevel}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          dead ? 'text-rose-300' : 'text-amber-300'
                        }`}
                      >
                        <Crosshair size={13} />
                        Jump
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
