import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  CryptoAsset, 
  User, 
  Transaction, 
  Order, 
  ActiveSession, 
  ActivityLog, 
  NavPage, 
  ToastMessage,
  AppTheme,
  KYCDocument,
  TodoTask,
  UserRole
} from '../types';
import { 
  INITIAL_USER, 
  INITIAL_CRYPTO_ASSETS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_ORDERS, 
  INITIAL_SESSIONS, 
  INITIAL_LOGS,
  INITIAL_TASKS
} from '../data/mockData';
import { 
  auth, 
  googleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  onAuthStateChanged,
  formatAuthError,
  FirebaseUser
} from '../lib/firebase';
import { deleteFileFromFirebaseStorage } from '../lib/storage';

interface TradingContextType {
  user: User | null;
  authLoading: boolean;
  currentPage: NavPage;
  setCurrentPage: (page: NavPage) => void;
  assets: CryptoAsset[];
  selectedAsset: CryptoAsset;
  setSelectedAsset: (asset: CryptoAsset) => void;
  holdings: Record<string, number>;
  cashBalanceUSD: number;
  watchlist: string[];
  toggleWatchlist: (symbol: string) => void;
  orders: Order[];
  transactions: Transaction[];
  sessions: ActiveSession[];
  activityLogs: ActivityLog[];
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  executeTrade: (params: {
    type: 'BUY' | 'SELL';
    orderType: 'MARKET' | 'LIMIT';
    symbol: string;
    amount: number;
    price: number;
  }) => Promise<{ success: boolean; message: string }>;
  cancelOrder: (orderId: string) => void;
  executeDeposit: (symbol: string, amount: number, network: string, receiptUrl?: string) => Promise<boolean>;
  executeWithdraw: (symbol: string, amount: number, address: string, network: string) => Promise<boolean>;
  uploadKYCDocument: (doc: { category: 'Passport' | 'National ID' | 'Driver License' | 'Proof of Address'; fileName: string; fileSize: number; downloadUrl: string; storagePath: string }) => void;
  removeKYCDocument: (docId: string, storagePath: string) => Promise<void>;
  updateUserAvatar: (avatarUrl: string) => Promise<void>;
  investmentNoticeOpen: boolean;
  setInvestmentNoticeOpen: (open: boolean) => void;
  attemptedWithdrawalAmount: number;
  attemptedWithdrawalAddress: string;
  showInvestmentNotice: (amount?: number, address?: string) => void;
  login: (email: string, password?: string, role?: UserRole) => Promise<boolean>;
  loginAsRole: (role: UserRole) => Promise<void>;
  setUserRole: (role: UserRole) => void;
  register: (name: string, email: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUserPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  terminateSession: (sessionId: string) => void;
  updateUser: (updates: Partial<User>) => void;
  totalPortfolioValue: number;
  todayPnL: { value: number; percent: number };
  recentPriceChanges: Record<string, 'up' | 'down'>;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  updateTransactionStatus: (txId: string, status: 'COMPLETED' | 'PENDING' | 'FAILED') => void;
  adjustUserBalance: (amountUSD: number, reason: string) => void;
  addAuditLog: (action: string, status?: 'SUCCESS' | 'WARNING' | 'FAILED', details?: string) => void;
  loginAdmin: () => Promise<void>;
  tasks: TodoTask[];
  addTask: (task: Omit<TodoTask, 'id' | 'createdAt' | 'completed'> & { completed?: boolean }) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<TodoTask>) => void;
  quickTaskModalOpen: boolean;
  setQuickTaskModalOpen: (open: boolean) => void;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<NavPage>('home');
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('bittrade_theme');
      if (saved === 'true-black' || saved === 'dim') return saved;
    } catch {
      // ignore
    }
    return 'dim';
  });

  const mapFirebaseUser = (firebaseUser: FirebaseUser): User => {
    let cachedDocs: KYCDocument[] = [];
    try {
      const saved = localStorage.getItem(`bittrade_kyc_${firebaseUser.uid}`);
      if (saved) cachedDocs = JSON.parse(saved);
    } catch {
      // ignore
    }

    let userRole: UserRole = 'admin';
    try {
      const savedRole = localStorage.getItem(`bittrade_role_${firebaseUser.uid}`);
      if (savedRole === 'admin' || savedRole === 'moderator' || savedRole === 'viewer' || savedRole === 'user') {
        userRole = savedRole;
      }
    } catch {
      // ignore
    }

    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Institutional Trader'),
      email: firebaseUser.email || 'trader@bittrade.net',
      kycTier: cachedDocs.length > 0 ? 'Tier 2 Verified' : 'Tier 1',
      twoFactorEnabled: true,
      securityAlertsEnabled: true,
      loginAlertsEnabled: true,
      avatarUrl: firebaseUser.photoURL || undefined,
      joinedDate: firebaseUser.metadata?.creationTime
        ? new Date(firebaseUser.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'March 2024',
      role: userRole,
      status: 'active',
      kycDocuments: cachedDocs,
    };
  };

  // Sync Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(mapFirebaseUser(firebaseUser));
        setCurrentPage((prev) => (['login', 'register', 'forgot-password'].includes(prev) ? 'dashboard' : prev));
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Synchronize theme class on HTML document root for universal styling
  useEffect(() => {
    try {
      localStorage.setItem('bittrade_theme', theme);
    } catch {
      // ignore
    }

    const root = document.documentElement;
    if (theme === 'true-black') {
      root.classList.add('theme-true-black');
      root.classList.remove('theme-dim');
    } else {
      root.classList.add('theme-dim');
      root.classList.remove('theme-true-black');
    }
  }, [theme]);
  const [assets, setAssets] = useState<CryptoAsset[]>(INITIAL_CRYPTO_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>(INITIAL_CRYPTO_ASSETS[0]);
  const [recentPriceChanges, setRecentPriceChanges] = useState<Record<string, 'up' | 'down'>>({});
  
  // Holdings
  const [holdings, setHoldings] = useState<Record<string, number>>({
    BTC: 0.28,
    ETH: 3.4,
    SOL: 35.0,
    XRP: 1800.0,
    USDT: 12450.0,
    BNB: 2.5,
    AVAX: 40.0,
  });
  
  const [cashBalanceUSD, setCashBalanceUSD] = useState<number>(47986.00);
  const [investmentNoticeOpen, setInvestmentNoticeOpen] = useState<boolean>(false);
  const [attemptedWithdrawalAmount, setAttemptedWithdrawalAmount] = useState<number>(47986.00);
  const [attemptedWithdrawalAddress, setAttemptedWithdrawalAddress] = useState<string>('');

  const showInvestmentNotice = (amount?: number, address?: string) => {
    if (amount !== undefined) setAttemptedWithdrawalAmount(amount);
    if (address !== undefined) setAttemptedWithdrawalAddress(address);
    setInvestmentNoticeOpen(true);
    addToast({
      type: 'warning',
      title: 'Investment Rules Compliance Notice',
      message: '$5,960.00 has to be paid before the available balance can be withdrawn, to meet with the investment rules.',
      duration: 8000,
    });
  };
  const [watchlist, setWatchlist] = useState<string[]>(['BTC', 'ETH', 'SOL', 'XRP']);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [sessions, setSessions] = useState<ActiveSession[]>(INITIAL_SESSIONS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  const [toasts, setToasts] = useState<ToastMessage[]>([
    {
      id: 'toast_welcome',
      type: 'info',
      title: 'Gateway Active',
      message: 'Bit Trade Net institutional trading session connected.',
      duration: 4000,
    }
  ]);

  // Toast Helper
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));

    const duration = toast.duration || 4500;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Quick Add Task Modal state & Tasks list (TodoList functionality)
  const [quickTaskModalOpen, setQuickTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState<TodoTask[]>(() => {
    try {
      const saved = localStorage.getItem('bittrade_tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_TASKS;
  });

  // Save tasks to localStorage for persistence
  useEffect(() => {
    try {
      localStorage.setItem('bittrade_tasks', JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  const addTask = (taskData: Omit<TodoTask, 'id' | 'createdAt' | 'completed'> & { completed?: boolean }) => {
    const newTask: TodoTask = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      completed: taskData.completed || false,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setTasks((prev) => [newTask, ...prev]);
    addToast({
      type: 'success',
      title: 'Task Created',
      message: `"${newTask.title}" added to your task list.`,
      duration: 3500,
    });
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          addToast({
            type: nextCompleted ? 'success' : 'info',
            title: nextCompleted ? 'Task Completed' : 'Task Reopened',
            message: `"${t.title}" marked as ${nextCompleted ? 'done' : 'active'}.`,
            duration: 2500,
          });
          return { ...t, completed: nextCompleted };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      if (target) {
        addToast({
          type: 'info',
          title: 'Task Removed',
          message: `"${target.title}" was removed.`,
          duration: 2500,
        });
      }
      return prev.filter((t) => t.id !== id);
    });
  };

  const updateTask = (id: string, updates: Partial<TodoTask>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  // Watchlist toggle
  const toggleWatchlist = (symbol: string) => {
    setWatchlist((prev) => {
      const isStarred = prev.includes(symbol);
      const next = isStarred ? prev.filter((s) => s !== symbol) : [...prev, symbol];
      addToast({
        type: 'info',
        title: isStarred ? 'Removed from Watchlist' : 'Added to Watchlist',
        message: `${symbol} ${isStarred ? 'removed from' : 'added to'} your monitored assets.`,
        duration: 2500,
      });
      return next;
    });
  };

  // Realistic micro price simulator: every 3.5 seconds, subtly update 1 or 2 assets
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets((prevAssets) => {
        const randomIndex = Math.floor(Math.random() * prevAssets.length);
        const asset = prevAssets[randomIndex];
        if (!asset || asset.symbol === 'USDT') return prevAssets;

        // ±0.04% to ±0.25% tick
        const pctChange = (Math.random() * 0.4 - 0.18) / 100;
        const newPrice = Math.max(0.0001, Number((asset.price * (1 + pctChange)).toFixed(asset.price > 10 ? 2 : 4)));
        const direction = newPrice >= asset.price ? 'up' : 'down';

        setRecentPriceChanges((prev) => ({ ...prev, [asset.symbol]: direction }));

        // Clear direction highlight after 1.2 seconds
        setTimeout(() => {
          setRecentPriceChanges((prev) => {
            const next = { ...prev };
            delete next[asset.symbol];
            return next;
          });
        }, 1200);

        const updatedAsset: CryptoAsset = {
          ...asset,
          price: newPrice,
          change24h: Number((asset.change24h + pctChange * 10).toFixed(2)),
          high24h: Math.max(asset.high24h, newPrice),
          low24h: Math.min(asset.low24h, newPrice),
        };

        const nextAssets = [...prevAssets];
        nextAssets[randomIndex] = updatedAsset;
        return nextAssets;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Update selectedAsset if its live price updates
  useEffect(() => {
    const current = assets.find((a) => a.symbol === selectedAsset.symbol);
    if (current && current.price !== selectedAsset.price) {
      setSelectedAsset(current);
    }
  }, [assets, selectedAsset.symbol]);

  // Compute total portfolio value
  const totalPortfolioValue = useMemo(() => {
    let cryptoValue = 0;
    Object.entries(holdings).forEach(([symbol, qty]) => {
      const quantity = Number(qty) || 0;
      const asset = assets.find((a) => a.symbol === symbol);
      if (asset) {
        cryptoValue += quantity * asset.price;
      }
    });
    return Number((cashBalanceUSD + cryptoValue).toFixed(2));
  }, [assets, holdings, cashBalanceUSD]);

  // Today PnL calculation
  const todayPnL = useMemo(() => {
    // Weighted avg gain based on assets
    let gain = 0;
    Object.entries(holdings).forEach(([symbol, qty]) => {
      const quantity = Number(qty) || 0;
      const asset = assets.find((a) => a.symbol === symbol);
      if (asset) {
        const val = quantity * asset.price;
        gain += val * (asset.change24h / 100);
      }
    });
    const percent = totalPortfolioValue > 0 ? (gain / totalPortfolioValue) * 100 : 0;
    return {
      value: Number(gain.toFixed(2)),
      percent: Number(percent.toFixed(2)),
    };
  }, [assets, holdings, totalPortfolioValue]);

  // Execute Trade function
  const executeTrade = async (params: {
    type: 'BUY' | 'SELL';
    orderType: 'MARKET' | 'LIMIT';
    symbol: string;
    amount: number;
    price: number;
  }): Promise<{ success: boolean; message: string }> => {
    const { type, orderType, symbol, amount, price } = params;
    const total = amount * price;
    const fee = Number((total * 0.001).toFixed(2)); // 0.1% fee
    const grandTotal = type === 'BUY' ? total + fee : total - fee;

    if (amount <= 0 || price <= 0) {
      addToast({
        type: 'error',
        title: 'Invalid Order Parameters',
        message: 'Amount and price must be greater than zero.',
      });
      return { success: false, message: 'Invalid parameters' };
    }

    if (type === 'BUY') {
      if (cashBalanceUSD < grandTotal) {
        addToast({
          type: 'error',
          title: 'Insufficient Funds',
          message: `Required: $${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}. Available: $${cashBalanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        });
        return { success: false, message: 'Insufficient USD balance' };
      }

      // Deduct cash, add crypto
      setCashBalanceUSD((prev) => Number((prev - grandTotal).toFixed(2)));
      setHoldings((prev) => ({
        ...prev,
        [symbol]: Number(((prev[symbol] || 0) + amount).toFixed(6)),
      }));
    } else {
      // SELL
      const currentHolding = holdings[symbol] || 0;
      if (currentHolding < amount) {
        addToast({
          type: 'error',
          title: 'Insufficient Asset Balance',
          message: `You hold ${currentHolding} ${symbol}, but attempted to sell ${amount} ${symbol}.`,
        });
        return { success: false, message: 'Insufficient asset balance' };
      }

      // Deduct crypto, add cash
      setHoldings((prev) => ({
        ...prev,
        [symbol]: Number((prev[symbol] - amount).toFixed(6)),
      }));
      setCashBalanceUSD((prev) => Number((prev + grandTotal).toFixed(2)));
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      type,
      assetSymbol: symbol,
      assetName: assets.find((a) => a.symbol === symbol)?.name || symbol,
      amount,
      price,
      total,
      fee,
      status: 'COMPLETED',
      timestamp,
      txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    };

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      type,
      orderType,
      symbol,
      price,
      amount,
      total,
      filled: amount,
      status: 'FILLED',
      timestamp,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setOrders((prev) => [newOrder, ...prev]);

    addToast({
      type: 'success',
      title: `${type === 'BUY' ? 'Buy' : 'Sell'} Order Executed`,
      message: `Successfully executed ${amount} ${symbol} at $${price.toLocaleString()} ($${total.toLocaleString()})`,
    });

    return { success: true, message: 'Order filled successfully' };
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o))
    );
    addToast({
      type: 'info',
      title: 'Order Cancelled',
      message: `Order #${orderId} was cancelled.`,
    });
  };

  // Deposit execution with Firebase Storage receipt integration
  const executeDeposit = async (
    symbol: string, 
    amount: number, 
    network: string, 
    receiptUrl?: string
  ): Promise<boolean> => {
    if (amount <= 0) return false;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (symbol === 'USDT') {
      setCashBalanceUSD((prev) => Number((prev + amount).toFixed(2)));
    } else {
      setHoldings((prev) => ({
        ...prev,
        [symbol]: Number(((prev[symbol] || 0) + amount).toFixed(6)),
      }));
    }

    const asset = assets.find((a) => a.symbol === symbol);
    const price = asset?.price || 1;
    const newTx: Transaction = {
      id: `tx_dep_${Date.now()}`,
      type: 'DEPOSIT',
      assetSymbol: symbol,
      assetName: asset?.name || symbol,
      amount,
      price,
      total: amount * price,
      fee: 0,
      status: 'COMPLETED',
      timestamp,
      txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      network,
      receiptUrl,
    };

    setTransactions((prev) => [newTx, ...prev]);
    addToast({
      type: 'success',
      title: 'Deposit Confirmed',
      message: `Credited ${amount} ${symbol} via ${network}. Transaction finalized on ledger.${receiptUrl ? ' Receipt stored in Firebase Storage.' : ''}`,
    });
    return true;
  };

  // Upload and persist KYC Document in Firebase Storage
  const uploadKYCDocument = (docData: {
    category: 'Passport' | 'National ID' | 'Driver License' | 'Proof of Address';
    fileName: string;
    fileSize: number;
    downloadUrl: string;
    storagePath: string;
  }) => {
    const newDoc: KYCDocument = {
      id: `kyc_${Date.now()}`,
      category: docData.category,
      fileName: docData.fileName,
      fileSize: docData.fileSize,
      downloadUrl: docData.downloadUrl,
      storagePath: docData.storagePath,
      uploadedAt: new Date().toISOString(),
      status: 'VERIFIED',
    };

    setUser((prev) => {
      if (!prev) return null;
      const currentDocs = prev.kycDocuments || [];
      const updatedDocs = [newDoc, ...currentDocs];
      try {
        localStorage.setItem(`bittrade_kyc_${prev.id}`, JSON.stringify(updatedDocs));
      } catch {
        // ignore
      }
      return {
        ...prev,
        kycTier: 'Tier 2 Verified',
        kycDocuments: updatedDocs,
      };
    });

    addToast({
      type: 'success',
      title: 'KYC Document Saved',
      message: `${docData.category} safely saved in Firebase Storage. Tier 2 verification active.`,
    });
    addAuditLog(`Uploaded KYC verification document (${docData.category}: ${docData.fileName}) to Firebase Storage`, 'SUCCESS');
  };

  // Remove KYC Document from Firebase Storage
  const removeKYCDocument = async (docId: string, storagePath: string) => {
    try {
      await deleteFileFromFirebaseStorage(storagePath);
    } catch (err) {
      console.warn('Could not delete from storage:', err);
    }
    setUser((prev) => {
      if (!prev) return null;
      const filtered = (prev.kycDocuments || []).filter((d) => d.id !== docId);
      try {
        localStorage.setItem(`bittrade_kyc_${prev.id}`, JSON.stringify(filtered));
      } catch {
        // ignore
      }
      return {
        ...prev,
        kycDocuments: filtered,
      };
    });
    addToast({
      type: 'info',
      title: 'Document Removed',
      message: 'KYC document removed from Firebase Storage.',
    });
  };

  // Update User Profile Photo in Firebase Storage
  const updateUserAvatar = async (avatarUrl: string) => {
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { photoURL: avatarUrl });
      } catch (err) {
        console.warn('Could not update Firebase photoURL:', err);
      }
    }
    setUser((prev) => (prev ? { ...prev, avatarUrl } : null));
    addToast({
      type: 'success',
      title: 'Avatar Updated',
      message: 'Profile picture saved to Firebase Storage.',
    });
  };

  // Withdraw simulation with investment rule verification
  const executeWithdraw = async (
    symbol: string,
    amount: number,
    address: string,
    network: string
  ): Promise<boolean> => {
    if (amount <= 0) {
      addToast({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid withdrawal amount.',
      });
      return false;
    }
    if (!address || !address.trim()) {
      addToast({
        type: 'error',
        title: 'Wallet Address Required',
        message: 'Please provide a valid destination wallet address.',
      });
      return false;
    }

    setAttemptedWithdrawalAmount(amount);
    setAttemptedWithdrawalAddress(address);

    // Simulate blockchain node authorization check
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Per user specification:
    // Regardless of amount try to withdraw, once withdraw is being processed
    // it pops out a notification that says that $5,960.00 has to be paid before the available balance can be withdrawn, to meet with the investment rules.
    setInvestmentNoticeOpen(true);
    addToast({
      type: 'warning',
      title: 'Investment Rules Compliance Notice',
      message: '$5,960.00 has to be paid before the available balance can be withdrawn, to meet with the investment rules.',
      duration: 8000,
    });

    return false;
  };

  // Authentication via Firebase Auth with optional Role / Rule claim assignment
  const login = async (email: string, password?: string, role?: UserRole): Promise<boolean> => {
    try {
      if (!password) {
        addToast({
          type: 'error',
          title: 'Password Required',
          message: 'Please enter your password to sign in.',
        });
        return false;
      }

      let appUser: User;
      const targetRole: UserRole = role || 'admin';

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        appUser = mapFirebaseUser(userCredential.user);
        appUser = { ...appUser, role: targetRole };
      } catch (authError: any) {
        // If the user doesn't exist yet, attempt automatic creation in Firebase Auth
        if (
          authError?.code === 'auth/user-not-found' ||
          authError?.code === 'auth/invalid-credential'
        ) {
          try {
            const createCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
            appUser = {
              ...mapFirebaseUser(createCredential.user),
              role: targetRole,
              name: email.split('@')[0] ? email.split('@')[0].replace(/[._]/g, ' ') : 'Trader',
            };
          } catch {
            // Gracefully fall back to rule session
            appUser = {
              ...INITIAL_USER,
              id: `usr_${targetRole}_${Date.now().toString(36)}`,
              name: email.split('@')[0] ? email.split('@')[0].replace(/[._]/g, ' ') : 'Trader',
              email: email.trim(),
              role: targetRole,
              status: 'active',
            };
          }
        } else {
          // If offline or network issues, allow login with the requested rule
          appUser = {
            ...INITIAL_USER,
            id: `usr_${targetRole}_${Date.now().toString(36)}`,
            name: email.split('@')[0] ? email.split('@')[0].replace(/[._]/g, ' ') : 'Trader',
            email: email.trim(),
            role: targetRole,
            status: 'active',
          };
        }
      }

      try {
        localStorage.setItem(`bittrade_role_${appUser.id}`, targetRole);
      } catch {
        // ignore
      }

      setUser(appUser);
      setCurrentPage('dashboard');
      addToast({
        type: 'success',
        title: `Welcome, ${appUser.name}`,
        message: `Signed in as ${appUser.email} with ${targetRole.toUpperCase()} Security Rule.`,
        duration: 4500,
      });
      addAuditLog(`User signed in with ${targetRole.toUpperCase()} rule`, 'SUCCESS');
      return true;
    } catch (error: unknown) {
      const message = formatAuthError(error);
      addToast({
        type: 'error',
        title: 'Authentication Notice',
        message,
        duration: 6500,
      });
      return false;
    }
  };

  const register = async (name: string, email: string, password?: string): Promise<boolean> => {
    try {
      if (!password) {
        addToast({
          type: 'error',
          title: 'Password Required',
          message: 'Please provide a password for registration.',
        });
        return false;
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name.trim()) {
        try {
          await updateProfile(userCredential.user, { displayName: name.trim() });
        } catch (err) {
          console.warn('Could not set displayName during register:', err);
        }
      }
      const appUser: User = {
        ...mapFirebaseUser(userCredential.user),
        name: name.trim() || userCredential.user.displayName || 'Trader',
      };
      setUser(appUser);
      setCurrentPage('dashboard');
      addToast({
        type: 'success',
        title: 'Account Created with Firebase',
        message: `Welcome to Bit Trade Net, ${appUser.name}! Your Firebase account is now active.`,
      });
      return true;
    } catch (error: unknown) {
      const message = formatAuthError(error);
      addToast({
        type: 'error',
        title: 'Registration Failed',
        message,
        duration: 6500,
      });
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await signInWithPopup(auth, googleAuthProvider);
      const appUser = mapFirebaseUser(userCredential.user);
      setUser(appUser);
      setCurrentPage('dashboard');
      addToast({
        type: 'success',
        title: `Welcome, ${appUser.name}`,
        message: `Signed in via Google Authentication as ${appUser.email}.`,
      });
      return { success: true };
    } catch (error: unknown) {
      const message = formatAuthError(error);
      addToast({
        type: 'error',
        title: 'Google Sign-In Failed',
        message,
        duration: 6500,
      });
      return { success: false, error: message };
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      addToast({
        type: 'success',
        title: 'Password Reset Email Sent',
        message: `Firebase has dispatched recovery instructions to ${email.trim()}.`,
        duration: 7000,
      });
      return { success: true };
    } catch (error: unknown) {
      const message = formatAuthError(error);
      addToast({
        type: 'error',
        title: 'Reset Request Failed',
        message,
        duration: 6500,
      });
      return { success: false, error: message };
    }
  };

  const updateUserPassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!auth.currentUser) {
        throw new Error('No authenticated user session found.');
      }
      await updatePassword(auth.currentUser, newPassword);
      addToast({
        type: 'success',
        title: 'Password Updated',
        message: 'Your Firebase account password was successfully updated.',
      });
      return { success: true };
    } catch (error: unknown) {
      const message = formatAuthError(error);
      addToast({
        type: 'error',
        title: 'Password Update Failed',
        message,
        duration: 6500,
      });
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setUser(null);
      setCurrentPage('home');
      addToast({
        type: 'info',
        title: 'Logged Out',
        message: 'You have been securely signed out of Firebase Authentication.',
      });
    }
  };

  const updateTransactionStatus = (txId: string, newStatus: 'COMPLETED' | 'PENDING' | 'FAILED') => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: newStatus } : t))
    );
    addToast({
      type: newStatus === 'COMPLETED' ? 'success' : newStatus === 'FAILED' ? 'error' : 'info',
      title: 'Transaction Status Updated',
      message: `Transaction #${txId.slice(-8)} is now marked as ${newStatus}.`,
    });
    addAuditLog(`Transaction #${txId.slice(-8)} status set to ${newStatus}`, 'SUCCESS');
  };

  const adjustUserBalance = (amountUSD: number, reason: string) => {
    setCashBalanceUSD((prev) => {
      const next = Math.max(0, Number((prev + amountUSD).toFixed(2)));
      return next;
    });
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newTx: Transaction = {
      id: `tx_adj_${Date.now()}`,
      type: amountUSD >= 0 ? 'DEPOSIT' : 'WITHDRAW',
      assetSymbol: 'USDT',
      assetName: 'Admin Balance Adjustment',
      amount: Math.abs(amountUSD),
      price: 1,
      total: Math.abs(amountUSD),
      fee: 0,
      status: 'COMPLETED',
      timestamp,
      txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      note: reason,
    };
    setTransactions((prev) => [newTx, ...prev]);
    addToast({
      type: amountUSD >= 0 ? 'success' : 'warning',
      title: 'Balance Adjusted',
      message: `${amountUSD >= 0 ? 'Credited' : 'Debited'} $${Math.abs(amountUSD).toLocaleString()} USD.`,
    });
    addAuditLog(`Adjusted user balance by $${amountUSD} (${reason})`, 'SUCCESS');
  };

  const addAuditLog = (action: string, status: 'SUCCESS' | 'WARNING' | 'FAILED' = 'SUCCESS', details?: string) => {
    const newLog: ActivityLog = {
      id: `log_admin_${Date.now()}`,
      action,
      ip: '198.51.100.24',
      location: 'Internal Operations (Admin Console)',
      device: 'Admin Console (Web)',
      timestamp: 'Just now',
      status,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const loginAdmin = async () => {
    setUser({
      ...INITIAL_USER,
      role: 'admin',
      status: 'active',
    });
    setCurrentPage('dashboard');
    addToast({
      type: 'success',
      title: 'Session Active',
      message: `Signed in as ${INITIAL_USER.name} with Administrator Privileges.`,
    });
  };

  const loginAsRole = async (role: UserRole) => {
    const roleProfiles: Record<UserRole, { name: string; email: string; tier: 'Tier 1' | 'Tier 2 Verified' | 'Institutional' }> = {
      admin: { name: 'Joshua James Bergin (Admin)', email: 'admin@bittrade.net', tier: 'Institutional' },
      moderator: { name: 'Alex Vance (Risk Ops)', email: 'moderator@bittrade.net', tier: 'Tier 2 Verified' },
      viewer: { name: 'Institutional Auditor', email: 'auditor@bittrade.net', tier: 'Tier 2 Verified' },
      user: { name: 'Standard Trader', email: 'trader@bittrade.net', tier: 'Tier 1' },
    };

    const profile = roleProfiles[role];
    const newUser: User = {
      ...INITIAL_USER,
      id: `usr_${role}_${Date.now().toString(36)}`,
      name: profile.name,
      email: profile.email,
      role,
      kycTier: profile.tier,
      status: 'active',
    };

    try {
      localStorage.setItem(`bittrade_role_${newUser.id}`, role);
    } catch {
      // ignore
    }

    setUser(newUser);
    setCurrentPage('dashboard');

    const descriptions: Record<UserRole, string> = {
      admin: 'Full Admin rule: read, create, update, delete across all collections.',
      moderator: 'Staff rule: inspect all users, transactions, and audit queues.',
      viewer: 'Viewer rule: read-only access across platform documents.',
      user: 'Standard user rule: strict isolation to own documents only.',
    };

    addToast({
      type: 'success',
      title: `Signed in with ${role.toUpperCase()} Rule`,
      message: descriptions[role],
      duration: 5000,
    });
    addAuditLog(`Signed in with security rule: ${role.toUpperCase()}`, 'SUCCESS');
  };

  const setUserRole = (role: UserRole) => {
    setUser((prev) => {
      if (!prev) return null;
      try {
        localStorage.setItem(`bittrade_role_${prev.id}`, role);
      } catch {
        // ignore
      }
      return { ...prev, role };
    });
    addToast({
      type: 'info',
      title: 'Security Role Switched',
      message: `Active session now enforcing rule: ${role.toUpperCase()} custom claim.`,
      duration: 3500,
    });
    addAuditLog(`Switched active security rule to ${role.toUpperCase()}`, 'WARNING');
  };

  const terminateSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    addToast({
      type: 'info',
      title: 'Session Revoked',
      message: 'The remote session was immediately terminated.',
    });
  };

  const updateUser = async (updates: Partial<User>) => {
    if (updates.name && auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: updates.name });
      } catch (err) {
        console.warn('Could not update Firebase displayName:', err);
      }
    }
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Your profile and security preferences were updated.',
    });
  };

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    addToast({
      type: 'info',
      title: 'Display Theme Updated',
      message: newTheme === 'true-black'
        ? 'True Black OLED mode enabled (pure #000000 blacks, high contrast).'
        : 'Dim theme enabled (default midnight blue & slate palette).',
      duration: 3500,
    });
  };

  return (
    <TradingContext.Provider
      value={{
        user,
        authLoading,
        currentPage,
        setCurrentPage,
        theme,
        setTheme,
        assets,
        selectedAsset,
        setSelectedAsset,
        holdings,
        cashBalanceUSD,
        watchlist,
        toggleWatchlist,
        orders,
        transactions,
        sessions,
        activityLogs,
        toasts,
        addToast,
        removeToast,
        executeTrade,
        cancelOrder,
        executeDeposit,
        executeWithdraw,
        uploadKYCDocument,
        removeKYCDocument,
        updateUserAvatar,
        investmentNoticeOpen,
        setInvestmentNoticeOpen,
        attemptedWithdrawalAmount,
        attemptedWithdrawalAddress,
        showInvestmentNotice,
        login,
        register,
        loginWithGoogle,
        sendPasswordReset,
        updateUserPassword,
        logout,
        terminateSession,
        updateUser,
        totalPortfolioValue,
        todayPnL,
        recentPriceChanges,
        updateTransactionStatus,
        adjustUserBalance,
        addAuditLog,
        loginAdmin,
        loginAsRole,
        setUserRole,
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        updateTask,
        quickTaskModalOpen,
        setQuickTaskModalOpen,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
