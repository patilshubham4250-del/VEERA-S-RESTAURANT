/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  Save, 
  Plus, 
  Trash2, 
  Sparkles, 
  Calculator, 
  AlertCircle, 
  Banknote, 
  CreditCard, 
  Receipt, 
  FileText, 
  Utensils,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { DailyArchive, ArchiveItemSummary, MenuItem, Category } from '../types';

interface EditHistoricalArchiveModalProps {
  archive: DailyArchive;
  menuItems?: MenuItem[];
  categories?: Category[];
  onClose: () => void;
  onSave: (updatedArchive: DailyArchive) => void;
}

export default function EditHistoricalArchiveModal({
  archive,
  menuItems = [],
  categories = [],
  onClose,
  onSave,
}: EditHistoricalArchiveModalProps) {
  // Extract initial items summary from archive (either archive.itemsSummary or derived from archive.orders)
  const initialItems = useMemo<ArchiveItemSummary[]>(() => {
    if (archive.itemsSummary && archive.itemsSummary.length > 0) {
      return archive.itemsSummary.map(item => ({ ...item }));
    }
    if (archive.orders && archive.orders.length > 0) {
      const map: Record<string, { quantity: number; revenue: number; price: number; category?: string }> = {};
      archive.orders.forEach((order) => {
        order.items.forEach((item) => {
          if (!map[item.name]) {
            map[item.name] = { 
              quantity: 0, 
              revenue: 0, 
              price: item.price,
              category: menuItems.find(m => m.name.toLowerCase() === item.name.toLowerCase())?.category || 'chicken_special'
            };
          }
          map[item.name].quantity += item.quantity;
          map[item.name].revenue += item.price * item.quantity;
        });
      });
      return Object.entries(map).map(([name, data]) => ({
        name,
        quantity: data.quantity,
        price: data.price,
        revenue: data.revenue,
        category: data.category
      }));
    }
    return [];
  }, [archive, menuItems]);

  // Form states
  const [dateStr, setDateStr] = useState<string>(archive.date);
  const [isoDate, setIsoDate] = useState<string>(() => {
    if (archive.timestamp) {
      try {
        return new Date(archive.timestamp).toISOString().split('T')[0];
      } catch (e) {
        return new Date().toISOString().split('T')[0];
      }
    }
    return new Date().toISOString().split('T')[0];
  });
  const [totalSales, setTotalSales] = useState<number>(archive.totalSales);
  const [cashSales, setCashSales] = useState<number>(archive.cashSales);
  const [onlineSales, setOnlineSales] = useState<number>(archive.onlineSales);
  const [billsCount, setBillsCount] = useState<number>(archive.billsCount);
  const [notes, setNotes] = useState<string>(archive.notes || '');
  const [items, setItems] = useState<ArchiveItemSummary[]>(initialItems);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'financials' | 'items'>('financials');

  // New Item Row state
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemPrice, setNewItemPrice] = useState<number>(0);
  const [newItemCategory, setNewItemCategory] = useState<string>(categories[0]?.id || 'chicken_special');

  // Handle Date picker change
  const handleDateChange = (newIso: string) => {
    setIsoDate(newIso);
    try {
      const d = new Date(newIso);
      const formatted = d.toLocaleDateString([], {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      setDateStr(formatted);
    } catch (e) {
      // ignore
    }
  };

  // Add Item to table
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      setErrorMsg('Item name cannot be empty.');
      return;
    }
    if (newItemQty <= 0) {
      setErrorMsg('Item quantity must be greater than 0.');
      return;
    }
    if (newItemPrice < 0) {
      setErrorMsg('Item price cannot be negative.');
      return;
    }

    const newItem: ArchiveItemSummary = {
      name: newItemName.trim(),
      quantity: newItemQty,
      price: newItemPrice,
      revenue: newItemPrice * newItemQty,
      category: newItemCategory
    };

    setItems(prev => [...prev, newItem]);
    setNewItemName('');
    setNewItemQty(1);
    setNewItemPrice(0);
    setErrorMsg('');
  };

  // When picking a dish from dropdown
  const handleSelectPredefinedDish = (dishId: string) => {
    const dish = menuItems.find(m => m.id === dishId);
    if (dish) {
      setNewItemName(dish.name);
      setNewItemPrice(dish.price);
      setNewItemCategory(dish.category);
    }
  };

  // Delete an item
  const handleDeleteItem = (index: number) => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Update item in table
  const handleItemFieldChange = (index: number, field: keyof ArchiveItemSummary, value: any) => {
    setItems(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'price') {
        const qty = field === 'quantity' ? Number(value) || 0 : updated.quantity;
        const pr = field === 'price' ? Number(value) || 0 : updated.price;
        updated.revenue = qty * pr;
      }
      return updated;
    }));
  };

  // Auto-calculate total from items
  const handleAutoCalcFromItems = () => {
    const sum = items.reduce((acc, curr) => acc + (curr.revenue || curr.price * curr.quantity), 0);
    setTotalSales(sum);
    // Proportional or evenly balance cash & online
    if (cashSales + onlineSales > 0) {
      const cashRatio = cashSales / (cashSales + onlineSales);
      setCashSales(Math.round(sum * cashRatio));
      setOnlineSales(sum - Math.round(sum * cashRatio));
    } else {
      setCashSales(Math.round(sum * 0.5));
      setOnlineSales(sum - Math.round(sum * 0.5));
    }
  };

  // Auto-balance cash & online to match total
  const handleAutoBalancePayment = () => {
    const diff = totalSales - (cashSales + onlineSales);
    if (diff !== 0) {
      setOnlineSales(Math.max(0, onlineSales + diff));
    }
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (totalSales < 0) {
      setErrorMsg('Total sales cannot be negative.');
      return;
    }
    if (billsCount < 0) {
      setErrorMsg('Bills count cannot be negative.');
      return;
    }

    const updatedArchive: DailyArchive = {
      ...archive,
      date: dateStr.trim(),
      timestamp: new Date(isoDate).toISOString(),
      totalSales: Number(totalSales),
      cashSales: Number(cashSales),
      onlineSales: Number(onlineSales),
      billsCount: Number(billsCount),
      itemsSummary: items,
      notes: notes.trim() || undefined
    };

    onSave(updatedArchive);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-white">
                Edit Historical Day Closure
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Full editing control for dates, sales figures, itemized dishes sold, and shift notes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800/60 p-1.5 rounded-lg border border-slate-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigator */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-4 pt-2 shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('financials')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'financials'
                ? 'bg-white text-emerald-700 border-t border-x border-slate-200 shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>Dates & Financial Totals</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'items'
                ? 'bg-white text-emerald-700 border-t border-x border-slate-200 shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Itemized Dishes Sold ({items.length})</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5 bg-slate-50">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: FINANCIALS & DATES */}
          {activeTab === 'financials' && (
            <div className="flex flex-col gap-5">
              
              {/* Date Card */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  Date Configuration
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Closure Calendar Date *</label>
                    <input
                      type="date"
                      value={isoDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      required
                      className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Display Label / Date String *</label>
                    <input
                      type="text"
                      value={dateStr}
                      onChange={(e) => setDateStr(e.target.value)}
                      required
                      placeholder="e.g. Sat, Oct 31, 2026"
                      className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Metrics Card */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                    Revenue & Ledger Totals
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoBalancePayment}
                      className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Adjust online sales so cash + online = total"
                    >
                      <Calculator className="w-3 h-3" />
                      Auto-balance Channels
                    </button>
                    {items.length > 0 && (
                      <button
                        type="button"
                        onClick={handleAutoCalcFromItems}
                        className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Sum all item revenues and apply to total sales"
                      >
                        <Sparkles className="w-3 h-3" />
                        Calc From Items (₹{items.reduce((acc, c) => acc + (c.revenue || c.price * c.quantity), 0).toFixed(0)})
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-600">Total Sales Revenue (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={totalSales}
                        onChange={(e) => setTotalSales(parseFloat(e.target.value) || 0)}
                        required
                        className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-emerald-700">Cash Register Sales (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={cashSales}
                        onChange={(e) => setCashSales(parseFloat(e.target.value) || 0)}
                        required
                        className="w-full pl-7 pr-3 py-2 bg-emerald-50/40 border border-emerald-200 rounded-lg text-xs font-black font-mono text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-blue-700">Digital / Online Sales (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={onlineSales}
                        onChange={(e) => setOnlineSales(parseFloat(e.target.value) || 0)}
                        required
                        className="w-full pl-7 pr-3 py-2 bg-blue-50/40 border border-blue-200 rounded-lg text-xs font-black font-mono text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-600">Closed Invoices Count</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={billsCount}
                      onChange={(e) => setBillsCount(parseInt(e.target.value, 10) || 0)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Validation Note */}
                <div className="flex items-center justify-between text-[11px] font-mono p-2 bg-slate-100 rounded-lg text-slate-600">
                  <span>Cash + Online = ₹{(cashSales + onlineSales).toFixed(0)}</span>
                  <span className={cashSales + onlineSales === totalSales ? 'text-emerald-700 font-bold' : 'text-amber-600 font-bold'}>
                    {cashSales + onlineSales === totalSales ? '✓ Balanced with Total Sales' : `Difference: ₹${(totalSales - (cashSales + onlineSales)).toFixed(0)}`}
                  </span>
                </div>
              </div>

              {/* Notes Card */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  Shift Remarks & Notes (Optional)
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Festival peak rush, 4 VIP banquet tables, weather was rainy..."
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none placeholder-slate-400"
                />
              </div>

            </div>
          )}

          {/* TAB 2: ITEMISED DISHES */}
          {activeTab === 'items' && (
            <div className="flex flex-col gap-5">
              
              {/* Add Item Card */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    Record Dish Sold in this Closure
                  </span>

                  {menuItems.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-bold">Quick Pick:</span>
                      <select
                        onChange={(e) => handleSelectPredefinedDish(e.target.value)}
                        defaultValue=""
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none font-semibold cursor-pointer max-w-[200px] truncate"
                      >
                        <option value="" disabled>Choose Menu Dish...</option>
                        {menuItems.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} (₹{m.price})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-5 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Dish Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Chicken Sukka"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(parseInt(e.target.value, 10) || 1)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Unit Price (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-3 flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Dish
                    </button>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                <div className="p-3 bg-slate-100/70 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-slate-600" />
                    <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                      Day's Recorded Dishes ({items.length})
                    </span>
                  </div>
                  
                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAutoCalcFromItems}
                      className="text-[10px] font-bold text-emerald-700 bg-white hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Sync Total Revenue: ₹{items.reduce((acc, c) => acc + (c.revenue || c.price * c.quantity), 0).toFixed(0)}
                    </button>
                  )}
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-medium">
                    No individual dishes logged for this historical day closure. You can add them above.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                    {items.map((item, index) => (
                      <div key={index} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemFieldChange(index, 'name', e.target.value)}
                            className="font-bold text-xs text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none w-full py-0.5"
                          />
                          {item.category && (
                            <span className="text-[9px] font-bold uppercase text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                              {categories.find(c => c.id === item.category)?.name || item.category}
                            </span>
                          )}
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 font-bold">Qty:</span>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={item.quantity}
                              onChange={(e) => handleItemFieldChange(index, 'quantity', parseInt(e.target.value, 10) || 1)}
                              className="w-14 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded font-mono text-xs font-bold text-center text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 font-bold">₹:</span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.price}
                              onChange={(e) => handleItemFieldChange(index, 'price', parseFloat(e.target.value) || 0)}
                              className="w-16 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded font-mono text-xs font-bold text-center text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          <div className="w-20 text-right font-mono font-bold text-xs text-slate-900">
                            ₹{(item.revenue || item.price * item.quantity).toFixed(0)}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteItem(index)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 mt-2">
            <div className="text-[11px] font-bold text-slate-500 font-mono">
              Closure ID: <span className="text-slate-700">{archive.id}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Changes to Closure
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
