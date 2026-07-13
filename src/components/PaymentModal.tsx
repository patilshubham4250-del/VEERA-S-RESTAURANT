/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Banknote, CreditCard, ArrowRight, RefreshCcw, QrCode } from 'lucide-react';
import { PaymentMethod } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  gstRate: number;
  onSuccess: (paymentMethod: PaymentMethod, amountPaid: number) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  total,
  subtotal,
  tax,
  discount,
  gstRate,
  onSuccess,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [selectedOnlineProvider, setSelectedOnlineProvider] = useState<string>('gpay');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Quick cash helper suggestions based on the total amount
  const getQuickCashSuggestions = (amt: number) => {
    const ceilTen = Math.ceil(amt / 10) * 10;
    const ceilFifty = Math.ceil(amt / 50) * 50;
    const ceilHundred = Math.ceil(amt / 100) * 100;
    const nextDenominations = [50, 100, 200, 500, 1000, 2000].filter(d => d > amt).slice(0, 3);
    
    const suggestions = new Set<number>();
    suggestions.add(Math.round(amt)); // exact change rounded
    suggestions.add(ceilTen);
    suggestions.add(ceilFifty);
    suggestions.add(ceilHundred);
    nextDenominations.forEach(d => suggestions.add(d));
    
    return Array.from(suggestions).filter(s => s >= amt).sort((a, b) => a - b).slice(0, 4);
  };

  const cashSuggestions = getQuickCashSuggestions(total);

  useEffect(() => {
    if (paymentMethod === 'CASH') {
      const received = parseFloat(cashReceived) || 0;
      setChangeAmount(Math.max(0, received - total));
    } else {
      setChangeAmount(0);
    }
  }, [cashReceived, total, paymentMethod]);

  const handleQuickCash = (amount: number) => {
    setCashReceived(amount.toFixed(0));
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'CASH') {
      const received = parseFloat(cashReceived) || 0;
      if (received < total - 0.01) {
        alert('Received cash is less than the total bill amount!');
        return;
      }
    }

    setIsProcessing(true);
    // Simulate real-time merchant payment approval
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      // Let success transition show for 1.2s then callback
      setTimeout(() => {
        const received = paymentMethod === 'CASH' ? (parseFloat(cashReceived) || total) : total;
        onSuccess(paymentMethod, received);
        resetState();
      }, 1500);
    }, 1200);
  };

  const resetState = () => {
    setPaymentMethod('CASH');
    setCashReceived('');
    setChangeAmount(0);
    setSelectedOnlineProvider('gpay');
    setIsProcessing(false);
    setIsSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="payment-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          id="payment-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md overflow-hidden bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Checkout & Payment</h3>
              <p className="text-xs text-slate-500 font-bold">Choose preferred checkout method</p>
            </div>
            <button
              id="close-payment-modal"
              onClick={() => {
                resetState();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isSuccess ? (
            <form onSubmit={handleCheckoutSubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {/* Bill Breakdown Summarized */}
              <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 flex flex-col gap-1.5 animate-fadeIn">
                <div className="flex justify-between text-xs text-slate-600 font-bold">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-700 font-extrabold">
                    <span>Discount:</span>
                    <span className="font-mono">-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-slate-600 font-bold">
                  <span>Taxes ({gstRate}% GST):</span>
                  <span className="font-mono">₹{tax.toFixed(2)}</span>
                </div>
                <div className="h-px bg-emerald-200/50 my-1"></div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-extrabold text-slate-800">Total Bill Amount:</span>
                  <span className="text-xl font-black text-emerald-700 font-mono">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Selector Toggle */}
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-lg">
                <button
                  id="select-cash-payment"
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md text-xs font-black uppercase transition-all ${
                    paymentMethod === 'CASH'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  Cash Payment
                </button>
                <button
                  id="select-online-payment"
                  type="button"
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md text-xs font-black uppercase transition-all ${
                    paymentMethod === 'ONLINE'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Online / UPI
                </button>
              </div>

              {/* Conditional Inputs */}
              {paymentMethod === 'CASH' ? (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  {/* Cash received input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Cash Tendered (Received)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">₹</span>
                      <input
                        id="cash-received-input"
                        type="number"
                        step="any"
                        required
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        placeholder={`Min ₹${total.toFixed(2)}`}
                        className="w-full pl-8 pr-4 py-3 rounded-lg border border-slate-200 text-lg font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Cash Suggestions */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-slate-500 font-bold">Quick Cash Tender Presets:</span>
                    <div className="grid grid-cols-4 gap-2">
                      {cashSuggestions.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleQuickCash(amt)}
                          className="py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-lg text-xs font-black font-mono text-slate-700 transition-all text-center cursor-pointer"
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Balance / Change Due */}
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-800">Change to Return:</span>
                      <p className="text-[10px] text-emerald-600 font-bold">Give balance back to guest</p>
                    </div>
                    <span id="cash-change-display" className="text-xl font-black text-emerald-700 font-mono">
                      ₹{changeAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  {/* Select UPI App / Mock QR */}
                  <div className="flex flex-col gap-3 items-center justify-center py-2 px-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-1.5 bg-slate-800 text-white font-bold px-2.5 py-1 rounded-full text-xs">
                      <QrCode className="w-3.5 h-3.5" />
                      Dynamic Table QR Code
                    </div>
                    
                    {/* Simulated Dynamic UPI QR */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm relative">
                      <svg className="w-28 h-28 text-slate-800" viewBox="0 0 100 100">
                        {/* Dynamic looking QR grid */}
                        <path fill="currentColor" d="M0 0h30v30H0zm5 5h20v20H5zM70 0h30v30H70zm5 5h20v20H75zM0 70h30v30H0zm5 5h20v20H5zM10 10h10v10H10zm70 0h10v10H80zm-70 70h10v10H10zm35-40h10v10H45zm10 10h10v10H55zm-10 10h10v10H45zm25-10h10v10H70zm10 10h10v10H80zm-10 10h10v10H70zm-25 10h10v10H45zm15-45h10v10H60zm10 0h10v10H70z" />
                        <rect x="42" y="42" width="16" height="16" rx="2" fill="#059669" />
                        <circle cx="50" cy="50" r="4" fill="white" />
                      </svg>
                      <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[0.5px] rounded-lg pointer-events-none"></div>
                    </div>
                    
                    <p className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-wider">
                      Scan to pay ₹{total.toFixed(2)} directly on the table
                    </p>
                  </div>

                  {/* UPI Provider Selection */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-slate-500 font-bold">Payment Gateway / App Profile:</span>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'gpay', label: 'GPay', color: 'border-emerald-200 text-emerald-700 bg-emerald-50' },
                        { id: 'phonepe', label: 'PhonePe', color: 'border-slate-300 text-slate-900 bg-slate-50' },
                        { id: 'paytm', label: 'Paytm', color: 'border-slate-300 text-slate-900 bg-slate-50' },
                        { id: 'card', label: 'Card/POS', color: 'border-slate-300 text-slate-900 bg-slate-50' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedOnlineProvider(p.id)}
                          className={`py-2 text-center rounded-lg text-xs font-bold border transition-all ${
                            selectedOnlineProvider === p.id
                              ? `${p.color} ring-2 ring-emerald-500/50 shadow-sm border-transparent`
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex gap-3">
                <button
                  id="cancel-payment"
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="confirm-payment-button"
                  type="submit"
                  disabled={isProcessing}
                  className={`flex-[2] py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-black text-white transition-all shadow-md ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-100'
                      : 'bg-slate-800 hover:bg-slate-900 hover:shadow-slate-100'
                  } disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer`}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                      Approving Bill...
                    </>
                  ) : (
                    <>
                      Confirm & Print Bill
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Success Feedback Layout */
            <motion.div
              id="payment-success-view"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="p-8 flex flex-col items-center justify-center text-center gap-4 bg-white"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                <Check className="w-9 h-9 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-800">Order Completed Successfully!</h4>
                <p className="text-xs text-slate-500 font-bold mt-1">Invoice registered in real-time server logs.</p>
              </div>

              {/* Mini receipt detail */}
              <div className="w-full bg-slate-50 rounded-lg p-4 border border-dashed border-slate-200 flex flex-col gap-2 font-mono text-xs text-slate-600 max-w-xs text-left">
                <div className="text-center font-black text-slate-800 border-b border-slate-200 pb-2 mb-1">
                  VEERA'S RESTAURANT
                </div>
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="font-bold text-slate-800">{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Items Total:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount:</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST ({gstRate}%):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="h-px bg-slate-200 my-1"></div>
                <div className="flex justify-between font-bold text-sm text-slate-800">
                  <span>Total Bill:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-bold">Updating analytics, please wait...</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
