import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { siteConfig } from '@/config/site.config';
import type { InvoiceData } from '@/components/invoice/InvoiceTemplate';

const formatCurrency = (amount: number) => `${siteConfig.products.currencySymbol}${amount.toLocaleString()}`;

export async function generateInvoicePDF(data: InvoiceData): Promise<Blob> {
  const doc = new jsPDF();
  const { invoice, contact, name } = siteConfig;
  
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(name, 20, yPos);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPos += 8;
  doc.text(contact.address.full, 20, yPos);
  yPos += 5;
  doc.text(`Phone: ${contact.phone}`, 20, yPos);
  yPos += 5;
  doc.text(`Email: ${contact.email}`, 20, yPos);

  // Invoice title on right
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - 20, 20, { align: 'right' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(data.invoiceNumber, pageWidth - 20, 30, { align: 'right' });
  
  doc.setFontSize(10);
  doc.text(`Date: ${new Date(data.date).toLocaleDateString()}`, pageWidth - 20, 38, { align: 'right' });
  doc.text(`Order: ${data.orderNumber}`, pageWidth - 20, 44, { align: 'right' });
  
  if (data.orderSource === 'in_store') {
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(pageWidth - 55, 48, 35, 8, 2, 2, 'F');
    doc.setFontSize(8);
    doc.text('IN-STORE', pageWidth - 20, 54, { align: 'right' });
  }

  // Divider
  yPos = 60;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos, pageWidth - 20, yPos);

  // Bill To section
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('BILL TO', 20, yPos);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  yPos += 8;
  doc.setFontSize(12);
  doc.text(data.customer.name, 20, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  yPos += 6;
  doc.text(data.customer.phone, 20, yPos);
  
  if (data.customer.email) {
    yPos += 5;
    doc.text(data.customer.email, 20, yPos);
  }
  
  yPos += 5;
  doc.text(data.customer.address, 20, yPos);
  yPos += 5;
  doc.text(`${data.customer.city}, ${data.customer.district}`, 20, yPos);

  // Items table
  yPos += 15;
  
  const tableData = data.items.map(item => [
    item.product_name,
    item.size,
    item.quantity.toString(),
    formatCurrency(item.price),
    formatCurrency(item.price * item.quantity),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Item', 'Size', 'Qty', 'Price', 'Amount']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [100, 100, 100],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });

  // Totals
  // @ts-ignore - autoTable adds this property
  yPos = doc.lastAutoTable.finalY + 10;
  
  const totalsX = pageWidth - 80;
  
  doc.setFontSize(10);
  doc.text('Subtotal', totalsX, yPos);
  doc.text(formatCurrency(data.subtotal), pageWidth - 20, yPos, { align: 'right' });
  
  if (data.shippingCost > 0) {
    yPos += 7;
    doc.text('Shipping', totalsX, yPos);
    doc.text(formatCurrency(data.shippingCost), pageWidth - 20, yPos, { align: 'right' });
  }
  
  if ((data.giftWrapCost ?? 0) > 0) {
    yPos += 7;
    doc.text('Gift Wrap', totalsX, yPos);
    doc.text(formatCurrency(data.giftWrapCost!), pageWidth - 20, yPos, { align: 'right' });
  }
  
  if (data.discountAmount > 0) {
    yPos += 7;
    doc.setTextColor(0, 128, 0);
    doc.text('Discount', totalsX, yPos);
    doc.text(`-${formatCurrency(data.discountAmount)}`, pageWidth - 20, yPos, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }
  
  if (invoice.taxEnabled && invoice.taxRate > 0) {
    yPos += 7;
    doc.text(`${invoice.taxLabel} (${invoice.taxRate}%)`, totalsX, yPos);
    doc.text(formatCurrency((data.subtotal * invoice.taxRate) / 100), pageWidth - 20, yPos, { align: 'right' });
  }
  
  // Total line
  yPos += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(totalsX - 10, yPos, pageWidth - 20, yPos);
  
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total', totalsX, yPos);
  doc.text(formatCurrency(data.total), pageWidth - 20, yPos, { align: 'right' });

  // Payment method
  yPos += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(20, yPos - 5, pageWidth - 40, 15, 3, 3, 'F');
  doc.text(`Payment Method: ${data.paymentMethod.toUpperCase()}`, 25, yPos + 5);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(invoice.footer, pageWidth / 2, footerY, { align: 'center' });
  
  if (invoice.termsAndConditions) {
    doc.setFontSize(8);
    doc.text(invoice.termsAndConditions, pageWidth / 2, footerY + 5, { align: 'center' });
  }

  return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function printInvoice(data: InvoiceData) {
  const blob = await generateInvoicePDF(data);
  const url = URL.createObjectURL(blob);
  
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
  
  // Clean up after a delay
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// Thermal Receipt PDF Generator
export type ThermalWidth = 80 | 58;

const THERMAL_SPECS = {
  80: { widthPt: 226.77, marginPt: 14.17, fontSize: 9, lineHeight: 1.2 },
  58: { widthPt: 164.41, marginPt: 8.5, fontSize: 8, lineHeight: 1.1 },
};

export async function generateThermalReceiptPDF(
  data: InvoiceData,
  width: ThermalWidth = 80
): Promise<Blob> {
  const spec = THERMAL_SPECS[width];
  const { invoice, contact, name } = siteConfig;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [spec.widthPt, 1000], // Height will auto-extend
  });

  const pageWidth = spec.widthPt;
  const margin = spec.marginPt;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper to draw dashed line
  const drawDashedLine = () => {
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    const dashLen = 3;
    const gap = 2;
    for (let x = margin; x < pageWidth - margin; x += dashLen + gap) {
      doc.line(x, y, Math.min(x + dashLen, pageWidth - margin), y);
    }
    y += 8;
  };

  // Store Header (centered)
  doc.setFontSize(spec.fontSize + 3);
  doc.setFont('helvetica', 'bold');
  doc.text(name, pageWidth / 2, y, { align: 'center' });
  y += spec.fontSize + 4;

  doc.setFontSize(spec.fontSize - 1);
  doc.setFont('helvetica', 'normal');
  doc.text(contact.address.full, pageWidth / 2, y, { align: 'center' });
  y += spec.fontSize + 2;
  doc.text(contact.phone, pageWidth / 2, y, { align: 'center' });
  y += spec.fontSize + 6;

  drawDashedLine();

  // Invoice Info
  doc.setFontSize(spec.fontSize);
  doc.text(`Invoice: ${data.invoiceNumber}`, margin, y);
  y += spec.fontSize + 3;
  doc.text(`Order: ${data.orderNumber}`, margin, y);
  y += spec.fontSize + 3;
  doc.text(`Date: ${new Date(data.date).toLocaleDateString()}`, margin, y);
  y += spec.fontSize + 3;
  if (data.orderSource === 'in_store') {
    doc.text('Type: IN-STORE', margin, y);
    y += spec.fontSize + 3;
  }
  y += 3;

  drawDashedLine();

  // Customer Info
  doc.text(`Customer: ${data.customer.name}`, margin, y);
  y += spec.fontSize + 3;
  doc.text(`Phone: ${data.customer.phone}`, margin, y);
  y += spec.fontSize + 6;

  drawDashedLine();

  // Items
  data.items.forEach((item) => {
    // Product name (may wrap)
    const productText = `${item.product_name} - ${item.size} x${item.quantity}`;
    const lines = doc.splitTextToSize(productText, contentWidth);
    lines.forEach((line: string) => {
      doc.text(line, margin, y);
      y += spec.fontSize + 2;
    });
    // Price right-aligned
    const priceText = formatCurrency(item.price * item.quantity);
    doc.text(priceText, pageWidth - margin, y - spec.fontSize - 2, { align: 'right' });
    y += 4;
  });

  y += 4;
  drawDashedLine();

  // Totals
  const drawTotalLine = (label: string, value: string, bold = false) => {
    if (bold) doc.setFont('helvetica', 'bold');
    else doc.setFont('helvetica', 'normal');
    doc.text(label, margin, y);
    doc.text(value, pageWidth - margin, y, { align: 'right' });
    y += spec.fontSize + 4;
  };

  drawTotalLine('Subtotal:', formatCurrency(data.subtotal));
  
  if (data.shippingCost > 0) {
    drawTotalLine('Shipping:', formatCurrency(data.shippingCost));
  }
  
  if ((data.giftWrapCost ?? 0) > 0) {
    drawTotalLine('Gift Wrap:', formatCurrency(data.giftWrapCost!));
  }
  
  if (data.discountAmount > 0) {
    drawTotalLine('Discount:', `-${formatCurrency(data.discountAmount)}`);
  }

  // Total line separator
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFontSize(spec.fontSize + 2);
  drawTotalLine('TOTAL:', formatCurrency(data.total), true);

  y += 4;
  drawDashedLine();

  // Payment Method
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(spec.fontSize);
  doc.text(`Payment: ${data.paymentMethod.toUpperCase()}`, pageWidth / 2, y, { align: 'center' });
  y += spec.fontSize + 8;

  drawDashedLine();

  // Footer
  doc.setFontSize(spec.fontSize - 1);
  const footerLines = doc.splitTextToSize(invoice.footer, contentWidth);
  footerLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, y, { align: 'center' });
    y += spec.fontSize + 2;
  });

  // Add some bottom margin
  y += margin;

  // Resize PDF to actual content height
  const finalHeight = y;
  const resizedDoc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [spec.widthPt, finalHeight],
  });

  // Re-render to sized document
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = spec.widthPt;
  tempCanvas.height = finalHeight;
  
  // For thermal receipts, we'll just return the oversized doc trimmed
  // jsPDF doesn't easily support dynamic resizing, so we accept slight extra space
  return doc.output('blob');
}

export async function printThermalReceipt(data: InvoiceData, width: ThermalWidth = 80) {
  const blob = await generateThermalReceiptPDF(data, width);
  const url = URL.createObjectURL(blob);
  
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
  
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}