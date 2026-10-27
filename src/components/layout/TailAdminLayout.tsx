import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  AlertTriangle,
  HardHat,
  Menu,
  X,
  FileSpreadsheet,
  Cloud,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Search,
  Pin,
  PinOff,
} from 'lucide-react';

interface TailAdminLayoutProps {
  activeTab: 'dashboard' | 'weekly' | 'monthly' | 'hazard-form';
  onTabChange: (tab: 'dashboard' | 'weekly' | 'monthly' | 'hazard-form') => void;
  onSwitchToWorker: () => void;
  onQuickExportExcel?: () => void;
  onOpenWebhookModal?: () => void;
  children: React.ReactNode;
}

export const TailAdminLayout: React.FC<TailAdminLayoutProps> = ({
  activeTab,
  onTabChange,
  onSwitchToWorker,
  onQuickExportExcel,
  onOpenWebhookModal,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    try {
      return localStorage.getItem('ihazard_sidebar_pinned') === 'true';
    } catch {
      return false;
    }
  });

  const togglePin = () => {
    setIsPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ihazard_sidebar_pinned', String(next));
      } catch {}
      return next;
    });
  };

  const isExpanded = isPinned || isHovered;

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Keselamatan Pertambangan';
      case 'weekly':
        return 'Laporan Keselamatan Mingguan';
      case 'monthly':
        return 'Laporan Keselamatan Bulanan';
      case 'hazard-form':
        return 'Lapor Temuan Bahaya Baru';
      default:
        return 'Dashboard Keselamatan';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] font-sans text-slate-800 antialiased selection:bg-amber-200 selection:text-amber-950">
      {/* ------------------------------------------------------------------ */}
      {/* SIDEBAR: Modern Humanized Slate with Auto Hover & Pin              */}
      {/* ------------------------------------------------------------------ */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#1C2434] text-white transition-[width,transform] duration-300 ease-in-out lg:static lg:translate-x-0 overflow-x-hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isExpanded ? 'w-64' : 'w-64 lg:w-[72px]'}`}
      >
        {/* Sidebar Header / Logo */}
        <div className="flex items-center justify-between gap-2 px-4 py-5 border-b border-[#2E3A47] shrink-0 h-18">
          <div
            className="flex items-center gap-3 cursor-pointer select-none overflow-hidden"
            onClick={() => onTabChange('dashboard')}
            title="iHazard SHE - Sistem Keselamatan Tambang"
          >
            <img
              src="/logo_ihazard.png"
              alt="iHazard Logo"
              className="w-9 h-9 rounded-xl object-cover shadow-sm border border-slate-700/80 shrink-0"
            />
            <div
              className={`transition-all duration-200 overflow-hidden whitespace-nowrap ${
                isExpanded ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0 lg:hidden'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white">iHazard</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  SHE
                </span>
              </div>
              <span className="text-[11px] text-[#8A99AD] font-medium block truncate">
                Sistem Keselamatan Tambang
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Desktop Pin Toggle */}
            <button
              onClick={togglePin}
              className={`hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-[#2E3A47] transition-all cursor-pointer ${
                !isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
              title={
                isPinned
                  ? 'Lepas pin (tutup otomatis saat kursor keluar)'
                  : 'Kunci menu agar selalu terbuka'
              }
              aria-label="Pin sidebar"
            >
              {isPinned ? (
                <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
              ) : (
                <PinOff className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="block lg:hidden text-slate-400 hover:text-white p-1"
              aria-label="Tutup menu sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear px-3 py-4">
          <nav className="space-y-6">
            {/* Group 1: Menu Utama */}
            <div>
              {isExpanded ? (
                <h3 className="mb-2.5 ml-3.5 text-[11px] font-semibold text-[#8A99AD] tracking-wider uppercase transition-opacity duration-200">
                  Menu Utama
                </h3>
              ) : (
                <div className="my-2 border-t border-[#2E3A47] mx-1 hidden lg:block" title="Menu Utama" />
              )}
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => {
                      onTabChange('dashboard');
                      setSidebarOpen(false);
                    }}
                    title="Dashboard SHE"
                    className={`group relative flex w-full items-center rounded-xl py-2.5 duration-150 ease-in-out text-xs font-semibold cursor-pointer transition-all ${
                      isExpanded ? 'px-3.5 gap-3 justify-start' : 'px-0 justify-center'
                    } ${
                      activeTab === 'dashboard'
                        ? 'bg-[#333A48] text-white shadow-xs'
                        : 'text-[#DEE4EE] hover:bg-[#333A48]/50 hover:text-white'
                    }`}
                  >
                    <LayoutDashboard
                      className={`w-4 h-4 shrink-0 ${activeTab === 'dashboard' ? 'text-amber-400' : 'text-[#8A99AD]'}`}
                    />
                    <span
                      className={`transition-all duration-200 whitespace-nowrap overflow-hidden ${
                        isExpanded ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0 lg:hidden'
                      }`}
                    >
                      Dashboard SHE
                    </span>
                    {isExpanded ? (
                      <span className="ml-auto rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 whitespace-nowrap">
                        Aktif
                      </span>
                    ) : (
                      <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400 hidden lg:block" />
                    )}
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => {
                      onTabChange('hazard-form');
                      setSidebarOpen(false);
                    }}
                    title="Lapor Bahaya"
                    className={`group relative flex w-full items-center rounded-xl py-2.5 duration-150 ease-in-out text-xs font-semibold cursor-pointer transition-all ${
                      isExpanded ? 'px-3.5 gap-3 justify-start' : 'px-0 justify-center'
                    } ${
                      activeTab === 'hazard-form'
                        ? 'bg-[#333A48] text-white shadow-xs'
                        : 'text-[#DEE4EE] hover:bg-[#333A48]/50 hover:text-white'
                    }`}
                  >
                    <AlertTriangle
                      className={`w-4 h-4 shrink-0 ${activeTab === 'hazard-form' ? 'text-amber-400' : 'text-[#8A99AD]'}`}
                    />
                    <span
                      className={`transition-all duration-200 whitespace-nowrap overflow-hidden ${
                        isExpanded ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0 lg:hidden'
                      }`}
                    >
                      Lapor Bahaya
                    </span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => {
                      onTabChange('weekly');
                      setSidebarOpen(false);
                    }}
                    title="Laporan Mingguan"
                    className={`group relative flex w-full items-center rounded-xl py-2.5 duration-150 ease-in-out text-xs font-semibold cursor-pointer transition-all ${
                      isExpanded ? 'px-3.5 gap-3 justify-start' : 'px-0 justify-center'
                    } ${
                      activeTab === 'weekly'
                        ? 'bg-[#333A48] text-white shadow-xs'
                        : 'text-[#DEE4EE] hover:bg-[#333A48]/50 hover:text-white'
                    }`}
                  >
                    <Calendar
                      className={`w-4 h-4 shrink-0 ${activeTab === 'weekly' ? 'text-amber-400' : 'text-[#8A99AD]'}`}
                    />
                    <span
                      className={`transition-all duration-200 whitespace-nowrap overflow-hidden ${
                        isExpanded ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0 lg:hidden'
                      }`}
                    >
                      Laporan Mingguan
                    </span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => {
                      onTabChange('monthly');
                      setSidebarOpen(false);
                    }}
                    title="Laporan Bulanan"
                    className={`group relative flex w-full items-center rounded-xl py-2.5 duration-150 ease-in-out text-xs font-semibold cursor-pointer transition-all ${
                      isExpanded ? 'px-3.5 gap-3 justify-start' : 'px-0 justify-center'
                    } ${
                      activeTab === 'monthly'
                        ? 'bg-[#333A48] text-white shadow-xs'
                        : 'text-[#DEE4EE] hover:bg-[#333A48]/50 hover:text-white'
                    }`}
                  >
                    <BarChart3
                      className={`w-4 h-4 shrink-0 ${activeTab === 'monthly' ? 'text-amber-400' : 'text-[#8A99AD]'}`}
                    />
                    <span
                      className={`transition-all duration-200 whitespace-nowrap overflow-hidden ${
                        isExpanded ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0 lg:hidden'
                      }`}
                    >
                      Laporan Bulanan
                    </span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Group 2: Ekspor dan Integrasi */}
            <div>
              {isExpanded ? (
                <h3 className="mb-2.5 ml-3.5 text-[11px] font-semibold text-[#8A99AD] tracking-wider uppercase transition-opacity duration-200">
                  Ekspor dan Data
                </h3>
              ) : (
                <div className="my-2 border-t border-[#2E3A47] mx-1 hidden lg:block" title="Ekspor dan Data" />
              )}
              <ul className="space-y-1">
                {onQuickExportExcel && (
                  <li>
                    <button
                      onClick={() => {
                        onQuickExportExcel();
                        setSidebarOpen(false);
                      }}
                      title="Unduh Laporan Excel"
                      className={`group relative flex w-full items-center rounded-xl py-2.5 duration-150 ease-in-out text-xs font-semibold cursor-pointer transition-all ${
                        isExpanded ? 'px-3.5 gap-3 justify-start' : 'px-0 justify-center'
                      } text-[#DEE4EE] hover:bg-[#333A48]/50 hover:text-white`}
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span
                        className={`transition-all duration-200 whitespace-nowrap overflow-hidden ${
                          isExpanded ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0 lg:hidden'
                        }`}
                      >
                        Unduh Laporan Excel
                      </span>
                    </button>
                  </li>
                )}

                {onOpenWebhookModal && (
                  <li>
                    <button
                      onClick={() => {
                        onOpenWebhookModal();
                        setSidebarOpen(false);
                      }}
                      title="Sinkronisasi Google Sheets"
                      className={`group relative flex w-full items-center rounded-xl py-2.5 duration-150 ease-in-out text-xs font-semibold cursor-pointer transition-all ${
                        isExpanded ? 'px-3.5 gap-3 justify-start' : 'px-0 justify-center'
                      } text-[#DEE4EE] hover:bg-[#333A48]/50 hover:text-white`}
                    >
                      <Cloud className="w-4 h-4 text-blue-400 shrink-0" />
                      <span
                        className={`transition-all duration-200 whitespace-nowrap overflow-hidden ${
                          isExpanded ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0 lg:hidden'
                        }`}
                      >
                        Sinkronisasi Google Sheets
                      </span>
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Group 3: Akses Portal */}
            <div>
              {isExpanded ? (
                <h3 className="mb-2.5 ml-3.5 text-[11px] font-semibold text-[#8A99AD] tracking-wider uppercase transition-opacity duration-200">
                  Akses Pengguna
                </h3>
              ) : (
                <div className="my-2 border-t border-[#2E3A47] mx-1 hidden lg:block" title="Akses Pengguna" />
              )}
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={onSwitchToWorker}
                    title="Lihat Tampilan Karyawan"
                    className={`group relative flex w-full items-center rounded-xl py-2.5 duration-150 ease-in-out text-xs font-semibold cursor-pointer transition-all ${
                      isExpanded ? 'px-3.5 gap-3 justify-start' : 'px-0 justify-center'
                    } text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300`}
                  >
                    <LogOut className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span
                      className={`transition-all duration-200 whitespace-nowrap overflow-hidden ${
                        isExpanded ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0 lg:hidden'
                      }`}
                    >
                      Lihat Tampilan Karyawan
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div className="mt-auto p-4 border-t border-[#2E3A47] shrink-0">
          <div
            className={`flex items-center text-[11px] text-[#8A99AD] overflow-hidden ${
              isExpanded ? 'gap-2 justify-start' : 'justify-center'
            }`}
            title="Standar Keselamatan Kerja"
          >
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
            <span
              className={`transition-all duration-200 whitespace-nowrap overflow-hidden ${
                isExpanded ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0 lg:hidden'
              }`}
            >
              Standar Keselamatan Kerja
            </span>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MAIN VIEWPORT: Header + Content Canvas                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Top Header (TailAdmin Crisp White Header) */}
        <header className="sticky top-0 z-30 flex w-full bg-white border-b border-[#E2E8F0] shadow-xs">
          <div className="flex flex-grow items-center justify-between py-3.5 px-4 sm:px-6 md:px-8">
            {/* Left: Hamburger & Global Search */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setSidebarOpen(!sidebarOpen);
                  } else {
                    togglePin();
                  }
                }}
                className="rounded-lg border border-[#E2E8F0] bg-white p-1.5 shadow-xs hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                aria-label="Toggle menu"
                title={isPinned ? 'Lepas pin sidebar' : 'Kunci/Buka sidebar'}
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="hidden sm:block">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari data K3LH, tiket, area pit..."
                    className="w-64 md:w-80 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 rounded-lg border border-slate-200 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Right: User Profile & Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* User Profile Chip */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center shadow-xs">
                  SO
                </div>
                <div className="hidden text-left sm:block">
                  <span className="block text-xs font-bold text-slate-900">SHE Officer</span>
                  <span className="block text-[11px] text-slate-500 font-medium">Pengawas K3LH Tambang</span>
                </div>
                <button
                  onClick={onSwitchToWorker}
                  title="Kembali ke tampilan karyawan lapangan"
                  className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors ml-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Lihat Tampilan Karyawan</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="p-4 sm:p-6 md:p-8 flex-1">
          {/* Breadcrumbs & Title */}
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {getBreadcrumbTitle()}
              </h2>
              <nav className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span className="hover:text-slate-800 cursor-pointer" onClick={() => onTabChange('dashboard')}>
                  Portal SHE
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-amber-600 font-semibold">
                  {activeTab === 'dashboard'
                    ? 'Ringkasan Utama'
                    : activeTab === 'weekly'
                    ? 'Laporan Mingguan'
                    : activeTab === 'monthly'
                    ? 'Laporan Bulanan'
                    : 'Lapor Bahaya'}
                </span>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
};
