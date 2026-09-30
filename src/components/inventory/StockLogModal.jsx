import { useEffect, useState } from 'react';
import { History, Inbox, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.js';

function toMessage(error) {
  return error?.message || 'Failed to load stock history';
}

function formatTimestamp(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

function shortId(id) {
  if (!id) return '—';
  return `${String(id).slice(0, 8)}…`;
}

export default function StockLogModal({ isOpen, product = null, products = [], onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    let cancelled = false;

    const loadLogs = async () => {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('stock_logs')
        .select('id, product_id, change_amount, type, created_at, products(id, name, sku)')
        .order('created_at', { ascending: false })
        .limit(250);

      if (product?.id) {
        query = query.eq('product_id', product.id);
      }

      const { data, error: fetchError } = await query;

      if (cancelled) return;

      if (fetchError) {
        setError(toMessage(fetchError));
        setLogs([]);
      } else {
        setLogs(data || []);
      }

      setLoading(false);
    };

    loadLogs();

    return () => {
      cancelled = true;
    };
  }, [isOpen, product?.id]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const nameById = new Map(products.map((item) => [item.id, item]));

  const resolveProduct = (log) => {
    if (log.products) return log.products;
    const cached = nameById.get(log.product_id);
    if (cached) return { id: cached.id, name: cached.name, sku: cached.sku };
    return null;
  };

  const heading = product
    ? `Stock History — ${product.name}`
    : 'Stock Audit Trail';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <aside className="flex h-full w-full max-w-2xl animate-slide-in flex-col border-l border-sky-500/20 bg-slate-900 shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-500/40 bg-sky-500/15 text-sky-300">
              <History size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-50">{heading}</h2>
              <p className="text-sm text-slate-300">
                {product
                  ? `SKU ${product.sku} · most recent first`
                  : 'All stock movements · most recent first'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close stock history"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-600 text-slate-300 transition hover:border-rose-400/60 hover:text-rose-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-300">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-sky-400" />
              <span className="text-sm">Loading stock logs...</span>
            </div>
          ) : error ? (
            <div className="m-5 rounded-xl border border-rose-400/50 bg-rose-500/15 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-5 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-600 bg-slate-950/60 text-slate-400">
                <Inbox size={22} />
              </div>
              <p className="text-sm font-medium text-slate-200">No stock logs yet</p>
              <p className="text-sm text-slate-400">
                Stock movements recorded with +1 / -1 will appear here.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-900/95 backdrop-blur">
                <tr className="border-b border-slate-800 text-sm uppercase tracking-wider text-slate-300">
                  <th className="px-5 py-3 font-semibold">Timestamp</th>
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-5 py-3 font-semibold">Change</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const change = Number(log.change_amount) || 0;
                  const embedded = resolveProduct(log);
                  const isPositive = change > 0;

                  return (
                    <tr
                      key={log.id}
                      className="border-b border-slate-800/70 transition hover:bg-slate-950/50"
                    >
                      <td className="whitespace-nowrap px-5 py-3 text-xs text-slate-400">
                        {formatTimestamp(log.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        {embedded ? (
                          <>
                            <span className="block font-medium text-slate-100">
                              {embedded.name}
                            </span>
                            <span className="block font-mono text-sm text-sky-300">
                              {embedded.sku}
                            </span>
                          </>
                        ) : (
                          <span className="font-mono text-sm text-slate-400" title={log.product_id}>
                            {shortId(log.product_id)}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex min-w-[3.5rem] items-center justify-center rounded-md border px-2 py-1 text-xs font-semibold ${
                            isPositive
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                              : change < 0
                                ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                                : 'border-slate-700 bg-slate-950/60 text-slate-400'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {change}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs capitalize text-slate-300">
                          {log.type || 'unknown'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3 text-sm text-slate-400">
          <span>
            {loading ? 'Loading…' : `${logs.length} log${logs.length === 1 ? '' : 's'}`}
          </span>
          <span>Newest first · max 250 entries</span>
        </div>
      </aside>
    </div>
  );
}
