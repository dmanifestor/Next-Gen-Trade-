import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { walletAddresses, USDTNetwork } from '../../config/wallets';
import { FileUpload } from '../ui/FileUpload';
import { 
  ArrowLeft, 
  ArrowDownLeft, 
  Copy, 
  Check, 
  QrCode, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw,
  Sparkles,
  Wallet,
  ArrowRight
} from 'lucide-react';

export const DepositView: React.FC = () => {
  const { assets, executeDeposit, setCurrentPage, addToast } = useTrading();
  const [network, setNetwork] = useState<USDTNetwork>('TRC-20');
  const [selectedAsset, setSelectedAsset] = useState<string>('USDT');
  const [amount, setAmount] = useState<string>('5000');
  const [copied, setCopied] = useState<boolean>(false);
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const address = selectedAsset === 'USDT'
    ? walletAddresses.USDT[network]
    : (walletAddresses as any)[selectedAsset]?.[network] || walletAddresses.USDT['TRC-20'];

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(address)}`;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      addToast({
        type: 'info',
        title: 'Address Copied',
        message: `${network} deposit address copied to clipboard.`,
        duration: 2500,
      });
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount) || 0;
    if (amountNum <= 0) {
      addToast({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid deposit amount.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await executeDeposit(selectedAsset, amountNum, network, receiptUrl);
      addToast({
        type: 'info',
        title: 'Deposit Notification Logged',
        message: `Deposit slip for $${amountNum.toLocaleString()} ${selectedAsset} submitted. Awaiting blockchain network confirmation.`,
      });
      setCurrentPage('transactions');
    } finally {
      setIsProcessing(false);
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
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                Deposit Digital Assets
              </h1>
              <p className="text-xs text-slate-400">
                Select your network and transfer USDT directly to your dedicated BTN address
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage('transactions')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white font-semibold transition-colors"
          >
            History
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage('withdraw')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white font-semibold transition-colors"
          >
            Withdraw
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Deposit Card */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80" />

          {/* Asset Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Currency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['USDT', 'BTC', 'ETH', 'BNB'].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => setSelectedAsset(sym)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                    selectedAsset === sym
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Network Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
              <span>Transfer Network</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                Zero Deposit Fees
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['TRC-20', 'BEP-20', 'ERC-20'] as USDTNetwork[]).map((net) => (
                <button
                  key={net}
                  type="button"
                  onClick={() => setNetwork(net)}
                  className={`py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 border ${
                    network === net
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <span className="font-extrabold">{net}</span>
                  <span className="text-[10px] text-slate-400">
                    {net === 'TRC-20' ? 'Tron Network' : net === 'BEP-20' ? 'BNB Smart Chain' : 'Ethereum'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <div className="p-3 bg-white rounded-2xl shadow-xl inline-block mb-3">
              <img
                src={qrUrl}
                alt={`${network} ${selectedAsset} deposit QR code`}
                className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
              />
            </div>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Scan with your mobile wallet app (e.g. Trust Wallet, Binance, MetaMask, TronLink)
            </p>
          </div>

          {/* Deposit Address Box */}
          <div>
            <span className="block text-xs font-semibold text-slate-300 mb-2">
              {network} Public Deposit Address
            </span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <code className="flex-1 font-mono text-xs sm:text-[13px] text-cyan-400 break-all select-all py-1 px-1">
                {address}
              </code>
              <button
                type="button"
                id="btn-copy-deposit-addr"
                onClick={copyAddress}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Copied ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="text-xs font-bold text-amber-300 block">
                  Important Network Rule
                </strong>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Only send {selectedAsset} using the selected <span className="text-amber-400 font-bold">{network}</span> network. Sending assets through another network or mismatched token may result in permanent loss of funds.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Action & Transfer Confirmation Card */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleDepositSubmit}
            className="glass-panel rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-5"
          >
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Simulated Deposit Gateway</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Amount to Deposit ({selectedAsset})
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5000"
                  required
                  className="glass-input w-full px-4 py-3 rounded-xl text-base font-bold font-mono"
                />
                <span className="absolute right-3.5 top-3.5 text-xs font-bold text-slate-400">
                  {selectedAsset}
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                {['1000', '5000', '15000', '25000'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className="flex-1 py-1 text-[11px] font-bold rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-slate-700 transition-colors"
                  >
                    +${Number(preset).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Proof of Payment / Transaction Hash receipt upload */}
            <FileUpload
              label="Transfer Receipt or Hash Screenshot (Optional)"
              value={receiptUrl}
              onChange={(url) => setReceiptUrl(url)}
              helperText="Upload transfer slip or TX confirmation for instant administrative reconciliation."
            />

            <button
              type="submit"
              id="btn-submit-deposit-form"
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Transfer Slip...</span>
                </>
              ) : (
                <>
                  <span>Submit Deposit Notification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Institutional Custody Specs Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Gateway Specifications
            </h4>
            <ul className="text-xs space-y-2 text-slate-300">
              <li className="flex items-center justify-between">
                <span className="text-slate-400">Confirmation Required</span>
                <span className="font-mono font-bold text-emerald-400">12 Network Blocks</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-400">Minimum Deposit</span>
                <span className="font-mono font-bold">10 USDT</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-400">Estimated Arrival</span>
                <span className="font-mono text-cyan-400">Instant (~2 mins)</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-400">Custody Protocol</span>
                <span className="font-mono text-emerald-400 font-bold">MPC Multi-Sig Hot Vault</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
