/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
  description?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export type PaymentMethod = 'CASH' | 'ONLINE';

export interface Order {
  id: string;
  invoiceNumber: string;
  items: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  tax: number; // e.g. 5% GST
  discount: number; // Flat discount amount
  gstRate?: number;
  total: number;
  paymentMethod: PaymentMethod;
  customerName?: string;
  tableNumber?: string;
  timestamp: string; // ISO String
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
}

export interface DailyArchive {
  id: string;
  date: string;
  totalSales: number;
  cashSales: number;
  onlineSales: number;
  billsCount: number;
  timestamp: string;
  orders?: Order[];
}
