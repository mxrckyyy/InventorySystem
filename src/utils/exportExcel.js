import * as XLSX from 'xlsx';

const SHEET_NAME = 'Inventory';

function statusLabel(quantity, minReorderLevel) {
  if (quantity === 0) return 'Out of Stock';
  if (quantity <= minReorderLevel) return 'Low Stock';
  return 'In Stock';
}

export const EXCEL_COLUMNS = [
  { label: 'SKU', key: 'sku', type: 'string', width: 20 },
  { label: 'Name', key: 'name', type: 'string', width: 32 },
  { label: 'Category', key: 'category', type: 'string', width: 20 },
  { label: 'Quantity', key: 'quantity', type: 'number', width: 12 },
  { label: 'Min Reorder Level', key: 'min_reorder_level', type: 'number', width: 20 },
  { label: 'Unit Price', key: 'unit_price', type: 'currency', width: 16 },
  { label: 'Total Value', key: 'total_value', type: 'currency', width: 16 },
  { label: 'Supplier', key: 'supplier', type: 'string', width: 26 },
  { label: 'Status', key: 'status', type: 'string', width: 14 },
  { label: 'Created At', key: 'created_at', type: 'date', width: 22 }
];

const PESO_FORMAT = 'P#,##0.00';
const DATE_FORMAT = 'yyyy-mm-dd hh:mm';

const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);

function toExcelSerial(date) {
  return (date.getTime() - EXCEL_EPOCH_UTC) / 86_400_000;
}

function buildRow(product) {
  const quantity = Number(product.quantity) || 0;
  const minLevel = Number(product.min_reorder_level) || 0;
  const unitPrice = Number(product.unit_price) || 0;

  return {
    sku: product.sku ?? '',
    name: product.name ?? '',
    category: product.category ?? '',
    quantity,
    min_reorder_level: minLevel,
    unit_price: unitPrice,
    total_value: unitPrice * quantity,
    supplier: product.supplier ?? '',
    status: statusLabel(quantity, minLevel),
    created_at: product.created_at ? new Date(product.created_at) : null
  };
}

function buildWorksheet(data, columns = EXCEL_COLUMNS) {
  const rows = (Array.isArray(data) ? data : []).map(buildRow);

  const header = columns.map((column) => column.label);
  const body = rows.map((row) =>
    columns.map((column) => {
      const value = row[column.key];
      if (value === null || value === undefined) return '';
      return value;
    })
  );

  const worksheet = XLSX.utils.aoa_to_sheet([header, ...body]);

  columns.forEach((column, index) => {
    const address = XLSX.utils.encode_cell({ c: index, r: 0 });
    const headerCell = worksheet[address];
    if (headerCell) {
      headerCell.t = 's';
      headerCell.v = column.label;
    }

    for (let rowIndex = 1; rowIndex <= rows.length; rowIndex += 1) {
      const cellAddress = XLSX.utils.encode_cell({ c: index, r: rowIndex });
      const cell = worksheet[cellAddress];
      if (!cell) continue;

      const rawValue = rows[rowIndex - 1][column.key];

      if (column.type === 'currency') {
        cell.t = 'n';
        cell.z = PESO_FORMAT;
      } else if (column.type === 'number') {
        cell.t = 'n';
        cell.z = '0';
      } else if (column.type === 'date') {
        if (rawValue instanceof Date) {
          cell.t = 'n';
          cell.v = toExcelSerial(rawValue);
          cell.z = DATE_FORMAT;
        }
      }
    }
  });

  worksheet['!cols'] = columns.map((column) => ({ wch: column.width }));
  worksheet['!autofilter'] = {
    ref: XLSX.utils.encode_range({
      s: { c: 0, r: 0 },
      e: { c: columns.length - 1, r: Math.max(rows.length, 1) }
    })
  };
  worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

  return worksheet;
}

export function buildWorkbook(data, columns = EXCEL_COLUMNS) {
  const workbook = XLSX.utils.book_new();
  const worksheet = buildWorksheet(data, columns);
  XLSX.utils.book_append_sheet(workbook, worksheet, SHEET_NAME);
  return workbook;
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

  return `${parts.join('_')}.xlsx`;
}

export function exportToExcel(data, filename, columns = EXCEL_COLUMNS) {
  const workbook = buildWorkbook(data, columns);

  const rawName = filename || 'inventory-export.xlsx';
  const safeName = rawName.toLowerCase().endsWith('.xlsx')
    ? rawName
    : `${rawName.replace(/\.(csv|xls)$/i, '')}.xlsx`;

  XLSX.writeFile(workbook, safeName, { compression: true });

  return safeName;
}
