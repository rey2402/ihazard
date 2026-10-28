import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Presentation,
  Search,
  Plus,
  Cloud,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  HardHat,
  RefreshCw,
  MapPin,
  Camera,
  Eye,
  EyeOff,
  KeyRound,
  Shield,
  Lock,
  User,
  ImageOff,
  X,
  RotateCcw,
  SlidersHorizontal,
  ArrowLeftRight,
} from 'lucide-react';
import { HazardReport, HazardStatus } from '../../types/hazard';
import { getAllHazardReports, updateHazardStatus, exportReportsToCSV, setAllHazardReports } from '../../services/storage-service';
import { exportReportsToExcel } from '../../services/excel-export-service';
import { downloadWeeklyPPT, downloadMonthlyPPT } from '../../services/pptx-engine';
import { WeeklySHEReport, MonthlySHEReport } from '../../types/she-report';
import {
  fetchHazardsFromGoogleSheets,
  syncHazardToGoogleSheets,
  getActiveWebhookUrl,
  normalizeWebhookUrl,
  SHEETS_WEBHOOK_KEY,
  DEFAULT_ADMIN_PIN,
} from '../../services/sheets-sync-service';
import { HazardBeforeAfterModal } from '../hazard/HazardBeforeAfterModal';
import { AttachPhotoModal } from '../hazard/AttachPhotoModal';
import { formatDriveImageUrl } from '../../utils/drive-image';
import { formatYearMonth } from '../../utils/date-utils';



const getPageNumbers = (current: number, total: number): (number | '...')[] => {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, 4, '...', total];
  }
  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
};

interface SHEAdminDashboardProps {
  onNavigateToForm: () => void;
  onNavigateToWeekly: () => void;
  onNavigateToMonthly: () => void;
}

