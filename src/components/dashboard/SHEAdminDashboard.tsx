import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Presentation,
  Search,
  Plus,
  Cloud,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { HazardReport, HazardStatus } from '../../types/hazard';
import { getAllHazardReports, updateHazardStatus, exportReportsToCSV, saveHazardReport } from '../../services/storage-service';
import { downloadWeeklyPPT, downloadMonthlyPPT } from '../../services/pptx-engine';
import { WeeklySHEReport, MonthlySHEReport } from '../../types/she-report';

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
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  const loadData = () => {
    let stored = getAllHazardReports();
    if (stored.length === 0) {
      SEED_DATA.forEach((s) => saveHazardReport(s));
      stored = SEED_DATA;
    }
    setHazards(stored);
  };

  useEffect(() => {
    loadData();
    const currentWebhook = localStorage.getItem('SHE_SHEETS_WEBHOOK_URL') || '';
    setWebhookUrl(currentWebhook);
  }, []);

  const handleStatusChange = (id: string, newStatus: HazardStatus) => {
    updateHazardStatus(
      id,
      newStatus,
      newStatus === 'Closed' ? 'SHE Officer' : undefined,
      newStatus === 'Closed' ? new Date().toISOString().slice(0, 10) : undefined
    );
    loadData();
  };

  const handleExportCSV = () => {
    const csvContent = exportReportsToCSV(hazards);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Hazard_Report_Mining_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-300">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-zinc-950 uppercase">
              Dashboard Keselamatan Tambang
            </h1>
            <span className="text-[10px] bg-slate-900 text-amber-400 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider border border-zinc-700">
              PIT OPS // LIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitoring kondisi bahaya, rasio penyelesaian, dan otomatisasi pelaporan K3LH standar Kepmen ESDM
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onNavigateToForm}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 text-xs font-black uppercase tracking-wider rounded shadow-md border border-amber-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lapor Baru (HP)</span>
          </button>

          <button
            onClick={handleQuickDownloadWeekly}
            disabled={isGeneratingPPT}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded border border-slate-300 shadow-xs transition-colors disabled:opacity-50"
            title="Download slide mingguan PPT otomatis"
          >
            <Presentation className="w-3.5 h-3.5 text-amber-600" />
            <span>Download Weekly PPT (6 Slide)</span>
          </button>

          <button
            onClick={handleQuickDownloadMonthly}
            disabled={isGeneratingPPT}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded border border-slate-300 shadow-xs transition-colors disabled:opacity-50"
            title="Download slide bulanan PPT otomatis"
          >
            <Presentation className="w-3.5 h-3.5 text-amber-600" />
            <span>Download Monthly PPT (10 Slide)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded border border-slate-300 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Excel / CSV</span>
          </button>

          <button
            onClick={() => setShowWebhookModal(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded border border-slate-300 shadow-xs transition-colors"
            title="Pengaturan Google Sheets Webhook"
          >
            <Cloud className="w-3.5 h-3.5 text-blue-600" />
            <span>Google Sheets</span>
          </button>
        </div>
      </div>

      {/* Industrial Telemetry Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-300 border-t-4 border-t-slate-800 rounded-lg p-3.5 shadow-xs">
          <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block">[ TOTAL TEMUAN ]</span>
          <div className="text-2xl font-mono font-black tracking-tight text-slate-950 mt-1">{totalCount}</div>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Laporan tercatat</span>
        </div>

        <div className="bg-white border border-slate-300 border-t-4 border-t-red-600 rounded-lg p-3.5 shadow-xs">
          <span className="text-[10px] font-mono font-black text-red-600 uppercase tracking-widest block">[ OPEN // MENUNGGU ]</span>
          <div className="text-2xl font-mono font-black tracking-tight text-red-600 mt-1">{openCount}</div>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Perlu tindak lanjut</span>
        </div>

        <div className="bg-white border border-slate-300 border-t-4 border-t-amber-500 rounded-lg p-3.5 shadow-xs">
          <span className="text-[10px] font-mono font-black text-amber-600 uppercase tracking-widest block">[ IN PROGRESS ]</span>
          <div className="text-2xl font-mono font-black tracking-tight text-amber-600 mt-1">{inProgressCount}</div>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Sedang dikerjakan</span>
        </div>

        <div className="bg-white border border-slate-300 border-t-4 border-t-emerald-600 rounded-lg p-3.5 shadow-xs">
          <span className="text-[10px] font-mono font-black text-emerald-600 uppercase tracking-widest block">[ SELESAI // CLOSED ]</span>
          <div className="text-2xl font-mono font-black tracking-tight text-emerald-600 mt-1">{closedCount}</div>
          <span className="text-[11px] text-emerald-700 font-bold mt-0.5 block">
            {totalCount > 0 ? `${((closedCount / totalCount) * 100).toFixed(0)}% resolved` : '0%'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-300 rounded-lg p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID tiket, nama pelapor, area pit, atau deskripsi bahaya..."
            className="w-full bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 font-medium rounded border border-slate-200 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-600 mr-1 uppercase">
            <span>Status:</span>
          </div>
          {(['ALL', 'Open', 'In Progress', 'Closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-colors ${
                filterStatus === status
                  ? 'bg-amber-500 text-zinc-950 font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {status === 'ALL' ? 'Semua' : status}
            </button>
          ))}

          <div className="h-3 w-[1px] bg-slate-300 mx-1 hidden sm:block" />

          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-600 mr-1 uppercase">
            <span>Risiko:</span>
          </div>
          {(['ALL', 'Tinggi', 'Sedang', 'Rendah'] as const).map((risk) => (
            <button
              key={risk}
              onClick={() => setFilterRisk(risk)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-colors ${
                filterRisk === risk
                  ? 'bg-amber-500 text-zinc-950 font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {risk === 'ALL' ? 'Semua' : risk}
            </button>
          ))}
        </div>
      </div>

      {/* Industrial Scannable Incident Table */}
      <div className="bg-white border border-slate-300 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100 text-[10px] font-mono font-black text-slate-700 uppercase tracking-wider">
                <th className="py-2.5 px-4 w-36">[ TIKET & WAKTU ]</th>
                <th className="py-2.5 px-4">[ TEMUAN BAHAYA & AREA PIT ]</th>
                <th className="py-2.5 px-4 w-40">[ TIPE & RISIKO ]</th>
                <th className="py-2.5 px-4 w-40">[ PELAPOR ]</th>
                <th className="py-2.5 px-4 w-40 text-right">[ STATUS & TINDAK LANJUT ]</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
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
                      <span className="font-mono font-black text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 text-[11px] block w-fit">
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
                          className="mt-1.5 text-[10px] text-amber-600 hover:text-amber-700 font-bold underline flex items-center gap-1"
                        >
                          Lihat Foto
                        </button>
                      )}
                    </td>

                    {/* Temuan & Area */}
                    <td className="py-3 px-4 align-top">
                      <div className="font-bold text-slate-900">{item.description}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 font-medium">
                        <span className="font-bold text-slate-800">{item.area}</span>
                        {item.locationDetail && <span>• {item.locationDetail}</span>}
                      </div>
                      {item.immediateAction && (
                        <div className="text-[11px] text-slate-600 mt-1 italic font-medium">
                          Tindakan: {item.immediateAction}
                        </div>
                      )}
                    </td>

                    {/* Tipe & Risiko */}
                    <td className="py-3 px-4 align-top">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                            item.hazardType === 'KTA'
                              ? 'bg-amber-500 text-zinc-950 border-amber-600'
                              : 'bg-red-600 text-white border-red-700'
                          }`}
                        >
                          {item.hazardType}
                        </span>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            item.riskLevel === 'Tinggi'
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : item.riskLevel === 'Sedang'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          {item.riskLevel}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-1 line-clamp-1 font-medium">{item.category}</span>
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
