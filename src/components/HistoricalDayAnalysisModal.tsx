/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  X, 
  Calendar, 
  TrendingUp, 
  Award, 
  PieChart, 
  BarChart3, 
  Banknote, 
  CreditCard, 
  Sparkles, 
  Utensils, 
  Layers, 
  Printer, 
  Pencil, 
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { DailyArchive, Category, MenuItem } from '../types';
import { getCategoryIcon } from '../utils/categoryIcons';

interface HistoricalDayAnalysisModalProps {
  archive: DailyArchive;
  allArchives?: DailyArchive[];
  categories?: Category[];
  menuItems?: MenuItem[];
  onClose: () => void;
  onEdit?: () => void;
  onEditRequest?: (archive: DailyArchive) => void;
}

export default function HistoricalDayAnalysisModal({
  archive,
  allArchives = [],
  categories = [],
  menuItems = [],
  onClose,
  onEdit,
  onEditRequest,
}: HistoricalDayAnalysisModalProps) {
  // 1. Consolidated Dish Sales (from itemsSummary or orders)
  const consolidatedDishes = useMemo(() => {
    if (archive.itemsSummary && archive.itemsSummary.length > 0) {
      return archive.itemsSummary.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        revenue: item.revenue || item.price * item.quantity,
        category: item.category || menuItems.find(m => m.name.toLowerCase() === item.name.toLowerCase())?.category || 'others'
      })).sort((a, b) => b.revenue - a.revenue);
    }

    if (archive.orders && archive.orders.length > 0) {
      const map: Record<string, { quantity: number; revenue: number; price: number; category: string }> = {};
      archive.orders.forEach((order) => {
        order.items.forEach((item) => {
          if (!map[item.name]) {
            map[item.name] = { 
              quantity: 0, 
              revenue: 0, 
              price: item.price,
              category: menuItems.find(m => m.name.toLowerCase() === item.name.toLowerCase())?.category || 'others'
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
      })).sort((a, b) => b.revenue - a.revenue);
    }

    return [];
  }, [archive, menuItems]);

  // Total portions sold
  const totalPortionsSold = useMemo(() => {
    return consolidatedDishes.reduce((acc, d) => acc + d.quantity, 0);
  }, [consolidatedDishes]);

  // Average Order Value
  const averageOrderValue = useMemo(() => {
    return archive.billsCount > 0 ? archive.totalSales / archive.billsCount : 0;
  }, [archive]);

  // Average Items per Order
  const avgItemsPerOrder = useMemo(() => {
    return archive.billsCount > 0 ? (totalPortionsSold / archive.billsCount).toFixed(1) : '0';
  }, [totalPortionsSold, archive.billsCount]);

  // Payment Channel Percentages
  const cashPercent = archive.totalSales > 0 ? (archive.cashSales / archive.totalSales) * 100 : 0;
  const onlinePercent = archive.totalSales > 0 ? (archive.onlineSales / archive.totalSales) * 100 : 0;

  // 2. Category-wise Revenue & Volume Breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { revenue: number; quantity: number }> = {};
    categories.forEach(c => {
      map[c.id] = { revenue: 0, quantity: 0 };
    });
    map['others'] = { revenue: 0, quantity: 0 };

    consolidatedDishes.forEach(dish => {
      const catKey = dish.category && map[dish.category] ? dish.category : 'others';
      map[catKey].revenue += dish.revenue;
      map[catKey].quantity += dish.quantity;
    });

    return Object.entries(map)
      .filter(([_, data]) => data.revenue > 0 || data.quantity > 0)
      .map(([catId, data]) => {
        const catObj = categories.find(c => c.id === catId);
        const percent = archive.totalSales > 0 ? (data.revenue / archive.totalSales) * 100 : 0;
        return {
          id: catId,
          name: catObj?.name || (catId === 'others' ? 'General Delights' : catId),
          icon: catObj?.icon || 'Utensils',
          revenue: data.revenue,
          quantity: data.quantity,
          percent
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [categories, consolidatedDishes, archive.totalSales]);

  // 3. Historical Benchmark (Compare vs other closures)
  const benchmark = useMemo(() => {
    if (allArchives.length <= 1) return null;
    const otherArchives = allArchives.filter(a => a.id !== archive.id);
    if (otherArchives.length === 0) return null;

    const avgSales = otherArchives.reduce((acc, a) => acc + a.totalSales, 0) / otherArchives.length;
    const avgBills = otherArchives.reduce((acc, a) => acc + a.billsCount, 0) / otherArchives.length;
    const avgAOV = otherArchives.reduce((acc, a) => acc + (a.billsCount > 0 ? a.totalSales / a.billsCount : 0), 0) / otherArchives.length;

    const salesDiffPercent = avgSales > 0 ? ((archive.totalSales - avgSales) / avgSales) * 100 : 0;
    const aovDiffPercent = avgAOV > 0 ? ((averageOrderValue - avgAOV) / avgAOV) * 100 : 0;

    return {
      avgSales,
      avgBills,
      avgAOV,
      salesDiffPercent,
      aovDiffPercent
    };
  }, [allArchives, archive, averageOrderValue]);

  // 4. Automated Smart Insights
  const smartInsights = useMemo(() => {
    const list: string[] = [];

    // Sales Performance
    if (benchmark) {
      if (benchmark.salesDiffPercent >= 15) {
        list.push(`🚀 Strong Revenue Surge: This closure surpassed the restaurant's historical daily average by +${benchmark.salesDiffPercent.toFixed(1)}% (₹${archive.totalSales.toFixed(0)} vs avg ₹${benchmark.avgSales.toFixed(0)}).`);
      } else if (benchmark.salesDiffPercent <= -15) {
        list.push(`📉 Below Average Revenue: Total sales were ${Math.abs(benchmark.salesDiffPercent).toFixed(1)}% below the historical average.`);
      } else {
        list.push(`⚖️ Steady Sales Pace: Revenue was aligned within standard historical boundaries (${benchmark.salesDiffPercent >= 0 ? '+' : ''}${benchmark.salesDiffPercent.toFixed(1)}% variance).`);
      }
    }

    // Payment preference
    if (onlinePercent >= 60) {
      list.push(`💳 High Digital Adoption: ${onlinePercent.toFixed(1)}% of shift revenue was collected online via UPI/Card, indicating fast checkout with minimal liquid cash handling.`);
    } else if (cashPercent >= 60) {
      list.push(`💵 Cash Dominant Shift: ${cashPercent.toFixed(1)}% of shift revenue was settled in liquid cash, requiring thorough cash register drawer balancing.`);
    }

    // Top Category
    if (categoryBreakdown.length > 0) {
      const topCat = categoryBreakdown[0];
      list.push(`👑 Category Champion: "${topCat.name}" accounted for ${topCat.percent.toFixed(1)}% of total daily revenue (₹${topCat.revenue.toFixed(0)} across ${topCat.quantity} portions).`);
    }

    // Top Dish
    if (consolidatedDishes.length > 0) {
      const topDish = consolidatedDishes[0];
      const dishShare = archive.totalSales > 0 ? (topDish.revenue / archive.totalSales) * 100 : 0;
      list.push(`🔥 Star Dish: "${topDish.name}" was the single highest revenue contributor with ₹${topDish.revenue.toFixed(0)} (${dishShare.toFixed(1)}% of total sales).`);
    }

    return list;
  }, [benchmark, archive, onlinePercent, cashPercent, categoryBreakdown, consolidatedDishes]);

  // Print summary report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-white">
                  Historical Day Analytics & Intelligence
                </h3>
                <span className="text-[10px] bg-emerald-600/30 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {archive.date}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Deep performance breakdown, category yields, and historical comparative metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors border border-slate-700 cursor-pointer"
              title="Print Shift Analytics Summary"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>

            {(onEditRequest || onEdit) && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onEditRequest) onEditRequest(archive);
                  else if (onEdit) onEdit();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                title="Edit this closure data"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Closure</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800/60 p-1.5 rounded-lg border border-slate-700/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5 bg-slate-50">
          
          {/* 1. EXECUTIVE KPI MATRIX */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total Sales */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Sales</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-400">₹</span>
                <span className="text-lg font-black text-slate-900 font-mono">{archive.totalSales.toFixed(0)}</span>
              </div>
              {benchmark && (
                <div className={`text-[9px] font-bold flex items-center gap-0.5 ${
                  benchmark.salesDiffPercent >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}>
                  {benchmark.salesDiffPercent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span>{Math.abs(benchmark.salesDiffPercent).toFixed(1)}% vs avg</span>
                </div>
              )}
            </div>

            {/* Invoices Count */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Paid Invoices</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-slate-900 font-mono">{archive.billsCount}</span>
                <span className="text-[10px] font-bold text-slate-400">bills</span>
              </div>
              <span className="text-[9px] text-slate-400 font-medium">Guest transactions</span>
            </div>

            {/* Average Order Value */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Avg Ticket (AOV)</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-400">₹</span>
                <span className="text-lg font-black text-slate-900 font-mono">{averageOrderValue.toFixed(0)}</span>
              </div>
              <span className="text-[9px] text-slate-400 font-medium">Per invoice average</span>
            </div>

            {/* Total Portions Sold */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Units / Portions</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-slate-900 font-mono">{totalPortionsSold}</span>
                <span className="text-[10px] font-bold text-slate-400">items</span>
              </div>
              <span className="text-[9px] text-slate-400 font-medium font-mono">{avgItemsPerOrder} items/bill</span>
            </div>

            {/* Cash Sales */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">💵 Cash Sales</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-400">₹</span>
                <span className="text-lg font-black text-emerald-700 font-mono">{archive.cashSales.toFixed(0)}</span>
              </div>
              <span className="text-[9px] font-bold text-emerald-800 font-mono">{cashPercent.toFixed(1)}% of total</span>
            </div>

            {/* Online Sales */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">💳 Online Sales</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-400">₹</span>
                <span className="text-lg font-black text-blue-700 font-mono">{archive.onlineSales.toFixed(0)}</span>
              </div>
              <span className="text-[9px] font-bold text-blue-800 font-mono">{onlinePercent.toFixed(1)}% of total</span>
            </div>
          </div>

          {/* 2. PAYMENT SPLIT CYLINDER GAUGE */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-700 uppercase tracking-wide">
                Settlement Channel Distribution
              </span>
              <span className="font-mono text-[11px] text-slate-500 font-bold">
                Cash: {cashPercent.toFixed(1)}% • Online: {onlinePercent.toFixed(1)}%
              </span>
            </div>
            
            <div className="h-4 bg-slate-100 rounded-full flex overflow-hidden shadow-inner relative">
              <div
                style={{ width: `${cashPercent}%` }}
                className="bg-emerald-600 h-full transition-all duration-500"
                title={`Cash: ₹${archive.cashSales} (${cashPercent.toFixed(1)}%)`}
              ></div>
              <div
                style={{ width: `${onlinePercent}%` }}
                className="bg-blue-600 h-full transition-all duration-500"
                title={`Online: ₹${archive.onlineSales} (${onlinePercent.toFixed(1)}%)`}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold pt-1">
              <div className="flex items-center gap-1.5 text-emerald-800">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>Cash Register: ₹{archive.cashSales.toFixed(0)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-800">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>Digital UPI/POS: ₹{archive.onlineSales.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* 3. DUAL GRID: CATEGORY BREAKDOWN & TOP DISHES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Category Revenue Breakdown */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wide">
                      Category Revenue Yield
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">Sales share by culinary category</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {categoryBreakdown.length} Categories Active
                </span>
              </div>

              {categoryBreakdown.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">
                  No categorized item records found for this closure.
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {categoryBreakdown.map((cat) => {
                    const IconComp = getCategoryIcon(cat.icon);
                    return (
                      <div key={cat.id} className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/60 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                              <IconComp className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold text-xs text-slate-800 truncate">{cat.name}</span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono font-extrabold text-xs text-slate-900">
                              ₹{cat.revenue.toFixed(0)}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 font-bold ml-1.5">
                              ({cat.percent.toFixed(1)}%)
                            </span>
                          </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, Math.max(3, cat.percent))}%` }}
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Performing Dishes */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wide">
                      Top Grossing Dishes
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">Ranked by revenue contribution</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {consolidatedDishes.length} Items Logged
                </span>
              </div>

              {consolidatedDishes.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">
                  No individual dish records found for this closure.
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
                  {consolidatedDishes.slice(0, 10).map((dish, idx) => {
                    const topRev = consolidatedDishes[0]?.revenue || 1;
                    const barW = Math.max(5, (dish.revenue / topRev) * 100);
                    const dishShare = archive.totalSales > 0 ? (dish.revenue / archive.totalSales) * 100 : 0;

                    return (
                      <div key={idx} className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/60 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-xs font-bold text-slate-400 w-5 text-center shrink-0">
                              #{idx + 1}
                            </span>
                            <span className="font-bold text-xs text-slate-800 truncate">{dish.name}</span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono font-black text-xs text-slate-900">
                              ₹{dish.revenue.toFixed(0)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono ml-1.5">
                              {dish.quantity} pcs
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${barW}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${
                                idx === 0 ? 'bg-amber-500' : 'bg-slate-500'
                              }`}
                            ></div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">
                            {dishShare.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* 4. SMART BUSINESS TAKEAWAYS & SHIFT NOTES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Automated Intelligence Highlights */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <h5 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wide">
                  Automated Shift Intelligence & Takeaways
                </h5>
              </div>

              <div className="flex flex-col gap-2">
                {smartInsights.map((insight, idx) => (
                  <div key={idx} className="p-2.5 bg-white/90 rounded-xl border border-emerald-100 text-xs font-medium text-slate-800 leading-relaxed shadow-2xs">
                    {insight}
                  </div>
                ))}
              </div>
            </div>

            {/* Shift Notes / Remarks */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                    Shift Remarks & Context
                  </h5>
                </div>
                {(onEditRequest || onEdit) && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onEditRequest) onEditRequest(archive);
                      else if (onEdit) onEdit();
                    }}
                    className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Edit Note
                  </button>
                )}
              </div>

              {archive.notes ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {archive.notes}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 text-xs font-medium">
                  No special notes or event logs recorded for this day closure.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-3.5 sm:p-4 flex items-center justify-between shrink-0">
          <div className="text-[11px] font-mono text-slate-500 font-bold">
            Archive ID: <span className="text-slate-700">{archive.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all uppercase tracking-wider cursor-pointer shadow-xs"
            >
              Close Analysis
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
