"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, ChevronDown, Calculator, RefreshCw, Activity, Wallet, Target, ShieldCheck, Zap, BookOpen, CheckCircle2, ArrowUp, Copy, Percent, AlertTriangle, Plus, Trash2, ShoppingCart, FileText, Info, Search, History, SearchCheck, Building2, BadgeCheck, Printer, Download, Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import { toolsData } from '@/data/tools';
import { toolArticles } from '@/data/toolArticles';
import ToolArticle from '@/components/ToolArticle';
import ToolCard from '@/components/ToolCard';
import ToolIcon from '@/components/ToolIcon';

const SEO_TITLE = "Free GST Calculator Online - ToolWala AI";
const SEO_DESC = "Calculate GST amount, total price, and reverse GST instantly with free GST Calculator.";

type CalcTab = 'single' | 'multi' | 'gstin';

interface CartItem {
  id: string;
  name: string;
  amount: number | '';
  rate: number;
  qty: number;
}

interface HistoryItem {
  id: string;
  timestamp: string;
  mode: 'add' | 'remove';
  taxType: 'intra' | 'inter';
  amount: number;
  rate: number;
  gst: number;
  total: number;
}

interface GstSlabGuide {
  rate: number;
  label: string;
  category: string;
  badgeColor: string;
  examples: string[];
}

const STATE_CODES: Record<string, string> = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
  "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
  "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur",
  "15": "Mizoram", "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal",
  "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "25": "Daman & Diu", "26": "Dadra & Nagar Haveli", "27": "Maharashtra", "28": "Andhra Pradesh",
  "29": "Karnataka", "30": "Goa", "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu",
  "34": "Puducherry", "35": "Andaman & Nicobar", "36": "Telangana", "37": "Andhra Pradesh (New)",
  "38": "Ladakh", "97": "Other Territory", "99": "Centre Jurisdiction"
};

function validateGSTIN(gstin: string) {
  const clean = gstin.trim().toUpperCase();
  if (!clean) return { valid: false, message: "Please enter a 15-digit GSTIN number." };
  
  if (clean.length !== 15) {
    return { valid: false, message: `GSTIN must be exactly 15 characters (currently ${clean.length}).` };
  }

  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  const formatValid = gstinRegex.test(clean);

  const stateCode = clean.substring(0, 2);
  const stateName = STATE_CODES[stateCode];
  const pan = clean.substring(2, 12);
  const entityCode = clean[12];
  const checksumChar = clean[14];

  // Modulus 36 Checksum
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const charVal = chars.indexOf(clean[i]);
    const factor = (i % 2 === 0) ? 1 : 2;
    const prod = charVal * factor;
    const quotient = Math.floor(prod / 36);
    const remainder = prod % 36;
    sum += quotient + remainder;
  }

  const checkVal = (36 - (sum % 36)) % 36;
  const expectedCheckChar = chars[checkVal];
  const checksumValid = expectedCheckChar === checksumChar;

  if (!formatValid) {
    return {
      valid: false,
      formatValid: false,
      checksumValid: false,
      stateCode: stateName ? stateCode : "Invalid",
      stateName: stateName || "Unknown State Code",
      pan,
      entityCode,
      checksumChar,
      message: "GSTIN format structure mismatch (Expected: 2-digit State + 10-digit PAN + Entity + Z + Checksum)."
    };
  }

  return {
    valid: formatValid && checksumValid,
    formatValid: true,
    checksumValid,
    stateCode,
    stateName: stateName || "Unknown State Code",
    pan,
    entityCode,
    checksumChar,
    message: checksumValid 
      ? "✅ Valid GSTIN Format & Checksum Verified!" 
      : "⚠️ Format valid, but Modulus 36 checksum character mismatch."
  };
}

interface GstSlabGuide {
  rate: number;
  label: string;
  category: string;
  badgeColor: string;
  examples: string[];
}

const GST_SLABS_DATA: GstSlabGuide[] = [
  {
    rate: 0,
    label: "0% (Exempted)",
    category: "Essential Unbranded Food & Healthcare",
    badgeColor: "bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-gray-300 border-slate-300 dark:border-white/10",
    examples: ["Fresh Vegetables & Fruits", "Unbranded Milk, Curd, Lassi", "Wheat, Rice, Flour (Unbranded)", "Healthcare & Hospital Stay", "Education Services"]
  },
  {
    rate: 3,
    label: "3% (Precious Metals)",
    category: "Gold, Silver & Jewellery",
    badgeColor: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 border-amber-300 dark:border-amber-500/30",
    examples: ["Gold Ornaments & Bullion", "Silver Items", "Precious Stones", "Imitation Jewellery"]
  },
  {
    rate: 5,
    label: "5% (Essential Goods)",
    category: "Basic Commodities & Economy Travel",
    badgeColor: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30",
    examples: ["Packaged Tea, Coffee, Sugar", "Edible Oil & Spices", "Life-saving Medicines", "Economy Air & Rail Travel", "Small Restaurants"]
  },
  {
    rate: 12,
    label: "12% (Standard Low)",
    category: "Processed Food & Electronics",
    badgeColor: "bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-300 border-blue-300 dark:border-blue-500/30",
    examples: ["Butter, Cheese, Ghee, Fruit Juice", "Apparel above ₹1,000", "Computers, Printers, Mobiles", "Business Class Air Travel"]
  },
  {
    rate: 18,
    label: "18% (Standard Rate)",
    category: "Most Goods & Services",
    badgeColor: "bg-purple-100 text-purple-900 dark:bg-purple-500/20 dark:text-purple-300 border-purple-300 dark:border-purple-500/30",
    examples: ["IT Services & Telecom", "Financial & Banking Services", "Hair Oil, Soap, Toothpaste", "Hotel Restaurants", "Capital Goods"]
  },
  {
    rate: 28,
    label: "28% (Luxury / Sin)",
    category: "Luxury Vehicles & Aerated Drinks",
    badgeColor: "bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-300 border-rose-300 dark:border-rose-500/30",
    examples: ["Cars & Motorcycles", "Air Conditioners & Refrigerators", "Aerated Drinks & Paan Masala", "Cigarettes & Tobacco", "Online Gaming"]
  }
];

const MAX_AMOUNT = 999999999999; // Max limit ₹1 Trillion (12 digits)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);
};

const formatCompactCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(value);
};

