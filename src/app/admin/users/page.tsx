"use client";

import { useEffect, useState } from 'react';
import { 
  Users, Search, Shield, Ban, CheckCircle, 
  UserMinus, UserCheck, Crown, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';
import AdminPagination from '@/components/admin/AdminPagination';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'premium';
  status: 'active' | 'blocked';
  createdAt: string;
}

const mockUsers: User[] = [
  { id: '1', email: 'admin@toolwala.co', role: 'admin', status: 'active', createdAt: '2026-05-01T12:00:00Z' },
  { id: '2', email: 'akash@technicul.co', role: 'premium', status: 'active', createdAt: '2026-05-15T08:30:00Z' },
  { id: '3', email: 'sam@guestmail.com', role: 'user', status: 'active', createdAt: '2026-06-02T14:45:00Z' },
  { id: '4', email: 'spammer_bot@malicious.xyz', role: 'user', status: 'blocked', createdAt: '2026-06-03T18:22:00Z' }
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await adminFetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.warn("Using simulated users data.", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const toggleUserStatus = async (id: string, currentStatus: 'active' | 'blocked') => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const res = await adminFetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, status: nextStatus } : u));
        toast.success(`User is now ${nextStatus}`);
      }
    } catch (err) {
      // Local fallback
      setUsers(users.map(u => u.id === id ? { ...u, status: nextStatus } : u));
      toast.success(`[Simulated] User status updated to ${nextStatus}`);
    }
  };

  const updateUserRole = async (id: string, newRole: 'admin' | 'user' | 'premium') => {
    try {
      const res = await adminFetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: newRole })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
        toast.success(`User role upgraded to ${newRole}`);
      }
    } catch (err) {
      // Local fallback
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
      toast.success(`[Simulated] User role updated to ${newRole}`);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterRole]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

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
            placeholder="Search users..."
            className="bg-transparent text-sm border-none outline-none focus:outline-none focus:ring-0 focus:border-none text-slate-900 dark:text-white w-full placeholder-slate-400 dark:placeholder-gray-600 font-semibold pl-2 h-auto"
          />
        </div>

        {/* Right: Role filter */}
        <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">
          <Shield className="w-3.5 h-3.5" /> Plan Tier
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-transparent border-none outline-none text-slate-900 dark:text-white font-black cursor-pointer ml-1 text-xs"
          >
            <option value="all" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">All Tiers</option>
            <option value="user" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">Guest / Standard</option>
            <option value="premium" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">Premium</option>
            <option value="admin" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">Administrator</option>
          </select>
        </div>
      </div>

      {/* Main Users Grid */}
      <div className="bg-white dark:bg-white/[0.01] rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="h-8 w-8 border-2 border-slate-200 dark:border-white/10 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Querying platform profiles...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <Users className="w-12 h-12 text-slate-300 dark:text-gray-600 mb-4" />
            <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">No Users Matches</h4>
            <p className="text-xs text-slate-500 dark:text-gray-500 font-semibold mt-1">No user accounts meet search parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-transparent border-b border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
                  <th className="py-5 pl-6">Profile Email</th>
                  <th className="py-5">Role/Tier</th>
                  <th className="py-5">Account Status</th>
                  <th className="py-5">Registered On</th>
                  <th className="py-5 pr-6 text-right font-black">Management Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                <AnimatePresence initial={false}>
                  {paginatedUsers.map((u) => (
                    <motion.tr 
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.01] transition-all duration-150 ${
                        u.status === 'blocked' ? 'bg-red-50/50 dark:bg-red-950/[0.05]' : ''
                      }`}
                    >
                      <td className="py-5 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xs font-black text-slate-900 dark:text-white uppercase">
                            {u.email.charAt(0)}
                          </div>
                          <div>
                            <span className="font-black text-slate-900 dark:text-white block">{u.email}</span>
                            <span className="text-[9px] text-slate-400 dark:text-gray-500 font-mono font-bold block mt-0.5">UID: {u.id}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          u.role === 'admin' ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/10' :
                          u.role === 'premium' ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/10' :
                          'text-slate-600 dark:text-gray-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5'
                        }`}>
                          {u.role === 'admin' ? <Crown className="w-3 h-3" /> : u.role === 'premium' ? <Shield className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                          {u.role}
                        </span>
                      </td>

                      <td className="py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          u.status === 'active' 
                            ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/10' 
                            : 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/10'
                        }`}>
                          {u.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                          {u.status}
                        </span>
                      </td>

                      <td className="py-5 text-slate-400 dark:text-gray-500 font-bold">
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>

                      <td className="py-5 pr-6 text-right space-x-2">
                        {/* Role Upgrade Dropdown */}
                        <select
                          value={u.role}
                          onChange={(e) => updateUserRole(u.id, e.target.value as any)}
                          className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white cursor-pointer outline-none focus:border-blue-500"
                        >
                          <option value="user" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">Standard</option>
                          <option value="premium" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">Premium</option>
                          <option value="admin" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">Admin</option>
                        </select>

                        {/* Ban/Unban Trigger */}
                        <button
                          onClick={() => toggleUserStatus(u.id, u.status)}
                          className={`p-2.5 border rounded-xl active:scale-95 transition-all inline-flex items-center justify-center cursor-pointer ${
                            u.status === 'active' 
                              ? 'border-slate-200 dark:border-white/5 hover:border-red-300 dark:hover:border-red-500/30 bg-slate-50 dark:bg-white/[0.01] hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400'
                              : 'border-slate-200 dark:border-white/5 hover:border-emerald-300 dark:hover:border-emerald-500/30 bg-slate-50 dark:bg-white/[0.01] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400'
                          }`}
                          title={u.status === 'active' ? 'Block Account' : 'Activate Account'}
                        >
                          {u.status === 'active' ? <UserMinus className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
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
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              itemLabel="users"
            />
          </div>
        )}
      </div>
    </div>
  );
}
