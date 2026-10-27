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
} from 'lucide-react';
import { HazardReport, HazardStatus } from '../../types/hazard';
import { getAllHazardReports, updateHazardStatus, exportReportsToCSV, saveHazardReport } from '../../services/storage-service';
import { exportReportsToExcel } from '../../services/excel-export-service';
import { downloadWeeklyPPT, downloadMonthlyPPT } from '../../services/pptx-engine';
import { WeeklySHEReport, MonthlySHEReport } from '../../types/she-report';
import {
  fetchHazardsFromGoogleSheets,
  syncHazardToGoogleSheets,
  getActiveWebhookUrl,
  SHEETS_WEBHOOK_KEY,
} from '../../services/sheets-sync-service';

// Seed sample mining reports if none exist
const SEED_DATA: HazardReport[] = [
  {
    id: 'HZD-20261026-X89A',
    timestamp: '2026-10-26T08:15:00Z',
    reporterName: 'Supriyanto',
    reporterNik: '204192',
    department: 'Mining Operation',
    area: 'Pit North / Front Loading',
    locationDetail: 'Bench 4 Loading Point Exca 01',
    hazardType: 'KTA',
    category: 'Jalan Tambang, Tanggul, & Lereng',
    riskLevel: 'Tinggi',
    description: 'Tanggul pengaman (windrow) runtuh tergerus air hujan, ketinggian kurang dari 3/4 diameter roda HD785.',
    photoUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    immediateAction: 'Pasang safety cone dan batasi akses unit sarana LV.',
    status: 'In Progress',
    picPerbaikan: 'Foreman Pit North',
    syncedToSheets: true,
  },
  {
    id: 'HZD-20261025-A4B2',
    timestamp: '2026-10-25T14:30:00Z',
    reporterName: 'Dedi Kurniawan',
    reporterNik: '201948',
    department: 'Hauling & Transport',
    area: 'Hauling Road',
    locationDetail: 'KM 14 Tikungan Pos 2',
    hazardType: 'TTA',
    category: 'Blind Spot, Debu, & Rambu Keselamatan',
    riskLevel: 'Sedang',
    description: 'Driver hauling mendahului unit dump truck di area tikungan blind spot.',
    photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    immediateAction: 'Peringatan via radio kanal 3 dan coaching di tempat.',
    status: 'Closed',
    picPerbaikan: 'Safety Officer Hauling',
    closedDate: '2026-10-25',
    syncedToSheets: true,
  },
  {
    id: 'HZD-20261024-C7F1',
    timestamp: '2026-10-24T10:00:00Z',
    reporterName: 'Agus Salim',
    reporterNik: '205310',
    department: 'Workshop & Plant',
    area: 'Workshop / Plant',
    locationDetail: 'Bay 3 Service Truk',
    hazardType: 'KTA',
    category: 'Tumpahan Oli, BBM, & Lingkungan',
    riskLevel: 'Sedang',
    description: 'Ceceran oli hidrolik bocor di lantai bay service, berpotensi terpeleset dan mencemari drainase.',
    photoUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    immediateAction: 'Tabur serbuk gergaji/oil spill kit dan pasang pita barikade.',
    status: 'Closed',
    picPerbaikan: 'Mekanik Leader',
    closedDate: '2026-10-24',
    syncedToSheets: true,
  },
  {
    id: 'HZD-20261023-F9E3',
    timestamp: '2026-10-23T16:45:00Z',
    reporterName: 'Hendra Wijaya',
    reporterNik: '203819',
    department: 'Coal Processing / ROM',
    area: 'ROM Stockpile',
    locationDetail: 'Hopper Crusher Primary',
    hazardType: 'KTA',
    category: 'Bahaya Kelistrikan & Panas',
    riskLevel: 'Rendah',
    description: 'Cover panel emergency stop pada conveyor crusher longgar dan kabel sedikit terbuka.',
    photoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    immediateAction: 'Dilaporkan ke tim elektrikal site.',
    status: 'Open',
    picPerbaikan: 'Electrician ROM',
    syncedToSheets: false,
  },
];

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
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isGeneratingPPT, setIsGeneratingPPT] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const loadData = () => {
    const stored = getAllHazardReports();
    setHazards(stored);
  };

  const syncWithCloud = async () => {
    setIsSyncingCloud(true);
    try {
      const cloudData = await fetchHazardsFromGoogleSheets();
      if (cloudData && cloudData.length > 0) {
        setHazards(cloudData);
        cloudData.forEach((s) => saveHazardReport(s));
      } else {
        loadData();
      }
    } catch {
      loadData();
    } finally {
      setIsSyncingCloud(false);
    }
  };

  useEffect(() => {
    loadData();
    syncWithCloud();
    const currentWebhook = getActiveWebhookUrl();
    setWebhookUrl(currentWebhook);
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

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      await exportReportsToExcel(hazards);
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

  const handleSaveWebhook = () => {
    localStorage.setItem('SHE_SHEETS_WEBHOOK_URL', webhookUrl.trim());
    setShowWebhookModal(false);
  };

  // Filtered reports
  const filteredHazards = hazards.filter((h) => {
    const matchStatus = filterStatus === 'ALL' || h.status === filterStatus;
    const matchRisk = filterRisk === 'ALL' || h.riskLevel === filterRisk;
    const matchSearch =
      h.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchRisk && matchSearch;
  });

  const totalCount = hazards.length;
  const openCount = hazards.filter((h) => h.status === 'Open').length;
  const inProgressCount = hazards.filter((h) => h.status === 'In Progress').length;
  const closedCount = hazards.filter((h) => h.status === 'Closed').length;

  return (
    <div className="space-y-5 pb-20">
      {/* Human Enterprise Action Toolbar Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-900">Google Sheets Live</span>
          </div>
          <span className="hidden sm:inline text-xs text-slate-400">
            Database Cloud K3 Tambang
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={syncWithCloud}
            disabled={isSyncingCloud}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            title="Tarik data terbaru dari Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncingCloud ? 'animate-spin' : ''}`} />
            <span>{isSyncingCloud ? 'Menyinkronkan...' : 'Tarik Data Live'}</span>
          </button>

          <button
            onClick={onNavigateToForm}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Laporan</span>
          </button>

          <button
            onClick={handleQuickDownloadWeekly}
            disabled={isGeneratingPPT}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            title="Unduh slide presentasi mingguan"
          >
            <Presentation className="w-4 h-4 text-amber-600" />
            <span>Unduh PPT Mingguan</span>
          </button>

          <button
            onClick={handleQuickDownloadMonthly}
            disabled={isGeneratingPPT}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            title="Unduh slide presentasi bulanan"
          >
            <Presentation className="w-4 h-4 text-amber-600" />
            <span>Unduh PPT Bulanan</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Unduh laporan lengkap format spreadsheet Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>{isExportingExcel ? 'Menyiapkan...' : 'Unduh Excel'}</span>
          </button>

          <button
            onClick={() => setShowWebhookModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
            title="Pengaturan integrasi Google Sheets"
          >
            <Cloud className="w-4 h-4 text-blue-600" />
            <span>Sinkronisasi Cloud</span>
          </button>
        </div>
      </div>

      {/* Human Enterprise Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Temuan */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <HardHat className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-400">Semua Waktu</span>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-bold text-slate-900 tracking-tight">{totalCount}</h4>
            <span className="text-xs font-medium text-slate-500 mt-1 block">Total Laporan</span>
          </div>
        </div>

        {/* Card 2: Open */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Perlu Aksi</span>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-bold text-red-600 tracking-tight">{openCount}</h4>
            <span className="text-xs font-medium text-slate-500 mt-1 block">Menunggu Penanganan</span>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Proses</span>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-bold text-amber-600 tracking-tight">{inProgressCount}</h4>
            <span className="text-xs font-medium text-slate-500 mt-1 block">Sedang Ditangani</span>
          </div>
        </div>

        {/* Card 4: Closed */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              {totalCount > 0 ? `${((closedCount / totalCount) * 100).toFixed(0)}% Selesai` : '0% Selesai'}
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-bold text-emerald-600 tracking-tight">{closedCount}</h4>
            <span className="text-xs font-medium text-slate-500 mt-1 block">Selesai Diverifikasi</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID tiket, nama pelapor, area pit, atau deskripsi bahaya..."
            className="w-full bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 font-medium rounded-lg border border-slate-200 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 mr-1">
            <span>Status:</span>
          </div>
          {(['ALL', 'Open', 'In Progress', 'Closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {status === 'ALL' ? 'Semua' : status}
            </button>
          ))}

          <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

          <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 mr-1">
            <span>Risiko:</span>
          </div>
          {(['ALL', 'Tinggi', 'Sedang', 'Rendah'] as const).map((risk) => (
            <button
              key={risk}
              onClick={() => setFilterRisk(risk)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterRisk === risk
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {risk === 'ALL' ? 'Semua' : risk}
            </button>
          ))}
        </div>
      </div>

      {/* Human Enterprise Incident Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Daftar Temuan Bahaya Lapangan</h3>
          <span className="text-xs text-slate-500 font-medium">Menampilkan {filteredHazards.length} laporan</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold text-slate-600">
                <th className="py-3.5 px-4 w-40">Tiket dan Waktu</th>
                <th className="py-3.5 px-4">Temuan Bahaya dan Area</th>
                <th className="py-3.5 px-4 w-44">Jenis dan Risiko</th>
                <th className="py-3.5 px-4 w-40">Pelapor</th>
                <th className="py-3.5 px-4 w-48 text-right">Status dan Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHazards.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                    Tidak ada laporan bahaya yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredHazards.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ID & Timestamp */}
                    <td className="py-3 px-4 align-top">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 text-[11px] block w-fit">
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
                      {item.photoUrl && (
                        <button
                          onClick={() => setSelectedPhoto(item.photoUrl)}
                          className="mt-1.5 text-[11px] text-amber-600 hover:text-amber-700 font-semibold underline flex items-center gap-1 cursor-pointer"
                        >
                          Lihat Foto
                        </button>
                      )}
                    </td>

                    {/* Temuan & Area */}
                    <td className="py-3 px-4 align-top">
                      <div className="font-semibold text-slate-900 text-xs">{item.description}</div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                        <span className="font-semibold text-slate-700">{item.area}</span>
                        {item.locationDetail && <span>• {item.locationDetail}</span>}
                      </div>
                      {item.immediateAction && (
                        <div className="text-[11px] text-slate-600 mt-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200/60 font-medium">
                          Tindakan: {item.immediateAction}
                        </div>
                      )}
                    </td>

                    {/* Tipe & Risiko */}
                    <td className="py-3 px-4 align-top">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${
                            item.hazardType === 'KTA'
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-red-50 text-red-900 border-red-300'
                          }`}
                        >
                          {item.hazardType === 'KTA' ? 'Kondisi Tidak Aman' : 'Tindakan Tidak Aman'}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${
                            item.riskLevel === 'Tinggi'
                              ? 'bg-red-50 text-red-700 border-red-300'
                              : item.riskLevel === 'Sedang'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          Risiko {item.riskLevel}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-1.5 line-clamp-1 font-medium">{item.category}</span>
                    </td>

                    {/* Pelapor */}
                    <td className="py-3 px-4 align-top">
                      <div className="font-bold text-slate-900">{item.reporterName}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">NIK: {item.reporterNik}</div>
                      <div className="text-[11px] text-slate-600 font-medium">{item.department}</div>
                    </td>

                    {/* Status & Aksi */}
                    <td className="py-3 px-4 align-top text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                            item.status === 'Closed'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : item.status === 'In Progress'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                          }`}
                        >
                          {item.status === 'Closed' ? 'Closed' : item.status === 'In Progress' ? 'In Progress' : 'Open'}
                        </span>

                        <div className="flex items-center gap-1 mt-1">
                          {item.status !== 'Closed' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'Closed')}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded shadow-xs transition-colors"
                            >
                              Selesaikan
                            </button>
                          )}
                          {item.status === 'Open' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'In Progress')}
                              className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[10px] font-black uppercase rounded border border-amber-600/30 transition-colors"
                            >
                              Proses
                            </button>
                          )}
                        </div>

                        {item.picPerbaikan && (
                          <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">PIC: {item.picPerbaikan}</span>
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

      {/* Modal Foto Pratinjau */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-xl max-h-[80vh] bg-white border border-zinc-200 rounded-xl overflow-hidden p-3 shadow-xl">
            <img src={selectedPhoto} alt="Dokumentasi Bahaya" className="w-full h-auto max-h-[70vh] object-contain rounded-lg" />
            <p className="text-center text-xs text-zinc-400 mt-2">Klik di mana saja untuk menutup</p>
          </div>
        </div>
      )}

      {/* Modal Pengaturan Webhook Google Sheets */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-semibold text-zinc-950 mb-1 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-zinc-700" />
              Koneksi Sinkronisasi Google Sheets
            </h3>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              Masukkan Webhook URL Google Apps Script yang terhubung ke Google Sheet tim SHE. Setiap laporan baru akan otomatis tersimpan.
            </p>

            <div className="mb-4">
              <label htmlFor="webhookInput" className="block text-xs font-medium text-zinc-700 mb-1">
                Google Apps Script Webhook URL
              </label>
              <input
                id="webhookInput"
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowWebhookModal(false)}
                className="px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveWebhook}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors"
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
