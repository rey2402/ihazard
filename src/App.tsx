import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  LayoutDashboard,
  Calendar,
  Award,
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

const DEMO_ADMIN_PIN = '1234';

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

  const [activeWorkerTab, setActiveWorkerTab] = useState<'report' | 'tracker'>('report');
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'weekly' | 'monthly' | 'hazard-form'>('dashboard');

  // PIN modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    localStorage.setItem('SHE_USER_ROLE', role);
  }, [role]);

  const handleWeeklyPPT = async (report: WeeklySHEReport) => {
    await downloadWeeklyPPT(report);
  };

  const handleMonthlyPPT = async (report: MonthlySHEReport) => {
    await downloadMonthlyPPT(report);
  };

  const handleOpenAdminLogin = () => {
    setPinInput('');
    setPinError('');
    setShowPinModal(true);
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === DEMO_ADMIN_PIN) {
      setRole('admin');
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError(`PIN salah! Gunakan PIN demo "${DEMO_ADMIN_PIN}".`);
    }
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
    <div className="min-h-screen bg-[#EEF2F6] text-zinc-900 flex flex-col antialiased selection:bg-amber-200 selection:text-amber-950">
      {/* Top Header - Worker View */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          {/* Logo & Role Badge */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            onClick={() => setActiveWorkerTab('report')}
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs font-bold group-hover:bg-amber-400 transition-colors">
              <HardHat className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white">
                SHE Tambang
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
              onClick={handleOpenAdminLogin}
              className="px-2.5 py-1.5 rounded text-xs font-mono font-bold text-amber-400 hover:text-amber-300 bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Masuk Mode Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area for Workers */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div>
          {activeWorkerTab === 'report' ? (
            <HazardReportForm
              onSubmitSuccess={() => setActiveWorkerTab('tracker')}
              onNavigateToDashboard={() => setActiveWorkerTab('tracker')}
            />
          ) : (
            <WorkerTracker onNavigateToForm={() => setActiveWorkerTab('report')} />
          )}
        </div>
      </main>

      {/* Mobile Floating Bottom Bar - Clean & Ergonomic */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 px-4 py-1.5 flex items-center justify-around shadow-lg">
        {role === 'karyawan' ? (
          <>
            <button
              onClick={() => setActiveWorkerTab('report')}
              className={`flex flex-col items-center gap-0.5 text-[11px] font-medium py-1 px-3 rounded-lg transition-colors ${
                activeWorkerTab === 'report' ? 'text-amber-400 bg-slate-800/80' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Lapor Bahaya</span>
            </button>

            <button
              onClick={() => setActiveWorkerTab('tracker')}
              className={`flex flex-col items-center gap-0.5 text-[11px] font-medium py-1 px-3 rounded-lg transition-colors ${
                activeWorkerTab === 'tracker' ? 'text-amber-400 bg-slate-800/80' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Status Laporan</span>
            </button>

            <button
              onClick={handleOpenAdminLogin}
              className="flex flex-col items-center gap-0.5 text-[11px] font-medium py-1 px-3 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>Login Admin</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveAdminTab('dashboard')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded transition-colors uppercase ${
                activeAdminTab === 'dashboard' ? 'text-amber-400 bg-zinc-800' : 'text-zinc-400'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('weekly')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded transition-colors uppercase ${
                activeAdminTab === 'weekly' ? 'text-amber-400 bg-zinc-800' : 'text-zinc-400'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Mingguan</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('monthly')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded transition-colors uppercase ${
                activeAdminTab === 'monthly' ? 'text-amber-400 bg-zinc-800' : 'text-zinc-400'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Bulanan</span>
            </button>

            <button
              onClick={handleSwitchToWorker}
              className="flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded text-emerald-400 hover:text-emerald-300 transition-colors uppercase"
            >
              <LogOut className="w-4 h-4" />
              <span>Ke Karyawan</span>
            </button>
          </>
        )}
      </div>

      {/* Clean Minimalist Admin PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-xl max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 bg-zinc-100 text-zinc-800 rounded-lg flex items-center justify-center mb-3">
              <KeyRound className="w-5 h-5" />
            </div>

            <h3 className="text-base font-semibold text-zinc-950 mb-1">
              Verifikasi Akses Admin SHE
            </h3>
            <p className="text-xs text-zinc-500 mb-5 leading-relaxed">
              Masukkan PIN Admin untuk membuka instrumen analitik, manajemen hazard, dan generator PowerPoint K3LH.
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <label htmlFor="adminPin" className="block text-xs font-medium text-zinc-700 mb-1.5">
                  PIN Keamanan
                </label>
                <input
                  id="adminPin"
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  autoFocus
                  placeholder="••••"
                  className="w-full bg-zinc-50/60 border border-zinc-200 rounded-lg px-3 py-2 text-center text-lg font-mono tracking-widest text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                />
              </div>

              {pinError && (
                <div className="p-2 bg-red-50 border border-red-200/80 text-red-700 rounded-lg text-xs text-center">
                  {pinError}
                </div>
              )}

              <button
                type="button"
                onClick={() => setPinInput(DEMO_ADMIN_PIN)}
                className="w-full py-1 text-xs text-zinc-500 hover:text-zinc-800 bg-zinc-50 border border-zinc-200 rounded-lg font-normal transition-colors"
              >
                Gunakan PIN Demo: <span className="font-mono font-medium text-zinc-700">{DEMO_ADMIN_PIN}</span>
              </button>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Buka Portal Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
