import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Presentation,
  Filter,
  Search,
  PlusCircle,
  Cloud,
  Calendar,
  Award,
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24 text-slate-800">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-500 block mb-1">TOTAL HAZARD</span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">{totalCount}</div>
          <span className="text-[11px] text-slate-400">Laporan Masuk</span>
        </div>

        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4">
          <span className="text-xs font-semibold text-red-600 block mb-1">OPEN HAZARD</span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-red-600">{openCount}</div>
          <span className="text-[11px] text-slate-400">Perlu Tindakan Segera</span>
        </div>

        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4">
          <span className="text-xs font-semibold text-amber-600 block mb-1">IN PROGRESS</span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-600">{inProgressCount}</div>
          <span className="text-[11px] text-slate-400">Sedang Dikerjakan</span>
        </div>

        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4">
          <span className="text-xs font-semibold text-emerald-600 block mb-1">CLOSED / SELESAI</span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600">{closedCount}</div>
          <span className="text-[11px] text-emerald-600 font-medium">
            {totalCount > 0 ? `${((closedCount / totalCount) * 100).toFixed(0)}% Selesai` : '0%'}
          </span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleQuickDownloadWeekly}
            disabled={isGeneratingPPT}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all"
          >
            <Presentation className="w-4 h-4" />
            <span>{isGeneratingPPT ? 'Rendering PPT...' : 'Download Weekly PPT (6 Slide)'}</span>
          </button>

          <button
            onClick={handleQuickDownloadMonthly}
            disabled={isGeneratingPPT}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all"
          >
            <Presentation className="w-4 h-4" />
            <span>Download Monthly PPT (10 Slide)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-2 border border-slate-200 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel / CSV</span>
          </button>

          <button
            onClick={onNavigateToWeekly}
            className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 border border-blue-200 transition-all"
            title="Buka form input log mingguan"
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Input Mingguan</span>
          </button>

          <button
            onClick={onNavigateToMonthly}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 border border-emerald-200 transition-all"
            title="Buka form input log bulanan"
          >
            <Award className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Input Bulanan</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWebhookModal(true)}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 text-xs flex items-center gap-1.5 transition-colors"
            title="Koneksi Google Sheets Webhook"
          >
            <Cloud className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Google Sheets</span>
          </button>

          <button
            onClick={onNavigateToForm}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Lapor Baru (HP)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4 mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Tiket, Nama Pelapor, Area, atau Deskripsi bahaya..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            {(['ALL', 'Open', 'In Progress', 'Closed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                  filterStatus === st
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-slate-500 font-medium shrink-0">Risiko:</span>
            {(['ALL', 'Tinggi', 'Sedang', 'Rendah'] as const).map((rk) => (
              <button
                key={rk}
                onClick={() => setFilterRisk(rk)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                  filterRisk === rk
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {rk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hazard Reports Table */}
      <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-bold">Tiket & Foto</th>
                <th className="py-3.5 px-4 font-bold">Pelapor & Dept</th>
                <th className="py-3.5 px-4 font-bold">Area Lokasi</th>
                <th className="py-3.5 px-4 font-bold">Tipe & Kategori</th>
                <th className="py-3.5 px-4 font-bold">Risiko</th>
                <th className="py-3.5 px-4 font-bold">Deskripsi & Temuan</th>
                <th className="py-3.5 px-4 font-bold">Status & Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHazards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    Tidak ada laporan bahaya yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredHazards.map((h) => {
                  const riskBadge = {
                    Tinggi: 'bg-red-50 text-red-700 border-red-200',
                    Sedang: 'bg-amber-50 text-amber-700 border-amber-200',
                    Rendah: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  }[h.riskLevel];

                  const statusBadge = {
                    Open: 'bg-red-50 text-red-700 border-red-200',
                    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
                    Closed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  }[h.status];

                  return (
                    <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                      {/* Tiket & Foto */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedPhoto(h.photoUrl)}
                            className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 hover:opacity-80 transition-opacity"
                          >
                            <img src={h.photoUrl} alt="Hazard" className="w-full h-full object-cover" />
                          </button>
                          <div>
                            <span className="font-mono text-xs font-bold text-amber-700 block">{h.id}</span>
                            <span className="text-[11px] text-slate-400 block">
                              {new Date(h.timestamp).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Pelapor */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">{h.reporterName}</span>
                        <span className="text-xs text-slate-500 font-mono">NIK: {h.reporterNik}</span>
                        <span className="text-[11px] text-slate-400 block">{h.department}</span>
                      </td>

                      {/* Area */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold text-slate-800 block">{h.area}</span>
                        {h.locationDetail && (
                          <span className="text-[11px] text-slate-500 block">{h.locationDetail}</span>
                        )}
                      </td>

                      {/* Tipe & Kategori */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded mr-1 ${
                            h.hazardType === 'KTA'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-orange-100 text-orange-800 border border-orange-200'
                          }`}
                        >
                          {h.hazardType}
                        </span>
                        <span className="text-xs text-slate-700 block mt-1">{h.category}</span>
                      </td>

                      {/* Risiko */}
                      <td className="py-3.5 px-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${riskBadge}`}>
                          {h.riskLevel}
                        </span>
                      </td>

                      {/* Deskripsi */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">{h.description}</p>
                        {h.immediateAction && (
                          <p className="text-[11px] text-emerald-700 font-medium mt-1 line-clamp-1">
                            Action: {h.immediateAction}
                          </p>
                        )}
                      </td>

                      {/* Status & Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1.5">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border text-center ${statusBadge}`}>
                            {h.status}
                          </span>
                          <div className="flex items-center gap-1 mt-1">
                            {h.status !== 'Closed' && (
                              <button
                                onClick={() => handleStatusChange(h.id, 'Closed')}
                                className="text-[11px] px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium transition-colors shadow-sm"
                              >
                                Close
                              </button>
                            )}
                            {h.status === 'Open' && (
                              <button
                                onClick={() => handleStatusChange(h.id, 'In Progress')}
                                className="text-[11px] px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded font-medium transition-colors shadow-sm"
                              >
                                Proses
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Preview Foto */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-2xl max-h-[85vh] bg-white border border-slate-200 rounded-2xl overflow-hidden p-3 shadow-2xl">
            <img src={selectedPhoto} alt="Dokumentasi Bahaya" className="w-full h-auto max-h-[75vh] object-contain rounded-xl" />
            <p className="text-center text-xs text-slate-500 mt-2 font-medium">Klik di mana saja untuk menutup</p>
          </div>
        </div>
      )}

      {/* Modal Pengaturan Google Sheets Webhook */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-600" />
              Koneksi Sinkronisasi Google Sheets
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Masukkan Webhook URL Google Apps Script yang terhubung ke Google Sheet tim SHE Mas Gusti.
              Setiap kali laporan disubmit via HP, baris baru otomatis masuk ke spreadsheet.
            </p>

            <div className="mb-4">
              <label htmlFor="webhookInput" className="block text-xs font-semibold text-slate-700 mb-1">
                Google Apps Script Webhook URL
              </label>
              <input
                id="webhookInput"
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowWebhookModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveWebhook}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
