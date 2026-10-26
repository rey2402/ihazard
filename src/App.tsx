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

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* Top Header - Clean, unified off-white palette with micro-border */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo & Workspace Breadcrumb */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => {
              if (role === 'admin') setActiveAdminTab('dashboard');
              else setActiveWorkerTab('report');
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-amber-400 flex items-center justify-center shadow-sm group-hover:bg-zinc-800 transition-colors">
              <HardHat className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold tracking-tight text-zinc-950">SHE COAL MINING</span>
              <span className="text-zinc-300 font-normal">/</span>
              <span className="text-xs font-medium text-zinc-500">
                {role === 'admin' ? 'Portal Admin SHE' : 'Portal Karyawan'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          {role === 'karyawan' ? (
            /* Worker Navigation Tabs */
            <div className="hidden md:flex items-center gap-4">
              <nav className="flex items-center gap-1 bg-zinc-100/80 p-0.5 rounded-lg border border-zinc-200/50">
                <button
                  onClick={() => setActiveWorkerTab('report')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeWorkerTab === 'report'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Lapor Bahaya</span>
                  </span>
                </button>

                <button
                  onClick={() => setActiveWorkerTab('tracker')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeWorkerTab === 'tracker'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Status Laporan Saya</span>
                  </span>
                </button>
              </nav>

              <button
                onClick={handleOpenAdminLogin}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 border border-zinc-200/70 flex items-center gap-1.5 transition-colors"
              >
                <Lock className="w-3 h-3 text-zinc-500" />
                <span>Masuk Mode Admin</span>
              </button>
            </div>
          ) : (
            /* Admin Navigation Tabs */
            <div className="hidden md:flex items-center gap-3">
              <nav className="flex items-center gap-1 bg-zinc-100/80 p-0.5 rounded-lg border border-zinc-200/50">
                <button
                  onClick={() => setActiveAdminTab('dashboard')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeAdminTab === 'dashboard'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard SHE</span>
                  </span>
                </button>

                <button
                  onClick={() => setActiveAdminTab('weekly')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeAdminTab === 'weekly'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Laporan Mingguan</span>
                  </span>
                </button>

                <button
                  onClick={() => setActiveAdminTab('monthly')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeAdminTab === 'monthly'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>Laporan Bulanan</span>
                  </span>
                </button>

                <button
                  onClick={() => setActiveAdminTab('hazard-form')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeAdminTab === 'hazard-form'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Lapor Bahaya</span>
                  </span>
                </button>
              </nav>

              <button
                onClick={handleSwitchToWorker}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 border border-zinc-200/70 flex items-center gap-1.5 transition-colors"
                title="Beralih ke tampilan karyawan lapangan"
              >
                <Eye className="w-3.5 h-3.5 text-zinc-500" />
                <span>Lihat Tampilan Karyawan</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {role === 'karyawan' ? (
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
        ) : (
          <div>
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
          </div>
        )}
      </main>

      {/* Mobile Floating Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-zinc-200/80 px-4 py-2 flex items-center justify-around shadow-sm">
        {role === 'karyawan' ? (
          <>
            <button
              onClick={() => setActiveWorkerTab('report')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-3 rounded-md transition-colors ${
                activeWorkerTab === 'report' ? 'text-zinc-950 font-semibold' : 'text-zinc-500'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Lapor Bahaya</span>
            </button>

            <button
              onClick={() => setActiveWorkerTab('tracker')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-3 rounded-md transition-colors ${
                activeWorkerTab === 'tracker' ? 'text-zinc-950 font-semibold' : 'text-zinc-500'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Status Laporan</span>
            </button>

            <button
              onClick={handleOpenAdminLogin}
              className="flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-3 rounded-md text-zinc-500 hover:text-zinc-950 transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>Login Admin</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveAdminTab('dashboard')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-2 rounded-md transition-colors ${
                activeAdminTab === 'dashboard' ? 'text-zinc-950 font-semibold' : 'text-zinc-500'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('weekly')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-2 rounded-md transition-colors ${
                activeAdminTab === 'weekly' ? 'text-zinc-950 font-semibold' : 'text-zinc-500'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Mingguan</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('monthly')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-2 rounded-md transition-colors ${
                activeAdminTab === 'monthly' ? 'text-zinc-950 font-semibold' : 'text-zinc-500'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Bulanan</span>
            </button>

            <button
              onClick={handleSwitchToWorker}
              className="flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-2 rounded-md text-zinc-500 hover:text-zinc-950 transition-colors"
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
