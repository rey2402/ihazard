import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  LayoutDashboard,
  Calendar,
  BarChart3,
  HardHat,
  Lock,
  LogOut,
  UserCheck,
  KeyRound,
  Eye,
} from 'lucide-react';
import { HazardReportForm } from './components/hazard/HazardReportForm';
import { SHEAdminDashboard } from './components/dashboard/SHEAdminDashboard';
import { WeeklyEntryForm } from './components/she/WeeklyEntryForm';
import { MonthlyEntryForm } from './components/she/MonthlyEntryForm';
import { WorkerTracker } from './components/worker/WorkerTracker';
import { downloadWeeklyPPT, downloadMonthlyPPT } from './services/pptx-engine';
import { WeeklySHEReport, MonthlySHEReport } from './types/she-report';
import { TailAdminLayout } from './components/layout/TailAdminLayout';
import { seedInitialDataIfEmpty } from './services/storage-service';
import { AdminLoginPage } from './components/auth/AdminLoginPage';

export const getActiveAdminPin = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('SHE_CUSTOM_ADMIN_PIN') || '1234';
  }
  return '1234';
};

interface AppProps {
  initialRole?: 'karyawan' | 'admin';
}

export default function App({ initialRole }: AppProps = {}) {
  // Determine initial role: prop -> URL query param -> localStorage -> default 'karyawan'
  const [role, setRole] = useState<'karyawan' | 'admin'>(() => {
    if (initialRole) return initialRole;
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlRole = urlParams.get('role');
      if (urlRole === 'admin' || urlRole === 'karyawan') return urlRole;
      const saved = localStorage.getItem('SHE_USER_ROLE');
      if (saved === 'admin' || saved === 'karyawan') return saved;
    }
    return 'karyawan';
  });

  const [activeWorkerTab, setActiveWorkerTab] = useState<'report' | 'tracker' | 'admin-login'>('report');
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'weekly' | 'monthly' | 'hazard-form'>('dashboard');

  useEffect(() => {
    seedInitialDataIfEmpty();
  }, []);

  useEffect(() => {
    localStorage.setItem('SHE_USER_ROLE', role);
  }, [role]);

  // Session Inactivity Auto-Logout (30 minutes)
  useEffect(() => {
    if (role !== 'admin') return;

    let timeoutId: any;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setRole('karyawan');
        setActiveWorkerTab('report');
      }, 30 * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [role]);

  const handleWeeklyPPT = async (report: WeeklySHEReport) => {
    await downloadWeeklyPPT(report);
  };

  const handleMonthlyPPT = async (report: MonthlySHEReport) => {
    await downloadMonthlyPPT(report);
  };

  const handleSwitchToWorker = () => {
    setRole('karyawan');
    setActiveWorkerTab('report');
  };

  if (role === 'admin') {
    return (
      <TailAdminLayout
        activeTab={activeAdminTab}
        onTabChange={setActiveAdminTab}
        onSwitchToWorker={handleSwitchToWorker}
      >
        {activeAdminTab === 'dashboard' && (
          <SHEAdminDashboard
            onNavigateToForm={() => setActiveAdminTab('hazard-form')}
            onNavigateToWeekly={() => setActiveAdminTab('weekly')}
            onNavigateToMonthly={() => setActiveAdminTab('monthly')}
          />
        )}

        {activeAdminTab === 'weekly' && (
          <WeeklyEntryForm onGeneratePPT={handleWeeklyPPT} />
        )}

        {activeAdminTab === 'monthly' && (
          <MonthlyEntryForm onGeneratePPT={handleMonthlyPPT} />
        )}

        {activeAdminTab === 'hazard-form' && (
          <HazardReportForm
            onSubmitSuccess={() => {}}
            onNavigateToDashboard={() => setActiveAdminTab('dashboard')}
          />
        )}
      </TailAdminLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col antialiased selection:bg-amber-200 selection:text-amber-950">
      {/* Top Header - Worker View */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          {/* Logo & Role Badge */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            onClick={() => setActiveWorkerTab('report')}
          >
            <img
              src="/logo_ihazard.png"
              alt="iHazard Logo"
              className="w-7 h-7 rounded-lg object-cover shadow-xs border border-slate-700/80 group-hover:scale-105 transition-transform"
            />
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white">
                iHazard
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-800 text-amber-400 border border-slate-700">
                Karyawan
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <nav className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-md border border-zinc-800">
              <button
                onClick={() => setActiveWorkerTab('report')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all uppercase tracking-wide ${
                  activeWorkerTab === 'report'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className={`w-3.5 h-3.5 ${activeWorkerTab === 'report' ? 'text-zinc-950' : 'text-amber-500'}`} />
                  <span>Lapor Bahaya</span>
                </span>
              </button>

              <button
                onClick={() => setActiveWorkerTab('tracker')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all uppercase tracking-wide ${
                  activeWorkerTab === 'tracker'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Status Laporan Saya</span>
                </span>
              </button>
            </nav>

            <button
              onClick={() => setActiveWorkerTab('admin-login')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer ${
                activeWorkerTab === 'admin-login'
                  ? 'text-slate-950 bg-amber-400 border border-amber-500'
                  : 'text-amber-400 hover:text-amber-300 bg-slate-800 hover:bg-slate-700 border border-amber-500/40'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Masuk Mode Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area for Workers */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-5">
        <div>
          {activeWorkerTab === 'report' ? (
            <HazardReportForm
              onSubmitSuccess={() => setActiveWorkerTab('tracker')}
              onNavigateToDashboard={() => setActiveWorkerTab('tracker')}
            />
          ) : activeWorkerTab === 'tracker' ? (
            <WorkerTracker onNavigateToForm={() => setActiveWorkerTab('report')} />
          ) : (
            <AdminLoginPage
              onLoginSuccess={() => {
                setRole('admin');
                setActiveAdminTab('dashboard');
                setActiveWorkerTab('report');
              }}
              onBack={() => setActiveWorkerTab('report')}
            />
          )}
        </div>
      </main>

      {/* Mobile Floating Bottom Bar - Clean & Ergonomic */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 px-4 py-1.5 flex items-center justify-around shadow-lg">
        {role === 'karyawan' ? (
          <>
            <button
              id="mobile-tab-report"
              onClick={() => setActiveWorkerTab('report')}
              className={`flex flex-col items-center gap-0.5 text-[11px] font-medium py-1 px-3 rounded-lg transition-colors cursor-pointer ${
                activeWorkerTab === 'report' ? 'text-amber-400 bg-slate-800/80 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Lapor Bahaya</span>
            </button>

            <button
              id="mobile-tab-tracker"
              onClick={() => setActiveWorkerTab('tracker')}
              className={`flex flex-col items-center gap-0.5 text-[11px] font-medium py-1 px-3 rounded-lg transition-colors cursor-pointer ${
                activeWorkerTab === 'tracker' ? 'text-amber-400 bg-slate-800/80 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Status Laporan</span>
            </button>

            <button
              id="mobile-tab-admin-login"
              onClick={() => setActiveWorkerTab('admin-login')}
              className={`flex flex-col items-center gap-0.5 text-[11px] font-medium py-1 px-3 rounded-lg transition-colors cursor-pointer ${
                activeWorkerTab === 'admin-login' ? 'text-amber-400 bg-slate-800/80 font-bold' : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Login Admin</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveAdminTab('dashboard')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded transition-colors uppercase cursor-pointer ${
                activeAdminTab === 'dashboard' ? 'text-amber-400 bg-zinc-800' : 'text-zinc-400'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('weekly')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded transition-colors uppercase cursor-pointer ${
                activeAdminTab === 'weekly' ? 'text-amber-400 bg-zinc-800' : 'text-zinc-400'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Mingguan</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('monthly')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded transition-colors uppercase cursor-pointer ${
                activeAdminTab === 'monthly' ? 'text-amber-400 bg-zinc-800' : 'text-zinc-400'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Bulanan</span>
            </button>

            <button
              onClick={handleSwitchToWorker}
              className="flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded text-emerald-400 hover:text-emerald-300 transition-colors uppercase cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Ke Karyawan</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
