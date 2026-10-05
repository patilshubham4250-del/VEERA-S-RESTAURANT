/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { Banknote, CreditCard, ShoppingBag, TrendingUp, Calendar, Search, RefreshCw, Trash2, ArrowUpRight, Award, ChevronDown, ChevronUp, Download, Upload, CalendarDays, CheckCircle, Pencil, Lock, Plus, Minus, AlertCircle, X, ShieldCheck, PieChart, Activity, Layers, Utensils } from 'lucide-react';
import { Order, PaymentMethod, DailyArchive, Category } from '../types';
import { DEFAULT_MENU_ITEMS, DEFAULT_CATEGORIES } from '../data';

interface AnalyticsDashboardProps {
  orders: Order[];
  dailyArchives: DailyArchive[];
  onClearLogs: () => void;
  onResetMockLogs: () => void;
  onCloseDay: () => void;
  onClearArchives: () => void;
  onExportBackup: () => void;
  onImportBackup: (jsonData: string) => boolean;
  autoBackup: boolean;
  onToggleAutoBackup: () => void;
  onDeleteOrder: (id: string) => void;
  onEditOrder: (id: string, updatedOrder: Order, applyDateToAll?: boolean) => void;
  sessionBillingDate?: string | null;
  onSetSessionBillingDate?: (date: string | null) => void;
  categories?: Category[];
}

