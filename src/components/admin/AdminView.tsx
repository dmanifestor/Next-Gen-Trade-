import React, { useState, useMemo } from 'react';
import { useTrading } from '../../context/TradingContext';
import { Modal } from '../ui/Modal';
import { 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Minus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Server, 
  Database, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Sliders, 
  Layers, 
  TrendingUp, 
  Eye, 
  ExternalLink,
  DollarSign,
  FileSpreadsheet,
  Check,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Transaction } from '../../types';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  kycTier: 'Tier 1' | 'Tier 2 Verified' | 'Institutional';
  status: 'active' | 'suspended';
  cashBalance: number;
  totalVolume: number;
  joinedDate: string;
}

export const AdminView: React.FC = () => {
  const { 
    user, 
    transactions, 
    updateTransactionStatus, 
    adjustUserBalance, 
    cashBalanceUSD, 
    assets, 
    setCurrentPage, 
    addToast,
    activityLogs,
    addAuditLog 
  } = useTrading();

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'approvals' | 'markets' | 'audit'>('overview');

  // Emergency Toggles
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [withdrawalLock, setWithdrawalLock] = useState<boolean>(false);

  // User Management State
  const [userSearch, setUserSearch] = useState<string>('');
  const [userFilter, setUserFilter] = useState<'all' | 'admin' | 'suspended' | 'institutional'>('all');
  
  // Balance Adjustment Modal State
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<ManagedUser | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<string>('5000');
  const [balanceDirection, setBalanceDirection] = useState<'credit' | 'debit'>('credit');
  const [balanceReason, setBalanceReason] = useState<string>('Administrative Deposit Adjustment');

  // Mock Managed Users List
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([
    {
      id: user?.id || 'usr_btn_9842',
      name: user?.name || 'Joshua James Bergin',
      email: user?.email || 'Bergjoshua1@gmail.com',
      role: 'admin',
      kycTier: user?.kycTier || 'Tier 2 Verified',
      status: 'active',
      cashBalance: cashBalanceUSD,
      totalVolume: 1245800,
      joinedDate: 'March 2019',
    },
    {
      id: 'usr_btn_1002',
      name: 'Sarah Connor',
      email: 's.connor@cyberdyne-cap.com',
      role: 'user',
      kycTier: 'Institutional',
      status: 'active',
      cashBalance: 245000.0,
      totalVolume: 4950000,
      joinedDate: 'January 2021',
    },
    {
      id: 'usr_btn_1003',
      name: 'David K. Vance',
      email: 'david.vance@quantfunds.io',
      role: 'user',
      kycTier: 'Tier 2 Verified',
      status: 'active',
      cashBalance: 82400.0,
      totalVolume: 890400,
      joinedDate: 'August 2022',
    },
    {
      id: 'usr_btn_1004',
      name: 'Elena Rostova',
      email: 'elena.rostova@geneva-wealth.ch',
      role: 'user',
      kycTier: 'Institutional',
      status: 'active',
      cashBalance: 512000.0,
      totalVolume: 8200000,
      joinedDate: 'May 2020',
    },
    {
      id: 'usr_btn_1005',
      name: 'Marcus Sterling',
      email: 'm.sterling@offshore-alpha.co',
      role: 'user',
      kycTier: 'Tier 1',
      status: 'suspended',
      cashBalance: 1200.0,
      totalVolume: 45000,
      joinedDate: 'November 2023',
    },
  ]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return managedUsers.filter((u) => {
      const matchText =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.id.toLowerCase().includes(userSearch.toLowerCase());
      if (!matchText) return false;

      if (userFilter === 'admin') return u.role === 'admin';
      if (userFilter === 'suspended') return u.status === 'suspended';
      if (userFilter === 'institutional') return u.kycTier === 'Institutional';
      return true;
    });
  }, [managedUsers, userSearch, userFilter]);

  // Pending Approvals
  const pendingTransactions = useMemo(() => {
    return transactions.filter((t) => t.status === 'PENDING');
  }, [transactions]);

  // Handlers for User Management
  const handleToggleUserStatus = (userId: string) => {
    setManagedUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'active' ? 'suspended' : 'active';
          addToast({
            type: newStatus === 'active' ? 'success' : 'warning',
            title: `Account ${newStatus === 'active' ? 'Reactivated' : 'Suspended'}`,
            message: `User ${u.name} is now ${newStatus}.`,
          });
          addAuditLog(`Account status changed to ${newStatus} for ${u.email}`, 'WARNING');
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const handleUpgradeUserKYC = (userId: string) => {
    setManagedUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextTier =
            u.kycTier === 'Tier 1'
              ? 'Tier 2 Verified'
              : u.kycTier === 'Tier 2 Verified'
              ? 'Institutional'
              : 'Tier 1';
          addToast({
            type: 'success',
            title: 'KYC Level Updated',
            message: `${u.name} upgraded to ${nextTier}.`,
          });
          addAuditLog(`KYC tier upgraded to ${nextTier} for ${u.email}`, 'SUCCESS');
          return { ...u, kycTier: nextTier };
        }
        return u;
      })
    );
  };

  const handleToggleAdminRole = (userId: string) => {
    setManagedUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newRole = u.role === 'admin' ? 'user' : 'admin';
          addToast({
            type: 'info',
            title: 'Role Permissions Modified',
            message: `${u.name} assigned role: ${newRole}.`,
          });
          addAuditLog(`Role permission changed to ${newRole} for ${u.email}`, 'WARNING');
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  const handleExecuteBalanceAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(balanceAmount);
    if (isNaN(val) || val <= 0) {
      addToast({
        type: 'error',
        title: 'Invalid Adjustment Amount',
        message: 'Please specify a positive dollar amount.',
      });
      return;
    }

    const delta = balanceDirection === 'credit' ? val : -val;

    if (selectedUserForBalance?.id === user?.id) {
      adjustUserBalance(delta, balanceReason);
    }

    setManagedUsers((prev) =>
      prev.map((u) => {
        if (u.id === selectedUserForBalance?.id) {
          return { ...u, cashBalance: Math.max(0, u.cashBalance + delta) };
        }
        return u;
      })
    );

    addToast({
      type: 'success',
      title: 'Ledger Adjustment Executed',
      message: `Adjusted balance by ${delta >= 0 ? '+' : ''}$${val.toLocaleString()} for ${selectedUserForBalance?.name}.`,
    });

    setBalanceModalOpen(false);
  };

  // Export Transactions CSV
  const handleExportSystemAudit = () => {
    const headers = ['TX_ID', 'TYPE', 'ASSET', 'AMOUNT', 'PRICE', 'TOTAL', 'FEE', 'STATUS', 'TIMESTAMP', 'HASH'];
    const rows = transactions.map((t) => [
      t.id,
      t.type,
      t.assetSymbol,
      t.amount,
      t.price,
      t.total,
      t.fee,
      t.status,
      t.timestamp,
      t.txHash,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bit_trade_global_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Global Audit Exported',
      message: 'Cryptographic ledger report downloaded successfully.',
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header & Emergency Status Strip */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-700/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              Platform Administration & Risk Portal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/50 text-[10px] font-extrabold text-indigo-300">
              SUPER-ADMIN
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time multi-sig vault supervision, transaction approval queues, KYC verification controls, and exchange parameters.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            id="btn-admin-export-audit"
            onClick={handleExportSystemAudit}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Audit CSV</span>
            <span className="sm:hidden">Export</span>
          </button>

          <button
            type="button"
            id="btn-admin-return-dashboard"
            onClick={() => setCurrentPage('dashboard')}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Client Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-700/60 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Assets Under Custody</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-100 mt-1.5">
            $142,850,000
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>98.4% Cold Vault &bull; 1.6% Hot</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-700/60 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>24h Global Volume</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-100 mt-1.5">
            $48,294,100
          </div>
          <div className="text-[10px] text-sky-400 mt-1 font-semibold">
            +12.4% vs previous 24h
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-700/60 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-100 mt-1.5">
            18,420
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Across Tier 1, 2 & Institutional
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-700/60 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pending Approvals</span>
            <AlertTriangle className={`w-4 h-4 ${pendingTransactions.length > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className={`text-xl sm:text-2xl font-black font-mono mt-1.5 ${pendingTransactions.length > 0 ? 'text-amber-400' : 'text-slate-100'}`}>
            {pendingTransactions.length} Pending
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Require operational review
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'System Overview & Controls', icon: Activity },
          { id: 'users', label: 'User & KYC Management', icon: Users },
          { id: 'approvals', label: `Pending Approvals (${pendingTransactions.length})`, icon: ShieldAlert },
          { id: 'markets', label: 'Market Pairs & Spreads', icon: Sliders },
          { id: 'audit', label: 'Admin Audit Log', icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: OVERVIEW & SYSTEM HEALTH */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Emergency Safety Switches */}
          <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-700/60 shadow-xl space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Global Risk Safeguards & Operations Switches</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-200">Exchange Maintenance Mode</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pause all active matching and order submissions</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMaintenanceMode(!maintenanceMode);
                    addToast({
                      type: !maintenanceMode ? 'warning' : 'info',
                      title: `Maintenance Mode ${!maintenanceMode ? 'ACTIVATED' : 'DEACTIVATED'}`,
                      message: !maintenanceMode ? 'Trading engine paused for maintenance.' : 'Trading engine operational.',
                    });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    maintenanceMode
                      ? 'bg-rose-500 text-white shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {maintenanceMode ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-200">Global Withdrawal Lock</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Halt automated hot wallet ledger signoffs</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setWithdrawalLock(!withdrawalLock);
                    addToast({
                      type: !withdrawalLock ? 'warning' : 'info',
                      title: `Withdrawal Gate ${!withdrawalLock ? 'LOCKED' : 'UNLOCKED'}`,
                      message: !withdrawalLock ? 'All outward withdrawals suspended.' : 'Withdrawals active.',
                    });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    withdrawalLock
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {withdrawalLock ? 'LOCKED' : 'ACTIVE'}
                </button>
              </div>
            </div>
          </div>

          {/* Engine Health Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Matching Engine</span>
                <Server className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-lg font-black text-emerald-400 font-mono">100% OPERATIONAL</div>
              <p className="text-[11px] text-slate-400">
                Primary cluster: LON-1 &bull; 2.1ms avg response &bull; 0 queue lag
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Cold Vault Liquidity</span>
                <Lock className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-lg font-black text-slate-100 font-mono">$140,650,000 USD</div>
              <p className="text-[11px] text-slate-400">
                Threshold: Multi-sig 4-of-7 key quorum distributed across 3 regions
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Hot Wallet Pool</span>
                <Activity className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-lg font-black text-slate-100 font-mono">$2,200,000 USD</div>
              <p className="text-[11px] text-slate-400">
                Replenished automatically when buffer dips under $1.5M threshold
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: USER ACCOUNT MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-700/60 shadow-xl space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, email, or user ID..."
                className="glass-input w-full pl-9 pr-3 py-2 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Users' },
                { id: 'admin', label: 'Admins' },
                { id: 'institutional', label: 'Institutional' },
                { id: 'suspended', label: 'Suspended' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setUserFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    userFilter === f.id
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">KYC Tier</th>
                  <th className="py-3 px-3 text-right">Cash Balance</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {u.id === user?.id && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <button
                        type="button"
                        onClick={() => handleUpgradeUserKYC(u.id)}
                        title="Click to advance KYC Level"
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors cursor-pointer"
                      >
                        {u.kycTier}
                      </button>
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-100">
                      ${u.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {u.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{u.status.toUpperCase()}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForBalance(u);
                            setBalanceModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 cursor-pointer"
                        >
                          Adjust Funds
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                            u.status === 'active'
                              ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAdminRole(u.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold cursor-pointer"
                        >
                          Role
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: PENDING WITHDRAWALS & APPROVALS QUEUE */}
      {activeTab === 'approvals' && (
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Withdrawal & Transaction Authorization Queue</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Large or flagged transactions requiring cryptographic multi-sig signoff.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs border border-amber-500/30">
              {pendingTransactions.length} Pending Actions
            </span>
          </div>

          {pendingTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="font-bold text-slate-200">No Pending Authorizations</div>
              <p className="text-xs">All outbound and inbound ledger transactions have been processed.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {pendingTransactions.map((tx) => (
                <div key={tx.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {tx.type}
                      </span>
                      <span className="font-bold text-sm text-slate-100">
                        {tx.amount.toLocaleString()} {tx.assetSymbol} (${tx.total.toLocaleString()})
                      </span>
                      <span className="text-xs text-slate-400">via {tx.network || 'TRC20'}</span>
                    </div>

                    <div className="text-xs text-slate-400">
                      <span>Destination: </span>
                      <span className="font-mono text-slate-300">{tx.destinationAddress || '0x498a...'}</span>
                    </div>

                    {tx.note && (
                      <div className="text-[11px] text-amber-300 bg-amber-950/30 px-2 py-1 rounded border border-amber-500/30 inline-block">
                        {tx.note}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateTransactionStatus(tx.id, 'COMPLETED')}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Broadcast</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateTransactionStatus(tx.id, 'FAILED')}
                      className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 border border-rose-500/40 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject & Refund</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: MARKET PAIRS & FEE CONTROLS */}
      {activeTab === 'markets' && (
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Listed Assets & Fee Configuration</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage trading availability, spreads, and maker/taker commissions.
              </p>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Fee Base: <strong>Maker 0.05%</strong> / <strong>Taker 0.10%</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Symbol / Pair</th>
                  <th className="py-3 px-3 text-right">Current Price</th>
                  <th className="py-3 px-3 text-right">24h Vol</th>
                  <th className="py-3 px-3 text-center">Liquidity Pool</th>
                  <th className="py-3 px-3 text-center">Trading Status</th>
                  <th className="py-3 px-3 text-center">Engine Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {assets.map((asset) => (
                  <tr key={asset.symbol} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-100">
                      {asset.symbol}/USD ({asset.name})
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-200">
                      ${asset.price.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">
                      ${(asset.volume24h / 1e6).toFixed(1)}M
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Deep OTC
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        ACTIVE
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          addToast({
                            type: 'info',
                            title: 'Spread Recalibrated',
                            message: `Recalibrated liquidity spreads for ${asset.symbol}/USD.`,
                          });
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold cursor-pointer"
                      >
                        Recalibrate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: ADMIN AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                <span>Administrative Event Audit Log</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Immutable cryptographic trace of all supervisor interventions.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportSystemAudit}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Log</span>
            </button>
          </div>

          <div className="divide-y divide-slate-800/60 text-xs">
            {activityLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-100">{log.action}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Operator IP: <span className="font-mono">{log.ip}</span> &bull; {log.device}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.status === 'SUCCESS'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {log.status}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BALANCE ADJUSTMENT MODAL */}
      <Modal
        isOpen={balanceModalOpen}
        onClose={() => setBalanceModalOpen(false)}
        title={`Adjust Balance: ${selectedUserForBalance?.name}`}
      >
        <form onSubmit={handleExecuteBalanceAdjustment} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
            <div className="text-slate-400">Account: <strong className="text-slate-200">{selectedUserForBalance?.email}</strong></div>
            <div className="text-slate-400">Current Cash Balance: <strong className="text-emerald-400 font-mono">${selectedUserForBalance?.cashBalance.toLocaleString()} USD</strong></div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Adjustment Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBalanceDirection('credit')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  balanceDirection === 'credit'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Credit Balance (+)</span>
              </button>

              <button
                type="button"
                onClick={() => setBalanceDirection('debit')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  balanceDirection === 'debit'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Debit Balance (-)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                step="any"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                placeholder="5000"
                required
                className="glass-input w-full pl-8 pr-3 py-2 rounded-xl text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Audit Reason / Internal Note
            </label>
            <input
              type="text"
              value={balanceReason}
              onChange={(e) => setBalanceReason(e.target.value)}
              placeholder="e.g. Approved institutional wire deposit"
              required
              className="glass-input w-full px-3 py-2 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setBalanceModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              Commit Ledger Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
