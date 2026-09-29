import { Bell, BellRing, TriangleAlert } from 'lucide-react';

export default function LowStockBanner({
  products = [],
  highlightActive = false,
  onToggleHighlight
}) {
  const critical = products.filter((product) => {
    const quantity = Number(product.quantity) || 0;
    const minLevel = Number(product.min_reorder_level) || 0;
    return quantity <= minLevel;
  });

  if (critical.length === 0) return null;

  const outOfStock = critical.filter(
    (product) => (Number(product.quantity) || 0) === 0
  ).length;

  const visible = critical.slice(0, 6);
  const hidden = critical.length - visible.length;
  const isCritical = outOfStock > 0;

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

            <div className="mt-2 flex flex-wrap gap-1.5">
              {visible.map((product) => {
                const quantity = Number(product.quantity) || 0;
                const minLevel = Number(product.min_reorder_level) || 0;
                const dead = quantity === 0;

                return (
                  <span
                    key={product.id}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
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
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleHighlight}
          aria-pressed={highlightActive}
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 ${
            highlightActive
              ? 'border-amber-400/60 bg-amber-500/20 text-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.3)] focus:ring-amber-400/50'
              : 'border-slate-700 bg-slate-950/60 text-slate-300 hover:border-amber-500/50 hover:text-amber-300 focus:ring-slate-500'
          }`}
        >
          {highlightActive ? <BellRing size={16} /> : <Bell size={16} />}
          {highlightActive ? 'Alerts Highlighting On' : 'Alert Manager'}
        </button>
      </div>
    </section>
  );
}
