import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { Modal } from '../ui/Modal';
import { FileUpload } from '../ui/FileUpload';
import { walletAddresses, USDTNetwork } from '../../config/wallets';
import { ArrowDownLeft, Copy, Check, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const { user, assets, executeDeposit, addToast } = useTrading();
  const [depAsset, setDepAsset] = useState<string>('USDT');
  const [network, setNetwork] = useState<USDTNetwork>('TRC-20');
  const [depAmount, setDepAmount] = useState<string>('5000');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Address lookup based on currency and network
  const address = depAsset === 'USDT' 
    ? walletAddresses.USDT[network] 
    : (walletAddresses as any)[depAsset]?.[network] || walletAddresses.USDT['TRC-20'];

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    addToast({
      type: 'info',
      title: 'Address Copied',
      message: `${network} deposit address copied to clipboard.`,
      duration: 2000,
    });
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(address)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(depAmount) || 0;
    if (amountNum <= 0) return;

    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      await executeDeposit(depAsset, amountNum, network, receiptUrl);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deposit Digital Assets"
      subtitle="Select network and transfer assets to your assigned official BTN address"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Currency selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Asset Currency
          </label>
          <select
            value={depAsset}
            onChange={(e) => setDepAsset(e.target.value)}
            className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs font-bold"
          >
            {assets.map((a) => (
              <option key={a.symbol} value={a.symbol} className="bg-[#0b1220]">
                {a.name} ({a.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Network Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Transfer Network
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['TRC-20', 'BEP-20', 'ERC-20'] as USDTNetwork[]).map((net) => (
              <button
                key={net}
                type="button"
                onClick={() => setNetwork(net)}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  network === net
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/25'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {net}
              </button>
            ))}
          </div>
        </div>

        {/* QR Code Container */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-2.5 bg-white rounded-2xl shadow-lg shadow-black/40 inline-block">
              <img
                src={qrUrl}
                alt={`${network} ${depAsset} deposit QR code`}
                className="w-40 h-40 rounded-lg object-contain"
                loading="eager"
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Scan QR code or copy the public address below
          </div>

          {/* Address Box */}
          <div className="text-left space-y-1">
            <span className="text-[11px] font-semibold text-slate-300">
              {network} Official Deposit Address
            </span>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center p-2 rounded-xl bg-slate-950 border border-slate-800">
              <code className="flex-1 min-w-0 font-mono text-[11px] text-sky-400 break-all select-all px-2 py-1">
                {address}
              </code>
              <button
                type="button"
                onClick={copyAddress}
                className="shrink-0 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
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
        </div>

        {/* Deposit Warning Note */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-300 leading-relaxed">
            <strong className="text-amber-400 block font-bold mb-0.5">Important Network Routing</strong>
            Only send {depAsset} using the selected <strong className="text-slate-100">{network}</strong> network. Sending assets through another network may result in permanent loss of funds.
          </div>
        </div>

        {/* Deposit Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Intended Deposit Amount
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              min="1"
              value={depAmount}
              onChange={(e) => setDepAmount(e.target.value)}
              required
              className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold"
              placeholder="Enter transfer amount"
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
              {depAsset}
            </span>
          </div>
        </div>

        {/* Firebase Storage Deposit Receipt Upload */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <FileUpload
            userId={user?.id || 'anonymous'}
            folder="deposits"
            label="Proof of Transfer / Receipt (Optional)"
            helperText="Attach transfer receipt screenshot or tx hash confirmation (PNG, JPG, PDF up to 10MB)"
            compact={true}
            onUploadSuccess={(res) => {
              setReceiptUrl(res.downloadUrl);
              addToast({
                type: 'info',
                title: 'Receipt Stored',
                message: 'Receipt safely stored in Firebase Storage. Click submit to record your deposit.',
              });
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <ArrowDownLeft className="w-4 h-4" />
              <span>Record Deposit & Submit Proof</span>
            </>
          )}
        </button>
      </form>
    </Modal>
  );
};
