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
  ArrowLeftRight,
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
import { PortalSelectorPage } from './components/portal/PortalSelectorPage';

export const getActiveAdminPin = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('SHE_CUSTOM_ADMIN_PIN') || '1234';
  }
  return '1234';
};

interface AppProps {
  initialRole?: 'karyawan' | 'admin' | 'selector';
}

export default function App({ initialRole }: AppProps = {}) {
  // Screen state determines what view is active:
  // 'selector': Welcome Portal (Role Selection)
  // 'karyawan': Worker Portal (Report & Status Tracker)
  // 'admin-login': Dedicated PIN verification screen
  // 'admin': SHE Admin Dashboard & Management Layout
  const [currentScreen, setCurrentScreen] = useState<'selector' | 'karyawan' | 'admin-login' | 'admin'>(() => {
    if (initialRole === 'admin') return 'admin';
    if (initialRole === 'karyawan') return 'karyawan';
    if (initialRole === 'selector') return 'selector';

    if (typeof window !== 'undefined') {
      // Check active verified admin session in sessionStorage
      const sessionActive = sessionStorage.getItem('SHE_ADMIN_SESSION');
      if (sessionActive === 'active') return 'admin';

      const urlParams = new URLSearchParams(window.location.search);
      const urlRole = urlParams.get('role');
      // SECURITY: role=admin in URL routes to PIN verification, NEVER grants instant admin!
      if (urlRole === 'admin') return 'admin-login';
      if (urlRole === 'karyawan') return 'karyawan';
      if (urlRole === 'selector') return 'selector';

      const savedPortal = localStorage.getItem('ihazard_preferred_portal');
      if (savedPortal === 'karyawan') return 'karyawan';
      if (savedPortal === 'admin') return 'admin-login';
    }

    return 'selector';
  });

  const [role, setRole] = useState<'karyawan' | 'admin'>(() => {
    if (initialRole === 'admin') return 'admin';
    return 'karyawan';
  });

  const [activeWorkerTab, setActiveWorkerTab] = useState<'report' | 'tracker' | 'admin-login'>('report');
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'weekly' | 'monthly' | 'hazard-form'>('dashboard');

  useEffect(() => {
    seedInitialDataIfEmpty();
  }, []);

  // Session Inactivity Auto-Logout (30 minutes for admin)
  useEffect(() => {
    if (currentScreen !== 'admin') return;

    let timeoutId: any;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('SHE_ADMIN_SESSION');
        }
        setRole('karyawan');
        setCurrentScreen('karyawan');
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
  }, [currentScreen]);

  const handleWeeklyPPT = async (report: WeeklySHEReport) => {
    await downloadWeeklyPPT(report);
  };

  const handleMonthlyPPT = async (report: MonthlySHEReport) => {
    await downloadMonthlyPPT(report);
  };

  const handleSelectRoleFromWelcome = (selectedRole: 'karyawan' | 'admin', rememberPreference: boolean) => {
    if (rememberPreference) {
      localStorage.setItem('ihazard_preferred_portal', selectedRole);
    } else {
      localStorage.removeItem('ihazard_preferred_portal');
    }

    if (selectedRole === 'karyawan') {
      setRole('karyawan');
      setActiveWorkerTab('report');
      setCurrentScreen('karyawan');
    } else {
      setCurrentScreen('admin-login');
    }
  };

  const handleSwitchToSelector = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('SHE_ADMIN_SESSION');
    }
    localStorage.removeItem('ihazard_preferred_portal');
    setCurrentScreen('selector');
  };

  const handleSwitchToWorker = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('SHE_ADMIN_SESSION');
    }
    setRole('karyawan');
    setActiveWorkerTab('report');
    setCurrentScreen('karyawan');
  };

  // 1. WELCOME PORTAL / ROLE SELECTION SCREEN
  if (currentScreen === 'selector') {
    return <PortalSelectorPage onSelectRole={handleSelectRoleFromWelcome} />;
  }

  // 2. ADMIN DASHBOARD SCREEN
  if (currentScreen === 'admin') {
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

  // 3. WORKER PORTAL & ADMIN LOGIN PAGE
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col antialiased selection:bg-amber-200 selection:text-amber-950">
      {/* Top Header - Worker View */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between">
          {/* Logo, Role Badge & Switch Portal */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="flex items-center gap-2.5 cursor-pointer group select-none"
              onClick={() => setActiveWorkerTab('report')}
            >
              <img
                src="/logo_ihazard.png"
                alt="iHazard Logo"
                className="w-7 h-7 rounded-lg object-cover shadow-xs border border-slate-700/80 group-hover:scale-105 transition-transform"
              />
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white">
                  iHazard
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-800 text-amber-400 border border-slate-700">
                  Karyawan
                </span>
              </div>
            </div>

            {/* Ganti Portal Button in Top Header */}
            <button
              onClick={handleSwitchToSelector}
              title="Ganti ke portal lain"
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/80 transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Ganti Portal</span>
              <span className="sm:hidden">Portal</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <nav className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-md border border-zinc-800">
              <button
                onClick={() => setActiveWorkerTab('report')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all uppercase tracking-wide cursor-pointer ${
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
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all uppercase tracking-wide cursor-pointer ${
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
          {currentScreen === 'admin-login' || activeWorkerTab === 'admin-login' ? (
            <AdminLoginPage
              onLoginSuccess={() => {
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('SHE_ADMIN_SESSION', 'active');
                }
                setRole('admin');
                setActiveAdminTab('dashboard');
                setCurrentScreen('admin');
              }}
              onBack={() => {
                setActiveWorkerTab('report');
                setCurrentScreen('karyawan');
              }}
            />
          ) : activeWorkerTab === 'tracker' ? (
            <WorkerTracker onNavigateToForm={() => setActiveWorkerTab('report')} />
          ) : (
            <HazardReportForm
              onSubmitSuccess={() => setActiveWorkerTab('tracker')}
              onNavigateToDashboard={() => setActiveWorkerTab('tracker')}
            />
          )}
      </main>

      {/* Mobile Floating Bottom Bar - Clean & Ergonomic */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 px-4 py-1.5 flex items-center justify-around shadow-lg">
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
      </div>
    </div>
  );
}
