import { History, Minus, Package, Pencil, Plus, Trash2, TriangleAlert } from 'lucide-react';
import { formatPHP } from '../../utils/currency.js';

function getStatus(quantity, minReorderLevel) {
  if (quantity === 0) {
    return {
      label: 'Out of Stock',
      badge: 'border-rose-400/50 bg-rose-500/15 text-rose-200',
      dot: 'bg-rose-400'
    };
  }

  if (quantity <= minReorderLevel) {
    return {
      label: 'Low Stock',
      badge: 'border-amber-400/50 bg-amber-500/15 text-amber-200',
      dot: 'bg-amber-400'
    };
  }

  return {
    label: 'In Stock',
    badge: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200',
    dot: 'bg-emerald-400'
  };
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16 text-slate-300">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-sky-400" />
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
    'inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-600 bg-slate-950/60 text-slate-300 transition hover:border-slate-400 hover:text-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-40';

  const writeDisabledTitle = canWrite ? undefined : 'Admin access required';

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
          Product Catalogue
        </h2>
        <button
          type="button"
          onClick={() => onViewLogs?.(null)}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-950/60 px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:border-sky-500/50 hover:text-sky-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
        >
          <History size={15} />
          All Logs
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-600 bg-slate-950/60 text-slate-400">
            <Package size={22} />
          </div>
          <p className="text-sm font-medium text-slate-200">No products found</p>
          <p className="text-sm text-slate-400">
            Adjust your search or add a new product to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-sm uppercase tracking-wider text-slate-300">
                <th className="px-5 py-3 font-semibold">SKU</th>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Quantity</th>
                <th className="px-5 py-3 font-semibold">Unit Price</th>
                <th className="px-5 py-3 font-semibold">Total Value</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
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
                    id={`product-row-${product.id}`}
                    className={`border-b border-slate-800/70 transition hover:bg-slate-800/40 ${
                      isFlagged ? 'bg-amber-500/[0.1]' : ''
                    }`}
                  >
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 font-mono text-sm text-sky-300">
                        {isFlagged ? (
                          <TriangleAlert size={14} className="shrink-0 text-amber-300" />
                        ) : null}
                        {product.sku}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-100">
                      {product.name}
                      {product.supplier ? (
                        <span className="block text-sm font-normal text-slate-400">
                          {product.supplier}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-md border border-slate-600 bg-slate-950/60 px-2.5 py-1 text-sm text-slate-200">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Decrease stock for ${product.name}`}
                          disabled={quantity === 0 || !canWrite}
                          title={writeDisabledTitle}
                          onClick={() => onAdjust?.(product, -1)}
                          className={`${actionBtn} hover:border-rose-400/70 hover:text-rose-200`}
                        >
                          <Minus size={16} strokeWidth={2.5} />
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
                          className={`${actionBtn} hover:border-emerald-400/70 hover:text-emerald-200`}
                        >
                          <Plus size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-200">{formatPHP(unitPrice)}</td>
                    <td className="px-5 py-3 font-semibold text-slate-50">
                      {formatPHP(unitPrice * quantity)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium ${status.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          aria-label={`View stock history for ${product.name}`}
                          onClick={() => onViewLogs?.(product)}
                          className={`${actionBtn} hover:border-sky-400/70 hover:text-sky-200`}
                        >
                          <History size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Edit ${product.name}`}
                          disabled={!canWrite}
                          title={writeDisabledTitle}
                          onClick={() => onEdit?.(product)}
                          className={`${actionBtn} hover:border-sky-400/70 hover:text-sky-200`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${product.name}`}
                          disabled={!canWrite}
                          title={writeDisabledTitle}
                          onClick={() => onDelete?.(product)}
                          className={`${actionBtn} hover:border-rose-400/70 hover:text-rose-200`}
                        >
                          <Trash2 size={16} />
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
