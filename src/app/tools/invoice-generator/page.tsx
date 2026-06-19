"use client";

import Link from 'next/link';
import { useState, useRef } from 'react';
// @ts-ignore
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  FileText, Download, Plus, Trash2, Upload, 
  Settings, RefreshCw, LayoutTemplate, Building, User, Receipt, ChevronLeft
} from 'lucide-react';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';

type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

type InvoiceData = {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  logoUrl: string | null;
  
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  
  items: InvoiceItem[];
  
  taxPercent: number;
  discount: number;
  shipping: number;
  
  notes: string;
  terms: string;
  
  template: 'Modern' | 'Minimal' | 'Corporate' | 'Premium';
  themeColor: string;
};

const initialData: InvoiceData = {
  businessName: 'Acme Corp',
  businessEmail: 'hello@acmecorp.com',
  businessPhone: '+1 (555) 123-4567',
  businessAddress: '123 Business Avenue, Suite 100\nNew York, NY 10001',
  logoUrl: null,
  
  clientName: 'Globex Corporation',
  clientEmail: 'billing@globex.com',
  clientPhone: '+1 (555) 987-6543',
  clientAddress: '456 Corporate Blvd, Floor 4\nSan Francisco, CA 94107',
  
  invoiceNumber: 'INV-2023-001',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  currency: 'USD',
  
  items: [
    { id: '1', description: 'Web Design Services', quantity: 1, rate: 2500 },
    { id: '2', description: 'Frontend Development (Hours)', quantity: 40, rate: 85 },
    { id: '3', description: 'Server Setup & Deployment', quantity: 1, rate: 500 }
  ],
  
  taxPercent: 10,
  discount: 0,
  shipping: 0,
  
  notes: 'Thank you for your business. It has been a pleasure working with you on this project.',
  terms: 'Payment is due within 14 days. Please make checks payable to Acme Corp.',
  
  template: 'Modern',
  themeColor: '#2563eb' // Blue
};

const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' },
];

const TEMPLATES = ['Modern', 'Minimal', 'Corporate', 'Premium'] as const;
const THEME_COLORS = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0f172a'];

