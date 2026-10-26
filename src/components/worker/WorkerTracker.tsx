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
      <div className="flex items-center justify-between gap-4 mb-5 pb-2 border-b border-slate-300">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-zinc-950 uppercase">
              Status Laporan Saya
            </h1>
            <span className="text-[10px] bg-slate-900 text-amber-400 px-2 py-0.5 rounded font-mono font-bold uppercase border border-zinc-700">
              TRACKING
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Pantau status verifikasi dan tindak lanjut perbaikan bahaya yang telah Anda laporkan
          </p>
        </div>
        <button
          onClick={onNavigateToForm}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black uppercase tracking-wider rounded shadow-md border border-amber-600/30 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Lapor Baru</span>
        </button>
      </div>

      {/* Pencarian NIK / Tiket */}
      <div className="bg-white border border-slate-300 rounded-lg p-2.5 mb-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchNik}
            onChange={(e) => setSearchNik(e.target.value)}
            placeholder="Cari berdasarkan NIK, nama pelapor, atau nomor tiket..."
            className="w-full bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 font-medium rounded border border-slate-200 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Daftar Laporan */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="bg-white border border-slate-300 rounded-lg p-8 text-center shadow-xs">
            <HardHat className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h4 className="text-xs font-black uppercase text-slate-800">Belum Ada Laporan</h4>
            <p className="text-[11px] text-slate-500 mt-1 mb-4 max-w-sm mx-auto font-medium">
              {searchNik
                ? `Tidak ada laporan yang cocok dengan pencarian "${searchNik}".`
                : 'Laporan yang Anda kirim akan otomatis muncul di sini untuk pemantauan tindak lanjut.'}
            </p>
            <button
              onClick={onNavigateToForm}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black uppercase tracking-wider rounded shadow-md transition-colors"
            >
              Kirim Laporan Pertama
            </button>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-slate-300 rounded-lg p-4 shadow-xs hover:border-amber-500/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 text-xs">
                      {report.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                        report.status === 'Closed'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : report.status === 'In Progress'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-red-100 text-red-800 border-red-300'
                      }`}
                    >
                      {report.status === 'Closed'
                        ? 'Selesai (Closed)'
                        : report.status === 'In Progress'
                        ? 'Sedang Ditindaklanjuti'
                        : 'Menunggu Review'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1 font-medium">
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
                  className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                    report.riskLevel === 'Tinggi'
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : report.riskLevel === 'Sedang'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}
                >
                  Risiko {report.riskLevel}
                </span>
              </div>

              <div className="text-xs text-slate-900 font-bold mb-3">
                {report.description}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-[11px] space-y-1 text-slate-700 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500">Area Pit:</span>
                  <span className="text-slate-900 font-bold">{report.area}</span>
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
                    {report.reporterName} (NIK: {report.reporterNik})
                  </span>
                </div>
                {report.picPerbaikan && (
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Penanggung Jawab:
                    </span>
                    <span className="text-slate-900 font-black">{report.picPerbaikan}</span>
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
