import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, HardHat, Plus } from 'lucide-react';
import { HazardReport } from '../../types/hazard';
import { getAllHazardReports } from '../../services/storage-service';

interface WorkerTrackerProps {
  onNavigateToForm: () => void;
}

export const WorkerTracker: React.FC<WorkerTrackerProps> = ({ onNavigateToForm }) => {
  const [searchNik, setSearchNik] = useState('');
  const [reports, setReports] = useState<HazardReport[]>([]);

  useEffect(() => {
    setReports(getAllHazardReports());
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
    <div className="max-w-2xl mx-auto pb-16">
      {/* Header section */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-2 border-b border-zinc-200/60">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
            Status Laporan Saya
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Pantau status verifikasi dan tindak lanjut perbaikan bahaya yang telah Anda laporkan
          </p>
        </div>
        <button
          onClick={onNavigateToForm}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Lapor Baru</span>
        </button>
      </div>

      {/* Pencarian NIK / Tiket */}
      <div className="bg-white border border-zinc-200/70 rounded-xl p-2.5 mb-5 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchNik}
            onChange={(e) => setSearchNik(e.target.value)}
            placeholder="Cari berdasarkan NIK, nama pelapor, atau nomor tiket..."
            className="w-full bg-transparent pl-9 pr-3 py-1 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Daftar Laporan */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="bg-white border border-zinc-200/70 rounded-xl p-8 text-center shadow-2xs">
            <HardHat className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-zinc-800">Belum Ada Laporan</h4>
            <p className="text-[11px] text-zinc-500 mt-1 mb-4 max-w-sm mx-auto">
              {searchNik
                ? `Tidak ada laporan yang cocok dengan pencarian "${searchNik}".`
                : 'Laporan yang Anda kirim akan otomatis muncul di sini untuk pemantauan tindak lanjut.'}
            </p>
            <button
              onClick={onNavigateToForm}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Kirim Laporan Pertama
            </button>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-zinc-200/70 rounded-xl p-4 shadow-2xs hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-zinc-950">{report.id}</span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        report.status === 'Closed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : report.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {report.status === 'Closed'
                        ? 'Selesai (Closed)'
                        : report.status === 'In Progress'
                        ? 'Sedang Ditindaklanjuti'
                        : 'Menunggu Review'}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">
                    {new Date(report.timestamp).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                    report.riskLevel === 'Tinggi'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : report.riskLevel === 'Sedang'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  Risiko {report.riskLevel}
                </span>
              </div>

              <div className="text-xs text-zinc-800 font-medium mb-3">
                {report.description}
              </div>

              <div className="bg-zinc-50/70 border border-zinc-200/60 rounded-lg p-2.5 text-[11px] space-y-1 text-zinc-600">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Area:</span>
                  <span className="text-zinc-800 font-medium">{report.area}</span>
                </div>
                {report.locationDetail && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Detail:</span>
                    <span className="text-zinc-700">{report.locationDetail}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-400">Pelapor:</span>
                  <span className="text-zinc-700">
                    {report.reporterName} (NIK: {report.reporterNik})
                  </span>
                </div>
                {report.picPerbaikan && (
                  <div className="flex justify-between pt-1 border-t border-zinc-200/60">
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Penanggung Jawab:
                    </span>
                    <span className="text-zinc-900 font-semibold">{report.picPerbaikan}</span>
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