function numberToWordsINR(amount: number): string {
  if (!amount || isNaN(amount) || amount <= 0) return "";
  if (amount > 100000000000) return "Amount Exceeds Supported Limit";

  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", 
                 "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const convertTwoDigits = (n: number): string => {
    if (n < 20) return units[n];
    const unitDigit = n % 10;
    return `${tens[Math.floor(n / 10)]}${unitDigit ? " " + units[unitDigit] : ""}`;
  };

  const convertThreeDigits = (n: number): string => {
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    let str = "";
    if (hundred > 0 && hundred < units.length) {
      str += `${units[hundred]} Hundred`;
    }
    if (remainder > 0) {
      if (str) str += " ";
      str += convertTwoDigits(remainder);
    }
    return str;
  };

  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) return "";

  let words = "";

  if (integerPart > 0) {
    let num = integerPart;

    const crore = Math.floor(num / 10000000);
    num %= 10000000;

    const lakh = Math.floor(num / 100000);
    num %= 100000;

    const thousand = Math.floor(num / 1000);
    num %= 1000;

    const remainder = num;

    let parts: string[] = [];

    if (crore > 0) {
      const croreWords = crore < 100 ? convertTwoDigits(crore) : convertThreeDigits(crore);
      parts.push(`${croreWords || crore} Crore`);
    }
    if (lakh > 0) {
      parts.push(`${convertTwoDigits(lakh)} Lakh`);
    }
    if (thousand > 0) {
      parts.push(`${convertTwoDigits(thousand)} Thousand`);
    }
    if (remainder > 0) {
      parts.push(convertThreeDigits(remainder));
    }

    words = parts.join(" ") + " Rupees";
  }

  if (decimalPart > 0) {
    const paiseWords = convertTwoDigits(decimalPart);
    if (words) {
      words += ` and ${paiseWords} Paise`;
    } else {
      words = `${paiseWords} Paise`;
    }
  }

  return words ? `${words} Only` : "";
}

