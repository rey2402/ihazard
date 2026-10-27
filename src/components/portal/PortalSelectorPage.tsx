import React, { useState } from 'react';
import { HardHat, ShieldCheck, ArrowRight } from 'lucide-react';

export interface PortalSelectorPageProps {
  onSelectRole: (role: 'karyawan' | 'admin', rememberPreference: boolean) => void;
}

export const PortalSelectorPage: React.FC<PortalSelectorPageProps> = ({ onSelectRole }) => {
  const [rememberPreference, setRememberPreference] = useState(true);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Header Ringkas & Terang */}
      <div className="max-w-3xl w-full mx-auto pt-6 sm:pt-10 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <img
            src="/logo_ihazard.png"
            alt="iHazard Logo"
            className="w-10 h-10 rounded-xl object-cover shadow-xs border border-slate-200"
          />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            iHazard<span className="text-amber-500">.</span>
          </h1>
        </div>

        <p className="text-sm sm:text-base font-semibold text-slate-500">
          Pilih Portal Masuk
        </p>
      </div>

      {/* Dua Kartu Pilihan Bersih & Terang */}
      <div className="max-w-3xl w-full mx-auto my-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Kartu 1: Karyawan */}
        <div className="bg-white border-2 border-slate-200 hover:border-amber-400 rounded-2xl p-5 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <HardHat className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                Akses Langsung
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Portal Karyawan Lapangan
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Lapor temuan kondisi/tindakan tidak aman dan pantau status tindak lanjut K3.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => onSelectRole('karyawan', rememberPreference)}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <span>Masuk ke Pelaporan Bahaya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Kartu 2: Admin SHE */}
        <div className="bg-white border-2 border-slate-200 hover:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                Terproteksi PIN
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Portal Pengawas & Admin SHE
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Validasi temuan bahaya, penugasan perbaikan PIC, dan statistik keselamatan kerja.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => onSelectRole('admin', rememberPreference)}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <span>Verifikasi Akses Admin</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Bersih */}
      <div className="max-w-md w-full mx-auto text-center pb-4">
        <label
          htmlFor="remember-pref"
          className="inline-flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer select-none"
        >
          <input
            id="remember-pref"
            type="checkbox"
            checked={rememberPreference}
            onChange={(e) => setRememberPreference(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 bg-white cursor-pointer"
          />
          <span>Ingat pilihan di perangkat ini</span>
        </label>
      </div>
    </div>
  );
};
