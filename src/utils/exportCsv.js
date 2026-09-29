const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

function statusLabel(quantity, minReorderLevel) {
  if (quantity === 0) return 'Out of Stock';
  if (quantity <= minReorderLevel) return 'Low Stock';
  return 'In Stock';
}

function escapeCell(value) {
  if (value === null || value === undefined) return '';

  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export const PRODUCT_COLUMNS = [
  { label: 'SKU', value: (row) => row.sku },
  { label: 'Name', value: (row) => row.name },
  { label: 'Category', value: (row) => row.category },
  {
    label: 'Quantity',
    value: (row) => Number(row.quantity) || 0
  },
  {
    label: 'Min Reorder Level',
    value: (row) => Number(row.min_reorder_level) || 0
  },
  {
    label: 'Unit Price',
    value: (row) => (Number(row.unit_price) || 0).toFixed(2)
  },
  {
    label: 'Total Value',
    value: (row) =>
      ((Number(row.unit_price) || 0) * (Number(row.quantity) || 0)).toFixed(2)
  },
  { label: 'Supplier', value: (row) => row.supplier },
  {
    label: 'Status',
    value: (row) =>
      statusLabel(
        Number(row.quantity) || 0,
        Number(row.min_reorder_level) || 0
      )
  },
  {
    label: 'Created At',
    value: (row) => (row.created_at ? new Date(row.created_at).toISOString() : '')
  }
];

export function buildCSV(data, columns = PRODUCT_COLUMNS) {
  const rows = Array.isArray(data) ? data : [];

  const header = columns.map((column) => escapeCell(column.label)).join(',');
  const body = rows.map((row) =>
    columns.map((column) => escapeCell(column.value(row))).join(',')
  );

  return [header, ...body].join('\r\n');
}

export function buildExportFilename({ category = 'all', searchTerm = '' } = {}) {
  const parts = ['inventory'];

  if (category && category !== 'all') {
    parts.push(category);
  }

  const query = searchTerm.trim().replace(/\s+/g, '-').toLowerCase();
  if (query) {
    parts.push(`search-${query}`);
  }

  const stamp = new Date().toISOString().slice(0, 10);
  parts.push(stamp);

  return `${parts.join('_')}.csv`;
}

export function exportToCSV(data, filename, columns = PRODUCT_COLUMNS) {
  const csv = buildCSV(data, columns);
  const blob = new Blob([`\uFEFF${csv}`], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName =
    (filename || 'export').toLowerCase().endsWith('.csv')
      ? filename
      : `${filename || 'export'}.csv`;

  link.href = url;
  link.download = safeName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return safeName;
}
