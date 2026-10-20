import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { InvestmentNoticeModal } from './InvestmentNoticeModal';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  Wallet, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Clock, 
  Send,
  Lock,
  ArrowRight
} from 'lucide-react';

export const WithdrawView: React.FC = () => {
  const { 
    cashBalanceUSD, 
    holdings, 
    executeWithdraw, 
    investmentNoticeOpen, 
    setInvestmentNoticeOpen, 
    setCurrentPage, 
    addToast 
  } = useTrading();

  const [asset, setAsset] = useState<string>('USDT');
  const [network, setNetwork] = useState<string>('TRC-20');
  const [address, setAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('2500');
  const [twoFactorCode, setTwoFactorCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const availableUsd = cashBalanceUSD;

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount) || 0;
    if (amountNum <= 0) {
      addToast({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount to withdraw.',
      });
      return;
    }
    if (!address.trim()) {
      addToast({
        type: 'error',
        title: 'Address Required',
        message: 'Please provide a valid destination wallet address.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await executeWithdraw(asset, amountNum, address, network);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800">
        <div>
          <button
            type="button"
            onClick={() => setCurrentPage('wallet')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-semibold mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Wallet</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                Withdraw Digital Assets
              </h1>
              <p className="text-xs text-slate-400">
                Submit an external crypto settlement request to your non-custodial wallet
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage('deposit')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white font-semibold transition-colors"
          >
            Deposit
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage('withdrawal-review')}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-semibold transition-colors"
          >
            Review Queue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Withdrawal Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleWithdrawSubmit}
            className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl relative overflow-hidden space-y-6"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-80" />

            {/* Simulation Warning */}
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Simulated Sandbox Environment</strong>
                <span className="text-[11px] text-slate-300">
                  Simulation only: all transfers undergo compliance authorization and investment rule verification prior to broadcast.
                </span>
              </div>
            </div>

            {/* Available Balance Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Available Simulated Balance
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                  ${availableUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAmount(availableUsd.toString())}
                className="px-2.5 py-1 text-xs font-bold text-sky-400 hover:text-sky-300 bg-sky-500/10 border border-sky-500/30 rounded-lg cursor-pointer"
              >
                Use MAX
              </button>
            </div>

            {/* Asset Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Asset to Withdraw
              </label>
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#0b1220]"
              >
                <option value="USDT">USDT — Tether USD</option>
                <option value="BTC">BTC — Bitcoin</option>
                <option value="ETH">ETH — Ethereum</option>
                <option value="BNB">BNB — BNB Chain</option>
                <option value="SOL">SOL — Solana</option>
              </select>
            </div>

            {/* Network Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Transfer Network</span>
                <span className="text-[10px] text-slate-400 font-mono">Estimated Fee: $25.00</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['TRC-20', 'BEP-20', 'ERC-20'].map((net) => (
                  <button
                    key={net}
                    type="button"
                    onClick={() => setNetwork(net)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      network === net
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Recipient Wallet Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Paste destination TRC-20 / BEP-20 / ERC-20 address"
                required
                className="glass-input w-full px-4 py-3 rounded-xl text-xs font-mono"
              />
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Withdrawal Amount ({asset})
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="2500"
                  required
                  className="glass-input w-full px-4 py-3 rounded-xl text-base font-bold font-mono"
                />
                <span className="absolute right-3.5 top-3.5 text-xs font-bold text-slate-400">
                  {asset}
                </span>
              </div>
            </div>

            {/* Two-Factor Authentication Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2FA Security Token / PIN</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Demo: 123456</span>
              </label>
              <input
                type="text"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="6-digit authenticator code"
                className="glass-input w-full px-4 py-2.5 rounded-xl text-sm font-mono tracking-widest"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-submit-withdraw-action"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-sky-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Ledger Compliance...</span>
                </>
              ) : (
                <>
                  <span>Submit Withdrawal Request</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          {/* Compliance Card */}
          <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Investment Compliance Rule</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In accordance with institutional risk guidelines, accounts must fulfill all active protocol fee obligations before funds are settled to external destination chains.
            </p>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 text-xs font-mono text-amber-200">
              Protocol Settlement Rule: $5,960.00 compliance verification.
            </div>
          </div>

          {/* Limits & Details */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Withdrawal Specifications
            </h4>
            <ul className="text-xs space-y-2 text-slate-300">
              <li className="flex items-center justify-between">
                <span className="text-slate-400">Daily Limit</span>
                <span className="font-mono font-bold">$250,000 USD</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-400">Network Flat Fee</span>
                <span className="font-mono text-emerald-400 font-bold">$25.00 USDT</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-400">Security Clearance</span>
                <span className="font-mono text-cyan-400">Manual Multi-Sig Review</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-400">Average Processing</span>
                <span className="font-mono">15 &ndash; 30 minutes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Investment Notice Modal */}
      <InvestmentNoticeModal
        isOpen={investmentNoticeOpen}
        onClose={() => setInvestmentNoticeOpen(false)}
      />
    </div>
  );
};
