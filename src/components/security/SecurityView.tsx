import React, { useState, useRef } from 'react';
import { useTrading } from '../../context/TradingContext';
import { Modal } from '../ui/Modal';
import { FileUpload } from '../ui/FileUpload';
import { 
  Shield, 
  ShieldCheck,
  ShieldAlert,
  KeyRound, 
  Smartphone, 
  Laptop, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  LogOut, 
  Bell, 
  Check, 
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  MailCheck,
  Moon,
  Sparkles,
  Palette,
  FileText,
  Trash2,
  ExternalLink,
  Camera,
  UploadCloud,
  FolderCheck,
  FileCheck2
} from 'lucide-react';

export const SecurityView: React.FC = () => {
  const { 
    user, 
    sessions, 
    activityLogs, 
    terminateSession, 
    updateUser, 
    updateUserPassword,
    uploadKYCDocument,
    removeKYCDocument,
    updateUserAvatar,
    addAuditLog,
    addToast,
    theme,
    setTheme
  } = useTrading();

  // 2FA Setup Modal State
  const [twoFAModalOpen, setTwoFAModalOpen] = useState(false);
  const [totpInput, setTotpInput] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  // KYC Document Upload State
  const [selectedCategory, setSelectedCategory] = useState<'Passport' | 'National ID' | 'Driver License' | 'Proof of Address'>('Passport');
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  // Password Form State
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const totpSecret = 'JBSWY3DPEHPK3PXP';
  const is2FAActive = Boolean(user?.twoFactorEnabled);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(totpSecret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
    addToast({
      type: 'info',
      title: 'Secret Key Copied',
      message: 'Authenticator secret copied to clipboard.',
    });
  };

  const handleToggleSwitch2FA = () => {
    if (is2FAActive) {
      updateUser({ twoFactorEnabled: false });
      addAuditLog('Two-factor authentication disabled by user', 'WARNING');
      addToast({
        type: 'warning',
        title: '2FA Protection Disabled',
        message: 'Account protection is now lowered. Two-factor verification has been deactivated.',
      });
    } else {
      updateUser({ twoFactorEnabled: true });
      addAuditLog('Two-factor authentication enabled (Account Protection active)', 'SUCCESS');
      addToast({
        type: 'success',
        title: '2FA Protection Enabled',
        message: 'Account protection active! All withdrawals and critical actions now require TOTP authorization.',
      });
    }
  };

  const handleVerify2FASetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpInput.length < 6) {
      addToast({
        type: 'error',
        title: 'Invalid Code',
        message: 'Please enter a valid 6-digit authenticator passcode.',
      });
      return;
    }
    updateUser({ twoFactorEnabled: true });
    addAuditLog('Two-factor authentication verified & activated via TOTP token', 'SUCCESS');
    setTwoFAModalOpen(false);
    setTotpInput('');
    addToast({
      type: 'success',
      title: '2FA Protection Activated',
      message: 'Google Authenticator / TOTP protection is now fully active for this account.',
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPassword || !newPassword || !confirmPassword) {
      addToast({
        type: 'error',
        title: 'Missing Fields',
        message: 'Please fill in all password fields.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast({
        type: 'error',
        title: 'Passwords Mismatch',
        message: 'New password and confirmation do not match.',
      });
      return;
    }
    if (newPassword.length < 6) {
      addToast({
        type: 'error',
        title: 'Weak Password',
        message: 'Firebase passwords must contain at least 6 characters.',
      });
      return;
    }

    setPassLoading(true);
    try {
      const res = await updateUserPassword(newPassword);
      if (res.success) {
        setCurrPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-4 sm:p-6 border border-slate-700/60 shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-4">
          {/* Avatar with Firebase Storage Upload Overlay */}
          <div className="relative group shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xl overflow-hidden shadow-md">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{user?.name?.charAt(0)?.toUpperCase() || 'T'}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowAvatarUpload(true)}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow transition-all cursor-pointer"
              title="Upload Profile Picture (Firebase Storage)"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
                {user?.name || 'Settings & Security'}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold transition-colors ${
                is2FAActive
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                  : 'bg-amber-950/80 border-amber-500/40 text-amber-400'
              }`}>
                {is2FAActive ? 'HARDENED VAULT' : 'SHIELD INACTIVE'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {user?.email} &bull; Member since {user?.joinedDate || 'March 2024'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 self-start sm:self-auto text-xs">
          <Shield className={`w-4 h-4 ${is2FAActive ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="text-slate-300 font-semibold">
            Security Score: <strong className={is2FAActive ? 'text-emerald-400' : 'text-amber-400'}>{is2FAActive ? '98/100' : '70/100'}</strong>
          </span>
        </div>
      </div>

      {/* Display & Theme Appearance Card (OLED Optimization Toggle) */}
      <div id="settings-theme-card" className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-700/60 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              theme === 'true-black'
                ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-400'
                : 'bg-sky-500/15 border border-sky-500/30 text-sky-400'
            }`}>
              {theme === 'true-black' ? <Sparkles className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-100">
                  Display Theme & Appearance
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                  theme === 'true-black'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {theme === 'true-black' ? 'OLED True Black' : 'Dim Default'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Switch between the default midnight Dim theme and True Black engineered for zero pixel emission on OLED displays.
              </p>
            </div>
          </div>

          {/* Quick Pill Segmented Switch */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              id="btn-theme-dim"
              onClick={() => setTheme('dim')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                theme === 'dim'
                  ? 'bg-slate-800 text-slate-100 shadow border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-sky-400" />
              <span>Dim</span>
            </button>
            <button
              type="button"
              id="btn-theme-true-black"
              onClick={() => setTheme('true-black')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                theme === 'true-black'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>True Black</span>
            </button>
          </div>
        </div>

        {/* Visual Interactive Theme Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
          {/* Option 1: Dim Theme (Default) */}
          <div
            id="card-theme-dim"
            onClick={() => setTheme('dim')}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden ${
              theme === 'dim'
                ? 'border-emerald-500/80 bg-slate-900/70 shadow-lg shadow-emerald-500/10'
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-100">Dim</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    Default
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Deep midnight blue/slate palette (<span className="font-mono text-slate-300">#060a12</span>) with subtle dark card layering and atmospheric depth.
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                theme === 'dim'
                  ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                  : 'border-slate-700 bg-slate-800/60'
              }`}>
                {theme === 'dim' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>

            {/* Visual Swatch Preview */}
            <div className="mt-3 p-2 rounded-lg bg-[#060a12] border border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#060a12] border border-slate-600 shadow-inner" />
                <span className="text-slate-300">Canvas #060a12</span>
              </div>
              <span className="text-sky-400">Midnight Slate</span>
            </div>
          </div>

          {/* Option 2: True Black Theme (OLED) */}
          <div
            id="card-theme-true-black"
            onClick={() => setTheme('true-black')}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden ${
              theme === 'true-black'
                ? 'border-emerald-500/80 bg-black shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/40'
                : 'border-slate-800 bg-black/60 hover:border-slate-700 hover:bg-black/90'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-100">True Black</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    OLED Ready
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pure pitch black (<span className="font-mono text-slate-300">#000000</span>) surfaces. Turns individual OLED pixels completely off for maximum contrast and battery conservation.
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                theme === 'true-black'
                  ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                  : 'border-slate-700 bg-slate-800/60'
              }`}>
                {theme === 'true-black' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>

            {/* Visual Swatch Preview */}
            <div className="mt-3 p-2 rounded-lg bg-black border border-neutral-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-black border border-neutral-600 shadow-inner" />
                <span className="text-emerald-400 font-bold">Canvas #000000</span>
              </div>
              <span className="text-emerald-400 font-semibold">Zero Pixel Emission</span>
            </div>
          </div>
        </div>

        {/* OLED Technical Callout Banner */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
          <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-200">OLED Display Advantage:</strong> On OLED and AMOLED screens, pixels displaying <code className="text-emerald-400 font-mono">#000000</code> emit zero photons and consume zero display current, providing infinite black levels and extending mobile battery longevity.
          </span>
        </div>
      </div>

      {/* Grid: 2FA Card + Password Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Card 1: Two-Factor Authentication */}
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-700/60 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Header with Title and Toggle Switch */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                  is2FAActive 
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                }`}>
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                    <span>Two-Factor Authentication (2FA)</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    TOTP Authenticator (Google Authenticator, Authy, 1Password)
                  </p>
                </div>
              </div>

              {/* Accessible 2FA Toggle Switch */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  role="switch"
                  id="toggle-switch-2fa"
                  aria-checked={is2FAActive}
                  aria-label="Toggle Two-Factor Authentication"
                  onClick={handleToggleSwitch2FA}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                    is2FAActive 
                      ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.35)]' 
                      : 'bg-slate-700/80 hover:bg-slate-700'
                  }`}
                >
                  <span className="sr-only">Enable or disable two-factor authentication</span>
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                      is2FAActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  >
                    {is2FAActive ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                    )}
                  </span>
                </button>
                <span className={`text-xs font-black uppercase tracking-wider hidden sm:inline-block ${
                  is2FAActive ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {is2FAActive ? 'ACTIVE' : 'OFF'}
                </span>
              </div>
            </div>

            {/* Simulated Account Protection Status Logic */}
            {is2FAActive ? (
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Account Protection Shield: ACTIVE</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-extrabold text-emerald-400 uppercase">
                    Max Security
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Cryptographic second-factor validation (RFC 6238) is actively guarding your digital account.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Withdrawal Gate: <strong className="text-white">Protected</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Credential Shield: <strong className="text-white">Active</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Account Protection Shield: DISABLED</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-[10px] font-extrabold text-rose-400 uppercase">
                    Vulnerable
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Your funds are protected by password alone. In the event of credential leakage, withdrawals could be authorized without hardware verification.
                </p>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Toggle the switch above to simulate real-time account shielding.</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400 font-mono">
              Algorithm: TOTP-HMAC-SHA1
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-configure-2fa"
                onClick={() => setTwoFAModalOpen(true)}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer text-center"
              >
                {is2FAActive ? 'View QR / Secret Key' : 'Configure Authenticator App'}
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Password Management */}
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-700/60 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                Password Management
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Update account master access credentials
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-3 mt-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Current Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={currPassword}
                onChange={(e) => setCurrPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Hide' : 'Show'} passwords</span>
              </button>

              <button
                type="submit"
                disabled={passLoading}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {passLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Account Verification & Notifications Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Verification Status */}
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <MailCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-100">
              Identity & Verification Status
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div>
                <span className="font-bold text-slate-200">Email Verification</span>
                <p className="text-[11px] text-slate-400">{user?.email}</p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div>
                <span className="font-bold text-slate-200">KYC Verification Tier</span>
                <p className="text-[11px] text-slate-400">Daily withdrawal limit: $500,000 USD</p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                <CheckCircle2 className="w-3 h-3" />
                <span>{user?.kycTier || 'Tier 2'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Security Notifications Preferences */}
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-100">
              Security Notification Preferences
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div>
                <span className="font-bold text-slate-200">New Login Alerts</span>
                <p className="text-[11px] text-slate-400">Notify immediately when signing in from an unknown device</p>
              </div>
              <input
                type="checkbox"
                checked={user?.loginAlertsEnabled}
                onChange={(e) => updateUser({ loginAlertsEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div>
                <span className="font-bold text-slate-200">Withdrawal Confirmations</span>
                <p className="text-[11px] text-slate-400">Dispatch cryptographic email codes on large ledger transfers</p>
              </div>
              <input
                type="checkbox"
                checked={user?.securityAlertsEnabled}
                onChange={(e) => updateUser({ securityAlertsEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Firebase Storage Document Vault & Identity Verification */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-700/60 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <FolderCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-100">
                  Document Verification & Storage Vault
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Firebase Storage Connected
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload identity verification documents (Passport, National ID, Driver's License, Utility Bill) directly to your secure Firebase Storage bucket (<code className="text-emerald-400 font-mono">yewoapp-906a5.firebasestorage.app</code>).
              </p>
            </div>
          </div>
        </div>

        {/* Document Category Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Select Document Classification to Upload
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Passport', 'National ID', 'Driver License', 'Proof of Address'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-left flex items-center justify-between cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{cat}</span>
                {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Component */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <FileUpload
            userId={user?.id || 'anonymous'}
            folder="kyc"
            label={`Upload ${selectedCategory} Document`}
            helperText="Accepted formats: PNG, JPG, WEBP, PDF (Max 10MB). Stored securely on Firebase."
            onUploadSuccess={(res) => {
              uploadKYCDocument({
                category: selectedCategory,
                fileName: res.fileName,
                fileSize: res.fileSize,
                downloadUrl: res.downloadUrl,
                storagePath: res.storagePath,
              });
            }}
          />
        </div>

        {/* Uploaded Documents List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Verified Documents in Firebase Storage ({user?.kycDocuments?.length || 0})
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Bucket: yewoapp-906a5.firebasestorage.app
            </span>
          </div>

          {user?.kycDocuments && user.kycDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {user.kycDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-100 truncate max-w-[140px]">
                          {doc.fileName}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {doc.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {(doc.fileSize / 1024).toFixed(1)} KB &bull; {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={doc.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                      title="Open file from Firebase Storage"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => removeKYCDocument(doc.id, doc.storagePath)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete from Firebase Storage"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-1">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-400">
                No identity documents uploaded yet
              </p>
              <p className="text-[11px] text-slate-500">
                Upload your Passport or Driver's License above to verify Tier 2 limits and store in Firebase.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="glass-panel rounded-2xl border border-slate-700/60 shadow-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100">
              Active Authorized Sessions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Devices currently holding authenticated tokens for your account
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-800/60 text-xs">
          {sessions.map((ses) => (
            <div key={ses.id} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                  {ses.device.includes('iPhone') ? <Smartphone className="w-4 h-4 text-emerald-400" /> : <Laptop className="w-4 h-4 text-sky-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">{ses.device}</span>
                    {ses.isCurrent && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        Current Session
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {ses.browser} &bull; <span className="font-mono">{ses.ip}</span> ({ses.location})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="text-[11px] text-slate-400 font-mono">
                  {ses.lastActive}
                </span>
                {!ses.isCurrent && (
                  <button
                    type="button"
                    onClick={() => terminateSession(ses.id)}
                    className="px-3 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 text-[11px] font-semibold border border-rose-500/30 transition-colors cursor-pointer"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login Activity Audit Log */}
      <div className="glass-panel rounded-2xl border border-slate-700/60 shadow-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800">
          <h3 className="text-sm sm:text-base font-bold text-slate-100">
            Security & Login Activity Audit Log
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographic timestamped log of authorization events
          </p>
        </div>

        {/* Mobile Native Card View (<sm) */}
        <div className="sm:hidden divide-y divide-slate-800/60">
          {activityLogs.map((log) => (
            <div key={log.id} className="p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-200">
                  {log.action}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  log.status === 'SUCCESS'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {log.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{log.device}</span>
                <span className="font-mono text-slate-300">{log.ip}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>{log.location}</span>
                <span>{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View (sm+) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/40">
                <th className="py-3 px-4">Event / Action</th>
                <th className="py-3 px-4">Device & Client</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activityLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-200">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {log.device}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {log.ip}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {log.location}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      log.status === 'SUCCESS'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2FA Configuration Modal */}
      <Modal
        isOpen={twoFAModalOpen}
        onClose={() => setTwoFAModalOpen(false)}
        title="Set Up Authenticator App"
        subtitle="Pair Google Authenticator or 1Password with Bit Trade Net"
        maxWidth="sm"
      >
        <form onSubmit={handleVerify2FASetup} className="space-y-4 text-center">
          {/* QR Code */}
          <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <rect width="100" height="100" fill="#ffffff" />
              <rect x="10" y="10" width="25" height="25" fill="#060a12" />
              <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
              <rect x="65" y="10" width="25" height="25" fill="#060a12" />
              <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
              <rect x="10" y="65" width="25" height="25" fill="#060a12" />
              <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
              <circle cx="50" cy="50" r="10" fill="#10B981" />
            </svg>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center justify-between">
            <span>{totpSecret}</span>
            <button
              type="button"
              onClick={handleCopyKey}
              className="p-1 text-slate-300 hover:text-slate-100 cursor-pointer"
            >
              {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 text-left">
              Enter 6-Digit TOTP Code (e.g. 582910)
            </label>
            <input
              type="text"
              maxLength={6}
              value={totpInput}
              onChange={(e) => setTotpInput(e.target.value)}
              placeholder="582910"
              required
              className="glass-input w-full px-3.5 py-2.5 rounded-xl text-center text-lg font-mono tracking-widest font-bold"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            Verify & Activate 2FA
          </button>
        </form>
      </Modal>

      {/* Avatar Upload Modal */}
      <Modal
        isOpen={showAvatarUpload}
        onClose={() => setShowAvatarUpload(false)}
        title="Update Profile Picture"
        subtitle="Upload your custom trader avatar to Firebase Storage"
        maxWidth="md"
      >
        <div className="space-y-4">
          <FileUpload
            userId={user?.id || 'anonymous'}
            folder="avatars"
            label="Select Avatar Image"
            allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
            helperText="Supported formats: PNG, JPG, WEBP (Max 5MB)"
            onUploadSuccess={(res) => {
              updateUserAvatar(res.downloadUrl);
              setShowAvatarUpload(false);
            }}
          />
        </div>
      </Modal>
    </div>
  );
};