export const SHEAdminDashboard: React.FC<SHEAdminDashboardProps> = ({
  onNavigateToForm,
  onNavigateToWeekly,
  onNavigateToMonthly,
}) => {
  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [filterMonth, setFilterMonth] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isGeneratingPPT, setIsGeneratingPPT] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [showPinInModal, setShowPinInModal] = useState(false);
  const [pinSaveFeedback, setPinSaveFeedback] = useState<string | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [syncStatusFeedback, setSyncStatusFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeModalHazard, setActiveModalHazard] = useState<{
    hazard: HazardReport;
    mode: 'view' | 'resolve';
  } | null>(null);
  const [attachPhotoHazard, setAttachPhotoHazard] = useState<HazardReport | null>(null);

  const loadData = () => {
    const stored = getAllHazardReports();
    setHazards(stored);
  };

  const syncWithCloud = async (overrideUrl?: string) => {
    setIsSyncingCloud(true);
    setSyncStatusFeedback(null);
    try {
      const target = overrideUrl || getActiveWebhookUrl();
      const cloudData = await fetchHazardsFromGoogleSheets(target);
      if (cloudData !== null && Array.isArray(cloudData)) {
        setHazards(cloudData);
        setAllHazardReports(cloudData);
        setSyncStatusFeedback({
          type: 'success',
          message: `Berhasil tersinkronisasi: ${cloudData.length} laporan aktif dari Google Sheets.`,
        });
      } else {
        setSyncStatusFeedback({
          type: 'error',
          message: 'Gagal terhubung ke Google Sheets. Pastikan Webhook URL valid dan deployment disetel "Anyone".',
        });
        loadData();
      }
    } catch {
      setSyncStatusFeedback({
        type: 'error',
        message: 'Koneksi gagal. Memuat data offline dari memori.',
      });
      loadData();
    } finally {
      setIsSyncingCloud(false);
      setTimeout(() => setSyncStatusFeedback(null), 7000);
    }
  };

  useEffect(() => {
    loadData();
    syncWithCloud();
    const currentWebhook = getActiveWebhookUrl();
    setWebhookUrl(currentWebhook);
    const savedPin = typeof window !== 'undefined' ? localStorage.getItem('SHE_CUSTOM_ADMIN_PIN') : null;
    setCurrentPin(savedPin && savedPin !== '1234' ? savedPin : DEFAULT_ADMIN_PIN);
  }, []);

  const handleStatusChange = async (id: string, newStatus: HazardStatus) => {
    const pic = newStatus === 'Closed' ? 'SHE Officer' : 'Pengawas Lapangan';
    const closedDate = newStatus === 'Closed' ? new Date().toISOString().slice(0, 10) : undefined;
    updateHazardStatus(id, newStatus, pic, closedDate);
    loadData();

    // Sync status change directly to Google Sheets!
    const target = getAllHazardReports().find((h) => h.id === id);
    if (target) {
      target.status = newStatus;
      target.picPerbaikan = pic;
      syncHazardToGoogleSheets(target);
    }
  };

  const handleConfirmResolve = (closureData: {
    closurePhotoUrl: string;
    closureNotes: string;
    closedBy: string;
  }) => {
    if (!activeModalHazard) return;
    const id = activeModalHazard.hazard.id;
    const closedDate = new Date().toISOString().slice(0, 10);

    updateHazardStatus(id, 'Closed', {
      picPerbaikan: closureData.closedBy,
      closedDate,
      closurePhotoUrl: closureData.closurePhotoUrl,
      closureNotes: closureData.closureNotes,
      closedBy: closureData.closedBy,
    });
    loadData();

    // Sync full closure data to Google Sheets!
    const target = getAllHazardReports().find((h) => h.id === id);
    if (target) {
      target.status = 'Closed';
      target.picPerbaikan = closureData.closedBy;
      target.closedDate = closedDate;
      target.closurePhotoUrl = closureData.closurePhotoUrl;
      target.closureNotes = closureData.closureNotes;
      target.closedBy = closureData.closedBy;
      syncHazardToGoogleSheets(target);
    }

    setActiveModalHazard(null);
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const dataToExport = filterMonth === 'ALL' ? hazards : filteredHazards;
      const fileName = filterMonth === 'ALL'
        ? 'Laporan_K3LH_Semua_Periode.xlsx'
        : `Laporan_K3LH_${formatYearMonth(filterMonth).replace(/\s+/g, '_')}.xlsx`;
      await exportReportsToExcel(dataToExport, fileName);
    } catch (err) {
      console.error('Failed to export excel:', err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleQuickDownloadWeekly = async () => {
    setIsGeneratingPPT(true);
    try {
      const defaultWeekly: WeeklySHEReport = {
        id: `W-${Date.now()}`,
        periodWeek: 'Minggu 4 - Oktober 2026',
        createdDate: new Date().toISOString().slice(0, 10),
        safeManHoursWeek: 35000,
        toolboxMeetingPercent: 98,
        plannedInspectionTarget: 8,
        plannedInspectionActual: 8,
        fatigueCheckPercent: 96,
        incidentsFatality: 0,
        incidentsLTI: 0,
        incidentsPropertyDamage: 1,
        incidentsNearmiss: 2,
        waterQualityPH: 7.2,
        topPriorityNotes: 'Penertiban jarak aman alat berat front loading dan perbaikan tanggul hauling.',
        totalHazardsReported: hazards.length,
        hazardsClosedPercent: Number(
          ((hazards.filter((h) => h.status === 'Closed').length / (hazards.length || 1)) * 100).toFixed(1)
        ),
      };
      await downloadWeeklyPPT(defaultWeekly, hazards);
    } finally {
      setIsGeneratingPPT(false);
    }
  };

  const handleQuickDownloadMonthly = async () => {
    setIsGeneratingPPT(true);
    try {
      const defaultMonthly: MonthlySHEReport = {
        id: `M-${Date.now()}`,
        periodMonth: 'Oktober 2026',
        safeManHoursMonth: 145000,
        safeManHoursYTD: 1420000,
        incidentsFatality: 0,
        incidentsLTI: 0,
        incidentsRestrictedWork: 0,
        incidentsMedicalTreatment: 1,
        ltifr: 0.0,
        trifr: 0.7,
        hazardResolutionRatePercent: 94.5,
        plannedInspectionRatePercent: 100,
        safetyTrainingAttendancePercent: 92.0,
        goldenRulesCompliancePercent: 97.5,
        b3WasteVolumeTons: 12.4,
        reclamationLandHa: 4.5,
        p2k3Notes: 'Evaluasi program keselamatan tambang dan zero incident milestone.',
      };
      await downloadMonthlyPPT(defaultMonthly, hazards);
    } finally {
      setIsGeneratingPPT(false);
    }
  };

  const handleSaveSettings = async () => {
    // 1. Validasi & Simpan PIN Admin
    const cleanPin = currentPin.trim();
    if (cleanPin.length < 4) {
      setPinSaveFeedback('PIN Admin minimal 4 karakter demi keamanan.');
      return;
    }
    localStorage.setItem('SHE_CUSTOM_ADMIN_PIN', cleanPin);

    // 2. Validasi & Simpan Webhook URL
    const normalized = normalizeWebhookUrl(webhookUrl);
    localStorage.setItem(SHEETS_WEBHOOK_KEY, normalized);
    setWebhookUrl(normalized);
    setShowWebhookModal(false);
    setPinSaveFeedback(null);

    setSyncStatusFeedback({
      type: 'success',
      message: 'Pengaturan tersimpan: URL Webhook dan PIN Admin berhasil diperbarui.',
    });

    await syncWithCloud(normalized);
  };

  // Dynamic available months derived from hazard records
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    hazards.forEach((h) => {
      if (h.timestamp && h.timestamp.length >= 7) {
        months.add(h.timestamp.slice(0, 7));
      }
    });
    const currentYm = new Date().toISOString().slice(0, 7);
    months.add(currentYm);
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [hazards]);

  // Filtered reports
  const filteredHazards = hazards.filter((h) => {
    const matchMonth = filterMonth === 'ALL' || (h.timestamp && h.timestamp.startsWith(filterMonth));
    const matchStatus = filterStatus === 'ALL' || h.status === filterStatus;
    const matchRisk = filterRisk === 'ALL' || h.riskLevel === filterRisk;
    const matchSearch =
      h.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchMonth && matchStatus && matchRisk && matchSearch;
  });

  // Reset page to 1 whenever any filter condition or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterMonth, filterStatus, filterRisk, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredHazards.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredHazards.length);
  const paginatedHazards = filteredHazards.slice(startIndex, endIndex);

  // Metric counts scoped to selected month
  const monthScopedHazards = filterMonth === 'ALL'
    ? hazards
    : hazards.filter((h) => h.timestamp && h.timestamp.startsWith(filterMonth));

  const totalCount = monthScopedHazards.length;
  const openCount = monthScopedHazards.filter((h) => h.status === 'Open').length;
  const inProgressCount = monthScopedHazards.filter((h) => h.status === 'In Progress').length;
  const closedCount = monthScopedHazards.filter((h) => h.status === 'Closed').length;

  const isFiltered = searchQuery.trim() !== '' || filterMonth !== 'ALL' || filterStatus !== 'ALL' || filterRisk !== 'ALL';
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterMonth('ALL');
    setFilterStatus('ALL');
    setFilterRisk('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5 pb-20 w-full max-w-full min-w-0">
      {/* 1. Header Ringkasan Eksekutif & Action Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Google Sheets Terhubung</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard Keselamatan Pertambangan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Monitoring real-time bahaya operasional K3LH, penugasan perbaikan PIC lapangan, dan pembuatan laporan otomatis.
            </p>
          </div>

          {/* Grouped Action Toolbar: Structured into Intentional Clusters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Primary Action */}
            <button
              onClick={onNavigateToForm}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Laporan</span>
            </button>

            {/* Export Cluster */}
            <div className="inline-flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <button
                onClick={handleExportExcel}
                disabled={isExportingExcel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-white rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                title="Unduh laporan lengkap format spreadsheet Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isExportingExcel ? 'Menyiapkan...' : 'Unduh Excel'}</span>
              </button>

              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 opacity-40 cursor-not-allowed select-none rounded-lg"
                title="Fitur PPT Terkunci (Paket Laporan Standard)"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span>PPT Mingguan</span>
              </button>

              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 opacity-40 cursor-not-allowed select-none rounded-lg"
                title="Fitur PPT Terkunci (Paket Laporan Standard)"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span>PPT Bulanan</span>
              </button>
            </div>

            {/* Sync & Cloud Cluster */}
            <div className="inline-flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <button
                onClick={() => syncWithCloud()}
                disabled={isSyncingCloud}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                title="Tarik data terbaru dari Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncingCloud ? 'animate-spin' : ''}`} />
                <span>{isSyncingCloud ? 'Menyinkronkan...' : 'Tarik Data Live'}</span>
              </button>

              <button
                onClick={() => {
                  const savedPin = typeof window !== 'undefined' ? localStorage.getItem('SHE_CUSTOM_ADMIN_PIN') : null;
                  setCurrentPin(savedPin && savedPin !== '1234' ? savedPin : DEFAULT_ADMIN_PIN);
                  setShowWebhookModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-all cursor-pointer"
                title="Pengaturan integrasi Google Sheets & PIN Admin"
              >
                <Cloud className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Pengaturan Cloud & PIN</span>
              </button>
            </div>
          </div>
        </div>

        {syncStatusFeedback && (
          <div
            className={`mt-4 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all ${
              syncStatusFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span className="font-bold text-sm">
              {syncStatusFeedback.type === 'success' ? '✓' : '✕'}
            </span>
            <span>{syncStatusFeedback.message}</span>
          </div>
        )}
      </div>

      {/* 2. Refined, Confident Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Temuan */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Laporan</span>
            <HardHat className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <h4 className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalCount}</h4>
            <span className="text-[11px] text-slate-400 mt-1 block">Seluruh akumulasi temuan K3LH</span>
          </div>
        </div>

        {/* Card 2: Open */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-rose-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Menunggu Penanganan</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-3">
            <h4 className="text-3xl font-extrabold text-rose-600 tracking-tight">{openCount}</h4>
            <span className="text-[11px] text-slate-400 mt-1 block">Kondisi terbuka butuh PIC</span>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-amber-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Sedang Ditangani</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <h4 className="text-3xl font-extrabold text-amber-600 tracking-tight">{inProgressCount}</h4>
            <span className="text-[11px] text-slate-400 mt-1 block">Dalam investigasi & perbaikan</span>
          </div>
        </div>

        {/* Card 4: Closed */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Selesai Diverifikasi</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <h4 className="text-3xl font-extrabold text-emerald-600 tracking-tight">{closedCount}</h4>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {totalCount > 0 ? `${((closedCount / totalCount) * 100).toFixed(0)}% telah terverifikasi aman` : '0% selesai'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Hub (Anti-Slop, Clean & High Density) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-2xs space-y-2.5">
        {/* Top Row: Search Input + Month Dropdown + Reset Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label="Cari tiket, nama pelapor, area, atau deskripsi bahaya"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tiket, pelapor, area..."
              className="w-full bg-slate-50/90 pl-10 pr-9 py-2 text-xs text-slate-900 rounded-xl border border-slate-200/90 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Month Filter Dropdown */}
          <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/90 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 shrink-0 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              aria-label="Filter Periode Bulan"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL">Semua Periode</option>
              {availableMonths.map((ym) => (
                <option key={ym} value={ym}>
                  {formatYearMonth(ym)}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Reset Button if filters applied */}
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Reset semua filter pencarian"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Sub Row: Dual Filter Chips for Status & Risk (No redundant labels) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pt-2 border-t border-slate-100">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {(['ALL', 'Open', 'In Progress', 'Closed'] as const).map((status) => {
              const count = status === 'ALL' ? totalCount : status === 'Open' ? openCount : status === 'In Progress' ? inProgressCount : closedCount;
              const isActive = filterStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-amber-300 shadow-2xs font-bold'
                      : 'bg-slate-100/90 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200/60'
                  }`}
                >
                  <span>{status === 'ALL' ? 'Semua Status' : status === 'In Progress' ? 'Proses' : status === 'Closed' ? 'Selesai' : status}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-amber-400/20 text-amber-300 font-bold' : 'bg-slate-200 text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Risk Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {(['ALL', 'Tinggi', 'Sedang', 'Rendah'] as const).map((risk) => {
              const isActive = filterRisk === risk;
              return (
                <button
                  key={risk}
                  onClick={() => setFilterRisk(risk)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? risk === 'Tinggi'
                        ? 'bg-rose-600 text-white shadow-2xs font-bold'
                        : risk === 'Sedang'
                        ? 'bg-amber-500 text-slate-950 shadow-2xs font-bold'
                        : risk === 'Rendah'
                        ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                        : 'bg-slate-900 text-white shadow-2xs font-bold'
                      : 'bg-slate-100/90 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200/60'
                  }`}
                >
                  {risk !== 'ALL' && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive
                          ? 'bg-white'
                          : risk === 'Tinggi'
                          ? 'bg-rose-500'
                          : risk === 'Sedang'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  )}
                  <span>{risk === 'ALL' ? 'Semua Risiko' : risk}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Incident DataTable Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs w-full max-w-full min-w-0">
        {/* Table Title Bar (Anti-Slop: Clean, high density, no filler text) */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-200/80 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Daftar Laporan Bahaya</h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200/80 text-slate-700 font-mono">
              {filteredHazards.length}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {isFiltered ? (
              <span>Filter aktif: <strong className="text-slate-800">{filteredHazards.length}</strong> dari {totalCount} laporan</span>
            ) : (
              <span>Total {totalCount} laporan</span>
            )}
          </span>
        </div>

        {/* Mobile Horizontal Scroll Indicator Hint */}
        <div className="md:hidden px-4 py-2 bg-amber-50/70 border-b border-amber-200/60 flex items-center justify-between text-[11px] text-amber-950 font-medium">
          <span className="flex items-center gap-1.5">
            <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Geser tabel ke samping untuk melihat seluruh data</span>
          </span>
          <span className="text-amber-700 font-bold text-[10px] uppercase bg-amber-200/70 px-1.5 py-0.5 rounded">↔ Geser Tabel</span>
        </div>

        {/* Responsive Datatable Scroll Container */}
        <div className="overflow-x-auto w-full max-w-full overscroll-x-contain touch-pan-x">
          <table className="w-full text-left text-xs border-collapse min-w-[840px]">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 w-48 min-w-[170px]">Tiket & Foto</th>
                <th className="py-3 px-4 min-w-[240px]">Temuan Bahaya & Lokasi</th>
                <th className="py-3 px-4 w-44 min-w-[160px]">Klasifikasi & Risiko</th>
                <th className="py-3 px-4 w-40 min-w-[140px]">Pelapor</th>
                <th className="py-3 px-4 w-32 min-w-[110px]">Status</th>
                <th className="py-3 px-4 w-32 min-w-[120px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {filteredHazards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400 font-medium">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">Tidak ada laporan yang sesuai filter</p>
                      <p className="text-[11px] text-slate-500">Coba ubah kata kunci pencarian atau reset filter.</p>
                      {isFiltered && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-2 px-3 py-1.5 bg-slate-900 text-amber-400 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-800 transition-colors"
                        >
                          Reset Filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedHazards.map((item) => (
                  <tr key={item.id} className="odd:bg-white even:bg-slate-50/30 hover:bg-amber-50/40 transition-colors group">
                    {/* 1. Tiket & Foto (Integrated Thumbnail Chip + Ticket ID) */}
                    <td className="py-2.5 sm:py-3 px-4 align-middle">
                      <div className="flex items-center gap-2.5">
                        {item.photoUrl ? (
                          <button
                            type="button"
                            onClick={() => setActiveModalHazard({ hazard: item, mode: 'view' })}
                            className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-2xs group/thumb shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                            title={item.closurePhotoUrl ? "Lihat foto Sebelum & Sesudah" : "Lihat foto temuan"}
                          >
                            <img
                              src={formatDriveImageUrl(item.photoUrl)}
                              alt={`Foto ${item.id}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 bg-slate-900/35 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="w-3.5 h-3.5 text-white drop-shadow" />
                            </div>
                            {item.closurePhotoUrl && (
                              <span className="absolute bottom-0 right-0 bg-emerald-600 text-white text-[9px] font-bold px-1 rounded-tl" title="Tersedia foto perbaikan">
                                ✓
                              </span>
                            )}
                          </button>
                        ) : (
                          <div
                            className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 shrink-0"
                            title="Belum ada foto"
                          >
                            <ImageOff className="w-4 h-4 text-slate-400/80" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setActiveModalHazard({ hazard: item, mode: 'view' })}
                            className="font-mono font-bold text-xs text-slate-900 hover:text-amber-600 transition-colors text-left block leading-tight cursor-pointer truncate"
                            title={`Buka detail tiket ${item.id}`}
                          >
                            {item.id}
                          </button>
                          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {new Date(item.timestamp).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Temuan Bahaya & Lokasi */}
                    <td className="py-2.5 sm:py-3 px-4 align-middle">
                      <div className="max-w-md">
                        <p
                          onClick={() => setActiveModalHazard({ hazard: item, mode: 'view' })}
                          className="font-semibold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-1 hover:text-amber-600 transition-colors cursor-pointer"
                          title={item.description}
                        >
                          {item.description}
                        </p>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 font-medium truncate">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="font-semibold text-slate-700">{item.area}</span>
                          {item.locationDetail && <span className="text-slate-400 truncate">• {item.locationDetail}</span>}
                        </div>
                        {item.immediateAction && (
                          <div
                            className="mt-1 inline-flex items-center gap-1 text-[10px] text-amber-900 bg-amber-50/90 px-1.5 py-0.5 rounded border border-amber-200/70 font-medium truncate max-w-full"
                            title={`Tindakan Langsung: ${item.immediateAction}`}
                          >
                            <Shield className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate"><strong className="text-amber-950 font-semibold">Tindakan:</strong> {item.immediateAction}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 3. Tipe & Risiko */}
                    <td className="py-2.5 sm:py-3 px-4 align-middle">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            item.hazardType === 'KTA'
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : 'bg-rose-50 text-rose-900 border-rose-200'
                          }`}
                        >
                          {item.hazardType === 'KTA' ? 'KTA' : 'TTA'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            item.riskLevel === 'Tinggi'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : item.riskLevel === 'Sedang'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.riskLevel === 'Tinggi'
                                ? 'bg-rose-600 animate-pulse'
                                : item.riskLevel === 'Sedang'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span>{item.riskLevel}</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-1 truncate max-w-[170px] font-medium" title={item.category}>
                        {item.category}
                      </span>
                    </td>

                    {/* 4. Pelapor */}
                    <td className="py-2.5 sm:py-3 px-4 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                          {item.reporterName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 text-xs truncate max-w-[130px]" title={item.reporterName}>
                            {item.reporterName}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[130px]" title={`${item.department} (NIK: ${item.reporterNik})`}>
                            {item.department || `NIK: ${item.reporterNik}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 5. Status Penanganan */}
                    <td className="py-2.5 sm:py-3 px-4 align-middle">
                      {item.status === 'Closed' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Selesai</span>
                        </span>
                      ) : item.status === 'In Progress' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                          <span>Proses</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200/80 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                          <span>Open</span>
                        </span>
                      )}
                    </td>

                    {/* 6. Aksi */}
                    <td className="py-2.5 sm:py-3 px-4 align-middle text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {item.status !== 'Closed' ? (
                          <>
                            {item.status === 'Open' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item.id, 'In Progress')}
                                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-900 border border-amber-200/80 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                                title="Tandai sedang diproses"
                              >
                                Proses
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setActiveModalHazard({ hazard: item, mode: 'resolve' })}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                              title="Verifikasi penyelesaian bahaya"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Selesaikan</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveModalHazard({ hazard: item, mode: 'view' })}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                            title="Lihat bukti penyelesaian bahaya"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Detail</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Pagination & Page Size Control (Anti-Slop, High-Density) */}
        {filteredHazards.length > 0 && (
          <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-slate-200/80 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            {/* Left: Row Count & Page Size Selector */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <span className="font-medium text-slate-500">
                Menampilkan <strong className="text-slate-800 font-semibold">{filteredHazards.length === 0 ? 0 : startIndex + 1}</strong>–<strong className="text-slate-800 font-semibold">{endIndex}</strong> dari <strong className="text-slate-800 font-semibold">{filteredHazards.length}</strong> laporan
              </span>
              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Per hal:</span>
                <select
                  aria-label="Jumlah baris per halaman"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-2xs"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Right: Navigation Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-end">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed shadow-2xs transition-colors cursor-pointer"
                  title="Halaman sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1 px-1">
                  {getPageNumbers(safeCurrentPage, totalPages).map((p, idx) => {
                    if (p === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 font-mono">
                          …
                        </span>
                      );
                    }
                    const pageNum = p as number;
                    const isActive = pageNum === safeCurrentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isActive
                            ? 'bg-slate-900 text-amber-300 shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed shadow-2xs transition-colors cursor-pointer"
                  title="Halaman berikutnya"
                >
                  <span className="hidden sm:inline">Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Sebelum & Sesudah Perbaikan (Before & After) / Verifikasi Selesai */}
      {activeModalHazard && (
        <HazardBeforeAfterModal
          hazard={activeModalHazard.hazard}
          mode={activeModalHazard.mode}
          onClose={() => setActiveModalHazard(null)}
          onConfirmResolve={handleConfirmResolve}
          onAttachPhoto={(h) => {
            setActiveModalHazard(null);
            setAttachPhotoHazard(h);
          }}
        />
      )}

      {attachPhotoHazard && (
        <AttachPhotoModal
          hazard={attachPhotoHazard}
          onClose={() => setAttachPhotoHazard(null)}
          onSuccess={(updated) => {
            setHazards((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
          }}
        />
      )}

      {/* Modal Foto Pratinjau Standar */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau Foto Dokumentasi Bahaya"
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-xl max-h-[80vh] bg-white border border-slate-200 rounded-2xl overflow-hidden p-3 shadow-2xl">
            <img src={formatDriveImageUrl(selectedPhoto)} alt="Dokumentasi Bahaya" className="w-full h-auto max-h-[70vh] object-contain rounded-xl" />
            <p className="text-center text-xs text-slate-500 mt-2">Klik di mana saja untuk menutup</p>
          </div>
        </div>
      )}

      {/* Modal Pengaturan Cloud & Keamanan Sistem */}
      {showWebhookModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="webhook-modal-title"
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 id="webhook-modal-title" className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-800" />
              Pengaturan Cloud & Keamanan Sistem
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Konfigurasi sinkronisasi Google Sheets dan ubah PIN otorisasi admin SHE pertambangan.
            </p>

            {/* 1. Pengaturan Webhook URL */}
            <div className="mb-4">
              <label htmlFor="webhookInput" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-blue-600" />
                Google Apps Script Webhook URL
              </label>
              <input
                id="webhookInput"
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Link Webhook Google Apps Script yang terhubung ke spreadsheet tim SHE.
              </span>
            </div>

            {/* 2. Pengaturan PIN Admin */}
            <div className="mb-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <label htmlFor="pinSettingsInput" className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  PIN Admin SHE (Otorisasi & Login)
                </span>
                <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  Rahasia
                </span>
              </label>
              <div className="relative">
                <input
                  id="pinSettingsInput"
                  type={showPinInModal ? 'text' : 'password'}
                  value={currentPin}
                  onChange={(e) => {
                    setCurrentPin(e.target.value);
                    if (pinSaveFeedback) setPinSaveFeedback(null);
                  }}
                  placeholder="Masukkan PIN Admin (min. 4 karakter)"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 pr-10 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPinInModal(!showPinInModal)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title={showPinInModal ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                >
                  {showPinInModal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                PIN ini digunakan untuk login admin dan otorisasi perubahan status temuan. Pastikan variabel <code className="bg-slate-200/80 px-1 py-0.5 rounded text-[10px]">ADMIN_PIN</code> di Google Apps Script sama.
              </p>
              {pinSaveFeedback && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {pinSaveFeedback}
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowWebhookModal(false);
                  setPinSaveFeedback(null);
                }}
                className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Simpan Pengaturan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
