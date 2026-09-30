import { useEffect, useRef, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

const EMPTY_FORM = {
  sku: '',
  name: '',
  category: '',
  quantity: '0',
  min_reorder_level: '0',
  unit_price: '',
  supplier: ''
};

const inputClass =
  'w-full min-h-[44px] rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-3 text-sm text-slate-100 placeholder-slate-400 outline-none transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/40';

function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isBlankZero(value) {
  const text = String(value ?? '').trim();
  return text === '0' || text === '0.0' || text === '0.00';
}

function generateSku(existingSkus = []) {
  const taken = new Set(
    existingSkus.map((sku) => String(sku || '').trim().toUpperCase()).filter(Boolean)
  );

  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('');
  const prefix = `PRD-${stamp}-`;

  let highest = 0;
  taken.forEach((sku) => {
    if (!sku.startsWith(prefix)) return;
    const sequence = Number.parseInt(sku.slice(prefix.length), 10);
    if (Number.isFinite(sequence)) highest = Math.max(highest, sequence);
  });

  for (let sequence = highest + 1; sequence <= 9999; sequence += 1) {
    const candidate = `${prefix}${String(sequence).padStart(4, '0')}`;
    if (!taken.has(candidate)) return candidate;
  }

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const candidate = `${prefix}${random}`;
    if (!taken.has(candidate)) return candidate;
  }

  return `${prefix}${String(Date.now()).slice(-4)}`;
}

function validate(form) {
  const errors = {};

  if (!form.sku.trim()) errors.sku = 'SKU is required';
  else if (form.sku.trim().length > 50) errors.sku = 'SKU must be 50 characters or fewer';

  if (!form.name.trim()) errors.name = 'Name is required';

  if (!form.category.trim()) errors.category = 'Category is required';

  const quantity = parseNumber(form.quantity, NaN);
  if (!Number.isFinite(quantity) || !Number.isInteger(quantity) || quantity < 0) {
    errors.quantity = 'Quantity must be a whole number of 0 or more';
  }

  const minLevel = parseNumber(form.min_reorder_level, NaN);
  if (!Number.isFinite(minLevel) || !Number.isInteger(minLevel) || minLevel < 0) {
    errors.min_reorder_level = 'Min reorder level must be a whole number of 0 or more';
  }

  const price = parseNumber(form.unit_price, NaN);
  if (!Number.isFinite(price) || price < 0) {
    errors.unit_price = 'Unit price must be a positive number';
  }

  return errors;
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-sm text-rose-300">{error}</span> : null}
    </label>
  );
}

export default function ProductModal({
  isOpen,
  product = null,
  products = [],
  categories = [],
  onClose,
  onSave
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const firstFieldRef = useRef(null);

  const isEditMode = Boolean(product);
  const existingSkus = products.map((item) => item.sku);

  useEffect(() => {
    if (!isOpen) return;

    setErrors({});
    setSubmitting(false);
    setForm(
      product
        ? {
            sku: product.sku ?? '',
            name: product.name ?? '',
            category: product.category ?? '',
            quantity: String(product.quantity ?? 0),
            min_reorder_level: String(product.min_reorder_level ?? 0),
            unit_price: product.unit_price === null ? '' : String(product.unit_price),
            supplier: product.supplier ?? ''
          }
        : { ...EMPTY_FORM, sku: generateSku(existingSkus) }
    );

    const timer = setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, product]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleNumericFocus = (field) => () => {
    if (isBlankZero(form[field])) updateField(field, '');
  };

  const handleNumericBlur = (field) => () => {
    const value = String(form[field] ?? '').trim();
    if (value === '') updateField(field, '0');
  };

  const handleRegenerateSku = () => {
    updateField('sku', generateSku(existingSkus));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      quantity: parseNumber(form.quantity),
      min_reorder_level: parseNumber(form.min_reorder_level),
      unit_price: parseNumber(form.unit_price),
      supplier: form.supplier.trim()
    };

    const result = await onSave?.(payload);
    setSubmitting(false);

    if (result !== false) onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">
              {isEditMode ? 'Edit Product' : 'Add Product'}
            </h2>
            <p className="text-sm text-slate-400">
              {isEditMode
                ? 'Update the product details below.'
                : 'Product ID (SKU) is auto-generated — you can override it.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-600 text-slate-300 transition hover:border-rose-400/60 hover:text-rose-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Product ID / SKU *" error={errors.sku}>
              <div className="flex gap-2">
                <input
                  ref={firstFieldRef}
                  type="text"
                  value={form.sku}
                  onChange={(event) => updateField('sku', event.target.value)}
                  placeholder="PRD-YYYYMMDD-0001"
                  aria-describedby="sku-auto-hint"
                  className={`${inputClass} flex-1 font-mono`}
                />
                {!isEditMode ? (
                  <button
                    type="button"
                    onClick={handleRegenerateSku}
                    aria-label="Regenerate product ID"
                    title="Regenerate product ID"
                    className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/60 text-slate-300 transition hover:border-sky-500/60 hover:text-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                  >
                    <RefreshCw size={16} />
                  </button>
                ) : null}
              </div>
              <span id="sku-auto-hint" className="mt-1 block text-sm text-slate-400">
                Auto-generated · editable if you need a custom code
              </span>
            </Field>

            <Field label="Name *" error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Product name"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Category *" error={errors.category}>
            <input
              type="text"
              value={form.category}
              onChange={(event) => updateField('category', event.target.value)}
              placeholder="e.g. Electronics"
              list="product-categories"
              className={inputClass}
            />
            <datalist id="product-categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Quantity *" error={errors.quantity}>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={form.quantity}
                onFocus={handleNumericFocus('quantity')}
                onBlur={handleNumericBlur('quantity')}
                onChange={(event) => updateField('quantity', event.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Min Reorder *" error={errors.min_reorder_level}>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={form.min_reorder_level}
                onFocus={handleNumericFocus('min_reorder_level')}
                onBlur={handleNumericBlur('min_reorder_level')}
                onChange={(event) => updateField('min_reorder_level', event.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Unit Price *" error={errors.unit_price}>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={form.unit_price}
                onFocus={handleNumericFocus('unit_price')}
                onBlur={handleNumericBlur('unit_price')}
                onChange={(event) => updateField('unit_price', event.target.value)}
                placeholder="0.00"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Supplier" error={errors.supplier}>
            <input
              type="text"
              value={form.supplier}
              onChange={(event) => updateField('supplier', event.target.value)}
              placeholder="Supplier name (optional)"
              className={inputClass}
            />
          </Field>

          <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-xl border border-slate-600 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-sky-400/50 bg-sky-500/20 px-5 py-3 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
