import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, HardHat, Plus } from 'lucide-react';
import { HazardReport } from '../../types/hazard';
import { getAllHazardReports, saveHazardReport } from '../../services/storage-service';
import { fetchHazardsFromGoogleSheets } from '../../services/sheets-sync-service';

interface WorkerTrackerProps {
  onNavigateToForm: () => void;
}

export const WorkerTracker: React.FC<WorkerTrackerProps> = ({ onNavigateToForm }) => {
  const [searchNik, setSearchNik] = useState('');
  const [reports, setReports] = useState<HazardReport[]>([]);

  useEffect(() => {
    setReports(getAllHazardReports());
    fetchHazardsFromGoogleSheets().then((cloudData) => {
      if (cloudData && cloudData.length > 0) {
        setReports(cloudData);
        cloudData.forEach((r) => saveHazardReport(r));
      }
    });
  }, []);

  const filteredReports = reports.filter((r) => {
    if (!searchNik.trim()) return true;
    const query = searchNik.toLowerCase().trim();
    return (
      r.reporterNik.toLowerCase().includes(query) ||
      r.reporterName.toLowerCase().includes(query) ||
      r.id.toLowerCase().includes(query) ||
      r.area.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-2xl mx-auto pb-28 md:pb-8">
      {/* Calm, Humanized Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Status Laporan Saya
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau perkembangan dan penanganan temuan bahaya yang telah Anda laporkan.
          </p>
        </div>
        <button
          onClick={onNavigateToForm}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Laporan</span>
        </button>
      </div>

      {/* Pencarian NIK / Tiket */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 mb-5 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchNik}
            onChange={(e) => setSearchNik(e.target.value)}
            placeholder="Cari berdasarkan NIK, nama pelapor, atau nomor tiket..."
            className="w-full bg-slate-50/80 pl-10 pr-4 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Daftar Laporan */}
      <div className="space-y-3.5">
        {filteredReports.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <HardHat className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Belum Ada Laporan</h4>
            <p className="text-xs text-slate-500 mt-1.5 mb-5 max-w-sm mx-auto leading-relaxed">
              {searchNik
                ? `Tidak ada laporan yang cocok dengan pencarian "${searchNik}".`
                : 'Laporan yang Anda kirim akan otomatis tersimpan di sini untuk memantau status penanganannya.'}
            </p>
            <button
              onClick={onNavigateToForm}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Kirim Laporan Pertama
            </button>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 text-xs">
                      {report.id}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${
                        report.status === 'Closed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : report.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-red-50 text-red-800 border-red-300'
                      }`}
                    >
                      {report.status === 'Closed'
                        ? 'Selesai Diverifikasi'
                        : report.status === 'In Progress'
                        ? 'Sedang Ditangani'
                        : 'Menunggu Penanganan'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1.5 font-medium">
                    {new Date(report.timestamp).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${
                    report.riskLevel === 'Tinggi'
                      ? 'bg-red-50 text-red-700 border-red-300'
                      : report.riskLevel === 'Sedang'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  }`}
                >
                  Risiko {report.riskLevel}
                </span>
              </div>

              <div className="text-xs text-slate-900 font-semibold mb-3 leading-relaxed">
                {report.description}
              </div>

              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1.5 text-slate-700 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500">Area Tambang:</span>
                  <span className="text-slate-900 font-semibold">{report.area}</span>
                </div>
                {report.locationDetail && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Titik Spesifik:</span>
                    <span className="text-slate-800">{report.locationDetail}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Pelapor:</span>
                  <span className="text-slate-800">
                    {report.reporterName} • NIK {report.reporterNik}
                  </span>
                </div>
                {report.picPerbaikan && (
                  <div className="flex justify-between pt-1.5 border-t border-slate-200/80">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Penanggung Jawab:
                    </span>
                    <span className="text-slate-900 font-bold">{report.picPerbaikan}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
