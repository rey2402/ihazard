import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, HardHat, Plus, Camera, ImageOff } from 'lucide-react';
import { HazardReport } from '../../types/hazard';
import { getAllHazardReports, setAllHazardReports } from '../../services/storage-service';
import { fetchHazardsFromGoogleSheets } from '../../services/sheets-sync-service';
import { HazardBeforeAfterModal } from '../hazard/HazardBeforeAfterModal';
import { AttachPhotoModal } from '../hazard/AttachPhotoModal';

interface WorkerTrackerProps {
  onNavigateToForm: () => void;
}

export const WorkerTracker: React.FC<WorkerTrackerProps> = ({ onNavigateToForm }) => {
  const [searchNik, setSearchNik] = useState('');
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [selectedModalHazard, setSelectedModalHazard] = useState<HazardReport | null>(null);
  const [attachPhotoHazard, setAttachPhotoHazard] = useState<HazardReport | null>(null);

  useEffect(() => {
    setReports(getAllHazardReports());
    fetchHazardsFromGoogleSheets().then((cloudData) => {
      if (cloudData !== null && Array.isArray(cloudData)) {
        setReports(cloudData);
        setAllHazardReports(cloudData);
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
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            Status Laporan Saya
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            Pantau tindak lanjut temuan bahaya yang Anda laporkan.
          </p>
        </div>
        <button
          onClick={onNavigateToForm}
          className="inline-flex items-center gap-1 px-3 py-2 sm:px-4 sm:py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Buat Laporan</span>
          <span className="sm:hidden">Lapor</span>
        </button>
      </div>

      {/* Pencarian NIK / Tiket */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2 sm:p-2.5 mb-4 sm:mb-5 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchNik}
            onChange={(e) => setSearchNik(e.target.value)}
            placeholder="Cari NIK, nama, area, atau ID tiket..."
            className="w-full bg-slate-50/80 pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Daftar Laporan */}
      <div className="space-y-3.5">
        {filteredReports.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 text-center shadow-xs">
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
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Header Kartu: Baris 1 (ID Tiket & Risiko) */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300 text-xs tracking-tight whitespace-nowrap shrink-0 shadow-2xs">
                  {report.id}
                </span>

                <span
                  className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${
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

              {/* Header Kartu: Baris 2 (Status & Waktu) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-md border whitespace-nowrap ${
                    report.status === 'Closed'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : report.status === 'In Progress'
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-red-50 text-red-800 border-red-300'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      report.status === 'Closed'
                        ? 'bg-emerald-500'
                        : report.status === 'In Progress'
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span>
                    {report.status === 'Closed'
                      ? 'Selesai Diverifikasi'
                      : report.status === 'In Progress'
                      ? 'Sedang Ditangani'
                      : 'Menunggu Penanganan'}
                  </span>
                </span>

                <span className="text-[11px] text-slate-400 font-medium">
                  {new Date(report.timestamp).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Deskripsi Bahaya */}
              <div className="text-xs sm:text-sm text-slate-900 font-semibold mb-3 leading-relaxed">
                {report.description}
              </div>

              {/* Detail Info */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1.5 text-slate-700 font-medium">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 shrink-0">Area Tambang:</span>
                  <span className="text-slate-900 font-semibold text-right">{report.area}</span>
                </div>
                {report.locationDetail && (
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 shrink-0">Titik Spesifik:</span>
                    <span className="text-slate-800 text-right">{report.locationDetail}</span>
                  </div>
                )}
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 shrink-0">Pelapor:</span>
                  <span className="text-slate-800 text-right">
                    {report.reporterName} • NIK {report.reporterNik}
                  </span>
                </div>
                {report.picPerbaikan && (
                  <div className="flex justify-between items-start gap-2 pt-1.5 border-t border-slate-200/80">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Penanggung Jawab:
                    </span>
                    <span className="text-slate-900 font-bold text-right">{report.picPerbaikan}</span>
                  </div>
                )}
              </div>

              {/* Bagian Foto & Lampiran */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                {report.photoUrl ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedModalHazard(report)}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 active:text-amber-800 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>
                        {report.status === 'Closed' && report.closurePhotoUrl
                          ? 'Lihat Bukti Selesai'
                          : 'Lihat Foto Temuan'}
                      </span>
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      onClick={() => setAttachPhotoHazard(report)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      Ganti Foto
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <ImageOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="italic">Belum ada foto</span>
                  </div>
                )}

                <div className="flex items-center gap-2 ml-auto sm:ml-0">
                  {!report.photoUrl && (
                    <button
                      onClick={() => setAttachPhotoHazard(report)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>+ Lampirkan Foto</span>
                    </button>
                  )}
                  {report.closedDate && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      Selesai: {report.closedDate}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedModalHazard && (
        <HazardBeforeAfterModal
          hazard={selectedModalHazard}
          mode="view"
          onClose={() => setSelectedModalHazard(null)}
          onAttachPhoto={(h) => {
            setSelectedModalHazard(null);
            setAttachPhotoHazard(h);
          }}
        />
      )}

      {attachPhotoHazard && (
        <AttachPhotoModal
          hazard={attachPhotoHazard}
          onClose={() => setAttachPhotoHazard(null)}
          onSuccess={(updated) => {
            setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          }}
        />
      )}
    </div>
  );
};
