import { History, Minus, Package, Pencil, Plus, Trash2, TriangleAlert } from 'lucide-react';
import { formatPHP } from '../../utils/currency.js';

function getStatus(quantity, minReorderLevel) {
  if (quantity === 0) {
    return {
      label: 'Out of Stock',
      badge: 'border-red-500/40 bg-red-500/10 text-red-400',
      dot: 'bg-red-500'
    };
  }

  if (quantity <= minReorderLevel) {
    return {
      label: 'Low Stock',
      badge: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
      dot: 'bg-amber-500'
    };
  }

  return {
    label: 'In Stock',
    badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    dot: 'bg-emerald-500'
  };
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16 text-slate-300">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-emerald-500" />
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
    'inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#273544] bg-[#0F161E] text-slate-400 transition hover:border-emerald-500/60 hover:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#273544] disabled:hover:text-slate-400';

  const writeDisabledTitle = canWrite ? undefined : 'Admin access required';

  return (
    <section className="overflow-hidden rounded-2xl border border-[#222E3A] bg-[#151D24]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E293B] px-6 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Product Catalogue
        </h2>
        <button
          type="button"
          onClick={() => onViewLogs?.(null)}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[#273544] bg-[#0F161E] px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:border-emerald-500/60 hover:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <History size={15} />
          All Logs
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#273544] bg-[#0F161E] text-slate-400">
            <Package size={22} />
          </div>
          <p className="text-sm font-semibold text-white">No products found</p>
          <p className="text-sm text-slate-300">
            Adjust your search or add a new product to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="bg-[#121920] text-xs font-semibold uppercase tracking-wider text-slate-300">
                <th className="border-b border-[#1E293B] px-6 py-3.5">SKU</th>
                <th className="border-b border-[#1E293B] px-6 py-3.5">Name</th>
                <th className="border-b border-[#1E293B] px-6 py-3.5">Category</th>
                <th className="border-b border-[#1E293B] px-6 py-3.5">Quantity</th>
                <th className="border-b border-[#1E293B] px-6 py-3.5">Unit Price</th>
                <th className="border-b border-[#1E293B] px-6 py-3.5">Total Value</th>
                <th className="border-b border-[#1E293B] px-6 py-3.5">Status</th>
                <th className="border-b border-[#1E293B] px-6 py-3.5 text-right">Actions</th>
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
                    className={`border-b border-[#1E293B] transition hover:bg-emerald-500/5 ${
                      isFlagged
                        ? 'bg-amber-500/10'
                        : 'odd:bg-[#151D24] even:bg-[#121920]'
                    }`}
                  >
                    <td className="px-6 py-3.5">
                      <span className="flex items-center gap-1.5 font-mono text-sm font-medium text-emerald-400">
                        {isFlagged ? (
                          <TriangleAlert size={14} className="shrink-0 text-amber-400" />
                        ) : null}
                        {product.sku}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-white">
                      {product.name}
                      {product.supplier ? (
                        <span className="block text-sm font-normal text-slate-300">
                          {product.supplier}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="rounded-md border border-[#273544] bg-[#0F161E] px-2.5 py-1 text-sm text-slate-300">
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
                        <span className="w-10 text-center font-semibold text-white">
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
                    <td className="px-6 py-3.5 text-slate-300">{formatPHP(unitPrice)}</td>
                    <td className="px-6 py-3.5 font-semibold text-white">
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
                          className={`${actionBtn} text-emerald-400 hover:border-emerald-500/60 hover:text-emerald-300`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${product.name}`}
                          disabled={!canWrite}
                          title={writeDisabledTitle}
                          onClick={() => onDelete?.(product)}
                          className={`${actionBtn} text-red-400 hover:border-red-500/60 hover:text-red-300`}
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
