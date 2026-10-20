import React, { useState, useEffect } from 'react';
import { TradingProvider, useTrading } from './context/TradingContext';
import { Navbar } from './components/layout/Navbar';
import { TickerRibbon } from './components/layout/TickerRibbon';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { AuthCard } from './components/auth/AuthCard';
import { HomeView } from './components/home/HomeView';
import { DashboardView } from './components/dashboard/DashboardView';
import { MarketView } from './components/markets/MarketView';
import { TradeView } from './components/trade/TradeView';
import { WalletView } from './components/wallet/WalletView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { SecurityView } from './components/security/SecurityView';
import { AdminView } from './components/admin/AdminView';
import { WithdrawalReviewView } from './components/transactions/WithdrawalReviewView';
import { DepositView } from './components/wallet/DepositView';
import { WithdrawView } from './components/wallet/WithdrawView';
import { DepositModal } from './components/wallet/DepositModal';
import { ToastContainer } from './components/ui/Toast';
import { ArrowLeft } from 'lucide-react';
import { NavPage } from './types';

const MainAppContent: React.FC = () => {
  const { user, currentPage, setCurrentPage, toasts, removeToast, theme, authLoading } = useTrading();
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  // Hash-based deep link router listener (supports /#login, /#dashboard, /#deposit, /#withdraw, etc.)
  useEffect(() => {
    const handleRouting = () => {
      const rawHash = window.location.hash.toLowerCase();
      const cleanHash = rawHash.replace(/^#\/?/, '').split('/')[0].split('?')[0];
      const rawPath = window.location.pathname.toLowerCase().replace(/^\//, '').split('/')[0].split('?')[0];

      const validPages: Record<string, NavPage> = {
        'login': 'login',
        'register': 'register',
        'forgot-password': 'forgot-password',
        'dashboard': 'dashboard',
        'markets': 'markets',
        'trade': 'trade',
        'wallet': 'wallet',
        'deposit': 'deposit',
        'withdraw': 'withdraw',
        'transactions': 'transactions',
        'history': 'transactions',
        'ledger': 'transactions',
        'settings': 'settings',
        'security': 'settings',
        'admin': 'admin',
        'home': 'home',
        'withdrawal-review': 'withdrawal-review',
        'withdraw-review': 'withdrawal-review',
      };

      const target = validPages[cleanHash] || (rawPath ? validPages[rawPath] : undefined);
      if (target) {
        setCurrentPage(target);
      }
    };

    // Check on initial load
    handleRouting();

    window.addEventListener('hashchange', handleRouting);
    window.addEventListener('popstate', handleRouting);
    return () => {
      window.removeEventListener('hashchange', handleRouting);
      window.removeEventListener('popstate', handleRouting);
    };
  }, [setCurrentPage]);

  // Keep window.location.hash synced with currentPage
  useEffect(() => {
    const currentHash = window.location.hash.toLowerCase().replace(/^#\/?/, '').split('/')[0].split('?')[0];
    if (currentHash !== currentPage) {
      window.history.replaceState(null, '', `#/${currentPage}`);
    }
  }, [currentPage]);

  // While Firebase initializes auth state
  if (authLoading) {
    return (
      <div className={`min-h-screen ${theme === 'true-black' ? 'bg-black' : 'bg-[#060a12]'} text-slate-100 flex flex-col justify-center items-center trading-pattern`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-black text-slate-950 text-lg shadow-lg shadow-emerald-500/20 animate-pulse">
            B
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono">Connecting to Firebase Auth...</span>
          </div>
        </div>
      </div>
    );
  }

  // Explicit Authentication Pages (Login, Register, Forgot Password)
  const isAuthPage = ['login', 'register', 'forgot-password'].includes(currentPage);
  if (isAuthPage) {
    const authMode = currentPage === 'register' 
      ? 'register' 
      : currentPage === 'forgot-password' 
      ? 'forgot-password' 
      : 'login';

    return (
      <div className={`min-h-screen ${theme === 'true-black' ? 'bg-black' : 'bg-[#060a12]'} text-slate-100 flex flex-col justify-between trading-pattern`}>
        <div className="py-3 sm:py-5 px-4 sm:px-6 flex justify-between items-center max-w-7xl mx-auto w-full safe-area-pt">
          <button
            type="button"
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Homepage</span>
          </button>
        </div>

        <main className="flex-1 flex items-center justify-center p-2.5 sm:p-4 w-full">
          <AuthCard 
            initialMode={authMode} 
            onSuccess={() => setCurrentPage('dashboard')} 
          />
        </main>

        <footer className="py-4 sm:py-6 text-center text-xs text-slate-400 border-t border-slate-900 safe-area-pb px-3">
          &copy; {new Date().getFullYear()} Bit Trade Net. Trade Smarter. Move Faster. Institutional simulation environment.
        </footer>
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'true-black' ? 'bg-black' : 'bg-[#060a12]'} text-slate-100 flex flex-col justify-between trading-pattern selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden w-full transition-colors duration-200`}>
      {/* Top Navigation */}
      <header className="sticky top-0 z-30">
        <Navbar onOpenDeposit={() => setDepositModalOpen(true)} />
        <TickerRibbon />
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto ${currentPage === 'home' ? 'px-0 py-0 max-w-none' : 'max-w-7xl px-2.5 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-24 md:pb-12'} overflow-x-hidden`}>
        {currentPage === 'home' && <HomeView />}
        {currentPage === 'dashboard' && <DashboardView />}
        {currentPage === 'markets' && <MarketView />}
        {currentPage === 'trade' && <TradeView />}
        {currentPage === 'wallet' && <WalletView />}
        {currentPage === 'deposit' && <DepositView />}
        {currentPage === 'withdraw' && <WithdrawView />}
        {currentPage === 'transactions' && <TransactionsView />}
        {currentPage === 'settings' && <SecurityView />}
        {currentPage === 'admin' && <AdminView />}
        {currentPage === 'withdrawal-review' && <WithdrawalReviewView />}
      </main>

      {/* Quick Deposit Modal from Navbar */}
      <DepositModal 
        isOpen={depositModalOpen} 
        onClose={() => setDepositModalOpen(false)} 
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Footer */}
      <Footer />

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default function App() {
  return (
    <TradingProvider>
      <MainAppContent />
    </TradingProvider>
  );
}
