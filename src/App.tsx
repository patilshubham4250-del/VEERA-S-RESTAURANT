/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ChefHat, TrendingUp, Receipt, Layers, CreditCard, Banknote, Coffee, Clock, Calendar, Lock, X, ShieldCheck, AlertCircle, Cloud, CloudOff, RefreshCw, LogOut } from 'lucide-react';
import { MenuItem, CartItem, Order, PaymentMethod, DailyArchive } from './types';
import { DEFAULT_MENU_ITEMS, MOCK_ORDERS } from './data';
import BillCalculator from './components/BillCalculator';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import MenuManagement from './components/MenuManagement';
import PaymentModal from './components/PaymentModal';
import LoginPage from './components/LoginPage';
import { 
  seedCloudDatabaseIfEmpty, 
  fetchAllCloudData, 
  saveMenuItemsToCloud, 
  saveConfigToCloud, 
  saveOrderToCloud, 
  deleteOrderFromCloud, 
  clearAllOrdersFromCloud, 
  saveArchiveToCloud,
  deleteArchiveFromCloud
} from './lib/firebase';

export default function App() {
  const [activeView, setActiveView] = useState<'billing' | 'analytics' | 'menu'>('billing');

  // User login state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('veeras_logged_in') === 'true';
  });

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    sessionStorage.setItem('veeras_logged_in', 'true');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to lock the POS terminal and log out?')) {
      setIsLoggedIn(false);
      sessionStorage.removeItem('veeras_logged_in');
    }
  };

  // Cloud integration states
  const [cloudStatus, setCloudStatus] = useState<'loading' | 'synced' | 'syncing' | 'error'>('loading');
  const [lastSynced, setLastSynced] = useState<string>('');
  const [isInitialLoadDone, setIsInitialLoadDone] = useState<boolean>(false);

  // Load state from localStorage as an offline fallback
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('veeras_menu_items_v3');
    return saved ? JSON.parse(saved) : DEFAULT_MENU_ITEMS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('veeras_orders_new');
    return saved ? JSON.parse(saved) : MOCK_ORDERS;
  });

  const [dailyArchives, setDailyArchives] = useState<DailyArchive[]>(() => {
    const saved = localStorage.getItem('veeras_daily_archives_new');
    return saved ? JSON.parse(saved) : [];
  });

  // Cart & billing config state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [gstRate, setGstRate] = useState<number>(() => {
    const saved = localStorage.getItem('veeras_gst_rate');
    return saved ? parseFloat(saved) : 5; // Default 5%
  });
  const [customerName, setCustomerName] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [autoBackup, setAutoBackup] = useState<boolean>(() => {
    const saved = localStorage.getItem('veeras_auto_backup_new');
    return saved !== null ? saved === 'true' : true;
  });

  // Session Billing Date - if active, all bills follow this date
  const [sessionBillingDate, setSessionBillingDate] = useState<string | null>(() => {
    return localStorage.getItem('veeras_session_billing_date') || null;
  });

  // Verification modal state for session billing date
  const [sessionDateModal, setSessionDateModal] = useState<{
    isOpen: boolean;
    passwordValue: string;
    newDateValue: string;
    error: string;
    actionType: 'set' | 'reset';
  }>({
    isOpen: false,
    passwordValue: '',
    newDateValue: new Date().toISOString().split('T')[0],
    error: '',
    actionType: 'set'
  });

  // Time state for live POS clock
  const [liveTime, setLiveTime] = useState<string>('');

  // Central sync helper
  const syncToCloud = async (taskName: string, writeFn: () => Promise<void>) => {
    try {
      setCloudStatus('syncing');
      await writeFn();
      setCloudStatus('synced');
      setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error(`Cloud Sync Failed for "${taskName}":`, err);
      setCloudStatus('error');
    }
  };

  // 1. Initial Load and Seed database from Cloud
  const loadDataFromCloud = async () => {
    try {
      setCloudStatus('loading');
      // Seed default menu to Firestore if empty
      await seedCloudDatabaseIfEmpty(DEFAULT_MENU_ITEMS, MOCK_ORDERS);
      
      const data = await fetchAllCloudData();
      if (data) {
        if (data.menuItems) {
          setMenuItems(data.menuItems);
          localStorage.setItem('veeras_menu_items_v3', JSON.stringify(data.menuItems));
        }
        if (data.orders) {
          setOrders(data.orders);
          localStorage.setItem('veeras_orders_new', JSON.stringify(data.orders));
        }
        if (data.dailyArchives) {
          setDailyArchives(data.dailyArchives);
          localStorage.setItem('veeras_daily_archives_new', JSON.stringify(data.dailyArchives));
        }
        if (data.config) {
          if (typeof data.config.gstRate === 'number') {
            setGstRate(data.config.gstRate);
            localStorage.setItem('veeras_gst_rate', data.config.gstRate.toString());
          }
          if (data.config.sessionBillingDate !== undefined) {
            setSessionBillingDate(data.config.sessionBillingDate);
            if (data.config.sessionBillingDate) {
              localStorage.setItem('veeras_session_billing_date', data.config.sessionBillingDate);
            } else {
              localStorage.removeItem('veeras_session_billing_date');
            }
          }
          if (typeof data.config.autoBackup === 'boolean') {
            setAutoBackup(data.config.autoBackup);
            localStorage.setItem('veeras_auto_backup_new', data.config.autoBackup.toString());
          }
        }
      }
      setCloudStatus('synced');
      setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setIsInitialLoadDone(true);
    } catch (error) {
      console.error("Failed to load data from Firebase cloud, falling back to offline localStorage:", error);
      setCloudStatus('error');
      setIsInitialLoadDone(true); // Allow local usage even if offline
    }
  };

  useEffect(() => {
    loadDataFromCloud();
  }, []);

  // 2. Local Fallback Sync Effects (to keep localStorage synchronized)
  useEffect(() => {
    localStorage.setItem('veeras_menu_items_v3', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('veeras_orders_new', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('veeras_daily_archives_new', JSON.stringify(dailyArchives));
  }, [dailyArchives]);

  useEffect(() => {
    localStorage.setItem('veeras_auto_backup_new', autoBackup.toString());
  }, [autoBackup]);

  useEffect(() => {
    localStorage.setItem('veeras_gst_rate', gstRate.toString());
  }, [gstRate]);

  useEffect(() => {
    if (sessionBillingDate) {
      localStorage.setItem('veeras_session_billing_date', sessionBillingDate);
    } else {
      localStorage.removeItem('veeras_session_billing_date');
    }
  }, [sessionBillingDate]);

  // 3. Auto-sync changes to cloud for settings and menu
  useEffect(() => {
    if (!isInitialLoadDone) return;
    syncToCloud('Save Menu Items', () => saveMenuItemsToCloud(menuItems));
  }, [menuItems, isInitialLoadDone]);

  useEffect(() => {
    if (!isInitialLoadDone) return;
    syncToCloud('Save Configuration', () => saveConfigToCloud({ gstRate, sessionBillingDate, autoBackup }));
  }, [gstRate, sessionBillingDate, autoBackup, isInitialLoadDone]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cart values derived
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (discountType === 'percentage') {
      return (subtotal * discount) / 100;
    }
    return discount;
  }, [subtotal, discount, discountType]);

  const taxAmount = useMemo(() => {
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    return taxableAmount * (gstRate / 100);
  }, [subtotal, discountAmount, gstRate]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + taxAmount);
  }, [subtotal, discountAmount, taxAmount]);

  // Handle billing payment successful trigger
  const handlePaymentSuccess = (paymentMethod: PaymentMethod, amountPaid: number) => {
    // Generate next invoice code
    const lastInvoiceNum = orders.length > 0 
      ? parseInt(orders[0].invoiceNumber.replace('INV-', '')) || 1000
      : 1000;
    const nextInvoiceCode = `INV-${lastInvoiceNum + 1}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      invoiceNumber: nextInvoiceCode,
      items: cart.map(item => ({
        menuItemId: item.menuItem.id,
        name: item.menuItem.name,
        price: item.menuItem.price,
        quantity: item.quantity
      })),
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      gstRate,
      total,
      paymentMethod,
      customerName: customerName.trim() || "",
      tableNumber: tableNumber || "",
      timestamp: sessionBillingDate ? new Date(sessionBillingDate).toISOString() : new Date().toISOString()
    };

    setOrders((prevOrders) => [newOrder, ...prevOrders]);
    syncToCloud('Create Order', () => saveOrderToCloud(newOrder));
    
    // Reset cart and checkout details
    setCart([]);
    setDiscount(0);
    setCustomerName('');
    setTableNumber('');
    setIsPaymentModalOpen(false);
  };

  // Menu alterations
  const handleAddMenuItem = (newItem: Omit<MenuItem, 'id'>) => {
    const itemWithId: MenuItem = {
      ...newItem,
      id: `dish_${Date.now()}`
    };
    setMenuItems((prev) => [...prev, itemWithId]);
  };

  const handleToggleAvailability = (id: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  const handleDeleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEditMenuItem = (id: string, updatedFields: Partial<MenuItem>) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updatedFields } : item
      )
    );
  };

  const handleDeleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
    syncToCloud('Delete Order', () => deleteOrderFromCloud(id));
  };

  const handleEditOrder = (id: string, updatedOrder: Order, applyDateToAll?: boolean) => {
    let nextOrders: Order[] = [];
    setOrders((prev) => {
      nextOrders = prev.map((order) => (order.id === id ? updatedOrder : order));
      if (applyDateToAll) {
        const targetDate = new Date(updatedOrder.timestamp);
        nextOrders = nextOrders.map((order) => {
          const oDate = new Date(order.timestamp);
          const newD = new Date(targetDate);
          newD.setHours(oDate.getHours(), oDate.getMinutes(), oDate.getSeconds());
          return {
            ...order,
            timestamp: newD.toISOString()
          };
        });
        setSessionBillingDate(targetDate.toISOString());
      }
      return nextOrders;
    });

    syncToCloud('Update Order(s)', async () => {
      if (applyDateToAll) {
        for (const o of nextOrders) {
          await saveOrderToCloud(o);
        }
      } else {
        await saveOrderToCloud(updatedOrder);
      }
    });
  };

  const handleResetMenuToDefault = () => {
    if (window.confirm("Are you sure you want to restore the official Veera's Restaurant menu? This will replace your current catalog with the standard dishes from the menu card (including Chicken Specials, Egg Specials, Soups, Veg & Soyabean Delights, and Rice & Noodles). Your customized pricing or custom dishes will be overwritten.")) {
      setMenuItems(DEFAULT_MENU_ITEMS);
    }
  };

  // Reset and seeding controls
  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to delete ALL billing records? This cannot be undone.')) {
      const orderIds = orders.map(o => o.id);
      setOrders([]);
      syncToCloud('Clear All Logs', () => clearAllOrdersFromCloud(orderIds));
    }
  };

  const handleResetMockLogs = () => {
    if (window.confirm('Do you want to re-load default history records for sales metrics?')) {
      const orderIds = orders.map(o => o.id);
      setOrders(MOCK_ORDERS);
      syncToCloud('Reset Active Orders', () => clearAllOrdersFromCloud(orderIds));
    }
  };

  // Start New Day / Close Day
  const handleCloseDay = () => {
    if (orders.length === 0) {
      alert("No active orders found in the ledger to close for today.");
      return;
    }

    if (!window.confirm("Are you sure you want to close the current daily shift? This will summarize your sales, archive today's stats, and reset your active billing counter. Your Dishes Catalog will be completely preserved.")) {
      return;
    }

    const baseDate = sessionBillingDate ? new Date(sessionBillingDate) : new Date();
    const todayStr = baseDate.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const cashSales = orders.filter(o => o.paymentMethod === 'CASH').reduce((sum, o) => sum + o.total, 0);
    const onlineSales = orders.filter(o => o.paymentMethod === 'ONLINE').reduce((sum, o) => sum + o.total, 0);
    const billsCount = orders.length;

    const newArchive: DailyArchive = {
      id: `day_${Date.now()}`,
      date: todayStr,
      totalSales,
      cashSales,
      onlineSales,
      billsCount,
      timestamp: baseDate.toISOString(),
      orders: [...orders]
    };

    const updatedArchives = [newArchive, ...dailyArchives];

    if (autoBackup) {
      try {
        const backupData = {
          version: '1.0',
          menuItems,
          orders, // backup current active orders so they are not lost
          dailyArchives: updatedArchives,
          exportedAt: baseDate.toISOString()
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `veera_pos_auto_backup_${baseDate.toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      } catch (err) {
        console.error("Auto backup download failed:", err);
      }
    }

    const activeOrderIds = orders.map(o => o.id);
    setDailyArchives(updatedArchives);
    setOrders([]);
    setCart([]);

    syncToCloud('Close Day Shift & Archive', async () => {
      await saveArchiveToCloud(newArchive);
      await clearAllOrdersFromCloud(activeOrderIds);
    });

    alert(`Daily Shift Closed successfully! ${autoBackup ? "An automatic backup file has been downloaded to your device." : ""} Active sales counters have been reset to zero for the new day.`);
  };

  const handleClearArchives = () => {
    if (window.confirm('Are you sure you want to delete ALL historical daily archive logs? This cannot be undone.')) {
      const archiveIds = dailyArchives.map(a => a.id);
      setDailyArchives([]);
      syncToCloud('Clear All Archives', async () => {
         for (const id of archiveIds) {
           await deleteArchiveFromCloud(id);
         }
      });
    }
  };

  // Import / Export backup helpers
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      menuItems,
      orders,
      dailyArchives,
      exportedAt: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `veera_pos_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (!data || (!Array.isArray(data.menuItems) && !Array.isArray(data.orders))) {
        alert("Invalid backup file structure. Please upload a valid Veera POS backup JSON.");
        return false;
      }
      if (Array.isArray(data.menuItems)) {
        setMenuItems(data.menuItems);
      }
      if (Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
      if (Array.isArray(data.dailyArchives)) {
        setDailyArchives(data.dailyArchives);
      }

      syncToCloud('Restore Backup', async () => {
        if (Array.isArray(data.menuItems)) {
          await saveMenuItemsToCloud(data.menuItems);
        }
        if (Array.isArray(data.orders)) {
          await clearAllOrdersFromCloud(orders.map(o => o.id));
          for (const o of data.orders) {
            await saveOrderToCloud(o);
          }
        }
        if (Array.isArray(data.dailyArchives)) {
          for (const a of data.dailyArchives) {
            await saveArchiveToCloud(a);
          }
        }
      });

      alert("Backup successfully restored from file! Your Dishes Catalog and sales transactions are updated.");
      return true;
    } catch (err) {
      alert("Error parsing backup file. Please ensure it is a valid, uncorrupted JSON file.");
      return false;
    }
  };

  const handleOpenSetSessionDateModal = () => {
    setSessionDateModal({
      isOpen: true,
      passwordValue: '',
      newDateValue: sessionBillingDate ? sessionBillingDate.split('T')[0] : new Date().toISOString().split('T')[0],
      error: '',
      actionType: 'set'
    });
  };

  const handleResetSessionDateWithVerification = () => {
    setSessionDateModal({
      isOpen: true,
      passwordValue: '',
      newDateValue: '',
      error: '',
      actionType: 'reset'
    });
  };

  const handleSessionDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionDateModal.passwordValue === '9773') {
      if (sessionDateModal.actionType === 'reset') {
        setSessionBillingDate(null);
        setSessionDateModal(prev => ({ ...prev, isOpen: false }));
        alert("Session date lock released. All new bills will now use real-time live dates.");
      } else {
        const selectedDate = sessionDateModal.newDateValue;
        if (!selectedDate) {
          setSessionDateModal(prev => ({ ...prev, error: 'Please choose a valid date.' }));
          return;
        }
        
        const now = new Date();
        const dateObj = new Date(selectedDate);
        dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
        const timestampISO = dateObj.toISOString();

        setSessionBillingDate(timestampISO);
        setSessionDateModal(prev => ({ ...prev, isOpen: false }));
        
        if (orders.length > 0 && window.confirm("Date lock active! Would you also like to update ALL existing bills in the ledger to this same date?")) {
          const nextOrders = orders.map(o => {
            const oDate = new Date(o.timestamp);
            const targetDate = new Date(timestampISO);
            targetDate.setHours(oDate.getHours(), oDate.getMinutes(), oDate.getSeconds());
            return {
              ...o,
              timestamp: targetDate.toISOString()
            };
          });
          setOrders(nextOrders);
          syncToCloud('Bulk Update Orders Date', async () => {
            for (const o of nextOrders) {
              await saveOrderToCloud(o);
            }
          });
        }
      }
    } else {
      setSessionDateModal(prev => ({ ...prev, error: 'Incorrect security password. Please try again.' }));
    }
  };

  // Today's total sales for live indicators
  const todaySalesTotal = useMemo(() => {
    const baseDate = sessionBillingDate ? new Date(sessionBillingDate) : new Date();
    const todayStr = baseDate.toDateString();
    return orders
      .filter(o => new Date(o.timestamp).toDateString() === todayStr)
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders, sessionBillingDate]);

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900">
      
      {/* 1. TOP GLOBAL HEADLINE STATUS BAR */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-[11px] tracking-wide text-slate-100 uppercase">Veera's POS Terminal</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400 text-[10px] hidden sm:inline">Active Session Host</span>
          <span className="text-slate-500">•</span>

          {/* Cloud Sync Status Badge */}
          {cloudStatus === 'loading' && (
            <div className="bg-blue-500/15 text-blue-400 border border-blue-500/25 rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin mr-0.5" />
              <span>Connecting Cloud...</span>
            </div>
          )}
          {cloudStatus === 'synced' && (
            <div className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-emerald-400 mr-0.5" />
              <span>Cloud Synced</span>
              {lastSynced && <span className="text-slate-500 font-mono font-medium text-[9px] ml-0.5">({lastSynced})</span>}
            </div>
          )}
          {cloudStatus === 'syncing' && (
            <div className="bg-amber-500/15 text-amber-400 border border-amber-500/25 rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin mr-0.5" />
              <span>Syncing Cloud...</span>
            </div>
          )}
          {cloudStatus === 'error' && (
            <button 
              onClick={loadDataFromCloud}
              className="bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/25 rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Cloud sync lost. Click to retry."
            >
              <CloudOff className="w-3.5 h-3.5 text-red-400 mr-0.5" />
              <span>Cloud Offline (Retry)</span>
            </button>
          )}

          <span className="text-slate-500 hidden sm:inline">•</span>

          {/* Custom Billing Date controls */}
          {sessionBillingDate ? (
            <div className="bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>Date Lock: <span className="font-mono">{new Date(sessionBillingDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span></span>
              <button 
                onClick={handleResetSessionDateWithVerification}
                className="text-amber-200 hover:text-white underline font-extrabold cursor-pointer hover:bg-amber-500/20 px-1 rounded transition-colors"
              >
                Reset
              </button>
            </div>
          ) : (
            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-emerald-400" />
              <span>Date: Real-Time Live</span>
              <button 
                onClick={handleOpenSetSessionDateModal}
                className="text-emerald-300 hover:text-white underline font-extrabold cursor-pointer hover:bg-emerald-500/20 px-1 rounded transition-colors"
              >
                Lock Date
              </button>
            </div>
          )}
        </div>
        
        {/* Real-time Clock display */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            {liveTime || "00:00:00"}
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Kitchen Open</span>
          <span className="text-slate-700">|</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/25 hover:border-red-500/40 px-2.5 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors animate-pulse hover:animate-none"
            title="Lock POS terminal"
          >
            <LogOut className="w-3 h-3 text-red-400" />
            <span>LOCK POS</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN BRAND HEADER SECTION */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand info */}
          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <ChefHat className="w-5.5 h-5.5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-slate-900 leading-tight">VEERA'S RESTAURANT</h1>
              <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-widest">Point of Sale & Analytics System</p>
            </div>
          </div>

          {/* Quick Real-time Today Sales Banner */}
          <div className="flex items-center gap-5 bg-slate-50 rounded-xl px-4 py-2 border border-slate-200 self-stretch sm:self-auto justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Today's Sales (Real-time)</span>
              <span className="text-sm font-black text-emerald-600 font-mono">₹{todaySalesTotal.toFixed(2)}</span>
            </div>
            <div className="h-7 w-px bg-slate-200"></div>
            <div className="flex flex-col text-right">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Invoices Raised</span>
              <span className="text-sm font-bold text-slate-700 font-mono">
                {orders.filter(o => {
                  const baseDate = sessionBillingDate ? new Date(sessionBillingDate) : new Date();
                  return new Date(o.timestamp).toDateString() === baseDate.toDateString();
                }).length} Bills
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* 3. RESPONSIVE NAVIGATION CONTROL HUB */}
      <div className="bg-white border-b border-slate-200 px-4">
        <div className="max-w-7xl mx-auto flex">
          {[
            { id: 'billing', label: 'Billing Counter', icon: Receipt, activeColor: 'border-emerald-600 text-emerald-700 bg-emerald-50/50' },
            { id: 'analytics', label: 'Sales Analytics', icon: TrendingUp, activeColor: 'border-emerald-600 text-emerald-700 bg-emerald-50/50' },
            { id: 'menu', label: 'Dishes Catalog', icon: Coffee, activeColor: 'border-emerald-600 text-emerald-700 bg-emerald-50/50' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex-1 sm:flex-initial py-3.5 px-4 sm:px-6 border-b-2 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? `${tab.activeColor} border-b-4 border-emerald-600`
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN CONTENT CONTAINER STAGE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-20">
        
        {/* Render Active View Panels */}
        {activeView === 'billing' && (
          <BillCalculator
            menuItems={menuItems}
            cart={cart}
            setCart={setCart}
            discount={discount}
            setDiscount={setDiscount}
            discountType={discountType}
            setDiscountType={setDiscountType}
            gstRate={gstRate}
            setGstRate={setGstRate}
            customerName={customerName}
            setCustomerName={setCustomerName}
            tableNumber={tableNumber}
            setTableNumber={setTableNumber}
            onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
            orders={orders}
            onDeleteOrder={handleDeleteOrder}
          />
        )}

        {activeView === 'analytics' && (
          <AnalyticsDashboard
            orders={orders}
            dailyArchives={dailyArchives}
            onClearLogs={handleClearLogs}
            onResetMockLogs={handleResetMockLogs}
            onCloseDay={handleCloseDay}
            onClearArchives={handleClearArchives}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            autoBackup={autoBackup}
            onToggleAutoBackup={() => setAutoBackup(!autoBackup)}
            onDeleteOrder={handleDeleteOrder}
            onEditOrder={handleEditOrder}
            sessionBillingDate={sessionBillingDate}
            onSetSessionBillingDate={setSessionBillingDate}
          />
        )}

        {activeView === 'menu' && (
          <MenuManagement
            menuItems={menuItems}
            onAddMenuItem={handleAddMenuItem}
            onToggleAvailability={handleToggleAvailability}
            onDeleteMenuItem={handleDeleteMenuItem}
            onResetMenuToDefault={handleResetMenuToDefault}
            onEditMenuItem={handleEditMenuItem}
          />
        )}

      </main>

      {/* 5. INTERACTIVE MODAL COMPONENT */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={total}
        subtotal={subtotal}
        tax={taxAmount}
        discount={discountAmount}
        gstRate={gstRate}
        onSuccess={handlePaymentSuccess}
      />

      {/* 6. PASSWORD SECURED SESSION DATE MODAL */}
      {sessionDateModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="font-extrabold text-xs uppercase tracking-widest text-white">
                  {sessionDateModal.actionType === 'set' ? 'Lock Session Date' : 'Reset Session Date'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSessionDateModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSessionDateSubmit} className="p-5 flex flex-col gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6 stroke-[2]" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-800 uppercase">
                  {sessionDateModal.actionType === 'set' ? 'Lock Billing Date' : 'Unlock Billing Date'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {sessionDateModal.actionType === 'set' 
                    ? 'All new bills created during this session will follow the same locked date.'
                    : 'Restore real-time automatic dates for all new invoices.'}
                </p>
              </div>

              {/* Date Input (for 'set' action) */}
              {sessionDateModal.actionType === 'set' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Choose Custom Date</label>
                  <input
                    type="date"
                    required
                    value={sessionDateModal.newDateValue}
                    onChange={(e) => setSessionDateModal(prev => ({ ...prev, newDateValue: e.target.value }))}
                    className="w-full text-center py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Security Password Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Enter Security Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••"
                  value={sessionDateModal.passwordValue}
                  onChange={(e) => setSessionDateModal(prev => ({ ...prev, passwordValue: e.target.value, error: '' }))}
                  className="w-full tracking-widest text-center py-2 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              {/* Error log */}
              {sessionDateModal.error && (
                <div className="bg-red-50 text-red-600 border border-red-100 rounded-lg p-2.5 text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium leading-normal">{sessionDateModal.error}</span>
                </div>
              )}

              {/* Actions footer */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setSessionDateModal(prev => ({ ...prev, isOpen: false }))}
                  className="py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all uppercase tracking-wider cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
