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
      ? 'border-red-500/60 bg-red-500/20 text-red-400 focus-visible:ring-red-500'
      : 'border-amber-400/60 bg-amber-500/20 text-amber-100 focus-visible:ring-emerald-500'
    : 'border-[#00D06C] bg-[#00D06C] text-slate-950 hover:brightness-110 focus-visible:ring-emerald-500';

  return (
    <section
      className={`rounded-2xl border px-4 py-3.5 backdrop-blur ${
        isCritical
          ? 'border-red-500/40 bg-red-500/[0.08]'
          : 'border-amber-500/40 bg-amber-500/[0.08]'
      }`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
              isCritical
                ? 'border-red-500/40 bg-red-500/10 text-red-400'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
            }`}
          >
            <TriangleAlert size={18} className="animate-neon-pulse" />
          </div>

          <div className="min-w-0">
            <p
              className={`text-sm font-semibold ${
                isCritical ? 'text-red-400' : 'text-amber-200'
              }`}
            >
              {critical.length} item{critical.length === 1 ? '' : 's'} at or below reorder
              level
              {outOfStock > 0 ? ` Â· ${outOfStock} out of stock` : ''}
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
                          ? 'border-red-500/40 bg-red-500/10 text-red-400'
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
                  <span className="inline-flex items-center rounded-full border border-[#273544] bg-[#0F161E] px-2.5 py-1 text-xs text-slate-400">
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
                ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-400 focus-visible:ring-emerald-500'
                : 'border-[#273544] bg-[#0F161E] text-slate-300 hover:border-emerald-500/60 hover:text-emerald-400 focus-visible:ring-emerald-500'
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
        <div id="low-stock-drawer" className="mt-3 border-t border-[#1E293B] pt-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold uppercase tracking-widest text-slate-300">
              Critical Products
            </span>
            <button
              type="button"
              onClick={onShowAll}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[#273544] bg-[#0F161E] px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:border-emerald-500/60 hover:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
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
                        ? 'border-red-500/30 bg-red-500/[0.06] hover:border-red-500/60 focus:ring-red-400/40'
                        : 'border-amber-500/30 bg-amber-500/[0.06] hover:border-amber-400/60 focus:ring-amber-400/40'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-100">
                        {product.name}
                      </span>
                      <span className="block truncate font-mono text-sm text-slate-400">
                        {product.sku}
                        {product.category ? ` Â· ${product.category}` : ''}
                      </span>
                    </span>

                    <span className="flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                          dead
                            ? 'border-red-500/40 bg-red-500/10 text-red-400'
                            : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                        }`}
                      >
                        {quantity}/{minLevel}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          dead ? 'text-red-400' : 'text-amber-300'
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
