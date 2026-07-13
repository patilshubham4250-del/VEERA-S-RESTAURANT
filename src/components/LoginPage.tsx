import React, { useState, useEffect, useRef } from 'react';
import { Lock, ChefHat, AlertCircle, Clock, Calendar, ShieldAlert, Eye, EyeOff, Keyboard, Grid, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [inputMode, setInputMode] = useState<'keypad' | 'keyboard'>('keypad');
  const [pin, setPin] = useState<string>('');
  const [keyboardPassword, setKeyboardPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [liveTime, setLiveTime] = useState<string>('');
  const [liveDate, setLiveDate] = useState<string>('');
  
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Update Clock
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setLiveDate(now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard support for typing PIN when in keypad mode
  useEffect(() => {
    if (inputMode !== 'keypad') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus element check (ignore if typing in some input)
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.key >= '0' && e.key <= '9') {
        handleNumberPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, inputMode]);

  // Focus input when shifting to keyboard mode
  useEffect(() => {
    if (inputMode === 'keyboard') {
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    }
  }, [inputMode]);

  const handleNumberPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError('');
      
      // Auto-submit if pin length becomes 4
      if (nextPin.length === 4) {
        verifyPasscode(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const verifyPasscode = (code: string) => {
    if (code === '9773') {
      onLoginSuccess();
    } else {
      setIsShaking(true);
      setError('Incorrect security passcode. Access denied.');
      setPin('');
      setKeyboardPassword('');
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleKeyboardFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyboardPassword) {
      setError('Please enter a passcode');
      return;
    }
    verifyPasscode(keyboardPassword);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-between p-6 text-slate-100 font-sans select-none relative overflow-hidden">
      
      {/* Decorative ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header - Info & Time */}
      <div className="w-full max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 z-10 opacity-85">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/35 text-emerald-400 flex items-center justify-center shadow-md">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-wider uppercase text-emerald-400">Veera's Restaurant</span>
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest leading-none mt-0.5">Terminal Locked</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{liveDate}</span>
          </div>
          <span className="text-slate-800">|</span>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>{liveTime}</span>
          </div>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="my-auto w-full max-w-md z-10">
        <motion.div 
          animate={isShaking ? { x: [-10, 10, -10, 10, -5, 5, -2, 2, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center"
        >
          {/* Lock Icon Banner */}
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 shadow-inner">
            <Lock className="w-6 h-6 stroke-[2]" />
          </div>

          <h2 className="text-xl font-black tracking-tight text-white uppercase text-center">POS Terminal Authorization</h2>
          <p className="text-xs text-slate-400 text-center mt-1">Please enter your security passcode to log in</p>

          {/* Mode Tabs Switcher */}
          <div className="flex bg-slate-950/60 p-1 border border-slate-800 rounded-xl my-5 w-full">
            <button
              onClick={() => {
                setInputMode('keypad');
                setError('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                inputMode === 'keypad' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Passcode Grid</span>
            </button>
            <button
              onClick={() => {
                setInputMode('keyboard');
                setError('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                inputMode === 'keyboard' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Keyboard Mode</span>
            </button>
          </div>

          {/* Tab Content Rendering with AnimatePresence */}
          <div className="w-full flex flex-col items-center min-h-[240px]">
            {inputMode === 'keypad' ? (
              <motion.div 
                key="keypad-mode-container"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex flex-col items-center"
              >
                {/* Hidden Dots Display */}
                <div className="flex gap-4 my-4">
                  {[0, 1, 2, 3].map((index) => {
                    const isActive = pin.length > index;
                    return (
                      <div 
                        key={index} 
                        className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                          isActive 
                            ? 'bg-emerald-400 border-emerald-400 scale-125 shadow-lg shadow-emerald-400/30' 
                            : 'border-slate-700 bg-slate-950'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Keypad Feedback */}
                <div className="h-6 w-full text-center flex items-center justify-center mb-4">
                  <AnimatePresence mode="wait">
                    {error ? (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-400 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        className="text-slate-500 text-[10px] font-bold uppercase tracking-wider"
                      >
                        Grid Mode: Type or Click digits
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3x4 Touch Grid Keypad */}
                <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs mb-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleNumberPress(num)}
                      className="aspect-square bg-slate-800/40 hover:bg-slate-800/80 active:bg-slate-700 border border-slate-800/55 rounded-2xl text-xl font-bold text-white transition-all duration-100 flex items-center justify-center cursor-pointer select-none active:scale-95"
                    >
                      {num}
                    </button>
                  ))}

                  {/* Clear Button (C) */}
                  <button
                    type="button"
                    onClick={handleClear}
                    className="aspect-square bg-slate-900/60 hover:bg-slate-800/40 border border-transparent rounded-2xl text-[10px] sm:text-xs font-bold text-slate-400 hover:text-white transition-all flex items-center justify-center cursor-pointer select-none"
                  >
                    CLEAR
                  </button>

                  {/* Zero (0) */}
                  <button
                    type="button"
                    onClick={() => handleNumberPress('0')}
                    className="aspect-square bg-slate-800/40 hover:bg-slate-800/80 active:bg-slate-700 border border-slate-800/55 rounded-2xl text-xl font-bold text-white transition-all duration-100 flex items-center justify-center cursor-pointer select-none active:scale-95"
                  >
                    0
                  </button>

                  {/* Backspace Button */}
                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="aspect-square bg-slate-900/60 hover:bg-slate-800/40 border border-transparent rounded-2xl text-lg font-bold text-slate-400 hover:text-white transition-all flex items-center justify-center cursor-pointer select-none"
                  >
                    ⌫
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form 
                key="keyboard-mode-container"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleKeyboardFormSubmit}
                className="w-full flex flex-col items-center justify-center py-4"
              >
                {/* Physical Keyboard Input field */}
                <div className="w-full max-w-sm flex flex-col gap-1.5 mb-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Type Passcode / Password</label>
                  <div className="relative">
                    <input
                      ref={passwordInputRef}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter security password"
                      value={keyboardPassword}
                      onChange={(e) => {
                        setKeyboardPassword(e.target.value);
                        setError('');
                      }}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all pr-12 text-center tracking-widest font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Keyboard feedback */}
                <div className="h-6 w-full text-center flex items-center justify-center mb-6">
                  <AnimatePresence mode="wait">
                    {error ? (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-400 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        className="text-slate-500 text-[10px] font-bold uppercase tracking-wider"
                      >
                        Press Enter or Click Submit below
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit Trigger Button */}
                <button
                  type="submit"
                  className="w-full max-w-xs bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold py-3 px-5 rounded-xl shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>Authorize & Log In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            )}
          </div>

          {/* Subtle Security Tip */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-4 border-t border-slate-800/50 pt-3 w-full justify-center">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
            <span>Authorized administrator staff only (PIN: 9773)</span>
          </div>

        </motion.div>
      </div>

      {/* Footer Disclaimer */}
      <div className="text-center text-[10px] text-slate-600 font-medium tracking-wide z-10 uppercase opacity-75">
        Veera POS POS Terminal System v3.2 • Encrypted Cloud Synchronized Mode
      </div>

    </div>
  );
}
