/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Receipt, 
  Percent, 
  User, 
  Layers, 
  ArrowRight, 
  RotateCcw, 
  Printer, 
  Eye, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Banknote, 
  CreditCard, 
  History,
  Flame,
  UtensilsCrossed,
  Salad,
  Fish,
  CookingPot,
  Sandwich,
  Disc,
  Egg,
  Sparkles,
  Soup,
  CupSoda,
  Utensils,
  LayoutGrid,
  Check,
  GlassWater
} from 'lucide-react';
import { MenuItem, CartItem, Category, PaymentMethod, Order } from '../types';
import { DEFAULT_CATEGORIES } from '../data';
import { getCategoryIcon } from '../utils/categoryIcons';

interface BillCalculatorProps {
  menuItems: MenuItem[];
  categories?: Category[];
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

// Icon mapping helper for all 14 categories
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  chicken_special: Flame,
  mutton_special: UtensilsCrossed,
  veg_special: Salad,
  fish_special: Fish,
  rice: CookingPot,
  bread: Sandwich,
  papad: Disc,
  egg_special: Egg,
  veeras_special: Sparkles,
  ukad: Soup,
  chicken_chinese_special: Flame,
  soups: CupSoda,
  veg_soyabean: Utensils,
  rice_noodles: Layers,
  beverages: GlassWater,
};

