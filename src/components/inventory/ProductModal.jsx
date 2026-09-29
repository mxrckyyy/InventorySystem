import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

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
  'w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20';

function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs text-rose-400">{error}</span> : null}
    </label>
  );
}

export default function ProductModal({
  isOpen,
  product = null,
  categories = [],
  onClose,
  onSave
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const firstFieldRef = useRef(null);

  const isEditMode = Boolean(product);

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
        : EMPTY_FORM
    );

    const timer = setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => clearTimeout(timer);
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
      <div className="w-full max-w-lg rounded-2xl border border-cyan-500/25 bg-slate-900 shadow-[0_0_60px_rgba(34,211,238,0.15)]">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">
              {isEditMode ? 'Edit Product' : 'Add Product'}
            </h2>
            <p className="text-xs text-slate-500">
              {isEditMode
                ? 'Update the product details below.'
                : 'Fill in the details to create a new item.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition hover:border-rose-500/60 hover:text-rose-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="SKU *" error={errors.sku}>
              <input
                ref={firstFieldRef}
                type="text"
                value={form.sku}
                onChange={(event) => updateField('sku', event.target.value)}
                placeholder="SKU-001"
                className={inputClass}
              />
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
                value={form.quantity}
                onChange={(event) => updateField('quantity', event.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Min Reorder *" error={errors.min_reorder_level}>
              <input
                type="number"
                min="0"
                step="1"
                value={form.min_reorder_level}
                onChange={(event) => updateField('min_reorder_level', event.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Unit Price *" error={errors.unit_price}>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.unit_price}
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
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/25 hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
