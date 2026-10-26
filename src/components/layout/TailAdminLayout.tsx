import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Award,
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

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Keselamatan Pertambangan';
      case 'weekly':
        return 'Form Laporan K3LH Mingguan (PPT)';
      case 'monthly':
        return 'Form Laporan K3LH Bulanan (PPT)';
      case 'hazard-form':
        return 'Form Pelaporan Hazard Baru';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F1F5F9] font-sans text-slate-800 antialiased selection:bg-amber-200 selection:text-amber-950">
      {/* ------------------------------------------------------------------ */}
      {/* SIDEBAR: Signature TailAdmin Deep Navy (#1C2434)                   */}
      {/* ------------------------------------------------------------------ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#1C2434] text-white duration-300 ease-linear lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 border-b border-[#2E3A47]">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => onTabChange('dashboard')}
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-wider text-white">SHE MINING</span>
              </div>
              <span className="text-[10px] text-[#8A99AD] font-medium tracking-wide uppercase block">
                TailAdmin Edition
              </span>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="block lg:hidden text-slate-400 hover:text-white"
            aria-label="Tutup menu sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear px-4 py-4">
          <nav className="space-y-6">
            {/* Group 1: MENU UTAMA */}
            <div>
              <h3 className="mb-2.5 ml-4 text-[11px] font-bold text-[#8A99AD] uppercase tracking-wider">
                MENU UTAMA
              </h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => {
                      onTabChange('dashboard');
                      setSidebarOpen(false);
                    }}
                    className={`group relative flex w-full items-center gap-3 rounded-sm py-2.5 px-4 font-medium duration-150 ease-in-out text-xs ${
                      activeTab === 'dashboard'
                        ? 'bg-[#333A48] text-white font-bold'
                        : 'text-[#DEE4EE] hover:bg-[#333A48]/50 hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-amber-400' : 'text-[#8A99AD]'}`} />
                    <span>Dashboard SHE</span>
                    <span className="ml-auto rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5">
                      Live
                    </span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => {
                      onTabChange('hazard-form');
                      setSidebarOpen(false);
                    }}
                    className={`group relative flex w-full items-center gap-3 rounded-sm py-2.5 px-4 font-medium duration-150 ease-in-out text-xs ${
                      activeTab === 'hazard-form'
                        ? 'bg-[#333A48] text-white font-bold'
                        : 'text-[#DEE4EE] hover:bg-[#333A48]/50 hover:text-white'
                    }`}
                  >
                    <AlertTriangle className={`w-4 h-4 ${activeTab === 'hazard-form' ? 'text-amber-400' : 'text-[#8A99AD]'}`} />
                    <span>Lapor Bahaya</span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => {
                      onTabChange('weekly');
                      setSidebarOpen(false);
                    }}
                    className={`group relative flex w-full items-center gap-3 rounded-sm py-2.5 px-4 font-medium duration-150 ease-in-out text-xs ${
                      activeTab === 'weekly'
                        ? 'bg-[#333A48] text-white font-bold'
                        : 'text-[#DEE4EE] hover:bg-[#333A48]/50 hover:text-white'
                    }`}
                  >
                    <Calendar className={`w-4 h-4 ${activeTab === 'weekly' ? 'text-amber-400' : 'text-[#8A99AD]'}`} />
                    <span>Laporan Mingguan</span>
                    <span className="ml-auto text-[10px] text-[#8A99AD] font-mono">PPT</span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => {
                      onTabChange('monthly');
                      setSidebarOpen(false);
                    }}
                    className={`group relative flex w-full items-center gap-3 rounded-sm py-2.5 px-4 font-medium duration-150 ease-in-out text-xs ${
                      activeTab === 'monthly'
                        ? 'bg-[#333A48] text-white font-bold'
                        : 'text-[#DEE4EE] hover:bg-[#333A48]/50 hover:text-white'
                    }`}
                  >
                    <Award className={`w-4 h-4 ${activeTab === 'monthly' ? 'text-amber-400' : 'text-[#8A99AD]'}`} />
                    <span>Laporan Bulanan</span>
                    <span className="ml-auto text-[10px] text-[#8A99AD] font-mono">PPT</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Group 2: EKSPOR & DATA */}
            <div>
              <h3 className="mb-2.5 ml-4 text-[11px] font-bold text-[#8A99AD] uppercase tracking-wider">
                EKSPOR & INTEGRASI
              </h3>
              <ul className="space-y-1">
                {onQuickExportExcel && (
                  <li>
                    <button
                      onClick={() => {
                        onQuickExportExcel();
                        setSidebarOpen(false);
                      }}
                      className="group relative flex w-full items-center gap-3 rounded-sm py-2.5 px-4 font-medium text-xs text-[#DEE4EE] hover:bg-[#333A48]/50 hover:text-white transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span>Export Excel (.xlsx)</span>
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
                      className="group relative flex w-full items-center gap-3 rounded-sm py-2.5 px-4 font-medium text-xs text-[#DEE4EE] hover:bg-[#333A48]/50 hover:text-white transition-colors"
                    >
                      <Cloud className="w-4 h-4 text-blue-400" />
                      <span>Google Sheets Sync</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Group 3: AKSES PORTAL */}
            <div>
              <h3 className="mb-2.5 ml-4 text-[11px] font-bold text-[#8A99AD] uppercase tracking-wider">
                AKSES PENGGUNA
              </h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={onSwitchToWorker}
                    className="group relative flex w-full items-center gap-3 rounded-sm py-2.5 px-4 font-medium text-xs text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-emerald-400" />
                    <span>Lihat Tampilan Karyawan</span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div className="mt-auto p-4 border-t border-[#2E3A47]">
          <div className="flex items-center gap-2 text-[10px] text-[#8A99AD]">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>Kepmen ESDM 1827.K/2018</span>
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
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="block lg:hidden rounded-sm border border-[#E2E8F0] bg-white p-1.5 shadow-xs hover:bg-slate-50 text-slate-600"
                aria-label="Toggle menu"
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

            {/* Right: Status Pill & User Profile */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Online telemetry indicator */}
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Site Ops Online</span>
              </div>

              {/* User Profile Chip (TailAdmin style) */}
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center shadow-xs">
                  SO
                </div>
                <div className="hidden text-left sm:block">
                  <span className="block text-xs font-bold text-slate-900">SHE Officer</span>
                  <span className="block text-[10px] text-slate-500 font-medium">Admin K3LH Site</span>
                </div>
                <button
                  onClick={onSwitchToWorker}
                  title="Kembali ke tampilan karyawan"
                  className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-emerald-700 transition-colors ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Lihat Tampilan Karyawan</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Canvas (TailAdmin #F1F5F9) */}
        <main className="p-4 sm:p-6 md:p-8 flex-1">
          {/* Breadcrumbs & Title */}
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {getBreadcrumbTitle()}
              </h2>
              <nav className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <span className="hover:text-slate-800 cursor-pointer" onClick={() => onTabChange('dashboard')}>
                  SHE Portal
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-amber-600 font-semibold">{activeTab.toUpperCase()}</span>
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
