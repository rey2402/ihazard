import { useState, useEffect } from 'react';
import { HazardReportForm } from './components/hazard/HazardReportForm';
import { SHEAdminDashboard } from './components/dashboard/SHEAdminDashboard';
import { WeeklyEntryForm } from './components/she/WeeklyEntryForm';
import { MonthlyEntryForm } from './components/she/MonthlyEntryForm';
import { WorkerTracker } from './components/worker/WorkerTracker';
import { downloadWeeklyPPT, downloadMonthlyPPT } from './services/pptx-engine';
import { WeeklySHEReport, MonthlySHEReport } from './types/she-report';
import { UnifiedAppLayout, ActiveNavTab } from './components/layout/UnifiedAppLayout';
import { seedInitialDataIfEmpty } from './services/storage-service';
import { AdminLoginPage } from './components/auth/AdminLoginPage';
import { PortalSelectorPage } from './components/portal/PortalSelectorPage';
import { DEFAULT_ADMIN_PIN } from './services/sheets-sync-service';

export const getActiveAdminPin = (): string => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('SHE_CUSTOM_ADMIN_PIN');
    if (!custom || custom === '1234') {
      return DEFAULT_ADMIN_PIN;
    }
    return custom;
  }
  return DEFAULT_ADMIN_PIN;
};

interface AppProps {
  initialRole?: 'karyawan' | 'admin' | 'selector';
}

export default function App({ initialRole }: AppProps = {}) {
  // Screen state determines what view is active:
  // 'selector': Welcome Portal (Role Selection)
  // 'karyawan': Unified Portal in Worker Mode
  // 'admin-login': Dedicated PIN verification screen
  // 'admin': Unified Portal in SHE Admin Mode
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

  const [activeNavTab, setActiveNavTab] = useState<ActiveNavTab>(() => {
    if (initialRole === 'admin') return 'dashboard';
    return 'hazard-form';
  });

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
        setActiveNavTab('hazard-form');
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
      setActiveNavTab('hazard-form');
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
    setActiveNavTab('hazard-form');
    setCurrentScreen('karyawan');
  };

  // 1. WELCOME PORTAL / ROLE SELECTION SCREEN
  if (currentScreen === 'selector') {
    return <PortalSelectorPage onSelectRole={handleSelectRoleFromWelcome} />;
  }

  // 2. DEDICATED PIN VERIFICATION / LOGIN SCREEN
  if (currentScreen === 'admin-login') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
        <AdminLoginPage
          onLoginSuccess={() => {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('SHE_ADMIN_SESSION', 'active');
            }
            setRole('admin');
            setCurrentScreen('admin');
            setActiveNavTab('dashboard');
          }}
          onBack={() => {
            setCurrentScreen('karyawan');
            setActiveNavTab('hazard-form');
          }}
        />
      </div>
    );
  }

  // 3. UNIFIED MODERN WORKSPACE (Worker & SHE Admin)
  return (
    <UnifiedAppLayout
      activeTab={activeNavTab}
      onTabChange={(tab) => {
        // If worker tries to click admin-only tab without admin role, prompt login
        if (role === 'karyawan' && (tab === 'dashboard' || tab === 'weekly' || tab === 'monthly')) {
          setCurrentScreen('admin-login');
        } else {
          setActiveNavTab(tab);
        }
      }}
      role={role}
      onSwitchToWorker={handleSwitchToWorker}
      onAdminLoginRequest={() => setCurrentScreen('admin-login')}
      onSwitchToSelector={handleSwitchToSelector}
    >
      {activeNavTab === 'dashboard' && (
        <SHEAdminDashboard
          onNavigateToForm={() => setActiveNavTab('hazard-form')}
          onNavigateToWeekly={() => setActiveNavTab('weekly')}
          onNavigateToMonthly={() => setActiveNavTab('monthly')}
        />
      )}

      {activeNavTab === 'hazard-form' && (
        <HazardReportForm
          onSubmitSuccess={() => setActiveNavTab('tracker')}
          onNavigateToDashboard={() => setActiveNavTab(role === 'admin' ? 'dashboard' : 'tracker')}
        />
      )}

      {activeNavTab === 'tracker' && (
        <WorkerTracker onNavigateToForm={() => setActiveNavTab('hazard-form')} />
      )}

      {activeNavTab === 'weekly' && (
        <WeeklyEntryForm onGeneratePPT={handleWeeklyPPT} />
      )}

      {activeNavTab === 'monthly' && (
        <MonthlyEntryForm onGeneratePPT={handleMonthlyPPT} />
      )}
    </UnifiedAppLayout>
  );
}
