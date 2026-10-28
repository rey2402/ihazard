import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  UserCheck,
  Calendar,
  BarChart3,
  Lock,
  LogOut,
  ArrowLeftRight,
  ShieldCheck,
  Cloud,
} from 'lucide-react';

export type ActiveNavTab = 'dashboard' | 'hazard-form' | 'tracker' | 'weekly' | 'monthly';

interface UnifiedAppLayoutProps {
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
  role: 'karyawan' | 'admin';
  onSwitchToWorker: () => void;
  onAdminLoginRequest: () => void;
  onSwitchToSelector: () => void;
  children: React.ReactNode;
}

export const UnifiedAppLayout: React.FC<UnifiedAppLayoutProps> = ({
  activeTab,
  onTabChange,
  role,
  onSwitchToWorker,
  onAdminLoginRequest,
  onSwitchToSelector,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans antialiased selection:bg-amber-200 selection:text-amber-950 w-full max-w-full overflow-x-hidden">
      {/* ------------------------------------------------------------------ */}
      {/* 1. TOPBAR: Sleek, Modern, Unified Hub Header                       */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          
          {/* Brand & Portal Selector Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              onClick={() => onTabChange(role === 'admin' ? 'dashboard' : 'hazard-form')}
              className="flex items-center gap-2 cursor-pointer group select-none"
              title="iHazard - Sistem Keselamatan Pertambangan"
            >
              <img
                src="/logo_ihazard.png"
                alt="iHazard Logo"
                className="w-7 h-7 rounded-lg object-cover border border-slate-200 group-hover:scale-105 transition-transform"
              />
              <span className="text-base font-extrabold tracking-tight text-slate-900">
                iHazard<span className="text-amber-500">.</span>
              </span>
            </div>

            {/* Quick Switch Portal */}
            <button
              onClick={onSwitchToSelector}
              title="Ganti Portal Masuk"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600" />
              <span>Ganti Portal</span>
            </button>
          </div>

          {/* Center Navigation Tabs (Desktop) - Guaranteed 1-Line Mendatar */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60 shrink-0">
            {/* Dashboard SHE (Admin Only) */}
            {role === 'admin' && (
              <button
                onClick={() => onTabChange('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <LayoutDashboard className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'dashboard' ? 'text-amber-600' : 'text-slate-400'}`} />
                <span className="whitespace-nowrap">Dashboard SHE</span>
              </button>
            )}

            {/* Lapor Bahaya */}
            <button
              onClick={() => onTabChange('hazard-form')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'hazard-form'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'hazard-form' ? 'text-slate-950' : 'text-amber-600'}`} />
              <span className="whitespace-nowrap">Lapor Bahaya</span>
            </button>

            {/* Status Laporan Saya */}
            <button
              onClick={() => onTabChange('tracker')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'tracker'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <UserCheck className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'tracker' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="whitespace-nowrap">Status Laporan</span>
            </button>

            {/* Laporan Mingguan & Bulanan (Admin Only - Terkunci) */}
            {role === 'admin' && (
              <>
                <button
                  type="button"
                  disabled
                  title="Fitur Terkunci (Paket Laporan Standard)"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 text-slate-400 opacity-40 cursor-not-allowed select-none"
                >
                  <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="whitespace-nowrap">Laporan Mingguan</span>
                </button>

                <button
                  type="button"
                  disabled
                  title="Fitur Terkunci (Paket Laporan Standard)"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 text-slate-400 opacity-40 cursor-not-allowed select-none"
                >
                  <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="whitespace-nowrap">Laporan Bulanan</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action: Role Switcher / Admin Status */}
          <div className="flex items-center gap-2.5 shrink-0">
            {role === 'admin' ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onSwitchToWorker}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  title="Kembali ke portal karyawan biasa"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Lihat Tampilan Karyawan</span>
                  <span className="sm:hidden">Karyawan</span>
                </button>

                <div className="flex items-center gap-1.5 pl-2.5 border-l border-slate-200">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-[11px] shadow-2xs">
                    SO
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-slate-700 whitespace-nowrap">
                    SHE Officer
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={onAdminLoginRequest}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              >
                <Lock className="w-3.5 h-3.5 text-slate-950" />
                <span>Masuk Mode Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* 2. MAIN WORKSPACE CANVAS: Expansive, Breathable, Full-Width        */}
      {/* ------------------------------------------------------------------ */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 min-w-0">
        {children}
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* 3. MOBILE FLOATING BOTTOM NAVIGATION HUB (md:hidden)               */}
      {/* ------------------------------------------------------------------ */}
      <nav aria-label="Navigasi Bawah Seluler" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around shadow-lg">
        {role === 'admin' ? (
          <>
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex flex-col items-center gap-0.5 text-[10px] py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'dashboard' ? 'text-amber-600 font-bold bg-amber-50/80' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onTabChange('hazard-form')}
              className={`flex flex-col items-center gap-0.5 text-[10px] py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'hazard-form' ? 'text-amber-600 font-bold bg-amber-50/80' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Lapor</span>
            </button>

            <button
              onClick={() => onTabChange('tracker')}
              className={`flex flex-col items-center gap-0.5 text-[10px] py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'tracker' ? 'text-amber-600 font-bold bg-amber-50/80' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Status</span>
            </button>

            <button
              type="button"
              disabled
              title="Fitur Terkunci (Paket Laporan Standard)"
              className="flex flex-col items-center gap-0.5 text-[10px] py-1 px-2.5 rounded-lg text-slate-400 opacity-40 cursor-not-allowed select-none"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Mingguan</span>
            </button>

            <button
              type="button"
              disabled
              title="Fitur Terkunci (Paket Laporan Standard)"
              className="flex flex-col items-center gap-0.5 text-[10px] py-1 px-2.5 rounded-lg text-slate-400 opacity-40 cursor-not-allowed select-none"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Bulanan</span>
            </button>

            <button
              onClick={onSwitchToWorker}
              className="flex flex-col items-center gap-0.5 text-[10px] py-1 px-2.5 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Karyawan</span>
            </button>
          </>
        ) : (
          <>
            <button
              id="mobile-tab-report"
              onClick={() => onTabChange('hazard-form')}
              className={`flex flex-col items-center gap-0.5 text-[10px] py-1 px-3 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'hazard-form' ? 'text-amber-600 font-bold bg-amber-50/80' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Lapor Bahaya</span>
            </button>

            <button
              id="mobile-tab-tracker"
              onClick={() => onTabChange('tracker')}
              className={`flex flex-col items-center gap-0.5 text-[10px] py-1 px-3 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'tracker' ? 'text-amber-600 font-bold bg-amber-50/80' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Status Laporan</span>
            </button>

            <button
              id="mobile-tab-admin-login"
              onClick={onAdminLoginRequest}
              className="flex flex-col items-center gap-0.5 text-[10px] py-1 px-3 rounded-lg text-amber-700 hover:text-amber-800 font-bold transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Login Admin</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
};
