/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, Receipt, Percent, User, Layers, ArrowRight, RotateCcw, Printer, Eye, X, ChevronRight, Banknote, CreditCard, History } from 'lucide-react';
import { MenuItem, CartItem, Category, PaymentMethod, Order } from '../types';
import { DEFAULT_CATEGORIES } from '../data';

interface BillCalculatorProps {
  menuItems: MenuItem[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  discount: number;
  setDiscount: (v: number) => void;
  discountType: 'percentage' | 'flat';
  setDiscountType: (type: 'percentage' | 'flat') => void;
  gstRate: number;
  setGstRate: (v: number) => void;
  customerName: string;
  setCustomerName: (v: string) => void;
  tableNumber: string;
  setTableNumber: (v: string) => void;
  onOpenPaymentModal: () => void;
  orders?: Order[];
  onDeleteOrder?: (id: string) => void;
}

export default function BillCalculator({
  menuItems,
  cart,
  setCart,
  discount,
  setDiscount,
  discountType,
  setDiscountType,
  gstRate,
  setGstRate,
  customerName,
  setCustomerName,
  tableNumber,
  setTableNumber,
  onOpenPaymentModal,
  orders = [],
  onDeleteOrder,
}: BillCalculatorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'menu' | 'cart'>('menu'); // Mobile-only helper
  const [rightPanelTab, setRightPanelTab] = useState<'cart' | 'history'>('cart');
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);

  // Calculate totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  }, [cart]);

  const calculatedDiscountAmount = useMemo(() => {
    if (discountType === 'percentage') {
      return (subtotal * discount) / 100;
    }
    return discount;
  }, [subtotal, discount, discountType]);

