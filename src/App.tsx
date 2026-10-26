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
  ShieldCheck,
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
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Portal Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              if (role === 'admin') setActiveAdminTab('dashboard');
              else setActiveWorkerTab('report');
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>SHE COAL MINING</span>
                {role === 'admin' ? (
                  <span className="inline-block text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                    PORTAL ADMIN SHE
                  </span>
                ) : (
                  <span className="inline-block text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-500/30">
                    PORTAL KARYAWAN
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {role === 'admin' ? 'Monitoring K3LH & Otomasi PPT' : 'Pelaporan Cepat Bahaya Tambang'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          {role === 'karyawan' ? (
            /* Menu Karyawan Lapangan */
            <div className="hidden md:flex items-center gap-3">
              <nav className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveWorkerTab('report')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeWorkerTab === 'report'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Lapor Bahaya</span>
                </button>

                <button
                  onClick={() => setActiveWorkerTab('tracker')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeWorkerTab === 'tracker'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Status Laporan Saya</span>
                </button>
              </nav>

              <div className="h-6 w-[1px] bg-slate-800 mx-1" />

              <button
                onClick={handleOpenAdminLogin}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 flex items-center gap-2 transition-all shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Masuk Mode Admin</span>
              </button>
            </div>
          ) : (
            /* Menu Admin SHE / P2K3 */
            <div className="hidden md:flex items-center gap-3">
              <nav className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveAdminTab('dashboard')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeAdminTab === 'dashboard'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard SHE</span>
                </button>

                <button
                  onClick={() => setActiveAdminTab('weekly')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeAdminTab === 'weekly'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Laporan Mingguan</span>
                </button>

                <button
                  onClick={() => setActiveAdminTab('monthly')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeAdminTab === 'monthly'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Laporan Bulanan</span>
                </button>

                <button
                  onClick={() => setActiveAdminTab('hazard-form')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeAdminTab === 'hazard-form'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Lapor Bahaya</span>
                </button>
              </nav>

              <div className="h-6 w-[1px] bg-slate-800 mx-1" />

              <button
                onClick={handleSwitchToWorker}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-all"
                title="Beralih ke tampilan karyawan lapangan"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Lihat Tampilan Karyawan</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {role === 'karyawan' ? (
          /* Tampilan Khusus Karyawan Lapangan */
          <div className="py-6">
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
          /* Tampilan Khusus Admin SHE / Manajemen */
          <div>
            {activeAdminTab === 'dashboard' && (
              <SHEAdminDashboard
                onNavigateToForm={() => setActiveAdminTab('hazard-form')}
                onNavigateToWeekly={() => setActiveAdminTab('weekly')}
                onNavigateToMonthly={() => setActiveAdminTab('monthly')}
              />
            )}

            {activeAdminTab === 'weekly' && (
              <div className="py-6">
                <WeeklyEntryForm onGeneratePPT={handleWeeklyPPT} />
              </div>
            )}

            {activeAdminTab === 'monthly' && (
              <div className="py-6">
                <MonthlyEntryForm onGeneratePPT={handleMonthlyPPT} />
              </div>
            )}

            {activeAdminTab === 'hazard-form' && (
              <div className="py-6">
                <HazardReportForm
                  onSubmitSuccess={() => {}}
                  onNavigateToDashboard={() => setActiveAdminTab('dashboard')}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Floating Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
        {role === 'karyawan' ? (
          <>
            <button
              onClick={() => setActiveWorkerTab('report')}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-3 rounded-lg transition-colors ${
                activeWorkerTab === 'report' ? 'text-amber-600 font-bold' : 'text-slate-500'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
              <span>Lapor Bahaya</span>
            </button>

            <button
              onClick={() => setActiveWorkerTab('tracker')}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-3 rounded-lg transition-colors ${
                activeWorkerTab === 'tracker' ? 'text-amber-600 font-bold' : 'text-slate-500'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span>Status Laporan</span>
            </button>

            <button
              onClick={handleOpenAdminLogin}
              className="flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-3 rounded-lg text-slate-500 hover:text-amber-600 transition-colors"
            >
              <Lock className="w-5 h-5" />
              <span>Login Admin</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveAdminTab('dashboard')}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2 rounded-lg transition-colors ${
                activeAdminTab === 'dashboard' ? 'text-amber-600 font-bold' : 'text-slate-500'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('weekly')}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2 rounded-lg transition-colors ${
                activeAdminTab === 'weekly' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Mingguan</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('monthly')}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2 rounded-lg transition-colors ${
                activeAdminTab === 'monthly' ? 'text-emerald-600 font-bold' : 'text-slate-500'
              }`}
            >
              <Award className="w-5 h-5" />
              <span>Bulanan</span>
            </button>

            <button
              onClick={handleSwitchToWorker}
              className="flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2 rounded-lg text-slate-500 hover:text-amber-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Ke Karyawan</span>
            </button>
          </>
        )}
      </div>

      {/* Modal Verifikasi PIN Admin */}
      {showPinModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-200 shadow-sm">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
              Verifikasi Akses Admin SHE
            </h3>
            <p className="text-xs text-slate-600 text-center mb-5 leading-relaxed">
              Masukkan PIN Admin untuk mengakses Dashboard Analitik, Manajemen Tiket, dan Generator PowerPoint K3LH.
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <label htmlFor="adminPin" className="block text-xs font-semibold text-slate-700 mb-1">
                  PIN Keamanan Admin
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
                  placeholder="Ketik 4 digit PIN..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {pinError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs text-center font-medium">
                  {pinError}
                </div>
              )}

              <button
                type="button"
                onClick={() => setPinInput(DEMO_ADMIN_PIN)}
                className="w-full py-1.5 text-xs text-amber-700 hover:text-amber-800 bg-amber-50 border border-amber-200/80 rounded-xl font-medium transition-colors"
              >
                Isi Cepat PIN Demo: <span className="font-mono font-bold">{DEMO_ADMIN_PIN}</span>
              </button>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-sm"
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
