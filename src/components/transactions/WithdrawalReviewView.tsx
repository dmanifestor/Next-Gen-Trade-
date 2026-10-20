import React, { useState, useMemo } from 'react';
import { useTrading } from '../../context/TradingContext';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  ArrowLeft, 
  DollarSign, 
  AlertCircle, 
  Clock, 
  Code, 
  FileText, 
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { InvestmentNoticeModal } from '../wallet/InvestmentNoticeModal';
import { walletAddresses } from '../../config/wallets';

export const WithdrawalReviewView: React.FC = () => {
  const { 
    user, 
    transactions, 
    updateTransactionStatus, 
    cashBalanceUSD, 
    setCurrentPage, 
    addToast,
    showInvestmentNotice 
  } = useTrading();

  // Find the top withdrawal review transaction (status === PENDING and type === WITHDRAW)
  const pendingTx = useMemo(() => {
    return transactions.find((t) => t.type === 'WITHDRAW' && t.status === 'PENDING') || {
      id: 'tx_btn_017',
      type: 'WITHDRAW' as const,
      assetSymbol: 'USDT',
      assetName: 'Tether USD',
      amount: 15000.0,
      price: 1.0,
      total: 15000.0,
      fee: 25.0,
      status: 'PENDING' as const,
      timestamp: '2024-03-14 09:22:15',
      txHash: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
      network: 'TRC20',
      destinationAddress: 'TYDzsxdSpGs61CX82km62fEdPwtzNJe2oo',
      note: 'Pending Admin Security Verification & AML Clearance',
    };
  }, [transactions]);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'button' | 'link' | 'badge'>('button');
  const [investmentModalOpen, setInvestmentModalOpen] = useState(false);

  const clearanceAddress = walletAddresses.USDT['TRC-20'];

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    addToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: `${label} copied successfully.`,
      duration: 2500,
    });
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleApprove = () => {
    updateTransactionStatus(pendingTx.id, 'COMPLETED');
    addToast({
      type: 'success',
      title: 'Withdrawal Approved',
      message: `Transaction ${pendingTx.id} marked as COMPLETED and broadcast to ledger.`,
      duration: 5000,
    });
  };

  const handleReject = () => {
    updateTransactionStatus(pendingTx.id, 'FAILED');
    addToast({
      type: 'warning',
      title: 'Withdrawal Rejected',
      message: `Transaction ${pendingTx.id} rejected and refunded to account.`,
      duration: 5000,
    });
  };

  // HTML Snippets requested by user for button / link
  const htmlSnippets = {
    button: `<a href="#/withdrawal-review" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;background:#10b981;color:#020617;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;font-weight:800;text-decoration:none;box-shadow:0 4px 14px rgba(16,185,129,0.35);transition:all 0.2s ease;">
  <span>Review Withdrawal ($${pendingTx.amount.toLocaleString()} USDT)</span>
  <span style="background:#020617;color:#10b981;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;">PENDING</span>
</a>`,
    link: `<a href="#/withdrawal-review" style="color:#34d399;font-family:sans-serif;font-size:13px;font-weight:700;text-decoration:underline;text-underline-offset:3px;">
  &#x26A0;&#xFE0F; Urgent: Review Pending Withdrawal Authorization (/#/withdrawal-review)
</a>`,
    badge: `<div style="display:inline-flex;align-items:center;gap:12px;padding:10px 16px;border-radius:12px;background:#0f172a;border:1px solid #f59e0b;font-family:sans-serif;">
  <span style="color:#fbbf24;font-size:12px;font-weight:700;">&#x23F3; Withdrawal Review Required: $${pendingTx.amount.toLocaleString()} USDT</span>
  <a href="#/withdrawal-review" style="padding:6px 14px;border-radius:8px;background:#f59e0b;color:#020617;font-size:11px;font-weight:800;text-decoration:none;">
    Open Review
  </a>
</div>`,
  };

  return (
    <div className="space-y-5 pb-16 max-w-5xl mx-auto w-full">
      {/* Top Breadcrumb & Route Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={() => {
            window.location.hash = '#/transactions';
            setCurrentPage('transactions');
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Transactions</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Direct Route:</span>
          <code className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-mono font-bold text-[11px]">
            /#/withdrawal-review
          </code>
        </div>
      </div>

      {/* Immediate Top Priority Alert Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black text-amber-300 uppercase tracking-wider">
                Top First Review — Outbound Withdrawal Authorization
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-mono text-[10px] font-extrabold border border-amber-500/30">
                PENDING ACTION
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-1 leading-snug">
              $5,960.00 has to be paid before the available balance can be withdrawn, to meet with the investment rules.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setInvestmentModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <DollarSign className="w-4 h-4" />
          <span>View Compliance Notice ($5,960.00)</span>
        </button>
      </div>

      {/* Main Review Card */}
      <div className="glass-panel rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden">
        {/* Card Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-100">
                  Withdrawal Review: {pendingTx.id}
                </h1>
                <div className="text-xs text-slate-400">
                  Logged {pendingTx.timestamp} &bull; Security Quorum Level 2
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
              pendingTx.status === 'COMPLETED'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : pendingTx.status === 'FAILED'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
            }`}>
              {pendingTx.status === 'COMPLETED' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : pendingTx.status === 'FAILED' ? (
                <XCircle className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              <span>{pendingTx.status}</span>
            </span>
          </div>
        </div>

        {/* Card Body - Grid */}
        <div className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Transaction Data */}
            <div className="space-y-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 p-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Transaction Metadata</span>
              </h3>

              <div className="space-y-2.5 text-xs divide-y divide-slate-800/60">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">Requested Amount</span>
                  <span className="font-mono font-black text-slate-100 text-sm">
                    {pendingTx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {pendingTx.assetSymbol}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-400">Fiat Value Equivalent</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">
                    ${pendingTx.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-400">Transfer Network</span>
                  <span className="font-semibold text-slate-200 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                    {pendingTx.network || 'TRC20'} (Tron Network)
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-400">Network Handling Fee</span>
                  <span className="font-mono text-slate-300">
                    ${(pendingTx.fee || 25).toFixed(2)} USD
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-slate-400 block mb-1">Destination TRC20 Wallet:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pendingTx.destinationAddress || clearanceAddress}
                      className="glass-input w-full px-3 py-1.5 rounded-lg font-mono text-[11px] text-slate-300 bg-slate-950"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyText(pendingTx.destinationAddress || clearanceAddress, 'Destination Address')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'Destination Address' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'Destination Address' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-slate-400 block mb-1">Ledger Transaction Hash:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pendingTx.txHash}
                      className="glass-input w-full px-3 py-1.5 rounded-lg font-mono text-[11px] text-slate-400 bg-slate-950 truncate"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyText(pendingTx.txHash, 'Transaction Hash')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'Transaction Hash' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'Transaction Hash' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: User & Compliance Verification */}
            <div className="space-y-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>Account & Compliance Verification</span>
                </h3>

                <div className="space-y-2.5 text-xs divide-y divide-slate-800/60 mt-3">
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400">Account Owner</span>
                    <span className="font-bold text-slate-200">{user?.name || 'Joshua James Bergin'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-400">Verified Email</span>
                    <span className="font-mono text-slate-300">{user?.email || 'Berginjoshua1@gmail.com'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-400">KYC Verification Tier</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                      {user?.kycTier || 'Tier 2 Verified'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-400">Current Available Balance</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ${cashBalanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-amber-400 font-bold">Required Investment Clearance</span>
                    <span className="font-mono font-black text-amber-400 text-sm">
                      $5,960.00 USD
                    </span>
                  </div>
                </div>

                <div className="mt-3.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed">
                  <strong>Investment Rules Protocol:</strong> As per institutional trading terms (Section 4.2), a clearance payment of <strong>$5,960.00 USD</strong> must be fulfilled before the full available balance is authorized for external cold-storage release.
                </div>
              </div>

              {/* Administrative Review Buttons */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={pendingTx.status === 'COMPLETED'}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Release Funds</span>
                </button>

                <button
                  type="button"
                  onClick={handleReject}
                  disabled={pendingTx.status === 'FAILED'}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 disabled:opacity-50 text-rose-400 border border-rose-500/40 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject & Refund</span>
                </button>
              </div>
            </div>
          </div>

          {/* HTML Snippet for Your Button / Link (User Request Section) */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-100">
                  HTML Snippet for Your Button / Link
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                {(['button', 'link', 'badge'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveSnippetTab(tab)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      activeSnippetTab === tab
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Copy and paste this HTML code directly into any web page, email template, or admin dashboard to link immediately to this review:
            </p>

            <div className="relative">
              <pre className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {htmlSnippets[activeSnippetTab]}
              </pre>

              <button
                type="button"
                onClick={() => handleCopyText(htmlSnippets[activeSnippetTab], `HTML ${activeSnippetTab} snippet`)}
                className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                {copiedField === `HTML ${activeSnippetTab} snippet` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy HTML</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Interactive Preview */}
            <div className="pt-2">
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                Live Interactive Preview:
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center">
                <div dangerouslySetInnerHTML={{ __html: htmlSnippets[activeSnippetTab] }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Notice Modal */}
      <InvestmentNoticeModal
        isOpen={investmentModalOpen}
        onClose={() => setInvestmentModalOpen(false)}
        onOpenDeposit={() => {
          setInvestmentModalOpen(false);
          window.location.hash = '#/wallet';
          setCurrentPage('wallet');
        }}
      />
    </div>
  );
};