  const taxAmount = useMemo(() => {
    // Dynamic GST on the post-discount price
    const taxableAmount = Math.max(0, subtotal - calculatedDiscountAmount);
    return taxableAmount * (gstRate / 100);
  }, [subtotal, calculatedDiscountAmount, gstRate]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - calculatedDiscountAmount + taxAmount);
  }, [subtotal, calculatedDiscountAmount, taxAmount]);

  // Handle Cart Operations
  const addToCart = (item: MenuItem) => {
    if (!item.isAvailable) return;
    setCart((prevCart) => {
      const existing = prevCart.find((ci) => ci.menuItem.id === item.id);
      if (existing) {
        return prevCart.map((ci) =>
          ci.menuItem.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prevCart, { menuItem: item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((ci) => {
          if (ci.menuItem.id === itemId) {
            const newQty = ci.quantity + delta;
            return { ...ci, quantity: newQty };
          }
          return ci;
        })
        .filter((ci) => ci.quantity > 0);
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((ci) => ci.menuItem.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCustomerName('');
    setTableNumber('');
  };

  // Filter Menu Items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  const todayOrders = useMemo(() => {
    const todayStr = new Date().toDateString();
    return orders.filter((o) => new Date(o.timestamp).toDateString() === todayStr);
  }, [orders]);

  const todayStats = useMemo(() => {
    const total = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const cash = todayOrders.filter(o => o.paymentMethod === 'CASH').reduce((sum, o) => sum + o.total, 0);
    const online = total - cash;
    return { total, cash, online, count: todayOrders.length };
  }, [todayOrders]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      
      {/* LEFT PANEL: Menu Catalog Selector (Takes 3/5 on large screens) */}
      <div className={`flex-1 flex flex-col gap-4 ${activeTab === 'cart' ? 'hidden md:flex' : 'flex'}`}>
        {/* Search and Category Filter Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              id="menu-search-input"
              type="text"
              placeholder="Search dishes, drinks, or desserts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Quick Categories list scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              key="all"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-100/50'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Dishes
            </button>
            {DEFAULT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-100/50'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid Scroll */}
        <div className="flex-1 overflow-y-auto pr-1 max-h-[50vh] md:max-h-[60vh] lg:max-h-[70vh] min-h-[300px]">
          {menuItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200 px-4">
              <span className="text-slate-300 font-bold block mb-2 text-3xl">🍽️</span>
              <p className="text-slate-700 text-sm font-bold">Your Dishes Catalog is Empty</p>
              <p className="text-slate-400 text-[11px] mt-1.5 max-w-xs mx-auto">Please go to "Dishes & Menu" management to populate items for this billing session.</p>
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
              <span className="text-slate-300 font-bold block mb-2 text-2xl">🍽️</span>
              <p className="text-slate-500 text-sm font-medium">No dishes found matching your search</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-2 text-xs text-emerald-600 font-semibold hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className={`group bg-white rounded-xl border p-3 flex flex-col justify-between transition-all cursor-pointer ${
                    item.isAvailable
                      ? 'border-slate-200 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-50/20 active:scale-[0.98]'
                      : 'border-slate-150 bg-slate-50/50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-bold text-slate-800 text-sm group-hover:text-emerald-600 transition-colors line-clamp-1">
                        {item.name}
                      </span>
                      {/* Veg/Non-Veg Visual Indicator dots */}
                      <span
                        className={`w-3 h-3 border flex items-center justify-center rounded-sm shrink-0 mt-0.5 ${
                          item.category === 'chicken_specials' || item.category === 'egg_specials' || item.name.toLowerCase().includes('chicken') || item.name.toLowerCase().includes('egg')
                            ? 'border-red-400 p-[1px]'
                            : 'border-green-500 p-[1px]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.category === 'chicken_specials' || item.category === 'egg_specials' || item.name.toLowerCase().includes('chicken') || item.name.toLowerCase().includes('egg')
                              ? 'bg-red-500'
                              : 'bg-green-600'
                          }`}
                        ></span>
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed h-8">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      ₹{item.price}
                    </span>
                    {item.isAvailable ? (
                      <span className="w-6 h-6 bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white rounded-lg flex items-center justify-center transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">
                        Out
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Shopping Bill & Daily Sales History Tabbed Container (Takes 2/5 on large screens) */}
      <div className={`w-full lg:w-[380px] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden shrink-0 ${activeTab === 'menu' ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Navigation Tabs for Right Panel */}
        <div className="flex bg-slate-100 border-b border-slate-200 text-xs font-bold font-sans">
          <button
            type="button"
            onClick={() => setRightPanelTab('cart')}
            className={`flex-1 py-3 px-4 border-b-2 text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              rightPanelTab === 'cart' 
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-sm' 
                : 'border-transparent text-slate-500 hover:text-slate-800 bg-slate-50/50'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Active Cart ({cart.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setRightPanelTab('history')}
            className={`flex-1 py-3 px-4 border-b-2 text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              rightPanelTab === 'history' 
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-sm' 
                : 'border-transparent text-slate-500 hover:text-slate-800 bg-slate-50/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Today's Bills ({todayOrders.length})</span>
          </button>
        </div>

        {rightPanelTab === 'cart' ? (
          <>
            {/* Active Cart Title & Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Compile Order Details</span>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-500 font-bold py-0.5 px-1.5 hover:bg-red-50 rounded transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear Cart
                </button>
              )}
            </div>

            {/* Customer & Table config inputs */}
            <div className="p-3 bg-slate-50/50 border-b border-slate-200 grid grid-cols-2 gap-2">
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input
                  id="customer-name-input"
                  type="text"
                  placeholder="Guest Name (Opt)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>
              <div className="relative">
                <Layers className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <select
                  id="table-selection"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none font-bold"
                >
                  <option value="">Select Table</option>
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
            </div>

            {/* Cart Item Rows */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-[180px] max-h-[350px]">
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <span className="text-3xl filter grayscale opacity-40 mb-2">📥</span>
                  <p className="text-slate-400 text-xs font-bold">Your bill list is empty</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">Click any food items on the left to add</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="block font-bold text-slate-800 text-xs truncate">
                        {item.menuItem.name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        ₹{item.menuItem.price} x {item.quantity}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, -1)}
                        className="w-5 h-5 text-slate-500 hover:text-emerald-600 rounded flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-700 min-w-[12px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, 1)}
                        className="w-5 h-5 text-slate-500 hover:text-emerald-600 rounded flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800 text-xs min-w-[50px] text-right">
                        ₹{item.menuItem.price * item.quantity}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.menuItem.id)}
                        className="p-1 text-slate-300 hover:text-red-500 rounded hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bill calculation modifiers (Discounts, Tax, etc) */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col gap-3">
              {/* Discount Settings row */}
              <div className="flex flex-col gap-2 bg-white p-2.5 border border-slate-200 rounded-lg animate-fadeIn">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Percent className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-bold">Discount:</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {/* Type selector */}
                    <div className="flex border border-slate-200 rounded-lg overflow-hidden p-0.5 text-[10px] font-bold bg-slate-50">
                      <button
                        type="button"
                        onClick={() => {
                          setDiscountType('percentage');
                          setDiscount(0);
                        }}
                        className={`px-1.5 py-0.5 rounded ${discountType === 'percentage' ? 'bg-emerald-600 text-white shadow-inner' : 'text-slate-500'}`}
                      >
                        %
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDiscountType('flat');
                          setDiscount(0);
                        }}
                        className={`px-1.5 py-0.5 rounded ${discountType === 'flat' ? 'bg-emerald-600 text-white shadow-inner' : 'text-slate-500'}`}
                      >
                        ₹
                      </button>
                    </div>

                    {/* Slider / input */}
                    <input
                      id="discount-input"
                      type="number"
                      min="0"
                      max={discountType === 'percentage' ? '100' : subtotal.toFixed(0)}
                      value={discount || ''}
                      onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-16 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold font-mono text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* GST Settings row */}
              <div className="flex flex-col gap-2 bg-white p-2.5 border border-slate-200 rounded-lg animate-fadeIn">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-bold">GST Rate:</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {/* Quick GST select buttons */}
                    <div className="flex border border-slate-200 rounded-lg overflow-hidden p-0.5 text-[10px] font-bold bg-slate-50">
                      {[0, 5, 12, 18].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setGstRate(rate)}
                          className={`px-1.5 py-0.5 rounded transition-all ${gstRate === rate ? 'bg-emerald-600 text-white shadow-inner' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>

                    {/* Custom input */}
                    <input
                      id="gst-rate-input"
                      type="number"
                      min="0"
                      max="100"
                      value={gstRate}
                      onChange={(e) => setGstRate(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                      className="w-12 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold font-mono text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>

              {/* Checkout pricing details block */}
              <div className="flex flex-col gap-1.5 font-mono text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {calculatedDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount Apply:</span>
                    <span>-₹{calculatedDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST Tax ({gstRate}%):</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="h-px bg-slate-200 my-1"></div>
                <div className="flex justify-between items-baseline">
                  <span className="font-sans text-sm font-extrabold text-slate-800">Total Payable:</span>
                  <span id="bill-total-price" className="font-sans text-lg font-black text-emerald-700">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Print & Proceed Button */}
              <button
                id="proceed-checkout-button"
                type="button"
                disabled={cart.length === 0}
                onClick={onOpenPaymentModal}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-black py-2.5 px-4 rounded-lg shadow-lg shadow-emerald-50/10 hover:shadow-emerald-100 flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
              >
                Checkout & Pay
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          /* TODAY'S SALES HISTORY/LEDGER TAB CONTENT */
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Header statistics info */}
            <div className="p-3 border-b border-slate-100 bg-emerald-50/30 flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">Session Completed Bills</span>
              <span className="text-xs font-mono font-extrabold text-emerald-600">₹{todayStats.total.toFixed(2)}</span>
            </div>

            {/* List of completed orders for today */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-slate-50/40">
              {todayOrders.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                  <History className="w-8 h-8 text-slate-300 animate-pulse mb-2" />
                  <p className="text-slate-400 text-xs font-bold">No completed bills today</p>
                  <p className="text-[10px] text-slate-300 mt-1 max-w-[200px]">Completed orders from active shift will list here for instant reprint/void.</p>
                </div>
              ) : (
                todayOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="p-2.5 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl transition-all shadow-sm hover:shadow flex flex-col gap-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-slate-700 font-mono">{order.invoiceNumber}</span>
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                          order.paymentMethod === 'CASH' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {order.paymentMethod}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-900 font-mono">₹{order.total.toFixed(0)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>{order.customerName || order.tableNumber || 'Guest'}</span>
                      <span>{new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="h-px bg-slate-100 my-0.5"></div>

                    {/* Compact Interactive Action buttons */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setPreviewOrder(order)}
                        className="flex-1 py-1 px-2 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-[10px] font-extrabold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-slate-400 hover:text-emerald-500" />
                        <span>View Receipt</span>
                      </button>

                      {onDeleteOrder && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to VOID/DELETE invoice ${order.invoiceNumber}? This will remove ₹${order.total} from shift statistics.`)) {
                              onDeleteOrder(order.id);
                            }
                          }}
                          className="py-1 px-2 hover:bg-red-50 text-slate-400 hover:text-red-500 border border-transparent hover:border-red-100 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title="Void order invoice"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Void</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Shift mini cash-register summary board */}
            <div className="p-3 bg-slate-100/80 border-t border-slate-200 font-sans flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Today's Register Draw</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-1.5 border border-slate-200 rounded-lg flex justify-between items-center">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                    Cash:
                  </span>
                  <span className="font-mono font-bold text-slate-800">₹{todayStats.cash.toFixed(0)}</span>
                </div>
                <div className="bg-white p-1.5 border border-slate-200 rounded-lg flex justify-between items-center">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                    Online:
                  </span>
                  <span className="font-mono font-bold text-slate-800">₹{todayStats.online.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE-ONLY TABS TRIGGER FLOAT */}
      <div className="fixed bottom-14 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-slate-200 p-2 md:hidden grid grid-cols-2 gap-2 shadow-lg">
        <button
          onClick={() => setActiveTab('menu')}
          className={`py-2 px-4 rounded-lg text-xs font-bold uppercase transition-all ${
            activeTab === 'menu' ? 'bg-emerald-600 text-white' : 'text-slate-500 bg-slate-100'
          }`}
        >
          🍳 Dishes Menu ({menuItems.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('cart');
            setRightPanelTab('cart');
          }}
          className={`py-2 px-4 rounded-lg text-xs font-bold uppercase transition-all relative ${
            activeTab === 'cart' ? 'bg-emerald-600 text-white' : 'text-slate-500 bg-slate-100'
          }`}
        >
          🛒 Active Bill ({cart.length})
          {cart.length > 0 && (
            <span className="absolute -top-1.5 -right-1 bg-red-500 text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold animate-bounce">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* THERMAL RECEIPT MODAL PREVIEW */}
      {previewOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button 
              onClick={() => setPreviewOrder(null)}
              className="absolute right-4 top-4 w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Receipt Header */}
            <div className="text-center font-mono flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                <Receipt className="w-4 h-4" />
              </span>
              <span className="font-extrabold text-sm uppercase tracking-wide">Veera's Restaurant</span>
              <span className="text-[10px] text-slate-500">12, High Street Mall, Delhi</span>
              <span className="text-[10px] text-slate-500">Phone: +91 98765 43210</span>
              <span className="text-[10px] text-slate-400 block mt-1">------------------------------</span>
              <span className="font-bold text-xs uppercase tracking-wider block">INVOICE BILL RECEIPT</span>
              <span className="text-[10px] text-slate-400 block">------------------------------</span>
            </div>

            {/* Receipt metadata */}
            <div className="font-mono text-[10px] text-slate-600 flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Invoice No:</span>
                <span className="font-bold text-slate-800">{previewOrder.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(previewOrder.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{new Date(previewOrder.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
              {previewOrder.tableNumber && (
                <div className="flex justify-between">
                  <span>Table Selection:</span>
                  <span className="font-bold text-slate-800">{previewOrder.tableNumber}</span>
                </div>
              )}
              {previewOrder.customerName && (
                <div className="flex justify-between">
                  <span>Guest Name:</span>
                  <span className="font-bold text-slate-800">{previewOrder.customerName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-bold text-slate-800">{previewOrder.paymentMethod}</span>
              </div>
            </div>

            <div className="text-center font-mono text-[10px] text-slate-400">------------------------------</div>

            {/* Receipt items list */}
            <div className="font-mono text-[11px] flex flex-col gap-2">
              <div className="flex justify-between font-bold text-slate-800 text-[10px]">
                <span className="w-1/2 text-left">ITEM</span>
                <span className="w-1/6 text-center">QTY</span>
                <span className="w-1/3 text-right">TOTAL</span>
              </div>
              <div className="h-px bg-slate-100"></div>

              {previewOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-slate-700">
                  <span className="w-1/2 text-left truncate">{it.name}</span>
                  <span className="w-1/6 text-center">{it.quantity}</span>
                  <span className="w-1/3 text-right">₹{(it.price * it.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div className="text-center font-mono text-[10px] text-slate-400">------------------------------</div>

            {/* Receipt Summary calculation */}
            <div className="font-mono text-[11px] flex flex-col gap-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal Items:</span>
                <span>₹{(previewOrder.subtotal ?? previewOrder.total).toFixed(2)}</span>
              </div>
              
              {previewOrder.discountAmount !== undefined && previewOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discounts Applied:</span>
                  <span>-₹{previewOrder.discountAmount.toFixed(2)}</span>
                </div>
              )}

              {previewOrder.taxAmount !== undefined && previewOrder.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>GST Tax Breakdown:</span>
                  <span>₹{previewOrder.taxAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="h-px bg-slate-200"></div>
              <div className="flex justify-between font-bold text-slate-950 text-sm">
                <span>TOTAL AMOUNT:</span>
                <span>₹{previewOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center font-mono text-[10px] text-slate-400">------------------------------</div>

            {/* Printed footer signature */}
            <div className="text-center font-mono text-[9px] text-slate-400 flex flex-col gap-0.5">
              <span>Thank you for visiting Veera's!</span>
              <span>Please come back soon.</span>
              <span className="font-extrabold mt-1">POS DIGITAL DUPLICATE COPY</span>
            </div>

            {/* Quick print action trigger */}
            <button
              type="button"
              onClick={() => {
                alert(`Directing duplicate print command for invoice ${previewOrder.invoiceNumber} to the local POS thermal printer...`);
                setPreviewOrder(null);
              }}
              className="mt-2 w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Print Invoice Receipt</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
