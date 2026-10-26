import { useState } from 'react';
import {
  AlertTriangle,
  LayoutDashboard,
  Calendar,
  Award,
  HardHat,
} from 'lucide-react';
import { HazardReportForm } from './components/hazard/HazardReportForm';
import { SHEAdminDashboard } from './components/dashboard/SHEAdminDashboard';
import { WeeklyEntryForm } from './components/she/WeeklyEntryForm';
import { MonthlyEntryForm } from './components/she/MonthlyEntryForm';
import { downloadWeeklyPPT, downloadMonthlyPPT } from './services/pptx-engine';
import { WeeklySHEReport, MonthlySHEReport } from './types/she-report';

export default function App() {
  const [activeTab, setActiveTab] = useState<'hazard-form' | 'dashboard' | 'weekly' | 'monthly'>('dashboard');

  const handleWeeklyPPT = async (report: WeeklySHEReport) => {
    await downloadWeeklyPPT(report);
  };

  const handleMonthlyPPT = async (report: MonthlySHEReport) => {
    await downloadMonthlyPPT(report);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>SHE COAL MINING</span>
                <span className="hidden sm:inline-block text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-500/30">
                  SITE BATU BARA
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Hazard Report & PPT Automation</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('hazard-form')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'hazard-form'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Lapor Bahaya</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard SHE</span>
            </button>

            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'weekly'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Laporan Mingguan</span>
            </button>

            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'monthly'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Laporan Bulanan</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'hazard-form' && (
          <div className="py-6">
            <HazardReportForm
              onSubmitSuccess={() => {}}
              onNavigateToDashboard={() => setActiveTab('dashboard')}
            />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <SHEAdminDashboard
            onNavigateToForm={() => setActiveTab('hazard-form')}
            onNavigateToWeekly={() => setActiveTab('weekly')}
            onNavigateToMonthly={() => setActiveTab('monthly')}
          />
        )}

        {activeTab === 'weekly' && (
          <div className="py-6">
            <WeeklyEntryForm onGeneratePPT={handleWeeklyPPT} />
          </div>
        )}

        {activeTab === 'monthly' && (
          <div className="py-6">
            <MonthlyEntryForm onGeneratePPT={handleMonthlyPPT} />
          </div>
        )}
      </main>

      {/* Mobile Floating Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('hazard-form')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'hazard-form' ? 'text-amber-600 font-bold' : 'text-slate-500'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
          <span>Lapor Bahaya</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'dashboard' ? 'text-amber-600 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'weekly' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Mingguan</span>
        </button>

        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'monthly' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Award className="w-5 h-5" />
          <span>Bulanan</span>
        </button>
      </div>
    </div>
  );
}
