"use client";

import { useEffect, useState } from 'react';
import { 
  Mail, Search, CheckCircle2, Clock, 
  Trash2, Download, Filter, MessageSquare, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';
import AdminPagination from '@/components/admin/AdminPagination';

interface Lead {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'pending' | 'resolved';
  createdAt: string;
}

const mockLeads: Lead[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', message: 'Hello, I would love to integrate your background remover into our corporate HR toolkit. Do you offer custom API pricing tiers?', status: 'new', createdAt: '2026-06-03T14:24:00Z' },
  { id: '2', name: 'Jane Smith', email: 'jane@startup.co', message: 'The OCR engine failed on a vertical text screenshot. Is vertical Japanese character detection supported?', status: 'pending', createdAt: '2026-06-02T09:12:00Z' },
  { id: '3', name: 'Mark Wilson', email: 'mark@designagency.net', message: 'I loved using the passport photo maker. Extremely clean cuts on hair edges! Shared with 10 teammates.', status: 'resolved', createdAt: '2026-06-01T17:40:00Z' },
  { id: '4', name: 'Sarah Connor', email: 'sarah@resistance.org', message: 'AI cost calculations seem off. Is it calculated dynamically based on input tokens?', status: 'new', createdAt: '2026-06-01T08:05:00Z' }
];

export default function LeadsManagement() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await adminFetch('/api/admin/leads');
        if (res.ok) {
          const data = await res.json();
          setLeads(data);
        }
      } catch (err) {
        console.warn("Using simulated CRM data.", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  const updateStatus = async (id: string, newStatus: 'new' | 'pending' | 'resolved') => {
    try {
      const res = await adminFetch('/api/admin/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
        toast.success(`Lead status updated to ${newStatus}`);
      }
    } catch (err) {
      // Local fallback
      setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
      toast.success(`[Simulated] Lead status updated to ${newStatus}`);
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const res = await adminFetch(`/api/admin/leads?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads(leads.filter(l => l.id !== id));
        setSelectedIds(selectedIds.filter(val => val !== id));
        toast.success('Lead deleted successfully');
      }
    } catch (err) {
      // Local fallback
      setLeads(leads.filter(l => l.id !== id));
      setSelectedIds(selectedIds.filter(val => val !== id));
      toast.success('[Simulated] Lead deleted successfully');
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map(l => l.id));
    }
  };

  const exportCSV = () => {
    const itemsToExport = leads.filter(l => selectedIds.includes(l.id) || selectedIds.length === 0);
    if (itemsToExport.length === 0) {
      toast.error('No leads available to export');
      return;
    }

    const headers = ['Name', 'Email', 'Message', 'Status', 'Date'];
    const rows = itemsToExport.map(l => [
      l.name,
      l.email,
      l.message.replace(/"/g, '""'),
      l.status,
      new Date(l.createdAt).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `crm-leads-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${itemsToExport.length} leads successfully`);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) || 
                          lead.email.toLowerCase().includes(search.toLowerCase()) || 
                          lead.message.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-10">
      {/* Search and Filters panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white dark:bg-white/[0.01] p-6 rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        
        {/* Left: Search input */}
        <div className="flex items-center gap-3 bg-slate-100/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 rounded-2xl px-5 py-3 w-full sm:w-80 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
          <Search className="w-4 h-4 text-slate-400 dark:text-gray-500 shrink-0" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="bg-transparent text-sm border-none outline-none focus:outline-none focus:ring-0 focus:border-none text-slate-900 dark:text-white w-full placeholder-slate-400 dark:placeholder-gray-600 font-semibold pl-2 h-auto"
          />
        </div>

        {/* Right: Status Filters + Action buttons */}
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">
            <Filter className="w-3.5 h-3.5" /> Status
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-900 dark:text-white font-black cursor-pointer ml-1 text-xs"
            >
              <option value="all" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">All</option>
              <option value="new" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">New</option>
              <option value="pending" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">Pending</option>
              <option value="resolved" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">Resolved</option>
            </select>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
          </button>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-white dark:bg-white/[0.01] rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="h-8 w-8 border-2 border-slate-200 dark:border-white/10 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Querying platform leads...</span>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <MessageSquare className="w-12 h-12 text-slate-300 dark:text-gray-600 mb-4" />
            <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">No Leads Found</h4>
            <p className="text-xs text-slate-500 dark:text-gray-500 font-semibold mt-1">No contact forms matched your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-transparent border-b border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
                  <th className="py-5 pl-6 w-12">
                    <input 
                      type="checkbox" 
                      onChange={toggleSelectAll} 
                      checked={selectedIds.length === filteredLeads.length && filteredLeads.length > 0}
                      className="rounded-md border-slate-300 dark:border-white/10 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-5">Sender</th>
                  <th className="py-5">Message Preview</th>
                  <th className="py-5">Status</th>
                  <th className="py-5">Received At</th>
                  <th className="py-5 pr-6 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                <AnimatePresence initial={false}>
                  {paginatedLeads.map((lead) => (
                    <motion.tr 
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.01] transition-all duration-150 ${
                        selectedIds.includes(lead.id) ? 'bg-blue-50/40 dark:bg-blue-950/[0.05]' : ''
                      }`}
                    >
                      <td className="py-5 pl-6">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(lead.id)}
                          onChange={() => toggleSelect(lead.id)}
                          className="rounded-md border-slate-300 dark:border-white/10 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-5">
                        <div>
                          <span className="font-black text-slate-900 dark:text-white block">{lead.name}</span>
                          <span className="text-[10px] text-slate-400 dark:text-gray-500 font-bold block mt-0.5">{lead.email}</span>
                        </div>
                      </td>
                      <td className="py-5 max-w-sm">
                        <p className="text-slate-600 dark:text-gray-400 line-clamp-2 text-xs font-semibold leading-relaxed">
                          {lead.message}
                        </p>
                      </td>
                      <td className="py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          lead.status === 'resolved' ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/10' :
                          lead.status === 'pending' ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/10' :
                          'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/10'
                        }`}>
                          {lead.status === 'resolved' && <CheckCircle2 className="w-3 h-3" />}
                          {lead.status === 'pending' && <Clock className="w-3 h-3" />}
                          {lead.status === 'new' && <AlertCircle className="w-3 h-3" />}
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-5 text-slate-400 dark:text-gray-500 font-bold">
                        {new Date(lead.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-5 pr-6 text-right space-x-2">
                        <select
                          value={lead.status}
                          onChange={(e) => updateStatus(lead.id, e.target.value as any)}
                          className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white cursor-pointer outline-none focus:border-blue-500"
                        >
                          <option value="new" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">Mark New</option>
                          <option value="pending" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">Mark Pending</option>
                          <option value="resolved" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">Mark Resolved</option>
                        </select>
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="p-2.5 border border-slate-200 dark:border-white/5 hover:border-red-300 dark:hover:border-red-500/30 rounded-xl bg-slate-50 dark:bg-white/[0.01] hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-all inline-flex items-center justify-center cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {/* Pagination Controls */}
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredLeads.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              itemLabel="leads"
            />
          </div>
        )}
      </div>
    </div>
  );
}