export default function AnalyticsDashboard({
  orders,
  dailyArchives = [],
  onClearLogs,
  onResetMockLogs,
  onCloseDay,
  onClearArchives,
  onExportBackup,
  onImportBackup,
  autoBackup,
  onToggleAutoBackup,
  onDeleteOrder,
  onEditOrder,
  sessionBillingDate,
  onSetSessionBillingDate,
  categories = DEFAULT_CATEGORIES,
}: AnalyticsDashboardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        onImportBackup(text);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const [filterPayment, setFilterPayment] = useState<'all' | 'CASH' | 'ONLINE'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  // Password Verification Modal state
  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean;
    actionType: 'edit' | 'delete' | null;
    order: Order | null;
    passwordValue: string;
    error: string;
  }>({
    isOpen: false,
    actionType: null,
    order: null,
    passwordValue: '',
    error: '',
  });

  // Edit Order Dialog state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editCustName, setEditCustName] = useState('');
  const [editTableNum, setEditTableNum] = useState('');
  const [editPayMethod, setEditPayMethod] = useState<PaymentMethod>('CASH');
  const [editGstRate, setEditGstRate] = useState<number>(5);
  const [editDiscountVal, setEditDiscountVal] = useState<number>(0);
  const [editItems, setEditItems] = useState<{ menuItemId: string; name: string; price: number; quantity: number }[]>([]);
  const [editTimestamp, setEditTimestamp] = useState<string>('');
  const [applyToAllBills, setApplyToAllBills] = useState<boolean>(false);

  // Selected Daily Archive state for detailed inspection modal
  const [selectedArchive, setSelectedArchive] = useState<DailyArchive | null>(null);
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');
  const [archiveFilterPayment, setArchiveFilterPayment] = useState<'all' | 'CASH' | 'ONLINE'>('all');
  const [expandedArchiveInvoiceId, setExpandedArchiveInvoiceId] = useState<string | null>(null);

  // Date range picker states for filtering historical logs
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Filter historical day closures by date range
  const filteredArchivesByDate = useMemo(() => {
    return (dailyArchives || []).filter((archive) => {
      const archiveDateStr = archive.timestamp || archive.date;
      const archiveTime = new Date(archiveDateStr).getTime();
      
      if (isNaN(archiveTime)) {
        return true;
      }
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (archiveTime < start.getTime()) return false;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (archiveTime > end.getTime()) return false;
      }
      
      return true;
    });
  }, [dailyArchives, startDate, endDate]);

  // Aggregated stats for the filtered date range of closures
  const rangeStats = useMemo(() => {
    let totalSales = 0;
    let cashSales = 0;
    let onlineSales = 0;
    let billsCount = 0;
    
    filteredArchivesByDate.forEach((archive) => {
      totalSales += archive.totalSales || 0;
      cashSales += archive.cashSales || 0;
      onlineSales += archive.onlineSales || 0;
      billsCount += archive.billsCount || 0;
    });
    
    const averageBill = billsCount > 0 ? totalSales / billsCount : 0;
    
    return {
      totalSales,
      cashSales,
      onlineSales,
      billsCount,
      averageBill
    };
  }, [filteredArchivesByDate]);

  // Generate or retrieve orders for the selected archive
  const archiveOrders = useMemo(() => {
    if (!selectedArchive) return [];
    if (selectedArchive.orders && selectedArchive.orders.length > 0) {
      return selectedArchive.orders;
    }
    
    // Fallback: Generate simulation orders matching the stats of legacy archive
    const count = selectedArchive.billsCount || 1;
    const mockOrders: Order[] = [];
    const targetTotal = selectedArchive.totalSales;
    const cashAmount = selectedArchive.cashSales;
    
    for (let i = 0; i < count; i++) {
      const isCash = i < Math.ceil(count * (cashAmount / (targetTotal || 1)));
      const amt = targetTotal / count;
      mockOrders.push({
        id: `mock_archive_${selectedArchive.id}_${i}`,
        invoiceNumber: `V-ARC-${selectedArchive.id.replace('day_', '')}-${101 + i}`,
        items: [
          { menuItemId: 'chk_chilly', name: 'Chicken chilly', price: 180, quantity: Math.max(1, Math.round((amt * 0.95) / 180)) }
        ],
        subtotal: amt * 0.95,
        tax: amt * 0.05,
        discount: 0,
        gstRate: 5,
        total: amt,
        paymentMethod: isCash ? 'CASH' : 'ONLINE',
        customerName: `Archived Guest ${i + 1}`,
        tableNumber: `T-${(i % 6) + 1}`,
        timestamp: selectedArchive.timestamp || new Date().toISOString()
      });
    }
    return mockOrders;
  }, [selectedArchive]);

  // Compute stats and dish sales for selected archive
  const archiveStats = useMemo(() => {
    if (!selectedArchive) return null;
    
    const ordersList = archiveOrders;
    let totalSubtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    const dishSalesMap: { [name: string]: { quantity: number; revenue: number; price: number } } = {};
    
    ordersList.forEach((order) => {
      totalSubtotal += order.subtotal;
      totalTax += order.tax;
      totalDiscount += order.discount || 0;
      
      order.items.forEach((item) => {
        if (!dishSalesMap[item.name]) {
          dishSalesMap[item.name] = { quantity: 0, revenue: 0, price: item.price };
        }
        dishSalesMap[item.name].quantity += item.quantity;
        dishSalesMap[item.name].revenue += item.price * item.quantity;
      });
    });
    
    const sortedDishes = Object.entries(dishSalesMap)
      .map(([name, data]) => ({
        name,
        quantity: data.quantity,
        revenue: data.revenue,
        price: data.price
      }))
      .sort((a, b) => b.quantity - a.quantity);
      
    const averageBill = selectedArchive.billsCount > 0 ? selectedArchive.totalSales / selectedArchive.billsCount : 0;
    
    return {
      totalSubtotal,
      totalTax,
      totalDiscount,
      sortedDishes,
      averageBill
    };
  }, [selectedArchive, archiveOrders]);

  // Filter archived transaction records
  const filteredArchiveOrders = useMemo(() => {
    return archiveOrders.filter((o) => {
      const matchesPayment = archiveFilterPayment === 'all' || o.paymentMethod === archiveFilterPayment;
      const matchesSearch = o.invoiceNumber.toLowerCase().includes(archiveSearchQuery.toLowerCase()) ||
        (o.customerName && o.customerName.toLowerCase().includes(archiveSearchQuery.toLowerCase())) ||
        (o.tableNumber && o.tableNumber.toLowerCase().includes(archiveSearchQuery.toLowerCase()));
      return matchesPayment && matchesSearch;
    });
  }, [archiveOrders, archiveFilterPayment, archiveSearchQuery]);

  const handleRequestEdit = (order: Order) => {
    setPasswordModal({
      isOpen: true,
      actionType: 'edit',
      order,
      passwordValue: '',
      error: '',
    });
  };

  const handleRequestDelete = (order: Order) => {
    setPasswordModal({
      isOpen: true,
      actionType: 'delete',
      order,
      passwordValue: '',
      error: '',
    });
  };

  const handleVerifyPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordModal.passwordValue === '9773') {
      const order = passwordModal.order;
      const type = passwordModal.actionType;
      
      // Reset password modal state
      setPasswordModal({ isOpen: false, actionType: null, order: null, passwordValue: '', error: '' });

      if (type === 'delete' && order) {
        if (window.confirm(`Are you absolutely sure you want to delete invoice ${order.invoiceNumber}? This action cannot be undone.`)) {
          onDeleteOrder(order.id);
        }
      } else if (type === 'edit' && order) {
        // Unlock editing by opening editing dialog
        setEditingOrder(order);
        setEditCustName(order.customerName || '');
        setEditTableNum(order.tableNumber || '');
        setEditPayMethod(order.paymentMethod);
        setEditGstRate(order.gstRate !== undefined ? order.gstRate : 5);
        setEditDiscountVal(order.discount || 0);
        setEditItems([...order.items]);
        setEditTimestamp(order.timestamp);
        setApplyToAllBills(false);
      }
    } else {
      setPasswordModal(prev => ({
        ...prev,
        error: 'Incorrect security password. Please try again.'
      }));
    }
  };

  const handleUpdateEditItemQty = (menuItemId: string, change: number) => {
    setEditItems(prev => prev.map(item => {
      if (item.menuItemId === menuItemId) {
        const nextQty = Math.max(1, item.quantity + change);
        return { ...item, quantity: nextQty };
      }
      return item;
    }));
  };

  const handleRemoveEditItem = (menuItemId: string) => {
    if (editItems.length === 1) {
      alert("An order must have at least one item. To cancel the order entirely, please delete it.");
      return;
    }
    setEditItems(prev => prev.filter(item => item.menuItemId !== menuItemId));
  };

  // Edited Order derived calculations
  const editSubtotal = editItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const editTaxAmount = Math.max(0, editSubtotal - editDiscountVal) * (editGstRate / 100);
  const editTotal = Math.max(0, editSubtotal - editDiscountVal + editTaxAmount);

  const handleSaveEditOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    // Ensure we parse the timestamp correctly (if edited, it can be YYYY-MM-DD)
    let finalTimestamp = editingOrder.timestamp;
    if (editTimestamp) {
      if (editTimestamp.includes('T')) {
        finalTimestamp = editTimestamp;
      } else {
        const [year, month, day] = editTimestamp.split('-').map(Number);
        const newD = new Date(editingOrder.timestamp);
        newD.setFullYear(year, month - 1, day);
        finalTimestamp = newD.toISOString();
      }
    }

    const updatedOrder: Order = {
      ...editingOrder,
      customerName: editCustName.trim() || "",
      tableNumber: editTableNum || "",
      paymentMethod: editPayMethod,
      gstRate: editGstRate,
      discount: editDiscountVal,
      items: editItems,
      subtotal: editSubtotal,
      tax: editTaxAmount,
      total: editTotal,
      timestamp: finalTimestamp,
    };

    onEditOrder(editingOrder.id, updatedOrder, applyToAllBills);
    setEditingOrder(null);
  };

  // Group orders by date (Today vs Older)
  const isToday = (dateStr: string) => {
    const orderDate = new Date(dateStr);
    const today = new Date();
    return orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear();
  };

  // KPIs
  const stats = useMemo(() => {
    let totalSales = 0;
    let cashSales = 0;
    let onlineSales = 0;
    let todaySales = 0;
    let todayOrdersCount = 0;
    
    // Dish item frequencies
    const dishSalesMap: { [name: string]: number } = {};

    // Category Sales Breakdown
    const itemCategoryMap: { [name: string]: string } = {};
    DEFAULT_MENU_ITEMS.forEach(item => {
      itemCategoryMap[item.name.toLowerCase()] = item.category;
    });

    const categorySales: { [cat: string]: number } = {};
    categories.forEach(c => {
      categorySales[c.id] = 0;
    });
    categorySales['others'] = 0;

    // Table Revenue mapping
    const tableRevenue: { [tbl: string]: { total: number; count: number } } = {};

    // Hourly tracking for peak hour
    const hourlyRevenue: { [hour: number]: number } = {};
    
    orders.forEach((o) => {
      totalSales += o.total;
      if (o.paymentMethod === 'CASH') {
        cashSales += o.total;
      } else {
        onlineSales += o.total;
      }

      if (isToday(o.timestamp)) {
        todaySales += o.total;
        todayOrdersCount++;
      }

      // Track item tallies for best seller and category sales
      o.items.forEach((item) => {
        dishSalesMap[item.name] = (dishSalesMap[item.name] || 0) + item.quantity;

        let cat = itemCategoryMap[item.name.toLowerCase()] || 'others';
        if (cat === 'chicken_specials') cat = 'chicken_special';
        if (cat === 'egg_specials') cat = 'egg_special';
        categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);
      });

      // Table performance
      const table = o.tableNumber || 'Takeaway/Other';
      if (!tableRevenue[table]) {
        tableRevenue[table] = { total: 0, count: 0 };
      }
      tableRevenue[table].total += o.total;
      tableRevenue[table].count += 1;

      // Hourly performance
      const hr = new Date(o.timestamp).getHours();
      hourlyRevenue[hr] = (hourlyRevenue[hr] || 0) + o.total;
    });

    // Find best seller
    let bestSeller = 'None';
    let maxQty = 0;
    Object.entries(dishSalesMap).forEach(([name, qty]) => {
      if (qty > maxQty) {
        maxQty = qty;
        bestSeller = `${name} (${qty} portions)`;
      }
    });

    // Find peak billing hour
    let peakHourStr = 'None';
    let peakHourSales = 0;
    Object.entries(hourlyRevenue).forEach(([hrStr, amt]) => {
      if (amt > peakHourSales) {
        peakHourSales = amt;
        const hourNum = parseInt(hrStr);
        const startFormat = hourNum === 0 ? '12 AM' : hourNum > 12 ? `${hourNum - 12} PM` : hourNum === 12 ? '12 PM' : `${hourNum} AM`;
        const endFormat = hourNum + 1 === 24 ? '12 AM' : (hourNum + 1) > 12 ? `${(hourNum + 1) - 12} PM` : (hourNum + 1) === 12 ? '12 PM' : `${hourNum + 1} AM`;
        peakHourStr = `${startFormat} - ${endFormat}`;
      }
    });

    const averageBill = orders.length > 0 ? totalSales / orders.length : 0;

    return {
      totalSales,
      cashSales,
      onlineSales,
      todaySales,
      todayOrdersCount,
      totalOrdersCount: orders.length,
      averageBill,
      bestSeller,
      categorySales,
      tableRevenue,
      peakHourStr,
      peakHourSales
    };
  }, [orders]);

  // Payment Breakdown percentages
  const cashPercent = stats.totalSales > 0 ? (stats.cashSales / stats.totalSales) * 100 : 0;
  const onlinePercent = stats.totalSales > 0 ? (stats.onlineSales / stats.totalSales) * 100 : 0;

  // Hourly Distribution for Today (Visual SVG Chart)
  const hourlyData = useMemo(() => {
    const intervals = [
      { label: 'Morning (8-12)', value: 0, cash: 0, online: 0 },
      { label: 'Lunch (12-16)', value: 0, cash: 0, online: 0 },
      { label: 'Tea Time (16-19)', value: 0, cash: 0, online: 0 },
      { label: 'Dinner (19-23)', value: 0, cash: 0, online: 0 },
    ];

    orders.filter(o => isToday(o.timestamp)).forEach((order) => {
      const hours = new Date(order.timestamp).getHours();
      let index = 0;
      if (hours >= 8 && hours < 12) index = 0;
      else if (hours >= 12 && hours < 16) index = 1;
      else if (hours >= 16 && hours < 19) index = 2;
      else if (hours >= 19 && hours < 23) index = 3;
      else index = 3; // default grouping

      intervals[index].value += order.total;
      if (order.paymentMethod === 'CASH') {
        intervals[index].cash += order.total;
      } else {
        intervals[index].online += order.total;
      }
    });

    return intervals;
  }, [orders]);

  // Filter transaction records
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesPayment = filterPayment === 'all' || o.paymentMethod === filterPayment;
      const matchesSearch = o.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (o.tableNumber && o.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesPayment && matchesSearch;
    });
  }, [orders, filterPayment, searchQuery]);

  const toggleInvoiceExpand = (id: string) => {
    setExpandedInvoiceId(expandedInvoiceId === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-10">
      
      {/* KPI METRIC CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales combined */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1.5 relative overflow-hidden">
          <div className="absolute right-3 top-3 w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4.5 h-4.5" />
          </div>
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Sales (Combined)</span>
          <span id="sales-kpi-total" className="text-xl font-black text-slate-900 font-mono">
            ₹{stats.totalSales.toFixed(2)}
          </span>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            Real-time aggregate restaurant volume
          </p>
        </div>

        {/* Cash Sales report */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1.5 relative overflow-hidden">
          <div className="absolute right-3 top-3 w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <Banknote className="w-4.5 h-4.5" />
          </div>
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cash Report</span>
          <span id="sales-kpi-cash" className="text-xl font-black text-emerald-700 font-mono">
            ₹{stats.cashSales.toFixed(2)}
          </span>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            {cashPercent.toFixed(1)}% of total business transactions
          </p>
        </div>

        {/* Online Sales report */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1.5 relative overflow-hidden">
          <div className="absolute right-3 top-3 w-8 h-8 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center">
            <CreditCard className="w-4.5 h-4.5" />
          </div>
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Online Report</span>
          <span id="sales-kpi-online" className="text-xl font-black text-slate-800 font-mono">
            ₹{stats.onlineSales.toFixed(2)}
          </span>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            {onlinePercent.toFixed(1)}% of card/UPI table transactions
          </p>
        </div>

        {/* Order count & ticket size */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1.5 relative overflow-hidden">
          <div className="absolute right-3 top-3 w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-4.5 h-4.5" />
          </div>
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Order Invoices</span>
          <span id="sales-kpi-orders" className="text-xl font-black text-slate-900 font-mono">
            {stats.totalOrdersCount} Bills
          </span>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            Average Order Ticket Size: <b className="font-mono text-slate-700">₹{stats.averageBill.toFixed(0)}</b>
          </p>
        </div>
      </div>

      {/* SECOND ROW SUB-KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Peak hour */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute right-3 top-3 w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <Activity className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Busy Hour (Peak Load)</span>
          <span className="text-sm font-extrabold text-slate-800 mt-1">{stats.peakHourStr}</span>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            Peak volume generated: <b className="font-mono text-slate-700">₹{stats.peakHourSales.toFixed(0)}</b>
          </p>
        </div>

        {/* Average Ticket Size breakdown */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute right-3 top-3 w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Bill Value</span>
          <span className="text-sm font-black text-slate-800 mt-1 font-mono">₹{stats.averageBill.toFixed(2)}</span>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            Per-guest ticket conversion average
          </p>
        </div>

        {/* Daily Target Progress Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1 relative overflow-hidden">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Daily Target Progress (₹10,000 Goal)</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-sm font-black text-slate-800 font-mono">
              {Math.min(100, (stats.totalSales / 10000) * 100).toFixed(0)}%
            </span>
            <span className="text-[9px] text-slate-400 font-medium">Achieved today</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5 relative border border-slate-200/50">
            <div 
              style={{ width: `${Math.min(100, (stats.totalSales / 10000) * 100)}%` }}
              className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
            ></div>
          </div>
        </div>
      </div>

      {/* SHIFT CLOSED & OFFLINE DATA PROTECTION PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        {/* Left Side: Shift Closure */}
        <div className="flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Shift Closing & Reset Control</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              End the active shift to archive today's transactions. The billing counter resets to zero while your <strong>Dishes Catalog (Menu Items) is completely preserved</strong>.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Active Shift Sales:</span>
              <span className="font-mono font-extrabold text-slate-800">₹{stats.totalSales.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Bills Raised:</span>
              <span className="font-mono font-extrabold text-slate-800">{stats.totalOrdersCount} Invoices</span>
            </div>
            <button
              onClick={onCloseDay}
              disabled={orders.length === 0}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border shadow-sm transition-all cursor-pointer ${
                orders.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              Close Shift & Start New Day
            </button>
          </div>
        </div>

        {/* Right Side: Local File Backup */}
        <div className="flex flex-col justify-between gap-4 border-t lg:border-t-0 lg:border-l border-slate-200 pt-5 lg:pt-0 lg:pl-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Download className="w-4.5 h-4.5 text-slate-700" />
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Device Backup Center (Offline)</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              No internet or cloud logins are needed! Export all your restaurant's data directly to your PC as physical backup files, or restore them instantly.
            </p>
          </div>

          {/* Toggle for Auto-backup */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200/60 text-xs">
            <span className="text-slate-600 font-semibold flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${autoBackup ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
              Auto-Download Backup on Shift Close
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoBackup}
                onChange={onToggleAutoBackup}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex flex-col gap-3">
            {/* Drag and Drop / File Select Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const text = event.target?.result as string;
                    if (text) onImportBackup(text);
                  };
                  reader.readAsText(file);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-lg p-4 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50/50 transition-all text-center group"
            >
              <Upload className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              <span className="text-xs font-semibold text-slate-700">Drag & Drop or Click to Upload</span>
              <span className="text-[10px] text-slate-400">Accepts only Veera backup .json files</span>
            </div>

            <button
              onClick={onExportBackup}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4 shrink-0" />
              Download Backup File Now
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* COMPACT HISTORICAL CLOSURES LIST */}
      {dailyArchives.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4.5 h-4.5 text-slate-500" />
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Historical Day Closures</h4>
            </div>
            <button
              onClick={onClearArchives}
              className="text-[10px] text-red-500 hover:text-red-700 font-bold hover:underline cursor-pointer"
            >
              Clear Archives
            </button>
          </div>

          {/* Date Range Picker inputs */}
          <div className="flex flex-col sm:flex-row gap-3 items-end justify-between bg-slate-50 p-3 rounded-lg border border-slate-200/60">
            <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset Range
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Range Summary Banner */}
          {(startDate || endDate) && (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                    Range Reporting Summary
                  </h5>
                  <p className="text-[10px] text-slate-400 font-bold">
                    From {startDate ? new Date(startDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Beginning'} to {endDate ? new Date(endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono font-bold text-slate-600 w-full md:w-auto">
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider font-sans">Total Sales</span>
                  <span className="text-xs font-black text-slate-900 font-mono">₹{rangeStats.totalSales.toFixed(0)}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider font-sans">Cash Sales</span>
                  <span className="text-xs font-black text-emerald-700 font-mono">₹{rangeStats.cashSales.toFixed(0)}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider font-sans">Online Sales</span>
                  <span className="text-xs font-black text-slate-800 font-mono">₹{rangeStats.onlineSales.toFixed(0)}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider font-sans">Bills Count</span>
                  <span className="text-xs font-black text-slate-900 font-mono">{rangeStats.billsCount}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider font-sans">Avg Bill</span>
                  <span className="text-xs font-black text-slate-900 font-mono">₹{rangeStats.averageBill.toFixed(0)}</span>
                </div>
              </div>
            </div>
          )}

          {filteredArchivesByDate.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs font-semibold">
              No historical day closures found within the selected date range.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[180px] overflow-y-auto pr-1">
              {filteredArchivesByDate.map((archive) => (
                <div 
                  key={archive.id} 
                  onClick={() => {
                    setSelectedArchive(archive);
                    setArchiveSearchQuery('');
                    setArchiveFilterPayment('all');
                    setExpandedArchiveInvoiceId(null);
                  }}
                  className="p-3 bg-slate-50 hover:bg-slate-100/90 rounded-lg border border-slate-200 hover:border-slate-300 transition-all text-xs cursor-pointer select-none group flex flex-col gap-1.5 active:scale-[0.985] relative"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{archive.date}</span>
                    <span className="text-[10px] bg-slate-200/60 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">
                      {archive.billsCount} Bills
                    </span>
                  </div>
                  <div className="h-px bg-slate-200"></div>
                  <div className="grid grid-cols-2 gap-1 font-mono text-[11px] text-slate-500">
                    <span className="text-left">Cash:</span>
                    <span className="text-right font-bold text-emerald-700">₹{archive.cashSales.toFixed(0)}</span>
                    <span className="text-left">Online:</span>
                    <span className="text-right font-bold text-slate-700">₹{archive.onlineSales.toFixed(0)}</span>
                    <span className="text-left text-slate-800 font-bold">Total Sales:</span>
                    <span className="text-right font-bold text-slate-900 flex items-center justify-end gap-1">
                      ₹{archive.totalSales.toFixed(0)}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400 group-hover:text-emerald-600 text-right font-bold mt-0.5 transition-colors">
                    Click to inspect details →
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MID PANEL: Visual SVG Graphs and Best-selling item banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graph 1: Cash vs Online comparative distribution */}
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Payment Share Analytics</h4>
            <p className="text-xs text-slate-400">Cash vs Online revenue split</p>
          </div>

          {stats.totalSales === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-semibold">
              No sales logged yet to calculate share percentages
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-3">
              {/* Giant stacked progress cylinder */}
              <div className="h-4 bg-slate-100 rounded-full flex overflow-hidden shadow-inner relative">
                <div
                  style={{ width: `${cashPercent}%` }}
                  className="bg-emerald-600 h-full transition-all duration-500"
                ></div>
                <div
                  style={{ width: `${onlinePercent}%` }}
                  className="bg-slate-800 h-full transition-all duration-500"
                ></div>
              </div>

              {/* Legend with percentages */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                    <span className="text-xs font-bold text-emerald-800">Cash Sales (Liquid)</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-emerald-700">
                    {cashPercent.toFixed(1)}% (₹{stats.cashSales.toFixed(0)})
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-800"></span>
                    <span className="text-xs font-bold text-slate-700">Online Payments</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-slate-800">
                    {onlinePercent.toFixed(1)}% (₹{stats.onlineSales.toFixed(0)})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bestselling item showcase */}
          <div className="mt-3 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 flex items-center gap-3 animate-fadeIn">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center shrink-0 shadow-inner">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Best-selling Dish</span>
              <p className="text-xs font-extrabold text-slate-800 truncate">{stats.bestSeller}</p>
            </div>
          </div>
        </div>

        {/* Graph 2: Today's Hourly Sales Volume stacked bar chart (Interactive SVG) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Today's Real-time Sales Trend</h4>
              <p className="text-xs text-slate-400">Hourly interval load comparison (Today)</p>
            </div>
            <div className="flex items-center gap-2.5 text-[10px] font-bold text-slate-500">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-600"></span>
                <span>Cash</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-800"></span>
                <span>Online</span>
              </div>
            </div>
          </div>

          {/* Interactive SVG Bar chart */}
          <div className="flex-1 min-h-[160px] flex items-end justify-between px-2 pt-4 relative">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-x-0 bottom-6 top-4 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-t border-dashed border-slate-400 w-full"></div>
              <div className="border-t border-dashed border-slate-400 w-full"></div>
              <div className="border-t border-dashed border-slate-400 w-full"></div>
            </div>

            {/* Bars container */}
            <div className="w-full h-full flex items-end justify-around pb-6 relative z-10 gap-4">
              {hourlyData.map((data, idx) => {
                const maxVal = Math.max(...hourlyData.map(d => d.value)) || 1000;
                const totalHeight = (data.value / maxVal) * 110; // scaled height in pixels
                const cashHeight = (data.cash / maxVal) * 110;
                const onlineHeight = (data.online / maxVal) * 110;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                    {/* Hover tooltip */}
                    <div className="absolute -top-1 bg-slate-900 text-white text-[9px] py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 font-mono whitespace-nowrap shadow-md">
                      Cash: ₹{data.cash.toFixed(0)} | Online: ₹{data.online.toFixed(0)}
                    </div>

                    {/* Stacked Bar Pillar */}
                    <div className="w-12 bg-slate-50 rounded-lg overflow-hidden flex flex-col justify-end shadow-inner relative transition-all duration-300 group-hover:shadow-md cursor-help border border-slate-100" style={{ height: '110px' }}>
                      {/* Online Stack (top) */}
                      <div
                        className="bg-slate-800 w-full transition-all duration-500 rounded-t"
                        style={{ height: `${onlineHeight}px` }}
                      ></div>
                      {/* Cash Stack (bottom) */}
                      <div
                        className="bg-emerald-600 w-full transition-all duration-500"
                        style={{ height: `${cashHeight}px` }}
                      ></div>

                      {/* Display total amount over bars on hover */}
                      {data.value > 0 && (
                        <span className="absolute inset-x-0 top-1 text-center font-mono font-bold text-[9px] text-slate-700 bg-white/70 px-0.5 rounded backdrop-blur-[0.5px]">
                          ₹{data.value.toFixed(0)}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-bold text-slate-500 text-center max-w-[80px] line-clamp-1">
                      {data.label.replace(' (', '\n(')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ADVANCED BENTO METRICS: CATEGORY BREAKDOWNS & TABLE LEADERSHIP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Dish Category Sales Share */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Category Revenue Shares</h4>
                <p className="text-xs text-slate-400">Total revenue generated per dish category</p>
              </div>
            </div>
          </div>

          {stats.totalSales === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs font-semibold">
              No sales logged yet to calculate category metrics
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-3">
              {Object.entries(stats.categorySales).map(([cat, amt]) => {
                const amtVal = amt as number;
                const percent = stats.totalSales > 0 ? (amtVal / stats.totalSales) * 100 : 0;
                
                const catObj = categories.find(c => c.id === cat);
                const label = catObj ? catObj.name : cat === 'others' ? 'Others' : cat;

                const categoryThemeMap: Record<string, { colorClass: string; bgLight: string; textColor: string }> = {
                  chicken_special: { colorClass: 'bg-red-500', bgLight: 'bg-red-50/50 border-red-100', textColor: 'text-red-800' },
                  mutton_special: { colorClass: 'bg-rose-700', bgLight: 'bg-rose-50/50 border-rose-100', textColor: 'text-rose-800' },
                  veg_special: { colorClass: 'bg-emerald-600', bgLight: 'bg-emerald-50/50 border-emerald-100', textColor: 'text-emerald-800' },
                  fish_special: { colorClass: 'bg-sky-500', bgLight: 'bg-sky-50/50 border-sky-100', textColor: 'text-sky-800' },
                  rice: { colorClass: 'bg-amber-600', bgLight: 'bg-amber-50/50 border-amber-100', textColor: 'text-amber-800' },
                  bread: { colorClass: 'bg-amber-700', bgLight: 'bg-amber-50/50 border-amber-100', textColor: 'text-amber-900' },
                  papad: { colorClass: 'bg-yellow-500', bgLight: 'bg-yellow-50/50 border-yellow-100', textColor: 'text-yellow-800' },
                  egg_special: { colorClass: 'bg-amber-500', bgLight: 'bg-amber-50/50 border-amber-100', textColor: 'text-amber-800' },
                  veeras_special: { colorClass: 'bg-purple-600', bgLight: 'bg-purple-50/50 border-purple-100', textColor: 'text-purple-800' },
                  ukad: { colorClass: 'bg-orange-600', bgLight: 'bg-orange-50/50 border-orange-100', textColor: 'text-orange-900' },
                  chicken_chinese_special: { colorClass: 'bg-orange-500', bgLight: 'bg-orange-50/50 border-orange-100', textColor: 'text-orange-800' },
                  soups: { colorClass: 'bg-blue-500', bgLight: 'bg-blue-50/50 border-blue-100', textColor: 'text-blue-800' },
                  veg_soyabean: { colorClass: 'bg-teal-600', bgLight: 'bg-teal-50/50 border-teal-100', textColor: 'text-teal-800' },
                  rice_noodles: { colorClass: 'bg-indigo-500', bgLight: 'bg-indigo-50/50 border-indigo-100', textColor: 'text-indigo-800' },
                  beverages: { colorClass: 'bg-cyan-500', bgLight: 'bg-cyan-50/50 border-cyan-100', textColor: 'text-cyan-800' },
                };

                const theme = categoryThemeMap[cat] || {
                  colorClass: 'bg-slate-500',
                  bgLight: 'bg-slate-50 border-slate-200',
                  textColor: 'text-slate-700'
                };

                if (amtVal === 0) return null; // Hide categories with 0 sales for a super-clean interface

                return (
                  <div key={cat} className={`p-2.5 rounded-xl border ${theme.bgLight} flex flex-col gap-2 shadow-sm hover:shadow transition-shadow`}>
                    <div className="flex justify-between items-center text-xs">
                      <span className={`font-extrabold text-[11px] uppercase tracking-wider ${theme.textColor}`}>{label}</span>
                      <span className="font-mono font-bold">
                        ₹{amtVal.toFixed(0)} <span className="text-slate-400">({percent.toFixed(0)}%)</span>
                      </span>
                    </div>
                    {/* Visual progress bar */}
                    <div className="w-full bg-slate-200/50 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${theme.colorClass} transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Card 2: Seating & Table Leadership Rank */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Table Profitability</h4>
                <p className="text-xs text-slate-400">Ranked performance breakdown per dining table / counter</p>
              </div>
            </div>
          </div>

          {Object.keys(stats.tableRevenue).length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs font-semibold">
              No bills raised yet to generate seating reports
            </div>
          ) : (
            <div className="flex flex-col gap-2 py-3 max-h-[300px] overflow-y-auto pr-1">
              {Object.entries(stats.tableRevenue)
                .sort((a, b) => {
                  const valA = a[1] as { total: number; count: number };
                  const valB = b[1] as { total: number; count: number };
                  return valB.total - valA.total;
                })
                .map(([tbl, data], idx) => {
                  const tableData = data as { total: number; count: number };
                  return (
                    <div 
                      key={tbl} 
                      className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="text-xs font-black text-slate-800">{tbl}</span>
                          <span className="block text-[9px] text-slate-400 font-bold">{tableData.count} bill{tableData.count !== 1 ? 's' : ''} completed</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-xs text-slate-950">₹{tableData.total.toFixed(0)}</span>
                        <span className="block text-[8px] text-slate-400 font-mono font-medium">Avg: ₹{(tableData.total / tableData.count).toFixed(0)}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* RECENT INVOICES LOG & TRANSACTION MANAGER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        
        {/* Filter Toolbar */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Real-time Transaction Ledger</h4>
            <p className="text-xs text-slate-400">Total of {filteredOrders.length} matching entries found</p>
          </div>

          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                id="ledger-search"
                type="text"
                placeholder="Search code/guest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Cash/Online dropdown selector */}
            <select
              id="ledger-payment-filter"
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value as any)}
              className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none font-bold"
            >
              <option value="all">All Channels</option>
              <option value="CASH">💵 Cash Only</option>
              <option value="ONLINE">💳 Online Only</option>
            </select>

            {/* Seeding & Reset Helpers */}
            <div className="flex gap-1">
              <button
                onClick={onResetMockLogs}
                title="Repopulate mock analytics"
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors border border-slate-200 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClearLogs}
                title="Reset all stats to zero"
                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-lg transition-colors border border-red-100 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Table Log */}
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No recorded invoices fit the filters selected.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const isExpanded = expandedInvoiceId === order.id;
                const formattedDate = new Date(order.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }) + ' - ' + new Date(order.timestamp).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Summary row */}
                    <div
                      onClick={() => toggleInvoiceExpand(order.id)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
                            order.paymentMethod === 'CASH'
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                              : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          {order.paymentMethod === 'CASH' ? (
                            <Banknote className="w-4.5 h-4.5" />
                          ) : (
                            <CreditCard className="w-4.5 h-4.5" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-800 font-mono">
                              {order.invoiceNumber}
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-1.5 py-0.5 rounded">
                              {order.tableNumber || 'Walk-in'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {formattedDate} {order.customerName ? `• ${order.customerName}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <span className="block font-bold text-slate-800 text-xs font-mono">
                            ₹{order.total.toFixed(2)}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold font-mono">
                            {order.items.length} items
                          </span>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleRequestEdit(order)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                            title="Edit Invoice"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRequestDelete(order)}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Expandable products details container */}
                    {isExpanded && (
                      <div className="px-6 pb-4 pt-1 bg-slate-50 border-t border-slate-100/70 animate-slideDown">
                        <div className="max-w-md flex flex-col gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Billing Itemization
                          </span>

                          {/* Ordered items listing */}
                          <div className="flex flex-col gap-1.5 text-xs text-slate-600 font-bold">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
                                <span className="text-slate-800 font-bold">
                                  {item.name} <span className="text-slate-400 font-mono">x{item.quantity}</span>
                                </span>
                                <span className="font-mono text-slate-700">
                                  ₹{(item.price * item.quantity).toFixed(0)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Mini ledger totals */}
                          <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-col gap-1 font-mono text-[11px] text-slate-500">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>₹{order.subtotal.toFixed(2)}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between text-emerald-700 font-bold">
                                <span>Discount:</span>
                                <span>-₹{order.discount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>GST Tax ({order.gstRate !== undefined ? order.gstRate : (order.tax > 0 && (order.subtotal - order.discount) > 0 ? Math.round((order.tax / (order.subtotal - order.discount)) * 100) : 5)}%):</span>
                              <span>₹{order.tax.toFixed(2)}</span>
                            </div>
                            <div className="h-px bg-slate-200 my-1"></div>
                            <div className="flex justify-between font-bold text-slate-800">
                              <span>Invoice Grand Total:</span>
                              <span>₹{order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* 1. PASSWORD VERIFICATION DIALOG */}
      {passwordModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="font-extrabold text-xs uppercase tracking-widest">Security Authorization</span>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModal({ isOpen: false, actionType: null, order: null, passwordValue: '', error: '' })}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleVerifyPasswordSubmit} className="p-5 flex flex-col gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6 stroke-[2]" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-800 uppercase">
                  {passwordModal.actionType === 'edit' ? 'Authorize Order Editing' : 'Authorize Order Deletion'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Enter the administrator security password to manage Invoice <span className="font-mono font-bold text-slate-700">{passwordModal.order?.invoiceNumber}</span>.
                </p>
              </div>

              {/* Input field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Enter Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••"
                  value={passwordModal.passwordValue}
                  onChange={(e) => setPasswordModal(prev => ({ ...prev, passwordValue: e.target.value, error: '' }))}
                  className="w-full tracking-widest text-center py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              {/* Error log */}
              {passwordModal.error && (
                <div className="bg-red-50 text-red-600 border border-red-100 rounded-lg p-2.5 text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium leading-normal">{passwordModal.error}</span>
                </div>
              )}

              {/* Actions footer */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModal({ isOpen: false, actionType: null, order: null, passwordValue: '', error: '' })}
                  className="py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-colors uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all uppercase tracking-wider"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT ORDER DIALOG */}
      {editingOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden my-8 animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-extrabold text-xs uppercase tracking-widest block">Modify Sales Invoice</span>
                  <p className="text-[10px] text-slate-400 font-mono">Invoice: {editingOrder.invoiceNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEditOrderSubmit} className="p-5 flex flex-col gap-4">
              
              {/* Form Grid details */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Guest Name</label>
                  <input
                    type="text"
                    placeholder="Guest Name"
                    value={editCustName}
                    onChange={(e) => setEditCustName(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Table / Channel</label>
                  <select
                    value={editTableNum}
                    onChange={(e) => setEditTableNum(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Walk-in Guest</option>
                    <option value="Table 1">Table 1 (2 Seater)</option>
                    <option value="Table 2">Table 2 (2 Seater)</option>
                    <option value="Table 3">Table 3 (4 Seater)</option>
                    <option value="Table 4">Table 4 (4 Seater)</option>
                    <option value="Table 5">Table 5 (6 Seater)</option>
                    <option value="Table 6">Table 6 (6 Seater)</option>
                    <option value="Table 7">Table 7 (Bar Counter)</option>
                    <option value="Table 8">Table 8 (Outdoor)</option>
                    <option value="Takeaway">Takeaway / Parcel</option>
                    <option value="Delivery">Online Delivery</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Payment Channel</label>
                  <div className="flex border border-slate-200 rounded-lg overflow-hidden p-0.5 text-xs bg-white">
                    <button
                      type="button"
                      onClick={() => setEditPayMethod('CASH')}
                      className={`flex-1 py-1 rounded font-bold uppercase transition-all ${editPayMethod === 'CASH' ? 'bg-emerald-600 text-white shadow-inner' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      💵 Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditPayMethod('ONLINE')}
                      className={`flex-1 py-1 rounded font-bold uppercase transition-all ${editPayMethod === 'ONLINE' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      💳 Online
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">GST Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editGstRate}
                    onChange={(e) => setEditGstRate(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center"
                  />
                </div>

                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Billing Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editTimestamp ? editTimestamp.split('T')[0] : ''}
                    onChange={(e) => setEditTimestamp(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Edit Items lists */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Dishes & Portions
                </span>

                <div className="max-h-[160px] overflow-y-auto pr-1 flex flex-col gap-2 border border-slate-100 p-2 rounded-xl bg-slate-50/50">
                  {editItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 p-2 bg-white rounded-lg border border-slate-200">
                      <div className="flex-1 min-w-0">
                        <span className="block font-bold text-slate-800 text-xs truncate">{item.name}</span>
                        <span className="font-mono text-[10px] text-slate-400">₹{item.price} each</span>
                      </div>

                      {/* Quantity adjuster */}
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateEditItemQty(item.menuItemId, -1)}
                          className="w-5 h-5 text-slate-500 hover:text-emerald-600 rounded flex items-center justify-center hover:bg-white active:scale-95 transition-all"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold text-slate-700 min-w-[12px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateEditItemQty(item.menuItemId, 1)}
                          className="w-5 h-5 text-slate-500 hover:text-emerald-600 rounded flex items-center justify-center hover:bg-white active:scale-95 transition-all"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Total & Remove button */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800 text-xs min-w-[50px] text-right">
                          ₹{item.price * item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEditItem(item.menuItemId)}
                          className="p-1 text-slate-300 hover:text-red-500 rounded hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount Modifier Row */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Apply Flat Discount (₹)</label>
                </div>
                <input
                  type="number"
                  min="0"
                  max={editSubtotal}
                  value={editDiscountVal || ''}
                  onChange={(e) => setEditDiscountVal(Math.max(0, Math.min(editSubtotal, parseFloat(e.target.value) || 0)))}
                  className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="0"
                />
              </div>

              {/* Apply Date to All bills check */}
              <div className="bg-amber-500/5 text-amber-900 border border-amber-500/15 p-3 rounded-xl flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="apply-to-all-check"
                  checked={applyToAllBills}
                  onChange={(e) => setApplyToAllBills(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="apply-to-all-check" className="text-[11px] font-semibold leading-relaxed text-slate-700 select-none cursor-pointer">
                  <span className="font-extrabold text-amber-800 uppercase block text-[10px] tracking-wide mb-0.5">Apply same date to all bills</span>
                  Update all existing ledger bills to this date, and set this as the locked session date for all future bills.
                </label>
              </div>

              {/* Calculation review */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-1.5 font-mono text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{editSubtotal.toFixed(2)}</span>
                </div>
                {editDiscountVal > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount:</span>
                    <span>-₹{editDiscountVal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST Tax ({editGstRate}%):</span>
                  <span>₹{editTaxAmount.toFixed(2)}</span>
                </div>
                <div className="h-px bg-slate-200 my-1"></div>
                <div className="flex justify-between items-baseline font-sans">
                  <span className="font-extrabold text-slate-800 text-sm">Revised Grand Total:</span>
                  <span className="text-base font-black text-emerald-700">₹{editTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions footer */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-colors uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. DETAILED HISTORICAL CLOSURE DETAIL MODAL */}
      {selectedArchive && archiveStats && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <CalendarDays className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-white">
                    Historical Shift Closure Details
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold tracking-wide">
                    AUDITED ARCHIVE RECORD FOR <span className="text-emerald-300 font-mono">{selectedArchive.date}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArchive(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800/60 p-1.5 rounded-lg border border-slate-700/50"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Scrollable Body Container */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-6 bg-slate-50">
              
              {/* 1. ARCHIVE DYNAMIC KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* Total Sales KPI */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col gap-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Sales Revenue</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-400">₹</span>
                    <span className="text-lg font-black text-slate-800 font-mono">{selectedArchive.totalSales.toFixed(2)}</span>
                  </div>
                </div>

                {/* Bills Count KPI */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col gap-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Closed Invoices</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-800 font-mono">{selectedArchive.billsCount}</span>
                    <span className="text-[10px] font-bold text-slate-400">Paid Bills</span>
                  </div>
                </div>

                {/* Cash Sales KPI */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col gap-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">💵 Cash Register Sales</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-400">₹</span>
                    <span className="text-lg font-black text-emerald-700 font-mono">{selectedArchive.cashSales.toFixed(2)}</span>
                  </div>
                </div>

                {/* Online Sales KPI */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col gap-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">💳 Digital Payments</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-400">₹</span>
                    <span className="text-lg font-black text-blue-700 font-mono">{selectedArchive.onlineSales.toFixed(2)}</span>
                  </div>
                </div>

                {/* Average Bill KPI */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col gap-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Avg Ticket / Order</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-400">₹</span>
                    <span className="text-lg font-black text-slate-800 font-mono">{archiveStats.averageBill.toFixed(2)}</span>
                  </div>
                </div>

                {/* GST Tax / Discount KPI Combined */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col gap-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Tax GST / Discounts</span>
                  <div className="flex flex-col text-[10px] text-slate-500 font-mono font-bold leading-tight">
                    <span className="text-slate-700">Tax: ₹{archiveStats.totalTax.toFixed(0)}</span>
                    <span className="text-emerald-700">Disc: -₹{archiveStats.totalDiscount.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* 2. DUAL-PANEL DATA BREAKDOWN */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* LEFT COLUMN: DISH-WISE QUANTITIES SOLD */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                        <Award className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm uppercase tracking-wide">
                          Itemized Dish Sales Performance
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold">Consolidated quantities and revenue</p>
                      </div>
                    </div>
                    <span className="bg-slate-100 text-slate-600 font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                      {archiveStats.sortedDishes.length} Unique Dishes
                    </span>
                  </div>

                  {archiveStats.sortedDishes.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-400 text-xs text-center">
                      <ShoppingBag className="w-10 h-10 text-slate-300 mb-2" />
                      No dish-wise sales information found.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5 max-h-[400px] overflow-y-auto pr-1">
                      {archiveStats.sortedDishes.map((dish, index) => {
                        const bestSellerQty = archiveStats.sortedDishes[0]?.quantity || 1;
                        const barWidth = Math.max(5, (dish.quantity / bestSellerQty) * 100);
                        
                        return (
                          <div key={index} className="bg-slate-50/50 hover:bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 transition-all flex flex-col gap-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-mono text-xs font-bold text-slate-400 w-5 text-center shrink-0">
                                  #{index + 1}
                                </span>
                                <span className="font-extrabold text-xs text-slate-800 truncate">
                                  {dish.name}
                                </span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-black text-xs text-slate-900 font-mono">
                                  {dish.quantity} portions
                                </span>
                                <span className="block font-mono text-[9px] text-slate-400 font-bold">
                                  ₹{dish.price} each
                                </span>
                              </div>
                            </div>
                            
                            {/* Horizontal visual indicator bar & sales value */}
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-slate-200/70 rounded-full overflow-hidden relative">
                                <div
                                  style={{ width: `${barWidth}%` }}
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    index === 0 
                                      ? 'bg-emerald-600' 
                                      : index < 3 
                                        ? 'bg-emerald-500/80' 
                                        : 'bg-slate-400/80'
                                  }`}
                                ></div>
                              </div>
                              <span className="font-mono font-black text-xs text-emerald-700 w-16 text-right">
                                ₹{dish.revenue.toFixed(0)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: ARCHIVED DAY'S TRANSACTION LEDGER */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm uppercase tracking-wide">
                          Archived Bills Audit Ledger
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold">Bill-wise detailed checkout ledger</p>
                      </div>
                    </div>
                  </div>

                  {/* Filter and Search Bar for Archived day */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                      <input
                        type="text"
                        placeholder="Search invoice/guest/table..."
                        value={archiveSearchQuery}
                        onChange={(e) => setArchiveSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                      />
                    </div>
                    <select
                      value={archiveFilterPayment}
                      onChange={(e) => setArchiveFilterPayment(e.target.value as any)}
                      className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none font-bold"
                    >
                      <option value="all">All Channels</option>
                      <option value="CASH">💵 Cash</option>
                      <option value="ONLINE">💳 Online</option>
                    </select>
                  </div>

                  {filteredArchiveOrders.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-400 text-xs text-center">
                      <Search className="w-10 h-10 text-slate-300 mb-2" />
                      No matching records fit the filters.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto pr-1 border border-slate-100 rounded-xl bg-slate-50/20">
                      {filteredArchiveOrders.map((order) => {
                        const isExpanded = expandedArchiveInvoiceId === order.id;
                        const formattedTime = new Date(order.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        
                        return (
                          <div key={order.id} className="hover:bg-slate-50 transition-colors">
                            <div
                              onClick={() => setExpandedArchiveInvoiceId(isExpanded ? null : order.id)}
                              className="p-3 flex items-center justify-between gap-3 cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border text-[10px] ${
                                  order.paymentMethod === 'CASH'
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                    : 'bg-slate-100 border-slate-200 text-slate-700'
                                }`}>
                                  {order.paymentMethod === 'CASH' ? '💵' : '💳'}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="font-extrabold text-xs text-slate-800 font-mono">{order.invoiceNumber}</span>
                                    <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded font-bold">{order.tableNumber || 'Walk-in'}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5 font-mono">
                                    {formattedTime} {order.customerName ? `• ${order.customerName}` : ''}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-right">
                                <div>
                                  <span className="block font-black text-slate-800 text-xs font-mono">₹{order.total.toFixed(0)}</span>
                                  <span className="text-[9px] text-slate-400 font-bold block font-mono">{order.items.length} items</span>
                                </div>
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                              </div>
                            </div>

                            {/* Bill Itemization Inside Archive details */}
                            {isExpanded && (
                              <div className="px-4 pb-3 pt-1 bg-slate-50 border-t border-slate-100/70 animate-slideDown">
                                <div className="flex flex-col gap-1.5 text-xs">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                                    Bill Itemization
                                  </span>
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-200 font-bold text-slate-600 text-[11px]">
                                      <span className="text-slate-700">
                                        {item.name} <span className="text-slate-400 font-mono text-[10px]">x{item.quantity}</span>
                                      </span>
                                      <span className="font-mono text-slate-800">
                                        ₹{(item.price * item.quantity).toFixed(0)}
                                      </span>
                                    </div>
                                  ))}
                                  
                                  {/* Subtotals & Taxes */}
                                  <div className="mt-1 pt-1.5 border-t border-slate-200/60 flex flex-col gap-0.5 font-mono text-[10px] text-slate-500">
                                    <div className="flex justify-between">
                                      <span>Subtotal:</span>
                                      <span>₹{order.subtotal.toFixed(1)}</span>
                                    </div>
                                    {order.discount > 0 && (
                                      <div className="flex justify-between text-emerald-700">
                                        <span>Discount:</span>
                                        <span>-₹{order.discount.toFixed(1)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span>GST Tax ({order.gstRate || 5}%):</span>
                                      <span>₹{order.tax.toFixed(1)}</span>
                                    </div>
                                    <div className="h-px bg-slate-200 my-0.5"></div>
                                    <div className="flex justify-between font-bold text-slate-700 text-[11px]">
                                      <span>Invoice Total:</span>
                                      <span>₹{order.total.toFixed(1)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 border-t border-slate-200 p-4 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedArchive(null)}
                className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all uppercase tracking-wider cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
