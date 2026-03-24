import { forwardRef } from 'react';
import { siteConfig } from '@/config/site.config';

interface OrderItem {
  id: string;
  product_name: string;
  product_image?: string;
  size: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  city: string;
  district: string;
  address?: string;
  addressLine1?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  date: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    district: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  giftWrapCost?: number;
  total: number;
  paymentMethod: string;
  orderSource?: string;
  notes?: string;
}

export type ThermalWidth = 80 | 58;

interface InvoiceTemplateProps {
  data: InvoiceData;
  format?: 'a4' | 'thermal';
  thermalWidth?: ThermalWidth;
}

const formatCurrency = (amount: number) => `${siteConfig.products.currencySymbol}${amount.toLocaleString()}`;

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ data, format = 'a4', thermalWidth = 80 }, ref) => {
    const { invoice, contact, name } = siteConfig;
    const isThermal = format === 'thermal';
    const width = thermalWidth || invoice.thermalPrinterWidth || 80;
    const is58mm = width === 58;

    if (isThermal) {
      return (
        <div
          ref={ref}
          className={`thermal-receipt bg-white text-black font-mono print:block ${
            is58mm ? 'p-2 text-[9px]' : 'p-3 text-[10px]'
          }`}
          style={{ 
            width: `${width}mm`, 
            maxWidth: '100%',
            lineHeight: is58mm ? 1.1 : 1.2,
          }}
        >
          {/* Header */}
          <div className="text-center mb-3">
            <h1 className={`font-bold ${is58mm ? 'text-[11px]' : 'text-xs'}`}>{name}</h1>
            <p className={is58mm ? 'text-[8px]' : 'text-[9px]'}>{contact.address.full}</p>
            <p className={is58mm ? 'text-[8px]' : 'text-[9px]'}>{contact.phone}</p>
          </div>

          <div className="border-t border-dashed border-black my-2" />

          {/* Invoice Info */}
          <div className="mb-2 space-y-0.5">
            <p>Invoice: {data.invoiceNumber}</p>
            <p>Order: {data.orderNumber}</p>
            <p>Date: {new Date(data.date).toLocaleDateString()}</p>
            {data.orderSource === 'in_store' && <p className="font-semibold">Type: IN-STORE</p>}
          </div>

          <div className="border-t border-dashed border-black my-2" />

          {/* Customer */}
          <div className="mb-2 space-y-0.5">
            <p className="font-semibold">{data.customer.name}</p>
            <p>{data.customer.phone}</p>
          </div>

          <div className="border-t border-dashed border-black my-2" />

          {/* Items */}
          <div className="mb-2 space-y-1">
            {data.items.map((item, idx) => (
              <div key={idx} className="space-y-0">
                <p className={is58mm ? 'text-[8px] leading-tight' : 'text-[9px] leading-tight'}>
                  {item.product_name}
                </p>
                <div className="flex justify-between">
                  <span>{item.size} x{item.quantity}</span>
                  <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-black my-2" />

          {/* Totals */}
          <div className="space-y-0.5">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(data.subtotal)}</span>
            </div>
            {data.shippingCost > 0 && (
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{formatCurrency(data.shippingCost)}</span>
              </div>
            )}
            {(data.giftWrapCost ?? 0) > 0 && (
              <div className="flex justify-between">
                <span>Gift Wrap:</span>
                <span>{formatCurrency(data.giftWrapCost!)}</span>
              </div>
            )}
            {data.discountAmount > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-{formatCurrency(data.discountAmount)}</span>
              </div>
            )}
            <div className="border-t border-black my-1" />
            <div className={`flex justify-between font-bold ${is58mm ? 'text-[11px]' : 'text-xs'}`}>
              <span>TOTAL:</span>
              <span>{formatCurrency(data.total)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-black my-2" />

          <p className="text-center font-medium">Payment: {data.paymentMethod.toUpperCase()}</p>

          <div className="border-t border-dashed border-black my-2" />

          <p className={`text-center ${is58mm ? 'text-[7px]' : 'text-[8px]'}`}>{invoice.footer}</p>
          
          {/* Cut line marker for auto-cutter */}
          <div className="mt-4 border-t border-dashed border-gray-400" />
        </div>
      );
    }

    // A4 Format
    return (
      <div
        ref={ref}
        className="bg-white text-black p-8 min-h-[297mm] w-[210mm] max-w-full mx-auto"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b pb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">{name}</h1>
            <p className="text-sm text-gray-600">{contact.address.full}</p>
            <p className="text-sm text-gray-600">{contact.phone}</p>
            <p className="text-sm text-gray-600">{contact.email}</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">INVOICE</h2>
            <p className="text-lg font-semibold">{data.invoiceNumber}</p>
            <p className="text-sm text-gray-600">Date: {new Date(data.date).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Order: {data.orderNumber}</p>
            {data.orderSource === 'in_store' && (
              <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                IN-STORE SALE
              </span>
            )}
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h3>
          <p className="font-semibold text-lg">{data.customer.name}</p>
          <p className="text-gray-600">{data.customer.phone}</p>
          {data.customer.email && <p className="text-gray-600">{data.customer.email}</p>}
          <p className="text-gray-600">{data.customer.address}</p>
          <p className="text-gray-600">{data.customer.city}, {data.customer.district}</p>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 text-sm font-semibold text-gray-600">ITEM</th>
              <th className="text-center py-3 text-sm font-semibold text-gray-600">SIZE</th>
              <th className="text-center py-3 text-sm font-semibold text-gray-600">QTY</th>
              <th className="text-right py-3 text-sm font-semibold text-gray-600">PRICE</th>
              <th className="text-right py-3 text-sm font-semibold text-gray-600">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="py-3">{item.product_name}</td>
                <td className="py-3 text-center">{item.size}</td>
                <td className="py-3 text-center">{item.quantity}</td>
                <td className="py-3 text-right">{formatCurrency(item.price)}</td>
                <td className="py-3 text-right font-medium">{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCurrency(data.subtotal)}</span>
            </div>
            {data.shippingCost > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Shipping</span>
                <span>{formatCurrency(data.shippingCost)}</span>
              </div>
            )}
            {(data.giftWrapCost ?? 0) > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Gift Wrap</span>
                <span>{formatCurrency(data.giftWrapCost!)}</span>
              </div>
            )}
            {data.discountAmount > 0 && (
              <div className="flex justify-between py-2 text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(data.discountAmount)}</span>
              </div>
            )}
            {invoice.taxEnabled && invoice.taxRate > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">{invoice.taxLabel} ({invoice.taxRate}%)</span>
                <span>{formatCurrency((data.subtotal * invoice.taxRate) / 100)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 border-t-2 border-gray-300 font-bold text-xl">
              <span>Total</span>
              <span>{formatCurrency(data.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mb-8 p-4 bg-gray-50 rounded">
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-medium">{data.paymentMethod.toUpperCase()}</span>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notes</h3>
            <p className="text-gray-600">{data.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-8 border-t text-center text-gray-500 text-sm">
          <p>{invoice.footer}</p>
          {invoice.termsAndConditions && (
            <p className="mt-2 text-xs">{invoice.termsAndConditions}</p>
          )}
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = 'InvoiceTemplate';

export default InvoiceTemplate;