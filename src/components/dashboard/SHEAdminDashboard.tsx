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

  // Metric counts scoped to selected month
  const monthScopedHazards = filterMonth === 'ALL'
    ? hazards
    : hazards.filter((h) => h.timestamp && h.timestamp.startsWith(filterMonth));

  const totalCount = monthScopedHazards.length;
  const openCount = monthScopedHazards.filter((h) => h.status === 'Open').length;
  const inProgressCount = monthScopedHazards.filter((h) => h.status === 'In Progress').length;
  const closedCount = monthScopedHazards.filter((h) => h.status === 'Closed').length;

  return (
    <div className="space-y-5 pb-20">
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

      {/* 3. Filter & Search Hub */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Cari ID tiket, nama pelapor, area pit, atau deskripsi bahaya"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID tiket, pelapor, area, atau deskripsi..."
            className="w-full bg-slate-50/80 pl-10 pr-4 py-2 text-xs text-slate-900 rounded-xl border border-slate-200/80 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all shadow-2xs"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month Filter Dropdown */}
          <div className="inline-flex items-center gap-1.5 bg-slate-100/90 px-2.5 py-1.5 rounded-xl border border-slate-200/70 shadow-2xs">
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

          {/* Status Tabs */}
          <div className="inline-flex bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/70">
            {(['ALL', 'Open', 'In Progress', 'Closed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterStatus === status
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status === 'ALL' ? `Semua (${totalCount})` : status === 'Open' ? `Open (${openCount})` : status === 'In Progress' ? `Proses (${inProgressCount})` : `Closed (${closedCount})`}
              </button>
            ))}
          </div>

          {/* Risk Tabs */}
          <div className="hidden sm:inline-flex bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/70">
            {(['ALL', 'Tinggi', 'Sedang', 'Rendah'] as const).map((risk) => (
              <button
                key={risk}
                onClick={() => setFilterRisk(risk)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterRisk === risk
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {risk === 'ALL' ? 'Semua' : risk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clean High-Contrast Incident Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Daftar Temuan Bahaya Lapangan</h3>
            <p className="text-xs text-slate-500 mt-0.5">Pantau dan verifikasi tindak lanjut keselamatan kerja operasional</p>
          </div>
          <span className="text-xs text-slate-600 font-semibold bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto">
            Total {filteredHazards.length} Laporan
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4 w-40 min-w-[150px]">No. Tiket & Waktu</th>
                <th className="py-3 px-4 min-w-[260px]">Temuan Bahaya & Lokasi</th>
                <th className="py-3 px-4 w-48 min-w-[180px]">Klasifikasi & Risiko</th>
                <th className="py-3 px-4 w-44 min-w-[160px]">Pelapor</th>
                <th className="py-3 px-4 w-36 min-w-[130px]">Status</th>
                <th className="py-3 px-4 w-36 min-w-[140px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {filteredHazards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    Tidak ada laporan bahaya yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredHazards.map((item) => (
                  <tr key={item.id} className="odd:bg-white even:bg-slate-50/40 hover:bg-amber-50/40 transition-colors">
                    {/* 1. ID & Timestamp */}
                    <td className="py-3.5 px-4 align-top">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 text-[11px] inline-block shadow-2xs">
                        {item.id}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-1 font-medium">
                        {new Date(item.timestamp).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {item.photoUrl ? (
                        <button
                          onClick={() => setActiveModalHazard({ hazard: item, mode: 'view' })}
                          className="mt-1.5 text-[11px] text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>{item.closurePhotoUrl ? 'Before & After' : 'Lihat Foto'}</span>
                        </button>
                      ) : (
                        <span className="mt-1.5 text-[11px] text-slate-400 font-medium flex items-center gap-1 italic">
                          <ImageOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Belum ada foto</span>
                        </span>
                      )}
                    </td>

                    {/* 2. Temuan & Area */}
                    <td className="py-3.5 px-4 align-top">
                      <p className="font-semibold text-slate-900 text-xs leading-relaxed">
                        {item.description}
                      </p>
                      <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-semibold text-slate-800">{item.area}</span>
                        {item.locationDetail && <span className="text-slate-500">• {item.locationDetail}</span>}
                      </div>
                      {item.immediateAction && (
                        <div className="text-[11px] text-slate-600 mt-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200/80 font-medium">
                          <span className="font-semibold text-slate-700">Tindakan Langsung:</span> {item.immediateAction}
                        </div>
                      )}
                    </td>

                    {/* 3. Tipe & Risiko */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                            item.hazardType === 'KTA'
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-red-50 text-red-900 border-red-300'
                          }`}
                        >
                          {item.hazardType === 'KTA' ? 'KTA (Kondisi)' : 'TTA (Tindakan)'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            item.riskLevel === 'Tinggi'
                              ? 'bg-red-50 text-red-700 border-red-300'
                              : item.riskLevel === 'Sedang'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.riskLevel === 'Tinggi'
                                ? 'bg-red-600'
                                : item.riskLevel === 'Sedang'
                                ? 'bg-amber-600'
                                : 'bg-emerald-600'
                            }`}
                          />
                          <span>Risiko {item.riskLevel}</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-1.5 line-clamp-1 font-medium">
                        {item.category}
                      </span>
                    </td>

                    {/* 4. Pelapor */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                          {item.reporterName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{item.reporterName}</div>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">NIK: {item.reporterNik}</div>
                          <div className="text-[11px] text-slate-600 font-medium">{item.department}</div>
                        </div>
                      </div>
                    </td>

                    {/* 5. Status */}
                    <td className="py-3.5 px-4 align-top">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${
                          item.status === 'Closed'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : item.status === 'In Progress'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}
                      >
                        {item.status === 'Closed' ? 'Closed' : item.status === 'In Progress' ? 'In Progress' : 'Open'}
                      </span>
                      {item.picPerbaikan && (
                        <span className="text-[10px] text-slate-500 block mt-1 font-medium">
                          PIC: {item.picPerbaikan}
                        </span>
                      )}
                    </td>

                    {/* 6. Aksi */}
                    <td className="py-3.5 px-4 align-top text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        {item.status !== 'Closed' && (
                          <button
                            onClick={() => setActiveModalHazard({ hazard: item, mode: 'resolve' })}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Selesaikan</span>
                          </button>
                        )}
                        {item.status === 'Open' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'In Progress')}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold rounded-lg border border-amber-600/30 transition-colors cursor-pointer"
                          >
                            Proses
                          </button>
                        )}
                        {item.status === 'Closed' && (
                          <button
                            onClick={() => setActiveModalHazard({ hazard: item, mode: 'view' })}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-[11px] font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Bukti Selesai</span>
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
