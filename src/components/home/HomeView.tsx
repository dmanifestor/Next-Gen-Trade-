import React, { useState, useMemo } from 'react';
import { useTrading } from '../../context/TradingContext';
import { Logo } from '../layout/Logo';
import { CryptoAsset } from '../../types';
import { 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Lock, 
  DollarSign, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Star, 
  Sparkles, 
  BarChart3, 
  Cpu, 
  Globe, 
  ExternalLink,
  Search,
  ArrowUpRight,
  Calculator,
  UserCheck
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { 
    user, 
    assets, 
    setCurrentPage, 
    setSelectedAsset, 
    recentPriceChanges, 
    login,
    theme 
  } = useTrading();

  // Market Table Category Tab
  const [marketCategory, setMarketCategory] = useState<string>('all');
  const [marketSearch, setMarketSearch] = useState<string>('');

  // Interactive Calculator State
  const [calcAsset, setCalcAsset] = useState<string>('BTC');
  const [calcAmount, setCalcAmount] = useState<number>(5000);
  const [calcDuration, setCalcDuration] = useState<number>(90); // days
  const [calcTier, setCalcTier] = useState<'conservative' | 'balanced' | 'quantitative'>('balanced');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Filtered Assets for Homepage
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matches =
        asset.name.toLowerCase().includes(marketSearch.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(marketSearch.toLowerCase());
      if (!matches) return false;

      if (marketCategory === 'layer1') return asset.category === 'layer1';
      if (marketCategory === 'defi') return asset.category === 'defi';
      if (marketCategory === 'infrastructure') return asset.category === 'infrastructure';
      if (marketCategory === 'gainers') return asset.change24h > 1.5;

      return true;
    });
  }, [assets, marketCategory, marketSearch]);

  // Yield Calculation
  const apyRate = useMemo(() => {
    if (calcTier === 'conservative') return 0.084; // 8.4%
    if (calcTier === 'balanced') return 0.158; // 15.8%
    return 0.264; // 26.4%
  }, [calcTier]);

  const projectedProfit = useMemo(() => {
    const years = calcDuration / 365;
    return calcAmount * apyRate * years;
  }, [calcAmount, apyRate, calcDuration]);

  const totalProjectedValue = calcAmount + projectedProfit;

  // Primary Action
  const handleStartTrading = () => {
    if (user) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('register');
    }
  };

  const handleTradeAsset = (asset: CryptoAsset) => {
    setSelectedAsset(asset);
    setCurrentPage('trade');
  };

  const faqs = [
    {
      q: 'What is Bit Trade Net and how does the trading platform work?',
      a: 'Bit Trade Net is a high-performance digital asset trading platform. Traders can explore real-time spot and limit order books, manage multi-currency crypto wallets, test quantitative trading strategies, and experience institutional execution with bank-grade security.',
    },
    {
      q: 'How do deposits and withdrawals work on the platform?',
      a: 'Users can deposit USDT, BTC, ETH, and other major tokens via TRC20, ERC20, and Bitcoin networks. When requesting withdrawals, institutional compliance verification ensures asset security, and ledger confirmations are tracked in your real-time transaction ledger.',
    },
    {
      q: 'What are the platform trading fees and spreads?',
      a: 'Bit Trade Net offers ultra-competitive maker/taker fee tiers starting at 0.05% with zero gas fees on internal cross-account transfers. High-volume institutional and VIP accounts enjoy customized fee rebates.',
    },
    {
      q: 'How is account security and asset custody safeguarded?',
      a: 'Every account is protected with mandatory Two-Factor Authentication (TOTP), military-grade AES-256 encrypted protocols, multi-signature cold storage vaulting, and active IP session authorization telemetry.',
    },
    {
      q: 'Can I switch between the Client Dashboard and the Admin Portal?',
      a: 'Yes! Authorized administrators can access the comprehensive Admin Dashboard to review pending deposits/withdrawals, manage user verification tiers, monitor system latency, and adjust platform market parameters.',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-20 pb-16 w-full">
      {/* 1. HERO SECTION */}
      <section className="relative pt-4 sm:pt-10 pb-6 sm:pb-12 text-center max-w-5xl mx-auto px-3 sm:px-6">
        {/* Glow ambient background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[450px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Operational Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-6 shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-in fade-in duration-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Next-Gen Institutional Liquidity Engine</span>
          <span className="text-emerald-500 font-mono hidden sm:inline">&bull; 2.1ms Latency</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-100 tracking-tight leading-[1.15] sm:leading-[1.1]">
          Institutional-Grade <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
            Digital Asset Trading
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Execute Bitcoin, Ethereum, Solana, and 50+ leading crypto pairs with sub-millisecond precision, cold-storage asset security, and real-time ledger verification.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
          <button
            type="button"
            id="btn-hero-start-trading"
            onClick={handleStartTrading}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{user ? 'Open Trading Dashboard' : 'Start Trading Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!user ? (
            <button
              type="button"
              id="btn-hero-register"
              onClick={() => setCurrentPage('register')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-700/80 hover:border-slate-600 font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Create Account</span>
            </button>
          ) : (
            <button
              type="button"
              id="btn-hero-admin"
              onClick={() => setCurrentPage('admin')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Admin Operations Portal</span>
            </button>
          )}

          <button
            type="button"
            id="btn-hero-markets"
            onClick={() => {
              const el = document.getElementById('section-home-markets');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-slate-300 hover:text-emerald-400 font-bold text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Explore Markets</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Live Metrics Strip */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left">
          <div className="glass-panel p-4 rounded-xl border border-slate-700/60">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">24h Global Volume</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">$2.84 Billion</div>
            <div className="text-[10px] text-slate-400 mt-0.5">+14.2% from prior cycle</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-slate-700/60">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Execution Speed</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-100 mt-1">2.1ms</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Sub-millisecond matching</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-slate-700/60">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Accounts</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-100 mt-1">18,420+</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Across 85+ jurisdictions</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-slate-700/60">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cold Storage</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">98.5%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Multi-sig offline custody</div>
          </div>
        </div>
      </section>

      {/* 2. LIVE CRYPTOCURRENCY MARKET SECTION */}
      <section id="section-home-markets" className="max-w-7xl mx-auto px-3 sm:px-6 scroll-mt-20">
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-700/60 shadow-2xl">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black text-slate-100">
                  Live Trading Markets
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                  REAL-TIME PRICES
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Inspect top crypto assets, 24-hour price action, and order book liquidity.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={marketSearch}
                onChange={(e) => setMarketSearch(e.target.value)}
                placeholder="Search Bitcoin, SOL, ETH..."
                className="glass-input w-full pl-9 pr-3 py-2 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar">
            {[
              { id: 'all', label: 'All Pairs' },
              { id: 'layer1', label: 'Layer 1' },
              { id: 'defi', label: 'DeFi' },
              { id: 'infrastructure', label: 'Infrastructure' },
              { id: 'gainers', label: 'Top Gainers' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setMarketCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  marketCategory === cat.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Asset</th>
                  <th className="py-3 px-3 text-right">Price</th>
                  <th className="py-3 px-3 text-right">24h Change</th>
                  <th className="py-3 px-3 text-right hidden sm:table-cell">24h High / Low</th>
                  <th className="py-3 px-3 text-right hidden md:table-cell">Market Cap</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredAssets.slice(0, 8).map((asset) => {
                  const tick = recentPriceChanges[asset.symbol];
                  const isPositive = asset.change24h >= 0;

                  return (
                    <tr key={asset.symbol} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-200 border border-slate-700/60">
                            {asset.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-100">{asset.name}</span>
                            <span className="ml-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              {asset.symbol}/USD
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold">
                        <span
                          className={`transition-colors duration-300 ${
                            tick === 'up'
                              ? 'text-emerald-400'
                              : tick === 'down'
                              ? 'text-rose-400'
                              : 'text-slate-100'
                          }`}
                        >
                          ${asset.price.toLocaleString('en-US', { minimumFractionDigits: asset.price > 10 ? 2 : 4 })}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                            isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                          }`}
                        >
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {isPositive ? '+' : ''}{asset.change24h.toFixed(2)}%
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-400 hidden sm:table-cell text-[11px]">
                        ${asset.high24h.toLocaleString()} / ${asset.low24h.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-400 hidden md:table-cell text-[11px]">
                        ${(asset.marketCap / 1e9).toFixed(2)}B
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleTradeAsset(asset)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-xs transition-all border border-emerald-500/30 cursor-pointer"
                        >
                          Trade Now
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span>Showing top market assets available for instant execution.</span>
            <button
              type="button"
              onClick={() => (user ? setCurrentPage('markets') : setCurrentPage('login'))}
              className="text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All 50+ Pairs in Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE YIELD & PROFIT CALCULATOR */}
      <section className="max-w-5xl mx-auto px-3 sm:px-6">
        <div className="glass-panel rounded-2xl p-5 sm:p-8 border border-slate-700/60 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-100">
                Interactive Yield & Quantitative Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Simulate portfolio returns across staking, automated liquidity, and quantitative strategies.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-6">
            {/* Left Controls */}
            <div className="space-y-4">
              {/* Asset Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Select Digital Asset
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['BTC', 'ETH', 'SOL', 'USDT'].map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setCalcAsset(sym)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        calcAsset === sym
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                  <span>Investment Capital</span>
                  <span className="text-emerald-400 font-mono font-bold">${calcAmount.toLocaleString()} USD</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>$500</span>
                  <span>$25,000</span>
                  <span>$50,000</span>
                </div>
              </div>

              {/* Duration Tabs */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Holding Period
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { days: 30, label: '30 Days' },
                    { days: 90, label: '90 Days' },
                    { days: 180, label: '180 Days' },
                    { days: 365, label: '1 Year' },
                  ].map((d) => (
                    <button
                      key={d.days}
                      type="button"
                      onClick={() => setCalcDuration(d.days)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                        calcDuration === d.days
                          ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                          : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strategy Tier Tabs */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Strategy Yield Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'conservative', label: 'Staking (8.4%)' },
                    { id: 'balanced', label: 'Balanced (15.8%)' },
                    { id: 'quantitative', label: 'Quant (26.4%)' },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setCalcTier(tier.id as any)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                        calcTier === tier.id
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Output Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-[#070e1b] to-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Projected Return Summary
                </span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-slate-100 mt-2">
                  ${totalProjectedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Estimated total value after {calcDuration} days
                </div>

                <div className="space-y-3 mt-6 pt-4 border-t border-slate-800/80 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Initial Principal:</span>
                    <span className="font-mono font-bold text-slate-200">${calcAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Projected Net Yield:</span>
                    <span className="font-mono font-bold text-emerald-400">+${projectedProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Annualized APY:</span>
                    <span className="font-mono font-bold text-amber-400">{(apyRate * 100).toFixed(1)}% APY</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Compounding Frequency:</span>
                    <span className="text-slate-300">Daily Continuous</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                id="btn-calc-execute"
                onClick={handleStartTrading}
                className="w-full mt-6 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Deploy Strategy</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM ARCHITECTURAL PILLARS */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Engineered for Precision
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-100 mt-1">
            Built for Institutional Standards
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Every layer of Bit Trade Net is architected to guarantee deterministic order fill rates and uncompromised custody.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Sub-Millisecond Matching</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              C++ matching engine with in-memory order books capable of processing over 100,000 requests per second with zero thread contention.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Cold-Vault Custody</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              98.5% of assets remain in air-gapped multi-party computation (MPC) cold storage vaults with geographically distributed signing keys.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Aggregate Deep Liquidity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Consolidated liquidity across tier-1 OTC desks and institutional market makers guaranteeing tight spreads and minimal slippage.
            </p>
          </div>
        </div>
      </section>

      {/* 5. SECURITY & REGULATORY ACCREDITATIONS */}
      <section className="max-w-5xl mx-auto px-3 sm:px-6">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-700/60 shadow-xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Cryptographic Proof & Compliance</span>
          </div>

          <h3 className="text-xl sm:text-3xl font-black text-slate-100">
            Uncompromising Security Governance
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-emerald-400 font-bold text-sm">SOC 2 Type II</div>
              <p className="text-[11px] text-slate-400 mt-1">Audited data integrity and operational controls</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-sky-400 font-bold text-sm">100% Reserves</div>
              <p className="text-[11px] text-slate-400 mt-1">Cryptographic Merkle tree reserve attestations</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-amber-400 font-bold text-sm">AES-256 Vault</div>
              <p className="text-[11px] text-slate-400 mt-1">FIPS 140-2 Level 3 hardware security modules</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-purple-400 font-bold text-sm">Mandatory 2FA</div>
              <p className="text-[11px] text-slate-400 mt-1">Hardware FIDO2 & TOTP Authenticator enforcement</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-3 sm:px-6">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="glass-panel rounded-xl border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-100">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. BOTTOM CALL TO ACTION BANNER */}
      <section className="max-w-5xl mx-auto px-3 sm:px-6">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-emerald-500/40 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-sky-500/10 pointer-events-none" />
          
          <h2 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">
            Ready to Experience Next-Gen Trading?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Open an account in seconds. Access real-time execution, build institutional crypto portfolios, and discover advanced capabilities.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              id="btn-cta-start"
              onClick={handleStartTrading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer"
            >
              {user ? 'Return to Trading Terminal' : 'Get Started'}
            </button>
            {!user && (
              <button
                type="button"
                id="btn-cta-signin"
                onClick={() => setCurrentPage('login')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm transition-all active:scale-95 cursor-pointer"
              >
                Sign In to Account
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
