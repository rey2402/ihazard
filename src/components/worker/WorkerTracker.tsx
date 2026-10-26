import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle2, AlertCircle, HardHat, PlusCircle, UserCheck } from 'lucide-react';
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
    <div className="max-w-2xl mx-auto p-4 pb-20 text-slate-800">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-300/80 rounded-2xl p-4 mb-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Status Laporan Saya</h2>
              <p className="text-xs text-amber-800 font-medium">Pantau tindak lanjut perbaikan bahaya yang Anda laporkan</p>
            </div>
          </div>
          <button
            onClick={onNavigateToForm}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Lapor Baru</span>
          </button>
        </div>
      </div>

      {/* Pencarian NIK / Tiket */}
      <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-3 mb-5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchNik}
            onChange={(e) => setSearchNik(e.target.value)}
            placeholder="Ketik NIK, Nama, atau Nomor Tiket Anda..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Daftar Laporan */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center shadow-sm">
            <HardHat className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">Belum Ada Laporan Ditemukan</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              {searchNik
                ? `Tidak ada laporan yang cocok dengan kata kunci "${searchNik}".`
                : 'Belum ada laporan yang tercatat di sistem.'}
            </p>
            <button
              onClick={onNavigateToForm}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Buat Laporan Bahaya Sekarang
            </button>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:border-amber-400 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-slate-900">{report.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
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
                  <span className="text-[11px] text-slate-500 block mt-0.5">
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
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    report.riskLevel === 'Tinggi'
                      ? 'bg-red-100 text-red-800'
                      : report.riskLevel === 'Sedang'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  Risiko {report.riskLevel}
                </span>
              </div>

              <div className="text-xs text-slate-700 font-medium mb-3 line-clamp-2">
                {report.description}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Area Lokasi:</span>
                  <span className="text-slate-800 font-semibold">{report.area}</span>
                </div>
                {report.locationDetail && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Detail Titik:</span>
                    <span className="text-slate-700">{report.locationDetail}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Pelapor:</span>
                  <span className="text-slate-700">
                    {report.reporterName} (NIK: {report.reporterNik})
                  </span>
                </div>
                {report.picPerbaikan && (
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      PIC Perbaikan:
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