export default function BillCalculator({
  menuItems,
  categories = DEFAULT_CATEGORIES,
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
  const [isCategoryWrapExpanded, setIsCategoryWrapExpanded] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'menu' | 'cart' | 'history'>('menu');
  const [rightPanelTab, setRightPanelTab] = useState<'cart' | 'history'>('cart');
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);

  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  // Calculate totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  }, [cart]);

  const totalQuantity = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const calculatedDiscountAmount = useMemo(() => {
    if (discountType === 'percentage') {
      return (subtotal * discount) / 100;
    }
    return discount;
  }, [subtotal, discount, discountType]);

  const taxAmount = useMemo(() => {
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

  // Quick category counts map
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: menuItems.length };
    categories.forEach((cat) => {
      counts[cat.id] = 0;
    });

    menuItems.forEach((item) => {
      const cat = item.category;
      if (cat in counts) {
        counts[cat] = (counts[cat] || 0) + 1;
      } else if (cat === 'chicken_specials') {
        counts['chicken_special'] = (counts['chicken_special'] || 0) + 1;
      } else if (cat === 'egg_specials') {
        counts['egg_special'] = (counts['egg_special'] || 0) + 1;
      }

      // Allow Pav to show count in both Bread and Veg & Soyabean Delights pairings
      if (item.id === 'extra_pav') {
        counts['veg_soyabean'] = (counts['veg_soyabean'] || 0) + 1;
      }
    });

    return counts;
  }, [menuItems, categories]);

  // Filter Menu Items with guaranteed unique item IDs
  const filteredMenuItems = useMemo(() => {
    const seen = new Set<string>();
    return menuItems.filter((item) => {
      if (!item || !item.id) return false;
      if (seen.has(item.id)) return false;
      seen.add(item.id);

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        item.category.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === 'all' ||
        item.category === selectedCategory ||
        (selectedCategory === 'chicken_special' && (item.category === 'chicken_specials' || item.category === 'chicken_special')) ||
        (selectedCategory === 'egg_special' && (item.category === 'egg_specials' || item.category === 'egg_special')) ||
        (selectedCategory === 'veg_soyabean' && (item.category === 'veg_soyabean' || item.id === 'extra_pav' || item.id === 'only_bhaji')) ||
        (selectedCategory === 'bread' && (item.category === 'bread' || item.id === 'extra_pav'));

      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  const todayOrders = useMemo(() => {
    const todayStr = new Date().toDateString();
    return orders.filter((o) => new Date(o.timestamp).toDateString() === todayStr);
  }, [orders]);

  const todayStats = useMemo(() => {
    const totalSales = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const cash = todayOrders.filter((o) => o.paymentMethod === 'CASH').reduce((sum, o) => sum + o.total, 0);
    const online = totalSales - cash;
    return { total: totalSales, cash, online, count: todayOrders.length };
  }, [todayOrders]);

  // Scroll categories horizontally
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      categoriesScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Helper to get cart quantity for an item
  const getItemCartQuantity = (itemId: string) => {
    const found = cart.find((ci) => ci.menuItem.id === itemId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 h-full flex-1 min-h-0">
      
      {/* MOBILE SEGMENTED VIEW SWITCHER (< 1024px) */}
      <div className="flex lg:hidden bg-white p-1 rounded-xl border border-slate-200 shadow-xs mb-1">
        <button
          type="button"
          onClick={() => setMobileTab('menu')}
          className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'menu'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Menu ({filteredMenuItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
            mobileTab === 'cart'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Bill & Cart</span>
          {totalQuantity > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              mobileTab === 'cart' ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'
            }`}>
              {totalQuantity}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('history')}
          className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'history'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Bills ({todayOrders.length})</span>
        </button>
      </div>

      {/* LEFT PANEL: Menu Catalog Selector */}
      <div
        className={`flex-1 flex flex-col gap-2.5 sm:gap-3 min-w-0 overflow-hidden ${
          mobileTab !== 'menu' ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {/* Search & Category Filter Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-3.5 shadow-xs flex flex-col gap-2.5 shrink-0">
          
          {/* Top row: Search input + Category wrap toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                id="menu-search-input"
                type="text"
                placeholder="Search all 14 categories, dishes, ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsCategoryWrapExpanded(!isCategoryWrapExpanded)}
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isCategoryWrapExpanded
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title="Toggle Categories Multi-row grid"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">{categories.length} Categories</span>
              <span className="text-[10px] font-extrabold">{isCategoryWrapExpanded ? '▲' : '▼'}</span>
            </button>
          </div>

          {/* Categories Container: Horizontal Scroll or Expanded Multi-Row Wrap */}
          {isCategoryWrapExpanded ? (
            /* Multi-Row Wrap Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 pt-1 border-t border-slate-100 max-h-48 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setIsCategoryWrapExpanded(false);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="truncate">All Dishes</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  selectedCategory === 'all' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-500'
                }`}>
                  {menuItems.length}
                </span>
              </button>

              {categories.map((cat) => {
                const IconComponent = getCategoryIcon(cat.icon);
                const isSelected = selectedCategory === cat.id;
                const count = categoryCounts[cat.id] || 0;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setIsCategoryWrapExpanded(false);
                    }}
                    className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center justify-between gap-1 cursor-pointer truncate ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                      <span className="truncate text-[11px]">{cat.name}</span>
                    </div>
                    <span className={`text-[10px] px-1 py-0.2 rounded-full shrink-0 ${
                      isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Horizontal Scroll Pill Bar with Left/Right Arrows */
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() => scrollCategories('left')}
                className="hidden sm:flex absolute -left-2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-xs items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 cursor-pointer"
                aria-label="Scroll categories left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div
                ref={categoriesScrollRef}
                className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full px-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    selectedCategory === 'all'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>All Dishes</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    selectedCategory === 'all' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-600'
                  }`}>
                    {menuItems.length}
                  </span>
                </button>

                {categories.map((cat) => {
                  const IconComponent = getCategoryIcon(cat.icon);
                  const isSelected = selectedCategory === cat.id;
                  const count = categoryCounts[cat.id] || 0;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                      <span>{cat.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isSelected ? 'bg-emerald-700 text-white' : 'bg-white text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => scrollCategories('right')}
                className="hidden sm:flex absolute -right-2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-xs items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 cursor-pointer"
                aria-label="Scroll categories right"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Menu Items Grid with Contained Scroll */}
        <div className="flex-1 overflow-y-auto pr-1 pb-16 lg:pb-2">
          {menuItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200 px-4">
              <span className="text-slate-300 font-bold block mb-2 text-3xl">🍽️</span>
              <p className="text-slate-700 text-sm font-bold">Your Dishes Catalog is Empty</p>
              <p className="text-slate-400 text-xs mt-1.5 max-w-xs mx-auto">
                Please visit "Dishes Catalog" to manage items or restore default menu items.
              </p>
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 px-4">
              <span className="text-slate-300 font-bold block mb-2 text-2xl">🔍</span>
              <p className="text-slate-700 text-sm font-bold">No dishes found matching your filter</p>
              <p className="text-slate-400 text-xs mt-1">Try another category or clear the search query.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-3 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
              >
                Show All Dishes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {filteredMenuItems.map((item) => {
                const qtyInCart = getItemCartQuantity(item.id);
                const isNonVeg =
                  item.category === 'chicken_special' ||
                  item.category === 'chicken_specials' ||
                  item.category === 'mutton_special' ||
                  item.category === 'fish_special' ||
                  item.category === 'egg_special' ||
                  item.category === 'egg_specials' ||
                  item.category === 'chicken_chinese_special' ||
                  item.category === 'ukad' ||
                  item.name.toLowerCase().includes('chicken') ||
                  item.name.toLowerCase().includes('mutton') ||
                  item.name.toLowerCase().includes('fish') ||
                  item.name.toLowerCase().includes('egg') ||
                  item.name.toLowerCase().includes('surmai') ||
                  item.name.toLowerCase().includes('pomfret');

                return (
                  <div
                    key={item.id}
                    className={`group bg-white rounded-xl border p-2.5 sm:p-3 flex flex-col justify-between transition-all ${
                      item.isAvailable
                        ? qtyInCart > 0
                          ? 'border-emerald-400 ring-1 ring-emerald-400/40 shadow-xs'
                          : 'border-slate-200 hover:border-emerald-300 hover:shadow-xs'
                        : 'border-slate-200 bg-slate-50/70 opacity-60'
                    }`}
                  >
                    <div>
                      {/* Name & Veg/Non-Veg dot */}
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1 leading-snug">
                          {item.name}
                        </span>
                        
                        <span
                          className={`w-3 h-3 border flex items-center justify-center rounded-xs shrink-0 mt-0.5 ${
                            isNonVeg ? 'border-red-500 p-[1px]' : 'border-emerald-600 p-[1px]'
                          }`}
                          title={isNonVeg ? 'Non-Vegetarian' : 'Pure Vegetarian'}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isNonVeg ? 'bg-red-500' : 'bg-emerald-600'
                            }`}
                          ></span>
                        </span>
                      </div>

                      {/* Description */}
                      {item.description ? (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mt-1 min-h-[32px]">
                          {item.description}
                        </p>
                      ) : (
                        <div className="min-h-[32px]"></div>
                      )}
                    </div>

                    {/* Price and Cart controls */}
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                      <span className="font-mono font-extrabold text-slate-900 text-sm">
                        ₹{item.price}
                      </span>

                      {!item.isAvailable ? (
                        <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
                          Out of Stock
                        </span>
                      ) : qtyInCart > 0 ? (
                        /* In-place quantity stepper */
                        <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.id, -1);
                            }}
                            className="w-5 h-5 bg-white text-emerald-700 rounded flex items-center justify-center hover:bg-emerald-100 active:scale-95 transition-all shadow-xs cursor-pointer"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono font-black text-emerald-800 min-w-[16px] text-center">
                            {qtyInCart}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                            className="w-5 h-5 bg-emerald-600 text-white rounded flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-all shadow-xs cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        /* Add button */
                        <button
                          type="button"
                          onClick={() => addToCart(item)}
                          className="bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE STICKY FLOATING CART BAR (Shown when on menu tab and cart has items) */}
      {mobileTab === 'menu' && totalQuantity > 0 && (
        <div className="fixed bottom-3 inset-x-3 z-30 lg:hidden bg-slate-900 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between border border-slate-800 animate-slideUp">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
              {totalQuantity}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Bill</span>
              <span className="text-sm font-black font-mono text-emerald-400">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileTab('cart')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-2 px-4 rounded-xl flex items-center gap-1.5 uppercase tracking-wide shadow-md transition-all cursor-pointer"
          >
            <span>Review Bill</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* RIGHT PANEL: Shopping Bill & Daily Sales History Tabbed Container */}
      <div
        className={`w-full lg:w-[380px] xl:w-[420px] 2xl:w-[440px] bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden shrink-0 ${
          mobileTab === 'menu' ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {/* Navigation Tabs for Right Panel */}
        <div className="flex bg-slate-100 border-b border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setRightPanelTab('cart');
              setMobileTab('cart');
            }}
            className={`flex-1 py-2.5 px-3 border-b-2 text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              (mobileTab === 'cart' || (mobileTab === 'menu' && rightPanelTab === 'cart')) && rightPanelTab === 'cart'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 bg-slate-50'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Active Cart ({totalQuantity})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRightPanelTab('history');
              setMobileTab('history');
            }}
            className={`flex-1 py-2.5 px-3 border-b-2 text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              (mobileTab === 'history' || rightPanelTab === 'history')
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 bg-slate-50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Today's Ledger ({todayOrders.length})</span>
          </button>
        </div>

        {rightPanelTab === 'cart' && mobileTab !== 'history' ? (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Header info bar */}
            <div className="p-2.5 px-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                Compile Bill Details
              </span>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-500 font-bold py-0.5 px-1.5 hover:bg-red-50 rounded transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>

            {/* Customer & Table inputs */}
            <div className="p-2.5 bg-slate-50/70 border-b border-slate-200 grid grid-cols-2 gap-2 shrink-0">
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input
                  id="customer-name-input"
                  type="text"
                  placeholder="Guest Name (Opt)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium placeholder-slate-400"
                />
              </div>

              <div className="relative">
                <Layers className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <select
                  id="table-selection"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold cursor-pointer"
                >
                  <option value="">Select Table</option>
                  <option value="Table 1">Table 1 (2 Seater)</option>
                  <option value="Table 2">Table 2 (2 Seater)</option>
                  <option value="Table 3">Table 3 (4 Seater)</option>
                  <option value="Table 4">Table 4 (4 Seater)</option>
                  <option value="Table 5">Table 5 (6 Seater)</option>
                  <option value="Table 6">Table 6 (6 Seater)</option>
                  <option value="Table 7">Table 7 (Bar Counter)</option>
                  <option value="Table 8">Table 8 (Family Room)</option>
                  <option value="Takeaway">Takeaway / Parcel</option>
                  <option value="Delivery">Online Delivery</option>
                </select>
              </div>
            </div>

            {/* Cart Item Rows (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 flex flex-col gap-2 min-h-[140px]">
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                  <span className="text-3xl opacity-30 mb-2">🛒</span>
                  <p className="text-slate-500 text-xs font-bold">Your bill cart is empty</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click dishes on the left to add items</p>
                  <button
                    type="button"
                    onClick={() => setMobileTab('menu')}
                    className="mt-3 lg:hidden text-xs bg-emerald-600 text-white font-bold py-1.5 px-3 rounded-lg"
                  >
                    Browse 14 Categories
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100/70 transition-colors border border-slate-100"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="block font-bold text-slate-800 text-xs truncate">
                        {item.menuItem.name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        ₹{item.menuItem.price} × {item.quantity}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.menuItem.id, -1)}
                        className="w-5 h-5 text-slate-500 hover:text-emerald-600 rounded flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-700 min-w-[14px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.menuItem.id, 1)}
                        className="w-5 h-5 text-slate-500 hover:text-emerald-600 rounded flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 text-xs min-w-[48px] text-right">
                        ₹{item.menuItem.price * item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.menuItem.id)}
                        className="p-1 text-slate-300 hover:text-red-500 rounded hover:bg-red-50 transition-all cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bill calculation modifiers & Checkout Controls (Pinned to bottom of right panel) */}
            <div className="p-2.5 sm:p-3 border-t border-slate-200 bg-slate-50 flex flex-col gap-2 shrink-0">
              
              {/* Discount & GST Controls */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                
                {/* Discount input */}
                <div className="bg-white p-1.5 border border-slate-200 rounded-lg flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Percent className="w-3 h-3 text-emerald-600" />
                    <span className="text-[10px] font-bold">Discount:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountType(discountType === 'percentage' ? 'flat' : 'percentage');
                      }}
                      className="px-1 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black rounded cursor-pointer"
                      title="Toggle Percentage or Flat Rupees"
                    >
                      {discountType === 'percentage' ? '%' : '₹'}
                    </button>
                    <input
                      id="discount-input"
                      type="number"
                      min="0"
                      max={discountType === 'percentage' ? '100' : subtotal}
                      value={discount || ''}
                      onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-12 px-1 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold font-mono text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* GST input */}
                <div className="bg-white p-1.5 border border-slate-200 rounded-lg flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Receipt className="w-3 h-3 text-emerald-600" />
                    <span className="text-[10px] font-bold">GST:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex border border-slate-200 rounded text-[9px] font-bold overflow-hidden">
                      {[0, 5].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setGstRate(rate)}
                          className={`px-1 py-0.5 ${gstRate === rate ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-600'}`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                    <input
                      id="gst-rate-input"
                      type="number"
                      min="0"
                      max="100"
                      value={gstRate}
                      onChange={(e) => setGstRate(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                      className="w-9 px-1 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold font-mono text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="5"
                    />
                  </div>
                </div>

              </div>

              {/* Price Breakdown */}
              <div className="flex flex-col gap-1 font-mono text-xs text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span className="font-sans text-[11px] text-slate-500">Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {calculatedDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span className="font-sans text-[11px]">Discount Applied:</span>
                    <span>-₹{calculatedDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                {gstRate > 0 && (
                  <div className="flex justify-between">
                    <span className="font-sans text-[11px] text-slate-500">GST ({gstRate}%):</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="h-px bg-slate-200 my-0.5"></div>
                <div className="flex justify-between items-baseline">
                  <span className="font-sans text-xs font-black text-slate-900 uppercase tracking-wide">
                    Total Payable:
                  </span>
                  <span id="bill-total-price" className="font-sans text-base sm:text-lg font-black text-emerald-700">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout & Pay Button */}
              <button
                id="proceed-checkout-button"
                type="button"
                disabled={cart.length === 0}
                onClick={onOpenPaymentModal}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-black py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Checkout & Pay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* TODAY'S SALES HISTORY/LEDGER TAB CONTENT */
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Header statistics info */}
            <div className="p-3 border-b border-slate-100 bg-emerald-50/40 flex items-center justify-between shrink-0">
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                Shift Invoices Ledger
              </span>
              <span className="text-xs font-mono font-extrabold text-emerald-700">
                ₹{todayStats.total.toFixed(2)}
              </span>
            </div>

            {/* List of completed orders for today */}
            <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 flex flex-col gap-2 bg-slate-50/40">
              {todayOrders.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <History className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-slate-500 text-xs font-bold">No completed bills today</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                    Completed orders from current shift will show here for instant receipt reprint or void.
                  </p>
                </div>
              ) : (
                todayOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-2.5 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl transition-all shadow-xs flex flex-col gap-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-slate-700 font-mono">
                          {order.invoiceNumber}
                        </span>
                        <span
                          className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                            order.paymentMethod === 'CASH'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {order.paymentMethod}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-900 font-mono">
                        ₹{order.total.toFixed(0)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>{order.customerName || order.tableNumber || 'Guest'}</span>
                      <span>
                        {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="h-px bg-slate-100 my-0.5"></div>

                    {/* Actions: View Receipt and Void */}
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
                            if (
                              window.confirm(
                                `Are you sure you want to VOID invoice ${order.invoiceNumber}? This will deduct ₹${order.total} from shift statistics.`
                              )
                            ) {
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

            {/* Shift register summary board */}
            <div className="p-2.5 bg-slate-100 border-t border-slate-200 font-sans flex flex-col gap-1.5 shrink-0">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Today's Register Draw
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-1.5 border border-slate-200 rounded-lg flex justify-between items-center">
                  <span className="text-slate-500 font-semibold flex items-center gap-1">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                    Cash:
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    ₹{todayStats.cash.toFixed(0)}
                  </span>
                </div>
                <div className="bg-white p-1.5 border border-slate-200 rounded-lg flex justify-between items-center">
                  <span className="text-slate-500 font-semibold flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    Online:
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    ₹{todayStats.online.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* THERMAL RECEIPT PREVIEW MODAL */}
      {previewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 flex flex-col gap-3 max-h-[90vh] overflow-y-auto">
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
                <span>
                  {new Date(previewOrder.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>
                  {new Date(previewOrder.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              {previewOrder.tableNumber && (
                <div className="flex justify-between">
                  <span>Table:</span>
                  <span className="font-bold text-slate-800">{previewOrder.tableNumber}</span>
                </div>
              )}
              {previewOrder.customerName && (
                <div className="flex justify-between">
                  <span>Guest:</span>
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
              {previewOrder.discount !== undefined && previewOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount Applied:</span>
                  <span>-₹{previewOrder.discount.toFixed(2)}</span>
                </div>
              )}
              {previewOrder.tax !== undefined && previewOrder.tax > 0 && (
                <div className="flex justify-between">
                  <span>GST Tax Breakdown:</span>
                  <span>₹{previewOrder.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="h-px bg-slate-200"></div>
              <div className="flex justify-between font-bold text-slate-950 text-sm">
                <span>TOTAL AMOUNT:</span>
                <span>₹{previewOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center font-mono text-[10px] text-slate-400">------------------------------</div>

            <div className="text-center font-mono text-[9px] text-slate-400 flex flex-col gap-0.5">
              <span>Thank you for visiting Veera's!</span>
              <span>Please visit again soon.</span>
              <span className="font-extrabold mt-1">POS DIGITAL DUPLICATE COPY</span>
            </div>

            <button
              type="button"
              onClick={() => {
                window.print();
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
