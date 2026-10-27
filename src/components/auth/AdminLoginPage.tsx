import React, { useState, useEffect } from 'react';
import { Lock, ArrowLeft, Shield, Eye, EyeOff, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import { getActiveAdminPin } from '../../App';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBack,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  // Countdown timer for brute force lockout
  useEffect(() => {
    if (lockoutUntil <= Date.now()) return;
    const interval = setInterval(() => {
      const diff = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (diff <= 0) {
        setLockoutUntil(0);
        setSecondsRemaining(0);
        setFailedAttempts(0);
        setPinError('');
      } else {
        setSecondsRemaining(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutUntil > Date.now()) {
      setPinError(`Akses diblokir sementara. Tunggu ${secondsRemaining} detik lagi.`);
      return;
    }

    const currentValidPin = getActiveAdminPin();

    if (pinInput.trim() === currentValidPin) {
      setPinInput('');
      setPinError('');
      setFailedAttempts(0);
      onLoginSuccess();
    } else {
      const nextFail = failedAttempts + 1;
      setFailedAttempts(nextFail);

      if (nextFail >= 5) {
        const lockTime = Date.now() + 180 * 1000; // 3 minutes lockout
        setLockoutUntil(lockTime);
        setSecondsRemaining(180);
        setPinError('Terlalu banyak percobaan salah (5x). Akses dikunci sementara selama 3 menit demi keamanan.');
      } else {
        setPinError(`PIN salah! Percobaan ${nextFail} dari 5.`);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-12 px-2 pb-28 md:pb-12">
      {/* Tombol Navigasi Kembali */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Kembali ke Portal Karyawan</span>
      </button>

      {/* Kartu Halaman Login Admin */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* Header Kartu */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto mb-3.5 shadow-sm border border-slate-800">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Verifikasi Akses Admin SHE
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Portal khusus Pengawas K3LH, Safety Officer, & Manajemen Operasional Tambang.
          </p>
        </div>

        {/* Form Verifikasi PIN */}
        <form onSubmit={handleVerifyPin} className="space-y-4">
          <div>
            <label htmlFor="adminPin" className="block text-xs font-bold text-slate-800 mb-1.5">
              Masukkan PIN Keamanan
            </label>
            <div className="relative">
              <input
                id="adminPin"
                type={showPin ? 'text' : 'password'}
                maxLength={6}
                value={pinInput}
                disabled={lockoutUntil > Date.now()}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                autoFocus
                placeholder="••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Pesan Kesalahan PIN */}
          {pinError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs text-center font-medium leading-relaxed flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{pinError}</span>
            </div>
          )}

          {/* Status Kunci Brute Force */}
          {lockoutUntil > Date.now() && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs text-center font-mono font-bold">
              Akses Terkunci: {secondsRemaining} detik tersisa
            </div>
          )}

          {/* Tombol Masuk */}
          <button
            type="submit"
            disabled={lockoutUntil > Date.now() || !pinInput.trim()}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Buka Portal Admin</span>
          </button>
        </form>

        {/* Informasi Keamanan Tambahan */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Sistem dilengkapi auto-logout setelah 30 menit tidak aktif demi keamanan data site pertambangan.
          </p>
        </div>
      </div>
    </div>
  );
};
