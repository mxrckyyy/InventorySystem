import { History, Minus, Package, Pencil, Plus, Trash2, TriangleAlert } from 'lucide-react';
import { formatPHP } from '../../utils/currency.js';

function getStatus(quantity, minReorderLevel) {
  if (quantity === 0) {
    return {
      label: 'Out of Stock',
      badge: 'border-rose-300 bg-rose-50 text-rose-700',
      dot: 'bg-rose-500'
    };
  }

  if (quantity <= minReorderLevel) {
    return {
      label: 'Low Stock',
      badge: 'border-amber-300 bg-amber-50 text-amber-700',
      dot: 'bg-amber-500'
    };
  }

  return {
    label: 'In Stock',
    badge: 'border-emerald-300 bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500'
  };
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16 text-slate-500">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
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
    'inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-white disabled:hover:text-slate-600';

  const writeDisabledTitle = canWrite ? undefined : 'Admin access required';

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-900 px-6 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-200">
          Product Catalogue
        </h2>
        <button
          type="button"
          onClick={() => onViewLogs?.(null)}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-950/60 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:border-amber-500/60 hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <History size={15} />
          All Logs
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
            <Package size={22} />
          </div>
          <p className="text-sm font-semibold text-slate-700">No products found</p>
          <p className="text-sm text-slate-500">
            Adjust your search or add a new product to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50 text-sm uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3.5 font-semibold">SKU</th>
                <th className="px-6 py-3.5 font-semibold">Name</th>
                <th className="px-6 py-3.5 font-semibold">Category</th>
                <th className="px-6 py-3.5 font-semibold">Quantity</th>
                <th className="px-6 py-3.5 font-semibold">Unit Price</th>
                <th className="px-6 py-3.5 font-semibold">Total Value</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
                <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
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
                    className={`border-b border-slate-200 transition hover:bg-amber-50/60 ${
                      isFlagged ? 'bg-amber-100/70' : 'odd:bg-white even:bg-slate-50/60'
                    }`}
                  >
                    <td className="px-6 py-3.5">
                      <span className="flex items-center gap-1.5 font-mono text-sm font-medium text-amber-700">
                        {isFlagged ? (
                          <TriangleAlert size={14} className="shrink-0 text-amber-600" />
                        ) : null}
                        {product.sku}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      {product.name}
                      {product.supplier ? (
                        <span className="block text-sm font-normal text-slate-500">
                          {product.supplier}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-sm text-slate-700">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Decrease stock for ${product.name}`}
                          disabled={quantity === 0 || !canWrite}
                          title={writeDisabledTitle}
                          onClick={() => onAdjust?.(product, -1)}
                          className={actionBtn}
                        >
                          <Minus size={16} strokeWidth={2.5} />
                        </button>
                        <span className="w-10 text-center font-semibold text-slate-900">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase stock for ${product.name}`}
                          disabled={!canWrite}
                          title={writeDisabledTitle}
                          onClick={() => onAdjust?.(product, 1)}
                          className={actionBtn}
                        >
                          <Plus size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700">{formatPHP(unitPrice)}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-900">
                      {formatPHP(unitPrice * quantity)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium ${status.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          aria-label={`View stock history for ${product.name}`}
                          onClick={() => onViewLogs?.(product)}
                          className={actionBtn}
                        >
                          <History size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Edit ${product.name}`}
                          disabled={!canWrite}
                          title={writeDisabledTitle}
                          onClick={() => onEdit?.(product)}
                          className={actionBtn}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${product.name}`}
                          disabled={!canWrite}
                          title={writeDisabledTitle}
                          onClick={() => onDelete?.(product)}
                          className={`${actionBtn} hover:border-rose-500 hover:bg-rose-50 hover:text-rose-600`}
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