export default function InvoiceGenerator() {
  const [data, setData] = useState<InvoiceData>(initialData);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxAmount = (subtotal * data.taxPercent) / 100;
  const total = subtotal + taxAmount + data.shipping - data.discount;

  const currencySymbol = CURRENCIES.find(c => c.code === data.currency)?.symbol || '$';
  
  const formatMoney = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setData(prev => ({ ...prev, logoUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    setData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), description: '', quantity: 1, rate: 0 }]
    }));
  };

  const removeItem = (id: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const resetForm = () => {
    if (window.confirm('Are you sure you want to reset all fields to default?')) {
      setData(initialData);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadPDF = async () => {
    if (!data.businessName.trim()) { alert('Business Name is required.'); return; }
    if (!data.clientName.trim()) { alert('Client Name is required.'); return; }
    const validItems = data.items.filter(i => i.description.trim() && i.rate > 0 && i.quantity > 0);
    if (validItems.length === 0) {
      alert('At least one item with a description and valid amount is required.');
      return;
    }

    setIsGenerating(true);
    try {
      const element = document.getElementById('invoice-preview-container');
      if (!element) return;
      
      const originalClasses = element.className;
      element.className = 'bg-white';
      
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      element.className = originalClasses;
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${data.invoiceNumber || 'Draft'}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderPreview = () => {
    const isModern = data.template === 'Modern';
    const isMinimal = data.template === 'Minimal';
    const isCorporate = data.template === 'Corporate';
    const isPremium = data.template === 'Premium';

    const getHeaderClasses = () => {
      if (isCorporate) return "flex justify-between items-start mb-10 pb-6 border-b border-gray-300";
      if (isPremium) return "flex justify-between items-start mb-12 pb-8 border-b-2";
      return "flex justify-between items-start mb-12";
    };

    const getTableClasses = () => {
      if (isCorporate) return "w-full mb-8 text-left border-collapse border border-gray-300";
      return "w-full mb-8 text-left border-collapse";
    };

    const getThClasses = () => {
      if (isCorporate) return "py-3 px-4 font-bold text-sm text-gray-800 bg-gray-100 border border-gray-300";
      if (isMinimal) return "py-3 px-4 font-bold text-sm text-gray-900 border-b-2 border-gray-900 bg-transparent";
      if (isPremium) return "py-3 px-4 font-bold text-xs uppercase tracking-wider text-gray-500 bg-gray-50 border-y border-gray-200";
      return "py-3 px-4 font-bold text-sm text-white";
    };

    const getTdClasses = (idx: number, isLast: boolean) => {
      let base = "py-4 px-4 text-sm text-gray-800";
      if (isCorporate) base += " border border-gray-300";
      if (isMinimal && !isLast) base += " border-b border-gray-200";
      if (isPremium && !isLast) base += " border-b border-gray-100";
      if (isModern) base += idx % 2 === 0 ? ' bg-gray-50/50' : ' bg-white';
      return base;
    };

    return (
      <div 
        id="invoice-preview-container" 
        className={`bg-white mx-auto relative ${isPremium ? 'rounded-2xl shadow-xl' : 'shadow-sm'} border border-gray-200/60`}
        style={{ 
          width: '100%', 
          maxWidth: '794px', // Standard A4 pixel width
          minWidth: '600px', // Prevent table breaking on mobile
          minHeight: '1123px', // Standard A4 pixel height
          padding: '40px',
          fontFamily: isCorporate ? 'Georgia, serif' : 'system-ui, sans-serif'
        }}
      >
        {(isPremium || isModern) && (
          <div 
            className="absolute top-0 left-0 right-0 h-3" 
            style={{ backgroundColor: data.themeColor }}
          />
        )}

        <div className={getHeaderClasses()} style={{ borderColor: isPremium ? `${data.themeColor}30` : undefined }}>
          <div>
            {data.logoUrl ? (
              <img src={data.logoUrl} alt="Business Logo" className="max-h-20 max-w-[200px] object-contain mb-4" />
            ) : (
              <div className="text-3xl font-black mb-2" style={{ color: isMinimal ? '#111827' : data.themeColor }}>
                {data.businessName || 'Business Name'}
              </div>
            )}
            <div className="text-gray-500 text-sm whitespace-pre-wrap">{data.businessAddress}</div>
            <div className="text-gray-500 text-sm mt-1">
              {data.businessEmail} {data.businessPhone && `• ${data.businessPhone}`}
            </div>
          </div>
          
          <div className="text-right">
            <h2 
              className="text-4xl font-black uppercase tracking-widest mb-3" 
              style={{ color: isModern ? '#e5e7eb' : (isPremium ? data.themeColor : '#111827') }}
            >
              Invoice
            </h2>
            <div className="text-gray-800 font-bold text-xl mb-1">#{data.invoiceNumber || 'INV-000'}</div>
            <div className="text-gray-500 text-sm flex justify-end gap-6 mt-3">
              <span className="font-semibold text-gray-700">Date:</span> <span>{data.invoiceDate}</span>
            </div>
            <div className="text-gray-500 text-sm flex justify-end gap-6 mt-1">
              <span className="font-semibold text-gray-700">Due:</span> <span>{data.dueDate}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between mb-12">
          <div className="w-1/2 pr-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Billed To</h3>
            <div className="font-bold text-gray-800 text-lg mb-1">{data.clientName || 'Client Name'}</div>
            <div className="text-gray-600 text-sm whitespace-pre-wrap mb-1">{data.clientAddress}</div>
            <div className="text-gray-500 text-sm">{data.clientEmail}</div>
            <div className="text-gray-500 text-sm">{data.clientPhone}</div>
          </div>
        </div>

        <table className={getTableClasses()}>
          <thead>
            <tr>
              <th className={getThClasses()} style={{ backgroundColor: isModern ? data.themeColor : undefined }}>Description</th>
              <th className={`${getThClasses()} w-24 text-center`} style={{ backgroundColor: isModern ? data.themeColor : undefined }}>Qty</th>
              <th className={`${getThClasses()} w-32 text-right`} style={{ backgroundColor: isModern ? data.themeColor : undefined }}>Rate</th>
              <th className={`${getThClasses()} w-32 text-right`} style={{ backgroundColor: isModern ? data.themeColor : undefined }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 ? (
              <tr><td colSpan={4} className="py-4 text-center text-gray-400 italic border-b border-gray-100">No items added</td></tr>
            ) : (
              data.items.map((item, idx) => (
                <tr key={item.id}>
                  <td className={getTdClasses(idx, idx === data.items.length - 1)}>
                    <div className="font-medium">{item.description || 'Item description'}</div>
                  </td>
                  <td className={`${getTdClasses(idx, idx === data.items.length - 1)} text-center`}>{item.quantity}</td>
                  <td className={`${getTdClasses(idx, idx === data.items.length - 1)} text-right`}>{formatMoney(item.rate)}</td>
                  <td className={`${getTdClasses(idx, idx === data.items.length - 1)} text-right font-semibold`}>{formatMoney(item.quantity * item.rate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex justify-end mb-16">
          <div className="w-1/2 md:w-5/12">
            <div className="flex justify-between py-2.5 text-sm text-gray-600 border-b border-gray-100">
              <span>Subtotal</span>
              <span className="font-medium text-gray-800">{formatMoney(subtotal)}</span>
            </div>
            {data.taxPercent > 0 && (
              <div className="flex justify-between py-2.5 text-sm text-gray-600 border-b border-gray-100">
                <span>Tax ({data.taxPercent}%)</span>
                <span className="font-medium text-gray-800">{formatMoney(taxAmount)}</span>
              </div>
            )}
            {data.discount > 0 && (
              <div className="flex justify-between py-2.5 text-sm text-gray-600 border-b border-gray-100">
                <span>Discount</span>
                <span className="font-medium text-red-600">-{formatMoney(data.discount)}</span>
              </div>
            )}
            {data.shipping > 0 && (
              <div className="flex justify-between py-2.5 text-sm text-gray-600 border-b border-gray-100">
                <span>Shipping / Other</span>
                <span className="font-medium text-gray-800">{formatMoney(data.shipping)}</span>
              </div>
            )}
            <div 
              className={`flex justify-between py-4 mt-2 text-xl font-bold ${isCorporate ? 'border-t-2 border-gray-800' : 'border-t-4'} text-gray-900`} 
              style={{ borderColor: !isCorporate ? data.themeColor : undefined }}
            >
              <span>Total</span>
              <span style={{ color: isPremium ? data.themeColor : undefined }}>{formatMoney(total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-gray-100 text-sm text-gray-500">
          {data.notes && (
            <div className="mb-4">
              <span className="font-bold text-gray-700 block mb-1">Notes</span>
              <span className="whitespace-pre-wrap">{data.notes}</span>
            </div>
          )}
          {data.terms && (
            <div>
              <span className="font-bold text-gray-700 block mb-1">Terms & Conditions</span>
              <span className="whitespace-pre-wrap text-xs">{data.terms}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#030712] min-h-screen py-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]">
              <Receipt className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter">Professional Invoice Generator</h1>
              <p className="text-gray-400 font-medium mt-1">Create, customize, and download beautiful PDF invoices instantly.</p>
            </div>
          </div>
          
          <div className="hidden md:flex gap-4">
            <button onClick={resetForm} className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
            <button onClick={downloadPDF} disabled={isGenerating} className="flex items-center gap-2 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all disabled:opacity-70 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>
        
        <div className="flex flex-col xl:flex-row gap-8">
          
          <div className="w-full xl:w-[45%] space-y-6">
            
            <div className="glass p-8 rounded-[2.5rem] border border-white/5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-8 flex items-center gap-3">
                <LayoutTemplate className="w-4 h-4" /> Template & Styling
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Template Style</label>
                  <select 
                    name="template" 
                    value={data.template} 
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white/5 text-white"
                  >
                    {TEMPLATES.map(t => <option key={t} value={t} className="bg-[#0f172a]">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Theme Color</label>
                  <div className="flex flex-wrap gap-2">
                    {THEME_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setData(prev => ({ ...prev, themeColor: color }))}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${data.themeColor === color ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <div className="relative w-8 h-8 rounded-full border border-white/10 overflow-hidden ml-1">
                      <input 
                        type="color" 
                        value={data.themeColor}
                        onChange={(e) => setData(prev => ({ ...prev, themeColor: e.target.value }))}
                        className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border border-white/5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-8 flex items-center gap-3">
                <Building className="w-4 h-4" /> Your Business
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Business Name *</label>
                    <input name="businessName" value={data.businessName} onChange={handleInputChange} className="w-full rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-white text-sm focus:border-blue-500 outline-none" placeholder="Acme Corp" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Logo</label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 border-dashed rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:bg-white/10 transition-colors">
                        <Upload className="w-4 h-4" /> {data.logoUrl ? 'Change' : 'Upload'}
                        <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                      </label>
                      {data.logoUrl && (
                        <button onClick={() => { setData(prev => ({...prev, logoUrl: null})); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl border border-white/10" title="Remove Logo">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Email</label>
                    <input name="businessEmail" value={data.businessEmail} onChange={handleInputChange} className="w-full rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-white text-sm focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Phone</label>
                    <input name="businessPhone" value={data.businessPhone} onChange={handleInputChange} className="w-full rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-white text-sm focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Address</label>
                  <textarea name="businessAddress" value={data.businessAddress} onChange={handleInputChange} rows={2} className="w-full rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-white text-sm focus:border-blue-500 outline-none resize-none" />
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border border-white/5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-8 flex items-center gap-3">
                <User className="w-4 h-4" /> Client Details
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-full">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Client Name *</label>
                    <input name="clientName" value={data.clientName} onChange={handleInputChange} className="w-full rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-white text-sm focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Email</label>
                    <input name="clientEmail" value={data.clientEmail} onChange={handleInputChange} className="w-full rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-white text-sm focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Phone</label>
                    <input name="clientPhone" value={data.clientPhone} onChange={handleInputChange} className="w-full rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-white text-sm focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Address</label>
                  <textarea name="clientAddress" value={data.clientAddress} onChange={handleInputChange} rows={2} className="w-full rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-white text-sm focus:border-blue-500 outline-none resize-none" />
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border border-white/5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-8 flex items-center gap-3">
                <FileText className="w-4 h-4" /> Invoice Details
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Invoice #</label>
                  <input name="invoiceNumber" value={data.invoiceNumber} onChange={handleInputChange} className="w-full rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-white text-xs focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Currency</label>
                  <select name="currency" value={data.currency} onChange={handleInputChange} className="w-full rounded-xl border border-white/10 px-4 py-3 text-xs font-black bg-white/5 text-white outline-none focus:border-blue-500">
                    {CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-[#0f172a]">{c.code} ({c.symbol})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Date</label>
                  <input type="date" name="invoiceDate" value={data.invoiceDate} onChange={handleInputChange} className="w-full rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-white text-xs focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Due Date</label>
                  <input type="date" name="dueDate" value={data.dueDate} onChange={handleInputChange} className="w-full rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-white text-xs focus:border-blue-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border border-white/5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-8">Line Items *</h3>
              <div className="space-y-4">
                <div className="hidden sm:grid sm:grid-cols-12 gap-4 text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-3">Rate</div>
                  <div className="col-span-1"></div>
                </div>
                
                {data.items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 sm:p-0 bg-white/5 sm:bg-transparent rounded-2xl border sm:border-none border-white/5">
                    <div className="sm:col-span-6">
                      <span className="sm:hidden text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Description</span>
                      <input 
                        value={item.description} 
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Item name"
                        className="w-full rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-white text-sm focus:border-blue-500 outline-none" 
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 sm:col-span-5 gap-4">
                      <div className="sm:col-span-2">
                        <span className="sm:hidden text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Qty</span>
                        <input 
                          type="number" min="1" step="any"
                          value={item.quantity} 
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-white text-sm focus:border-blue-500 outline-none" 
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <span className="sm:hidden text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Rate</span>
                        <div className="relative">
                          <span className="absolute left-4 top-3 text-gray-500 text-sm">{currencySymbol}</span>
                          <input 
                            type="number" min="0" step="any"
                            value={item.rate} 
                            onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-full rounded-xl border border-white/10 pl-8 pr-4 py-3 bg-white/5 text-white text-sm focus:border-blue-500 outline-none" 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="sm:col-span-1 flex items-end sm:items-center justify-end">
                      <button 
                        onClick={() => removeItem(item.id)} 
                        className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all w-full sm:w-auto flex justify-center border border-white/5 sm:border-none"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={addItem} 
                className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 bg-blue-600/10 px-6 py-3 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border border-white/5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-8 flex items-center gap-3">
                <Settings className="w-4 h-4" /> Summary Settings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Tax (%)</label>
                  <input type="number" min="0" max="100" name="taxPercent" value={data.taxPercent} onChange={handleNumberChange} className="w-full rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-white text-sm focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Discount ({currencySymbol})</label>
                  <input type="number" min="0" name="discount" value={data.discount} onChange={handleNumberChange} className="w-full rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-white text-sm focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Shipping ({currencySymbol})</label>
                  <input type="number" min="0" name="shipping" value={data.shipping} onChange={handleNumberChange} className="w-full rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-white text-sm focus:border-blue-500 outline-none" />
                </div>
              </div>
              
              <div className="space-y-6 border-t border-white/5 pt-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Notes to Client</label>
                  <textarea name="notes" value={data.notes} onChange={handleInputChange} rows={2} className="w-full rounded-xl border border-white/10 px-4 py-4 bg-white/5 text-white text-sm focus:border-blue-500 outline-none resize-none" placeholder="Thank you!" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Terms & Conditions</label>
                  <textarea name="terms" value={data.terms} onChange={handleInputChange} rows={2} className="w-full rounded-xl border border-white/10 px-4 py-4 bg-white/5 text-white text-sm focus:border-blue-500 outline-none resize-none" placeholder="Due in 14 days." />
                </div>
              </div>
            </div>
            
            <div className="md:hidden flex flex-col gap-4 pt-4">
              <button onClick={downloadPDF} disabled={isGenerating} className="w-full flex justify-center items-center gap-3 px-8 py-5 text-sm font-black uppercase tracking-widest text-white bg-blue-600 rounded-2xl shadow-xl">
                {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                Download PDF
              </button>
            </div>

          </div>

          <div className="w-full xl:w-[55%]">
            <div className="sticky top-6">
              <div className="hidden xl:flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <LayoutTemplate className="w-5 h-5 text-blue-500" />
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Live Preview</h2>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-600/10 px-4 py-2 rounded-full border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]">Updates instantly</span>
              </div>
              
              <div className="w-full overflow-x-auto max-w-full bg-[#0f172a] p-4 sm:p-10 rounded-[3rem] border border-white/5 shadow-2xl relative custom-scrollbar">
                 {isGenerating && (
                    <div className="absolute inset-0 z-10 bg-[#030712]/60 backdrop-blur-sm flex items-center justify-center rounded-[3rem]">
                      <div className="glass p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-white/10">
                        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
                        <p className="text-xs font-black uppercase tracking-widest text-white">Generating...</p>
                      </div>
                    </div>
                  )}
                {renderPreview()}
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* SEO Article Section */}
      <ToolArticle {...toolArticles['invoice-generator']} />
    </div>
  );
}
