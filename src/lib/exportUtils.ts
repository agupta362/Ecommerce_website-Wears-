import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { siteConfig } from '@/config/site.config';

interface ExportOrder {
  invoice_number?: string;
  order_number: string;
  date: string;
  order_source?: string;
  customer: string;
  phone: string;
  email?: string;
  city: string;
  district: string;
  items: number;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: string;
  payment_method: string;
}

interface ExportOptions {
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
  orderSource?: string;
}

const formatCurrency = (amount: number) => `${siteConfig.products.currencySymbol}${amount.toLocaleString()}`;

/**
 * Escapes a value for CSV format (handles commas, quotes, and newlines)
 */
function escapeCSVValue(value: string | number | undefined): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates Excel-compatible CSV content with BOM for proper Unicode support
 */
function generateCSV(headers: string[], rows: (string | number | undefined)[][]): string {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel Unicode support
  const headerLine = headers.map(escapeCSVValue).join(',');
  const dataLines = rows.map(row => row.map(escapeCSVValue).join(','));
  return BOM + [headerLine, ...dataLines].join('\r\n');
}

/**
 * Triggers a file download in the browser
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportOrdersToExcel(orders: ExportOrder[], filename: string) {
  const headers = [
    'Invoice #',
    'Order #',
    'Date',
    'Source',
    'Customer',
    'Phone',
    'Email',
    'City',
    'District',
    'Items',
    'Subtotal',
    'Shipping',
    'Discount',
    'Total',
    'Status',
    'Payment',
  ];

  const rows = orders.map(order => [
    order.invoice_number || '-',
    order.order_number,
    order.date,
    order.order_source === 'in_store' ? 'In-Store' : 'Online',
    order.customer,
    order.phone,
    order.email || '-',
    order.city,
    order.district,
    order.items,
    order.subtotal,
    order.shipping,
    order.discount,
    order.total,
    order.status,
    order.payment_method,
  ]);

  const csvContent = generateCSV(headers, rows);
  
  // Change extension to .csv for compatibility (Excel opens CSV files natively)
  const csvFilename = filename.replace(/\.xlsx?$/i, '.csv');
  downloadFile(csvContent, csvFilename, 'text/csv;charset=utf-8');
}

export function exportOrdersToPDF(orders: ExportOrder[], filename: string, options?: ExportOptions) {
  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${siteConfig.name} - Orders Report`, pageWidth / 2, 15, { align: 'center' });
  
  // Date range
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let dateText = `Generated: ${new Date().toLocaleDateString()}`;
  if (options?.dateFrom && options?.dateTo) {
    dateText += ` | Period: ${options.dateFrom.toLocaleDateString()} - ${options.dateTo.toLocaleDateString()}`;
  }
  doc.text(dateText, pageWidth / 2, 22, { align: 'center' });

  // Summary stats
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const onlineOrders = orders.filter(o => o.order_source !== 'in_store').length;
  const instoreOrders = orders.filter(o => o.order_source === 'in_store').length;

  doc.setFontSize(10);
  doc.text(`Total Orders: ${totalOrders} | Online: ${onlineOrders} | In-Store: ${instoreOrders} | Total Revenue: ${formatCurrency(totalRevenue)}`, pageWidth / 2, 30, { align: 'center' });

  // Table data
  const tableData = orders.map(order => [
    order.invoice_number || '-',
    order.order_number,
    order.date,
    order.order_source === 'in_store' ? 'Store' : 'Web',
    order.customer.substring(0, 15),
    order.phone,
    order.city,
    order.items.toString(),
    formatCurrency(order.total),
    order.status,
    order.payment_method.toUpperCase(),
  ]);

  autoTable(doc, {
    startY: 38,
    head: [['Invoice', 'Order #', 'Date', 'Src', 'Customer', 'Phone', 'City', 'Qty', 'Total', 'Status', 'Payment']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [50, 50, 50],
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7,
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 28 },
      2: { cellWidth: 18 },
      3: { cellWidth: 12 },
      4: { cellWidth: 25 },
      5: { cellWidth: 22 },
      6: { cellWidth: 18 },
      7: { cellWidth: 10, halign: 'center' },
      8: { cellWidth: 20, halign: 'right' },
      9: { cellWidth: 18 },
      10: { cellWidth: 18 },
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(filename);
}

export function filterOrders(orders: ExportOrder[], options: ExportOptions): ExportOrder[] {
  return orders.filter(order => {
    // Date filter
    if (options.dateFrom) {
      const orderDate = new Date(order.date);
      if (orderDate < options.dateFrom) return false;
    }
    if (options.dateTo) {
      const orderDate = new Date(order.date);
      const endOfDay = new Date(options.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      if (orderDate > endOfDay) return false;
    }

    // Status filter
    if (options.status && options.status !== 'all') {
      if (order.status !== options.status) return false;
    }

    // Source filter
    if (options.orderSource && options.orderSource !== 'all') {
      if (options.orderSource === 'online' && order.order_source === 'in_store') return false;
      if (options.orderSource === 'in_store' && order.order_source !== 'in_store') return false;
    }

    return true;
  });
}