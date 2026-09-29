import { History, Minus, Package, Pencil, Plus, Trash2, TriangleAlert } from 'lucide-react';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

function getStatus(quantity, minReorderLevel) {
  if (quantity === 0) {
    return {
      label: 'Out of Stock',
      badge: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
      dot: 'bg-rose-400'
    };
  }

  if (quantity <= minReorderLevel) {
    return {
      label: 'Low Stock',
      badge: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      dot: 'bg-amber-400'
    };
  }

  return {
    label: 'In Stock',
    badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    dot: 'bg-emerald-400'
  };
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16 text-slate-500">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
      <span className="ml-3 text-sm">Loading inventory...</span>
    </div>
  );
}

export default function ProductTable({
  products = [],
  loading = false,
  canWrite = true,
  highlightAlerts = false,
  onEdit,
  onDelete,
  onAdjust,
  onViewLogs
}) {
  const actionBtn =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-950/60 text-slate-400 transition hover:border-slate-500 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-40';

  const writeDisabledTitle = canWrite ? undefined : 'Admin access required';

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          Product Catalogue
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewLogs?.(null)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs font-medium text-slate-400 transition hover:border-cyan-500/50 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            <History size={13} />
            All Logs
          </button>
          <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2.5 py-1 text-xs font-medium text-slate-400">
            {products.length} result{products.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/60 text-slate-500">
            <Package size={22} />
          </div>
          <p className="text-sm font-medium text-slate-300">No products found</p>
          <p className="text-xs text-slate-500">
            Adjust your search or add a new product to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-medium">SKU</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Quantity</th>
                <th className="px-5 py-3 font-medium">Unit Price</th>
                <th className="px-5 py-3 font-medium">Total Value</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const quantity = Number(product.quantity) || 0;
                const minLevel = Number(product.min_reorder_level) || 0;
                const unitPrice = Number(product.unit_price) || 0;
                const status = getStatus(quantity, minLevel);
                const isFlagged = highlightAlerts && quantity <= minLevel;

                return (
                  <tr
                    key={product.id}
                    className={`border-b border-slate-800/70 transition hover:bg-slate-950/50 ${
                      isFlagged ? 'bg-amber-500/[0.07]' : ''
                    }`}
                  >
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 font-mono text-xs text-cyan-300">
                        {isFlagged ? (
                          <TriangleAlert size={13} className="shrink-0 text-amber-400" />
                        ) : null}
                        {product.sku}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-100">
                      {product.name}
                      {product.supplier ? (
                        <span className="block text-xs font-normal text-slate-500">
                          {product.supplier}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs text-slate-300">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          aria-label={`Decrease stock for ${product.name}`}
                          disabled={quantity === 0 || !canWrite}
                          title={writeDisabledTitle}
                          onClick={() => onAdjust?.(product, -1)}
                          className={`${actionBtn} hover:border-rose-500/60 hover:text-rose-300`}
                        >
                          <Minus size={14} strokeWidth={2.5} />
                        </button>
                        <span className="w-10 text-center font-semibold text-slate-100">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase stock for ${product.name}`}
                          disabled={!canWrite}
                          title={writeDisabledTitle}
                          onClick={() => onAdjust?.(product, 1)}
                          className={`${actionBtn} hover:border-emerald-500/60 hover:text-emerald-300`}
                        >
                          <Plus size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-300">
                      {currency.format(unitPrice)}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-100">
                      {currency.format(unitPrice * quantity)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${status.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          aria-label={`View stock history for ${product.name}`}
                          onClick={() => onViewLogs?.(product)}
                          className={`${actionBtn} hover:border-cyan-500/60 hover:text-cyan-300`}
                        >
                          <History size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Edit ${product.name}`}
                          disabled={!canWrite}
                          title={writeDisabledTitle}
                          onClick={() => onEdit?.(product)}
                          className={`${actionBtn} hover:border-cyan-500/60 hover:text-cyan-300`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${product.name}`}
                          disabled={!canWrite}
                          title={writeDisabledTitle}
                          onClick={() => onDelete?.(product)}
                          className={`${actionBtn} hover:border-rose-500/60 hover:text-rose-300`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