function NumberInput({ label, value, onChange, icon: Icon, suffix = "", helperText, placeholder = "", max = 500000 }: any) {
  const isMaxReached = value === MAX_AMOUNT;
  const numVal = typeof value === 'number' ? value : 0;
  const sliderMax = Math.min(max || 500000, MAX_AMOUNT);
  const pct = Math.min(100, Math.max(0, (numVal / sliderMax) * 100));

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${isMaxReached ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`} />
          <label className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">{label}</label>
        </div>
        <div className="relative flex items-center w-full sm:w-48">
          <input 
            type="number"
            min={0}
            max={MAX_AMOUNT}
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              if (e.target.value === '') {
                onChange('');
                return;
              }
              let valStr = e.target.value;
              const maxLen = MAX_AMOUNT ? MAX_AMOUNT.toString().length : 12;
              if (valStr.length > maxLen) {
                valStr = valStr.slice(0, maxLen);
              }
              let val = Number(valStr);
              if (val > MAX_AMOUNT) val = MAX_AMOUNT;
              if (val < 0) val = 0;
              onChange(val);
            }}
            onBlur={() => {
              if (value !== '' && value < 0) onChange(0);
            }}
            className={`w-full bg-slate-100 dark:bg-black/40 border rounded-xl py-3 px-4 pr-10 text-slate-900 dark:text-white font-mono text-lg text-center focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-white/20 shadow-inner dark:shadow-none ${
              isMaxReached 
                ? 'border-amber-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 font-bold' 
                : 'border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50'
            }`}
          />
          {suffix && <span className="absolute right-4 text-slate-500 dark:text-emerald-400 text-sm font-extrabold pointer-events-none">{suffix}</span>}
        </div>
      </div>
      
      {isMaxReached ? (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300/80 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold shadow-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Maximum Limit Reached: Bas ₹99,999 Crore (₹1 Trillion) tak hi maximum enter kar sakte hain.</span>
        </div>
      ) : (
        <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">{helperText}</p>
      )}

      {/* Interactive Slider Track with Draggable Circle Handle Knob */}
      <div className="relative w-full py-3 cursor-pointer group select-none">
        <div className="w-full h-2.5 bg-slate-200 dark:bg-white/10 rounded-full relative overflow-hidden shadow-inner">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" 
            animate={{ width: `${pct}%` }} 
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Visible Circle Knob / Thumb */}
        <motion.div 
          className="absolute top-1/2 -translate-y-1/2 -ml-3.5 w-7 h-7 bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-full shadow-lg flex items-center justify-center pointer-events-none group-hover:scale-110 group-active:scale-95 transition-transform"
          animate={{ left: `${pct}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
        </motion.div>

        {/* Full drag input */}
        <input 
          type="range"
          min={0}
          max={sliderMax}
          step={100}
          value={Math.min(numVal, sliderMax)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-grab active:cursor-grabbing z-10"
        />
      </div>
    </div>
  );
}

export default function GstCalculatorPage() {
  const [mounted, setMounted] = useState(false);
  const [faqExpanded, setFaqExpanded] = useState<number | null>(null);

  // States
  const [calcTab, setCalcTab] = useState<CalcTab>('single');
  const [amount, setAmount] = useState<number | ''>(10000);
  const [rate, setRate] = useState<number | ''>(18);
  const [isCustomRate, setIsCustomRate] = useState<boolean>(false);
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [taxType, setTaxType] = useState<'intra' | 'inter'>('intra');
  const [enableRounding, setEnableRounding] = useState<boolean>(false);
  const [showHsnGuide, setShowHsnGuide] = useState<boolean>(false);
  const [hsnSearch, setHsnSearch] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // History & GSTIN States
  const [calcHistory, setCalcHistory] = useState<HistoryItem[]>([]);
  const [gstinInput, setGstinInput] = useState<string>('27AAPCU0749L1Z2');
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Multi-item cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: '1', name: 'Laptop / Computer', amount: 50000, rate: 18, qty: 1 },
    { id: '2', name: 'Office Furniture', amount: 15000, rate: 12, qty: 1 },
  ]);

  useEffect(() => {
    setMounted(true);
    if (typeof document !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }
    try {
      const saved = localStorage.getItem('toolwala_gst_history');
      if (saved) {
        setCalcHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleDarkMode = () => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark');
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }
  };

  const handlePrintInvoice = () => {
    const isMulti = calcTab === 'multi';
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    const invNo = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

    let itemsHtml = "";
    if (isMulti) {
      itemsHtml = cartResults.items.map((it, idx) => `
        <tr>
          <td style="padding:10px; border-bottom:1px solid #eee;">${idx + 1}</td>
          <td style="padding:10px; border-bottom:1px solid #eee;"><strong>${it.name || 'Item'}</strong></td>
          <td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">${it.qty}</td>
          <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">${formatCurrency(Number(it.amount) || 0)}</td>
          <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">${it.rate}%</td>
          <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">${formatCurrency(it.itemGst)}</td>
          <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;"><strong>${formatCurrency(it.itemTotal)}</strong></td>
        </tr>
      `).join('');
    } else {
      itemsHtml = `
        <tr>
          <td style="padding:10px; border-bottom:1px solid #eee;">1</td>
          <td style="padding:10px; border-bottom:1px solid #eee;"><strong>GST Calculation (${mode === 'add' ? 'Exclusive' : 'Inclusive'})</strong></td>
          <td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">1</td>
          <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">${formatCurrency(results.original)}</td>
          <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">${rate}%</td>
          <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">${formatCurrency(results.gst)}</td>
          <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;"><strong>${formatCurrency(results.total)}</strong></td>
        </tr>
      `;
    }

    const subtotal = isMulti ? cartResults.totalBase : results.original;
    const totalGst = isMulti ? cartResults.totalGst : results.gst;
    const grandTotal = isMulti ? cartResults.grandTotal : results.total;
    const cgst = isMulti ? cartResults.cgst : results.cgst;
    const sgst = isMulti ? cartResults.sgst : results.sgst;
    const igst = isMulti ? cartResults.igst : results.igst;
    const roundOff = isMulti ? cartResults.roundOffDiff : results.roundOffDiff;
    const words = numberToWordsINR(grandTotal);

    let taxRows = "";
    if (taxType === 'intra') {
      taxRows = `
        <tr><td style="padding:4px 0;">CGST Amount:</td><td style="text-align:right; font-weight:bold;">${formatCurrency(cgst)}</td></tr>
        <tr><td style="padding:4px 0;">SGST Amount:</td><td style="text-align:right; font-weight:bold;">${formatCurrency(sgst)}</td></tr>
      `;
    } else {
      taxRows = `
        <tr><td style="padding:4px 0;">IGST Amount:</td><td style="text-align:right; font-weight:bold;">${formatCurrency(igst)}</td></tr>
      `;
    }

    if (enableRounding && Math.abs(roundOff) > 0.001) {
      taxRows += `<tr><td style="padding:4px 0;">Round Off Adjustment:</td><td style="text-align:right; font-weight:bold;">${roundOff > 0 ? '+' : ''}${formatCurrency(roundOff)}</td></tr>`;
    }

    const printWin = window.open('', '_blank');
    if (!printWin) return;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>GST Tax Invoice - ${invNo}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; background: #fff; }
          .invoice-box { max-width: 800px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: 900; color: #047857; letter-spacing: -0.5px; }
          .invoice-title { font-size: 14px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 2px; }
          .meta-grid { display: flex; justify-content: space-between; margin-bottom: 32px; font-size: 13px; color: #475569; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
          th { background: #f8fafc; padding: 10px; text-align: left; font-weight: 800; text-transform: uppercase; font-size: 11px; color: #475569; border-bottom: 2px solid #e2e8f0; }
          .totals-box { width: 300px; margin-left: auto; font-size: 13px; border-top: 2px solid #10b981; padding-top: 12px; }
          .grand-total { font-size: 18px; font-weight: 900; color: #047857; border-top: 2px solid #10b981; padding-top: 8px; margin-top: 8px; }
          .words-badge { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 10px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; margin-top: 20px; }
          .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; }
          @media print { body { padding: 0; } .invoice-box { border: none; box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div>
              <div class="logo">ToolWala AI</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Smart GST Tax Summary Invoice</div>
            </div>
            <div style="text-align: right;">
              <div class="invoice-title">GST TAX INVOICE</div>
              <div style="font-size: 12px; font-weight: bold; margin-top: 4px;">${invNo}</div>
              <div style="font-size: 12px; color: #64748b;">Date: ${dateStr}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div>
              <strong>Transaction Details:</strong><br>
              Mode: ${mode === 'add' ? 'Exclusive (+GST)' : 'Inclusive (-GST)'}<br>
              Tax Type: ${taxType === 'intra' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}
            </div>
            <div style="text-align: right;">
              <strong>Generated By:</strong><br>
              ToolWala AI GST Calculator<br>
              https://toolwala.co/tools/gst-calculator
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item Description</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Base Price</th>
                <th style="text-align:right;">Rate</th>
                <th style="text-align:right;">GST</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals-box">
            <table style="margin-bottom:0;">
              <tr><td style="padding:4px 0;">Subtotal (Base):</td><td style="text-align:right; font-weight:bold;">${formatCurrency(subtotal)}</td></tr>
              ${taxRows}
              <tr><td style="padding:4px 0;">Total Tax:</td><td style="text-align:right; font-weight:bold; color:#047857;">${formatCurrency(totalGst)}</td></tr>
              <tr class="grand-total"><td>Grand Total:</td><td style="text-align:right;">${formatCurrency(grandTotal)}</td></tr>
            </table>
          </div>

          ${words ? `<div class="words-badge">🔤 Amount in Words: ${words}</div>` : ''}

          <div class="footer">
            Computer-generated GST Tax Summary document. Powered by ToolWala AI.
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  const saveToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    if (!item.amount || item.amount <= 0) return;
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setCalcHistory(prev => {
      if (prev.length > 0 && prev[0].amount === item.amount && prev[0].rate === item.rate && prev[0].mode === item.mode && prev[0].taxType === item.taxType) {
        return prev;
      }
      const updated = [newItem, ...prev].slice(0, 5);
      try {
        localStorage.setItem('toolwala_gst_history', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setCalcHistory([]);
    try {
      localStorage.removeItem('toolwala_gst_history');
    } catch (e) {
      console.error(e);
    }
  };

  const restoreHistoryItem = (hItem: HistoryItem) => {
    setCalcTab('single');
    setAmount(hItem.amount);
    setRate(hItem.rate);
    setMode(hItem.mode);
    setTaxType(hItem.taxType);
    setIsCustomRate(![3, 5, 12, 18, 28].includes(hItem.rate));
  };

  const handleReset = () => {
    setAmount(10000);
    setRate(18);
    setIsCustomRate(false);
    setMode('add');
    setTaxType('intra');
    setEnableRounding(false);
  };

  const handleAddCartItem = () => {
    const newItem: CartItem = {
      id: Date.now().toString(),
      name: `Item ${cartItems.length + 1}`,
      amount: 1000,
      rate: 18,
      qty: 1
    };
    setCartItems([...cartItems, newItem]);
  };

  const handleRemoveCartItem = (id: string) => {
    if (cartItems.length <= 1) return;
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleUpdateCartItem = (id: string, field: keyof CartItem, value: any) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const cartResults = useMemo(() => {
    let totalBase = 0;
    let totalGst = 0;

    const itemsCalculated = cartItems.map(item => {
      const P = (Number(item.amount) || 0) * (Number(item.qty) || 1);
      const R = Number(item.rate) || 0;
      
      let itemBase = P;
      let itemGst = 0;
      let itemTotal = P;

      if (P > 0 && R > 0) {
        if (mode === 'add') {
          itemGst = (P * R) / 100;
          itemTotal = P + itemGst;
          itemBase = P;
        } else {
          itemBase = P / (1 + (R / 100));
          itemGst = P - itemBase;
          itemTotal = P;
        }
      }

      totalBase += itemBase;
      totalGst += itemGst;

      return {
        ...item,
        itemBase,
        itemGst,
        itemTotal
      };
    });

    const unroundedGrandTotal = totalBase + totalGst;
    let grandTotal = unroundedGrandTotal;
    let roundOffDiff = 0;

    if (enableRounding) {
      grandTotal = Math.round(unroundedGrandTotal);
      roundOffDiff = grandTotal - unroundedGrandTotal;
    }

    const halfGst = totalGst / 2;
    const cgst = taxType === 'intra' ? halfGst : 0;
    const sgst = taxType === 'intra' ? halfGst : 0;
    const igst = taxType === 'inter' ? totalGst : 0;

    return {
      items: itemsCalculated,
      totalBase,
      totalGst,
      exactGrandTotal: unroundedGrandTotal,
      grandTotal,
      roundOffDiff,
      cgst,
      sgst,
      igst
    };
  }, [cartItems, mode, taxType, enableRounding]);

  const handleCopyCart = async () => {
    try {
      const words = numberToWordsINR(cartResults.grandTotal);
      let itemLines = cartResults.items.map((it, idx) => 
        `${idx + 1}. ${it.name || 'Item'} (Qty: ${it.qty}) - Rate: ${it.rate}%\n   Base: ${formatCurrency(it.itemBase)} | Tax: ${formatCurrency(it.itemGst)} | Total: ${formatCurrency(it.itemTotal)}`
      ).join('\n');

      let taxBreakdownText = "";
      if (taxType === 'intra') {
        taxBreakdownText = `Total CGST: ${formatCurrency(cartResults.cgst)}\nTotal SGST: ${formatCurrency(cartResults.sgst)}\nTotal GST: ${formatCurrency(cartResults.totalGst)}`;
      } else {
        taxBreakdownText = `Total IGST: ${formatCurrency(cartResults.igst)}\nTotal GST: ${formatCurrency(cartResults.totalGst)}`;
      }

      let roundingText = enableRounding ? `\nRound Off Adjustment: ${cartResults.roundOffDiff >= 0 ? '+' : ''}${formatCurrency(cartResults.roundOffDiff)}` : '';

      const text = `--- Multi-Item Invoice GST Summary ---
Mode: ${mode === 'add' ? 'Add GST (Exclusive)' : 'Remove GST (Inclusive)'}
Transaction Type: ${taxType === 'intra' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}

Items List:
${itemLines}

Subtotal (Base): ${formatCurrency(cartResults.totalBase)}
${taxBreakdownText}${roundingText}
Grand Total: ${formatCurrency(cartResults.grandTotal)}
${words ? `Amount in Words: ${words}` : ''}

Calculated via ToolWala AI (https://toolwala.co/tools/gst-calculator)`;

      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const applyExample = (exAmount: number, exRate: number, exMode: 'add' | 'remove') => {
    setAmount(exAmount);
    setRate(exRate);
    setMode(exMode);
    setIsCustomRate(![3, 5, 12, 18, 28].includes(exRate));
  };

  const results = useMemo(() => {
    const P = Number(amount) || 0;
    const R = Number(rate) || 0;

    let original = P;
    let gst = 0;
    let total = P;

    if (P > 0 && R > 0) {
      if (mode === 'add') {
        gst = (P * R) / 100;
        total = P + gst;
        original = P;
      } else {
        original = P / (1 + (R / 100));
        gst = P - original;
        total = P;
      }
    }

    let finalTotal = total;
    let roundOffDiff = 0;

    if (enableRounding) {
      finalTotal = Math.round(total);
      roundOffDiff = finalTotal - total;
    }

    const halfRate = R / 2;
    const cgst = taxType === 'intra' ? gst / 2 : 0;
    const sgst = taxType === 'intra' ? gst / 2 : 0;
    const igst = taxType === 'inter' ? gst : 0;

    return {
      original,
      gst,
      exactTotal: total,
      total: finalTotal,
      roundOffDiff,
      cgst,
      sgst,
      igst,
      cgstRate: taxType === 'intra' ? halfRate : 0,
      sgstRate: taxType === 'intra' ? halfRate : 0,
      igstRate: taxType === 'inter' ? R : 0
    };
  }, [amount, rate, mode, taxType, enableRounding]);

  const handleCopy = async () => {
    try {
      const words = numberToWordsINR(results.total);
      let taxBreakdownText = "";
      if (taxType === 'intra') {
        taxBreakdownText = `CGST (${results.cgstRate}%): ${formatCurrency(results.cgst)}\nSGST (${results.sgstRate}%): ${formatCurrency(results.sgst)}\nTotal GST (${rate}%): ${formatCurrency(results.gst)}`;
      } else {
        taxBreakdownText = `IGST (${results.igstRate}%): ${formatCurrency(results.igst)}\nTotal GST (${rate}%): ${formatCurrency(results.gst)}`;
      }

      let roundingText = enableRounding ? `\nRound Off Adjustment: ${results.roundOffDiff >= 0 ? '+' : ''}${formatCurrency(results.roundOffDiff)}` : '';

      const text = `--- GST Calculation Summary ---
Mode: ${mode === 'add' ? 'Add GST (Exclusive)' : 'Remove GST (Inclusive)'}
Transaction Type: ${taxType === 'intra' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}
GST Rate: ${rate}%

Original Base Amount: ${formatCurrency(results.original)}
${taxBreakdownText}${roundingText}
Total Amount: ${formatCurrency(results.total)}
${words ? `Amount in Words: ${words}` : ''}

Calculated via ToolWala AI (https://toolwala.co/tools/gst-calculator)`;

      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const scrollToCalculator = () => {
    document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToLearnMore = () => {
    document.getElementById('learn-more-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const relatedTools = toolsData.filter(t => ['emi-calculator', 'sip-calculator', 'age-calculator'].includes(t.slug));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'GST Calculator',
    'description': SEO_DESC,
    'applicationCategory': 'FinanceApplication',
    'operatingSystem': 'All',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    }
  };

  const faqs = [
    {
      q: "What is GST?",
      a: "GST stands for Goods and Services Tax. It is an indirect tax which has replaced many indirect taxes in India such as the excise duty, VAT, services tax, etc. It is levied on the supply of goods and services."
    },
    {
      q: "What does 'Add GST' (Exclusive) mean?",
      a: "It means the amount you entered does not include the GST. The calculator will compute the GST amount and add it to your entered amount to give the final total price."
    },
    {
      q: "What does 'Remove GST' (Inclusive) mean?",
      a: "It means the amount you entered already includes the GST. The calculator will perform a reverse calculation to find the original base price of the item and the exact tax amount embedded in the total."
    },
    {
      q: "What are the common GST slabs in India?",
      a: "The standard GST rates in India are 3% (for gold), 5%, 12%, 18%, and 28%. Some essential items are fully exempt (0%)."
    },
    {
      q: "Is this calculator free to use?",
      a: "Yes! ToolWala AI's GST Calculator is 100% free, highly secure, and works entirely in your browser without saving any financial data to external servers."
    }
  ];

  if (!mounted) {
    return <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#030712]" />;
  }

  return (
    <ToolVisibilityGuard slug="gst-calculator">
      <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans transition-colors duration-250 font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        <MeshGradient />
        <FloatingParticles />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none z-0" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          
          <div className="flex items-center justify-between mb-10">
            <Link 
              href="/tools" 
              className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Directory
            </Link>

            <button 
              onClick={toggleDarkMode}
              className="p-2.5 rounded-2xl bg-white dark:bg-white/10 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-2 text-xs font-bold"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              <span className="hidden sm:inline">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-white/5 border border-emerald-200/60 dark:border-white/10 backdrop-blur-md text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-widest mb-6 shadow-sm hover:border-emerald-500/30 transition-colors">
              <span>🧾 Smart Tax Planning Tool</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-2 uppercase leading-none">
              GST Calculator
            </h1>
            
            <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 mb-6 uppercase tracking-wide">
              Calculate Goods & Services Tax Instantly
            </h2>
            
            <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 leading-relaxed font-medium mb-8 max-w-2xl mx-auto">
              Easily compute the tax amount and total price. Supports both adding exclusive GST and reverse calculating inclusive GST.
            </p>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-[10px] sm:text-xs font-black text-slate-600 dark:text-gray-500 uppercase tracking-widest mb-10">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> 100% Private</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> Instant Results</span>
              <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> High Precision</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={scrollToCalculator}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest text-sm rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                Start Calculating
              </button>
              <button 
                onClick={scrollToLearnMore}
                className="w-full sm:w-auto px-8 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white font-black uppercase tracking-widest text-sm rounded-full transition-transform hover:scale-105 active:scale-95 border border-slate-200 dark:border-white/10"
              >
                How It Works
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs (Single Item vs Multi-Item Cart vs GSTIN Validator) */}
          <div id="calculator-section" className="scroll-mt-24 pt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 max-w-4xl mx-auto">
              <div className="flex bg-slate-200/80 dark:bg-black/50 p-1.5 rounded-2xl border border-slate-300 dark:border-white/10 w-full sm:w-auto shadow-inner">
                <button
                  onClick={() => setCalcTab('single')}
                  className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    calcTab === 'single'
                      ? 'bg-white dark:bg-emerald-500 text-emerald-700 dark:text-slate-950 shadow-md'
                      : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Zap className="w-4 h-4" /> Single Item
                </button>
                <button
                  onClick={() => setCalcTab('multi')}
                  className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    calcTab === 'multi'
                      ? 'bg-white dark:bg-emerald-500 text-emerald-700 dark:text-slate-950 shadow-md'
                      : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" /> Multi-Item Cart
                </button>
                <button
                  onClick={() => setCalcTab('gstin')}
                  className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    calcTab === 'gstin'
                      ? 'bg-white dark:bg-emerald-500 text-emerald-700 dark:text-slate-950 shadow-md'
                      : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <SearchCheck className="w-4 h-4" /> GSTIN Validator
                </button>
              </div>

              <button
                onClick={() => setShowHistoryModal(true)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> History ({calcHistory.length})
              </button>
            </div>

            {calcTab === 'single' ? (
              <div className="flex flex-col lg:flex-row gap-8 mb-16">
                
                {/* Inputs Panel */}
                <div className="w-full lg:w-5/12 space-y-6 shrink-0">
                  <div className="glass rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl p-6 sm:p-8 bg-white dark:bg-white/[0.01]">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-8">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Calculation Details</h3>
                      </div>
                      <button 
                        onClick={handleReset}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" /> Reset
                      </button>
                    </div>

                    <div className="space-y-8">
                      {/* Calculation Mode Toggle */}
                      <div className="space-y-3">
                        <label className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white block">Mode</label>
                        <div className="flex bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-1.5 gap-1 w-full">
                          <button 
                            onClick={() => setMode('add')}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'add' ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'}`}
                          >
                            Add GST (+GST)
                          </button>
                          <button 
                            onClick={() => setMode('remove')}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'remove' ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'}`}
                          >
                            Remove GST (-GST)
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-gray-400 font-medium mt-2">
                          {mode === 'add' ? "Calculates and adds tax on top of your base amount." : "Extracts tax from a total amount to find the base price."}
                        </p>
                      </div>

                      {/* Transaction Type (Intra-State vs Inter-State) */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <label className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white block">Transaction Type</label>
                        </div>
                        <div className="flex bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-1.5 gap-1 w-full">
                          <button 
                            onClick={() => setTaxType('intra')}
                            className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${taxType === 'intra' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-black' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'}`}
                          >
                            Intra-State (CGST+SGST)
                          </button>
                          <button 
                            onClick={() => setTaxType('inter')}
                            className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${taxType === 'inter' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-black' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'}`}
                          >
                            Inter-State (IGST)
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-gray-400 font-medium mt-1">
                          {taxType === 'intra' ? "Same state sale: Splits tax into CGST (Central) and SGST (State)." : "Different state sale: Applies full Integrated GST (IGST)."}
                        </p>
                      </div>

                      <NumberInput 
                        label="Amount" 
                        helperText="Enter the amount to calculate GST for."
                        icon={Wallet}
                        value={amount} 
                        onChange={setAmount}
                        suffix="₹"
                        placeholder="10000"
                      />

                      {/* GST Rate Selection */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Percent className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <label className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white block">GST Rate</label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[3, 5, 12, 18, 28].map(r => (
                            <button
                              key={r}
                              onClick={() => {
                                setRate(r);
                                setIsCustomRate(false);
                              }}
                              className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all ${rate === r && !isCustomRate ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/50 text-emerald-700 dark:text-emerald-400 font-extrabold shadow-sm' : 'bg-slate-100 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-emerald-500/40 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                              {r}%
                            </button>
                          ))}
                          <button
                            onClick={() => setIsCustomRate(true)}
                            className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all ${isCustomRate ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/50 text-emerald-700 dark:text-emerald-400 font-extrabold shadow-sm' : 'bg-slate-100 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-emerald-500/40 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'}`}
                          >
                            Custom
                          </button>
                        </div>
                        
                        {/* Custom Rate Input */}
                        <AnimatePresence>
                          {isCustomRate && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0, marginTop: 0 }}
                              animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              className="relative flex items-center w-full"
                            >
                              <input 
                                type="number"
                                min={0}
                                step={0.1}
                                value={rate}
                                placeholder="e.g. 15"
                                onChange={(e) => {
                                  const val: number | '' = e.target.value === '' ? '' : Number(e.target.value);
                                  setRate(val);
                                }}
                                className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 rounded-xl py-3 px-4 pr-10 text-slate-900 dark:text-white font-mono text-lg text-left focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20 shadow-inner dark:shadow-none"
                              />
                              <span className="absolute right-4 text-slate-500 dark:text-gray-500 text-sm font-bold pointer-events-none">%</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Round Off Toggle */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10">
                        <div>
                          <label className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white block">Round Off Amount</label>
                          <span className="text-[10px] text-slate-500 dark:text-gray-400 font-medium">Nearest rupee rounding (Rule 54 CGST)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEnableRounding(!enableRounding)}
                          className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 shrink-0 ${enableRounding ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/20'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${enableRounding ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Quick Examples */}
                  <div className="glass rounded-3xl border border-slate-200 dark:border-white/5 p-6 bg-white dark:bg-white/[0.01]">
                    <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4">Quick Examples</h3>
                    <div className="space-y-2">
                      <button onClick={() => applyExample(50000, 18, 'add')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10 flex justify-between items-center group">
                        <span className="text-sm font-bold text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Laptop (₹50k + 18%)</span>
                        <ChevronLeft className="w-4 h-4 rotate-180 text-slate-400 dark:text-gray-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                      </button>
                      <button onClick={() => applyExample(1000, 5, 'add')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10 flex justify-between items-center group">
                        <span className="text-sm font-bold text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Food Bill (₹1k + 5%)</span>
                        <ChevronLeft className="w-4 h-4 rotate-180 text-slate-400 dark:text-gray-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                      </button>
                      <button onClick={() => applyExample(15000, 12, 'remove')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10 flex justify-between items-center group">
                        <span className="text-sm font-bold text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Phone (₹15k incl. 12%)</span>
                        <ChevronLeft className="w-4 h-4 rotate-180 text-slate-400 dark:text-gray-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                      </button>
                    </div>
                  </div>

                  {/* HSN / SAC GST Rate Slabs Guide */}
                  <div className="glass rounded-3xl border border-slate-200 dark:border-white/5 p-6 bg-white dark:bg-white/[0.01]">
                    <div 
                      onClick={() => setShowHsnGuide(!showHsnGuide)}
                      className="flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">GST Rate Slabs & HSN Guide</h3>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showHsnGuide ? 'rotate-180' : ''}`} />
                    </div>

                    <AnimatePresence>
                      {showHsnGuide && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          className="space-y-4 overflow-hidden"
                        >
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                            <input 
                              type="text"
                              placeholder="Search items (e.g. laptop, gold, food, AC)..."
                              value={hsnSearch}
                              onChange={(e) => setHsnSearch(e.target.value)}
                              className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-gray-500"
                            />
                          </div>

                          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                            {GST_SLABS_DATA.filter(slab => {
                              if (!hsnSearch) return true;
                              const q = hsnSearch.toLowerCase();
                              return slab.label.toLowerCase().includes(q) || 
                                     slab.category.toLowerCase().includes(q) || 
                                     slab.examples.some(ex => ex.toLowerCase().includes(q));
                            }).map(slab => (
                              <div key={slab.rate} className="p-3 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${slab.badgeColor}`}>
                                    {slab.label}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRate(slab.rate);
                                      setIsCustomRate(false);
                                    }}
                                    className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                                  >
                                    Apply {slab.rate}%
                                  </button>
                                </div>
                                <p className="text-[11px] font-bold text-slate-800 dark:text-gray-200">{slab.category}</p>
                                <div className="flex flex-wrap gap-1">
                                  {slab.examples.map((ex, idx) => (
                                    <span key={idx} className="text-[10px] bg-white dark:bg-white/5 px-2 py-0.5 rounded-md text-slate-600 dark:text-gray-400 border border-slate-200/50 dark:border-white/5">
                                      {ex}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Results Panel */}
                <div className="w-full lg:w-7/12 flex flex-col gap-6">
                  
                  <div className="glass rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl overflow-hidden bg-white dark:bg-white/[0.01] relative group h-full flex flex-col">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-110 duration-700" />
                    
                    <div className="p-8 sm:p-10 relative z-10 flex-grow flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                          <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">🎯 Result Summary</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={handlePrintInvoice}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400 transition-colors border border-emerald-200 dark:border-emerald-500/20"
                            title="Download/Print PDF Tax Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" /> PDF
                          </button>
                          <button 
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 transition-colors border border-slate-200 dark:border-white/10"
                          >
                            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? 'Copied!' : 'Share'}
                          </button>
                        </div>
                      </div>

                      <div className="mb-10 text-center px-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 block">Total Amount</span>
                        <motion.div 
                          key={results.total}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-gray-100 dark:to-gray-400 tracking-tight leading-tight break-all max-w-full overflow-hidden ${
                            formatCurrency(results.total).length > 20 ? 'text-2xl sm:text-3xl lg:text-4xl' :
                            formatCurrency(results.total).length > 14 ? 'text-3xl sm:text-4xl lg:text-5xl' :
                            formatCurrency(results.total).length > 10 ? 'text-4xl sm:text-5xl lg:text-6xl' :
                            'text-5xl sm:text-6xl lg:text-7xl'
                          }`}
                        >
                          {formatCurrency(results.total)}
                        </motion.div>
                        
                        {enableRounding && Math.abs(results.roundOffDiff) > 0.001 && (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                            Round off adjustment: {results.roundOffDiff > 0 ? `+${formatCurrency(results.roundOffDiff)}` : formatCurrency(results.roundOffDiff)} (Exact: {formatCurrency(results.exactTotal)})
                          </span>
                        )}
                        
                        {results.total > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold shadow-sm max-w-full leading-relaxed"
                          >
                            <span className="text-sm">🔤</span>
                            <span>{numberToWordsINR(results.total)}</span>
                          </motion.div>
                        )}

                        {results.total > 99999999 && (
                          <span className="text-xs font-bold text-slate-500 dark:text-gray-400 mt-2 block">
                            (~ {formatCompactCurrency(results.total)})
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 rounded-3xl p-4 sm:p-6 shadow-inner dark:shadow-none">
                        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm dark:shadow-none min-w-0 w-full overflow-hidden">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 mb-2 block">Original Base Amount</span>
                          <span className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white break-all max-w-full overflow-hidden text-center">{formatCurrency(results.original)}</span>
                          {results.original > 99999999 && (
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-gray-500 mt-1 block">
                              (~ {formatCompactCurrency(results.original)})
                            </span>
                          )}
                        </div>
                        <div className="bg-emerald-500/[0.04] dark:bg-emerald-500/[0.02] border border-emerald-500/20 dark:border-emerald-500/10 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm dark:shadow-none min-w-0 w-full overflow-hidden">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-500/70 mb-2 block">Total GST ({rate}%)</span>
                          <span className="text-base sm:text-lg md:text-xl font-black text-emerald-600 dark:text-emerald-400 break-all max-w-full overflow-hidden text-center">{formatCurrency(results.gst)}</span>
                          {results.gst > 99999999 && (
                            <span className="text-[10px] font-semibold text-emerald-600/70 dark:text-emerald-500/60 mt-1 block">
                              (~ {formatCompactCurrency(results.gst)})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CGST / SGST / IGST Breakdown Cards */}
                      {taxType === 'intra' ? (
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div className="bg-blue-500/[0.04] dark:bg-blue-500/[0.02] border border-blue-500/20 dark:border-blue-500/10 rounded-2xl p-4 flex flex-col items-center text-center min-w-0 overflow-hidden shadow-sm dark:shadow-none">
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400 mb-1 block">CGST ({results.cgstRate}%)</span>
                            <span className="text-sm sm:text-base font-black text-blue-700 dark:text-blue-300 break-all text-center">{formatCurrency(results.cgst)}</span>
                          </div>
                          <div className="bg-teal-500/[0.04] dark:bg-teal-500/[0.02] border border-teal-500/20 dark:border-teal-500/10 rounded-2xl p-4 flex flex-col items-center text-center min-w-0 overflow-hidden shadow-sm dark:shadow-none">
                            <span className="text-[10px] font-black uppercase tracking-widest text-teal-700 dark:text-teal-400 mb-1 block">SGST ({results.sgstRate}%)</span>
                            <span className="text-sm sm:text-base font-black text-teal-700 dark:text-teal-300 break-all text-center">{formatCurrency(results.sgst)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 bg-indigo-500/[0.04] dark:bg-indigo-500/[0.02] border border-indigo-500/20 dark:border-indigo-500/10 rounded-2xl p-4 flex flex-col items-center text-center min-w-0 overflow-hidden shadow-sm dark:shadow-none">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-400 mb-1 block">IGST ({results.igstRate}%)</span>
                          <span className="text-sm sm:text-base font-black text-indigo-700 dark:text-indigo-300 break-all text-center">{formatCurrency(results.igst)}</span>
                        </div>
                      )}
                      
                      <div className="mt-6 flex items-center justify-center gap-2">
                        <div className="h-1.5 flex-1 bg-slate-200 dark:bg-white/[0.05] rounded-full overflow-hidden flex">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(results.original / results.total) * 100}%` }}
                            className="h-full bg-blue-500"
                          />
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(results.gst / results.total) * 100}%` }}
                            className="h-full bg-emerald-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 px-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Base {results.total ? Math.round((results.original / results.total) * 100) : 0}%</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Tax {results.total ? Math.round((results.gst / results.total) * 100) : 0}%</span>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            ) : calcTab === 'multi' ? (
              /* Multi-Item Cart Interface */
              <div className="flex flex-col lg:flex-row gap-8 mb-16">
                
                {/* Cart Form List */}
                <div className="w-full lg:w-7/12 space-y-6 shrink-0">
                  <div className="glass rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl p-6 sm:p-8 bg-white dark:bg-white/[0.01] space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Multi-Item Invoice Cart</h3>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                        {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                      </span>
                    </div>

                    {/* Controls Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5 rounded-2xl p-4">
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-gray-300 block mb-1.5">GST Mode</label>
                        <select 
                          value={mode}
                          onChange={(e) => setMode(e.target.value as any)}
                          className="w-full bg-white dark:bg-black/50 border border-slate-300 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="add">Add GST (Exclusive)</option>
                          <option value="remove">Remove GST (Inclusive)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-gray-300 block mb-1.5">Transaction Type</label>
                        <select 
                          value={taxType}
                          onChange={(e) => setTaxType(e.target.value as any)}
                          className="w-full bg-white dark:bg-black/50 border border-slate-300 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="intra">Intra-State (CGST + SGST)</option>
                          <option value="inter">Inter-State (IGST)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-gray-300 block mb-1.5">Round Off</label>
                        <button
                          type="button"
                          onClick={() => setEnableRounding(!enableRounding)}
                          className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${enableRounding ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/50 text-emerald-700 dark:text-emerald-400 font-extrabold' : 'bg-white dark:bg-black/50 border-slate-300 dark:border-white/10 text-slate-600 dark:text-gray-400'}`}
                        >
                          <span>{enableRounding ? 'Nearest Rupee' : 'Exact Paise'}</span>
                          <div className={`w-4 h-4 rounded-full ${enableRounding ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/30'}`} />
                        </button>
                      </div>
                    </div>

                    {/* Cart Items List */}
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                      {cartItems.map((item, idx) => (
                        <div key={item.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-3 relative group">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-slate-400 dark:text-gray-500">#{idx + 1}</span>
                            <input 
                              type="text"
                              value={item.name}
                              placeholder="Item Description"
                              onChange={(e) => handleUpdateCartItem(item.id, 'name', e.target.value)}
                              className="flex-1 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                            />
                            {cartItems.length > 1 && (
                              <button 
                                onClick={() => handleRemoveCartItem(item.id)}
                                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                title="Delete Item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 block mb-1">Price (₹)</label>
                              <input 
                                type="number"
                                min={0}
                                value={item.amount}
                                onChange={(e) => handleUpdateCartItem(item.id, 'amount', e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 text-center"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 block mb-1">Qty</label>
                              <input 
                                type="number"
                                min={1}
                                value={item.qty}
                                onChange={(e) => handleUpdateCartItem(item.id, 'qty', Math.max(1, Number(e.target.value)))}
                                className="w-full bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 text-center"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 block mb-1">GST Rate</label>
                              <select
                                value={item.rate}
                                onChange={(e) => handleUpdateCartItem(item.id, 'rate', Number(e.target.value))}
                                className="w-full bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-1.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                              >
                                {[3, 5, 12, 18, 28].map(r => (
                                  <option key={r} value={r}>{r}%</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] pt-1 font-semibold text-slate-500 dark:text-gray-400 border-t border-slate-200/50 dark:border-white/5">
                            <span>Tax: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(cartResults.items[idx]?.itemGst || 0)}</strong></span>
                            <span>Line Total: <strong className="text-slate-900 dark:text-white">{formatCurrency(cartResults.items[idx]?.itemTotal || 0)}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleAddCartItem}
                      className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Item Row
                    </button>
                  </div>
                </div>

                {/* Cart Results Summary */}
                <div className="w-full lg:w-5/12 flex flex-col gap-6">
                  <div className="glass rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl overflow-hidden bg-white dark:bg-white/[0.01] relative group h-full flex flex-col p-8 sm:p-10 justify-between">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-2">
                        <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">📄 Invoice Summary</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={handlePrintInvoice}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400 transition-colors border border-emerald-200 dark:border-emerald-500/20"
                          title="Download/Print PDF Tax Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" /> PDF
                        </button>
                        <button 
                          onClick={handleCopyCart}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 transition-colors border border-slate-200 dark:border-white/10"
                        >
                          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? 'Copied!' : 'Copy Invoice'}
                        </button>
                      </div>
                    </div>

                    <div className="mb-8 text-center px-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 block">Grand Total</span>
                      <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-gray-100 dark:to-gray-400 tracking-tight leading-none break-all">
                        {formatCurrency(cartResults.grandTotal)}
                      </div>
                      
                      {cartResults.grandTotal > 0 && (
                        <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold shadow-sm max-w-full leading-relaxed">
                          <span className="text-sm">🔤</span>
                          <span>{numberToWordsINR(cartResults.grandTotal)}</span>
                        </div>
                      )}
                    </div>

                    {/* Detailed Invoice Breakdown */}
                    <div className="space-y-3 bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 rounded-3xl p-5 shadow-inner">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-500 dark:text-gray-400">Total Base Subtotal:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(cartResults.totalBase)}</span>
                      </div>

                      {taxType === 'intra' ? (
                        <>
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-blue-600 dark:text-blue-400">Total CGST:</span>
                            <span className="font-bold text-blue-700 dark:text-blue-300">{formatCurrency(cartResults.cgst)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-teal-600 dark:text-teal-400">Total SGST:</span>
                            <span className="font-bold text-teal-700 dark:text-teal-300">{formatCurrency(cartResults.sgst)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-indigo-600 dark:text-indigo-400">Total IGST:</span>
                          <span className="font-bold text-indigo-700 dark:text-indigo-300">{formatCurrency(cartResults.igst)}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-xs font-bold pt-3 border-t border-slate-200 dark:border-white/10">
                        <span className="text-emerald-700 dark:text-emerald-400">Total Tax Amount:</span>
                        <span className="text-emerald-700 dark:text-emerald-400 text-sm font-black">{formatCurrency(cartResults.totalGst)}</span>
                      </div>

                      {enableRounding && Math.abs(cartResults.roundOffDiff) > 0.001 && (
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-gray-400 pt-1">
                          <span>Round Off Adjustment:</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {cartResults.roundOffDiff > 0 ? `+${formatCurrency(cartResults.roundOffDiff)}` : formatCurrency(cartResults.roundOffDiff)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* GSTIN Validator Interface */
              <div className="max-w-3xl mx-auto mb-16">
                <div className="glass rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl p-6 sm:p-10 bg-white dark:bg-white/[0.01] space-y-8">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <SearchCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="text-base font-black uppercase tracking-widest text-slate-900 dark:text-white">GSTIN Number Validator</h3>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                      Modulus 36 Verified
                    </span>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-gray-300 block">Enter 15-Digit GSTIN Number</label>
                    <div className="relative">
                      <input 
                        type="text"
                        maxLength={15}
                        value={gstinInput}
                        onChange={(e) => setGstinInput(e.target.value.toUpperCase())}
                        placeholder="e.g. 27AAPCU0749L1Z2"
                        className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-2xl py-4 px-5 text-lg sm:text-xl font-mono font-black tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 uppercase shadow-inner"
                      />
                      <span className="absolute right-4 top-4 text-xs font-mono font-bold text-slate-400">
                        {gstinInput.length}/15
                      </span>
                    </div>

                    {/* Quick Sample Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] font-bold text-slate-500">Test Samples:</span>
                      <button onClick={() => setGstinInput('27AAPCU0749L1Z2')} className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 transition-colors">
                        27AAPCU0749L1Z2 (MH)
                      </button>
                      <button onClick={() => setGstinInput('07AAAAA0000A1Z5')} className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 transition-colors">
                        07AAAAA0000A1Z5 (DL)
                      </button>
                      <button onClick={() => setGstinInput('24AAACG1234F1Z1')} className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 transition-colors">
                        24AAACG1234F1Z1 (GJ)
                      </button>
                    </div>
                  </div>

                  {/* Validation Results Display */}
                  {(() => {
                    const v = validateGSTIN(gstinInput);
                    return (
                      <div className={`p-6 rounded-3xl border space-y-4 transition-all ${
                        v.valid 
                          ? 'bg-emerald-50/50 dark:bg-emerald-500/[0.03] border-emerald-300 dark:border-emerald-500/20' 
                          : 'bg-amber-50/50 dark:bg-amber-500/[0.03] border-amber-300 dark:border-amber-500/20'
                      }`}>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            {v.valid ? (
                              <BadgeCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            )}
                            <span className={`text-sm font-black uppercase tracking-wider ${v.valid ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                              {v.valid ? 'VALID GSTIN FORMAT & CHECKSUM' : 'INVALID / INCOMPLETE GSTIN'}
                            </span>
                          </div>
                          <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${v.valid ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'}`}>
                            {v.valid ? 'Active Format' : 'Check Digits'}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-700 dark:text-gray-300">{v.message}</p>

                        {gstinInput.trim().length === 15 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                            <div className="p-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200/60 dark:border-white/5">
                              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">State Code ({v.stateCode})</span>
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">{v.stateName}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200/60 dark:border-white/5">
                              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">PAN Number</span>
                              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block">{v.pan}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200/60 dark:border-white/5">
                              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Entity Code</span>
                              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block">{v.entityCode}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200/60 dark:border-white/5">
                              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Checksum Digit</span>
                              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block">{v.checksumChar}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* History Modal Overlay */}
          <AnimatePresence>
            {showHistoryModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-lg glass rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Recent Calculations History</h3>
                    </div>
                    <button 
                      onClick={() => setShowHistoryModal(false)}
                      className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  {calcHistory.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-gray-400 text-xs font-medium">
                      No calculation history saved yet.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {calcHistory.map((hItem) => (
                        <div 
                          key={hItem.id}
                          onClick={() => {
                            restoreHistoryItem(hItem);
                            setShowHistoryModal(false);
                          }}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 hover:border-emerald-500/40 cursor-pointer transition-all flex items-center justify-between group"
                        >
                          <div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                              <span>{hItem.timestamp}</span>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400">{hItem.mode === 'add' ? 'Add GST' : 'Remove GST'}</span>
                              <span>•</span>
                              <span>{hItem.taxType === 'intra' ? 'CGST+SGST' : 'IGST'}</span>
                            </div>
                            <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                              {formatCurrency(hItem.amount)} @ {hItem.rate}% GST
                            </div>
                            <div className="text-xs font-semibold text-slate-500 dark:text-gray-400">
                              Total: <strong className="text-slate-900 dark:text-white">{formatCurrency(hItem.total)}</strong> (Tax: {formatCurrency(hItem.gst)})
                            </div>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                            Restore →
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {calcHistory.length > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-white/5">
                      <span className="text-[10px] text-slate-400 font-medium">Saved locally in browser</span>
                      <button
                        onClick={clearHistory}
                        className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Clear History
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Educational Content Section */}
          <section id="learn-more-section" className="py-20 border-t border-slate-200 dark:border-white/5 mt-16 pt-24 scroll-mt-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-white/5 border border-emerald-200/60 dark:border-white/10 backdrop-blur-md text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-widest mb-6 shadow-sm">
                <BookOpen className="w-4 h-4" />
                <span>GST Guide</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-6">
                📚 How to Use the GST Calculator
              </h2>
              <p className="text-slate-600 dark:text-gray-400 text-base sm:text-lg font-medium leading-relaxed">
                Learn the difference between adding and removing GST to ensure your invoices and calculations are perfectly accurate.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              <div className="glass rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors shadow-sm dark:shadow-none">
                <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4">Adding GST (+GST)</h3>
                <p className="text-slate-600 dark:text-gray-300 leading-relaxed font-medium mb-4">
                  Use this when you know the base price of a product and need to apply the tax to find the final selling price.
                </p>
                <div className="bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm font-mono text-slate-700 dark:text-gray-400">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Formula:</span><br />
                  GST Amount = Base Price × (Rate / 100)<br />
                  Total Price = Base Price + GST Amount
                </div>
              </div>
              
              <div className="glass rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 bg-white dark:bg-white/[0.01] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors shadow-sm dark:shadow-none">
                <h3 className="text-xl font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">Removing GST (-GST)</h3>
                <p className="text-slate-600 dark:text-gray-300 leading-relaxed font-medium mb-4">
                  Use this when you have the final receipt or total price and need to backward-calculate how much of it was tax.
                </p>
                <div className="bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm font-mono text-slate-700 dark:text-gray-400">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Formula:</span><br />
                  Base Price = Total Price / [1 + (Rate / 100)]<br />
                  GST Amount = Total Price - Base Price
                </div>
              </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-8 mb-20">
              <div className="text-center">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-2">Frequently Asked Questions</h3>
                <p className="text-xs text-slate-500 dark:text-gray-500 font-bold uppercase tracking-wider mb-8">Everything you need to know about GST</p>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, index) => {
                  const isExpanded = faqExpanded === index;
                  return (
                    <div key={index} className="glass rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.01] overflow-hidden shadow-sm dark:shadow-none">
                      <button
                        onClick={() => setFaqExpanded(isExpanded ? null : index)}
                        className="w-full flex items-center justify-between p-5.5 text-left focus:outline-none cursor-pointer"
                      >
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                          {faq.q}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-gray-500 transition-transform duration-300 flex-shrink-0 ml-4 ${isExpanded ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''}`} />
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                          >
                            <div className="px-5.5 pb-5.5 pt-0.5 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-gray-400 leading-relaxed font-semibold font-sans">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Related Tools */}
            {relatedTools.length > 0 && (
              <div className="mt-20">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-8 text-center">Related Calculators</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
                  {relatedTools.map(tool => (
                    <ToolCard
                      key={tool.id || tool.slug}
                      {...tool}
                      isPopular={tool.popular}
                      isTrending={tool.trending}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="text-center py-12 border-t border-slate-200 dark:border-white/5 mt-16">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Ready to compute your tax?</h3>
              <button 
                onClick={scrollToCalculator}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest text-sm rounded-full transition-transform hover:scale-105 flex items-center justify-center gap-2 mx-auto shadow-lg shadow-emerald-500/20"
              >
                <ArrowUp className="w-5 h-5" />
                Back to Top
              </button>
            </div>
          </section>

        </div>

        {toolArticles['gst-calculator'] && (
          <ToolArticle {...toolArticles['gst-calculator']} />
        )}
      </div>
    </ToolVisibilityGuard>
  );
}
