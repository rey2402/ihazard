import React, { useState, useRef } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Upload,
  Calendar,
  User,
  MapPin,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
  ImageOff,
  ExternalLink,
} from 'lucide-react';
import { HazardReport } from '../../types/hazard';
import { compressImageFile } from '../../utils/image-compressor';
import { formatDriveImageUrl, getDriveViewerUrl } from '../../utils/drive-image';

interface HazardBeforeAfterModalProps {
  hazard: HazardReport;
  mode: 'view' | 'resolve';
  onClose: () => void;
  onConfirmResolve?: (closureData: {
    closurePhotoUrl: string;
    closureNotes: string;
    closedBy: string;
  }) => void;
  onAttachPhoto?: (hazard: HazardReport) => void;
}

export const HazardBeforeAfterModal: React.FC<HazardBeforeAfterModalProps> = ({
  hazard,
  mode,
  onClose,
  onConfirmResolve,
  onAttachPhoto,
}) => {
  const [closurePhoto, setClosurePhoto] = useState<string>(hazard.closurePhotoUrl || '');
  const [closureNotes, setClosureNotes] = useState<string>(hazard.closureNotes || '');
  const [closedBy, setClosedBy] = useState<string>(hazard.closedBy || 'SHE Officer Lapangan');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [viewTab, setViewTab] = useState<'both' | 'before' | 'after'>('both');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingPhoto(true);
    setErrorMsg('');
    try {
      const compressed = await compressImageFile(file, 1200, 0.75);
      setClosurePhoto(compressed);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses foto perbaikan');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleSubmitResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closureNotes.trim()) {
      setErrorMsg('Harap isi tindakan perbaikan yang telah dilakukan untuk menutup bahaya ini.');
      return;
    }
    if (!closedBy.trim()) {
      setErrorMsg('Nama verifikator K3/SHE wajib diisi.');
      return;
    }

    if (onConfirmResolve) {
      onConfirmResolve({
        closurePhotoUrl: closurePhoto,
        closureNotes: closureNotes.trim(),
        closedBy: closedBy.trim(),
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="before-after-title"
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  {hazard.id}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {hazard.area}
                </span>
              </div>
              <h3 id="before-after-title" className="text-sm font-bold text-white mt-0.5">
                {mode === 'resolve'
                  ? 'Verifikasi & Dokumentasi Perbaikan Bahaya'
                  : 'Dokumentasi Sebelum & Sesudah Perbaikan (Before & After)'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup modal perbaikan"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Tab Switcher on Mobile/Tablet */}
        {mode === 'view' && (
          <div className="flex items-center justify-center gap-1.5 p-2 bg-slate-50 border-b border-slate-100 text-xs">
            <button
              onClick={() => setViewTab('both')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                viewTab === 'both' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Berdampingan (Before & After)
            </button>
            <button
              onClick={() => setViewTab('before')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                viewTab === 'before' ? 'bg-red-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Sebelum Saja
            </button>
            <button
              onClick={() => setViewTab('after')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                viewTab === 'after' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Sesudah Saja
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Side by Side Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ========================================================= */}
            {/* BEFORE: KONDISI SEBELUM PERBAIKAN                        */}
            {/* ========================================================= */}
            {(mode === 'resolve' || viewTab === 'both' || viewTab === 'before') && (
              <div className="rounded-xl border border-red-200 bg-red-50/20 overflow-hidden flex flex-col">
                <div className="px-4 py-2.5 bg-red-100/70 border-b border-red-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-red-900 font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    <span>Kondisi Awal (Sebelum Perbaikan)</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 border border-red-300 px-2 py-0.5 rounded">
                    Risiko {hazard.riskLevel}
                  </span>
                </div>

                <div className="p-3.5 space-y-3 flex-1 flex flex-col">
                  {/* Photo Before */}
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center">
                    {hazard.photoUrl ? (
                      <>
                        <img
                          src={formatDriveImageUrl(hazard.photoUrl)}
                          alt="Temuan Bahaya"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 bg-slate-950/75 text-white text-[10px] px-2 py-0.5 rounded font-mono font-medium backdrop-blur-xs">
                          Foto Temuan Lapangan
                        </span>
                        {getDriveViewerUrl(hazard.photoUrl) && (
                          <a
                            href={getDriveViewerUrl(hazard.photoUrl)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-slate-950 text-white text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 backdrop-blur-xs transition-colors"
                          >
                            <span>Buka di Drive</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </>
                    ) : (
                      <div className="text-center p-4 text-slate-400 flex flex-col items-center justify-center">
                        <ImageOff className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                        <span className="text-xs font-semibold text-slate-600">Belum ada foto</span>
                        <span className="text-[11px] text-slate-400 mt-0.5">Dokumentasi foto belum dilampirkan</span>
                        {onAttachPhoto && (
                          <button
                            type="button"
                            onClick={() => onAttachPhoto(hazard)}
                            className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Lampirkan Foto</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-slate-700 block">Uraian Bahaya:</span>
                    <p className="text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed font-normal">
                      {hazard.description}
                    </p>
                  </div>

                  {/* Metadata Pelapor */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-auto">
                    <div>
                      <span className="text-slate-500 block">Pelapor:</span>
                      <span className="font-semibold text-slate-800">{hazard.reporterName}</span>
                      <span className="text-slate-500 block font-mono text-[10px]">NIK: {hazard.reporterNik}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Waktu Lapor:</span>
                      <span className="font-semibold text-slate-800">
                        {new Date(hazard.timestamp).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-slate-500 block text-[10px]">{hazard.department}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* AFTER: KONDISI SESUDAH PERBAIKAN                         */}
            {/* ========================================================= */}
            {(mode === 'resolve' || viewTab === 'both' || viewTab === 'after') && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/20 overflow-hidden flex flex-col">
                <div className="px-4 py-2.5 bg-emerald-100/70 border-b border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Hasil Perbaikan (Sesudah)</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                    {mode === 'resolve' ? 'Verifikasi Aktif' : 'Status: CLOSED'}
                  </span>
                </div>

                <div className="p-3.5 space-y-3 flex-1 flex flex-col">
                  {mode === 'resolve' ? (
                    /* FORM INPUT FOR RESOLUTION */
                    <form id="resolve-hazard-form" onSubmit={handleSubmitResolve} className="space-y-3 flex-1 flex flex-col">
                      {/* Photo Upload Area */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Foto Bukti Perbaikan <span className="text-slate-400 font-normal">(Opsional tapi direkomendasikan)</span>
                        </label>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handlePhotoUpload}
                          accept="image/*"
                          className="hidden"
                        />

                        {closurePhoto ? (
                          <div className="relative rounded-lg overflow-hidden border border-emerald-300 aspect-video group">
                            <img
                              src={closurePhoto}
                              alt="Bukti Perbaikan"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setClosurePhoto('')}
                              className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-md text-xs shadow-md transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <span className="absolute bottom-2 left-2 bg-emerald-950/80 text-white text-[10px] px-2 py-0.5 rounded font-mono font-medium backdrop-blur-xs">
                              Foto Siap Diunggah
                            </span>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 rounded-lg p-5 text-center cursor-pointer transition-colors"
                          >
                            <Camera className="w-7 h-7 mx-auto mb-1 text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-800 block">
                              Ambil Foto atau Pilih Gambar
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Format JPG / PNG (Otomatis dikompresi ringan)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Resolution Notes */}
                      <div>
                        <label htmlFor="closureNotes" className="block text-xs font-semibold text-slate-800 mb-1">
                          Tindakan Perbaikan yang Dilakukan <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="closureNotes"
                          rows={3}
                          value={closureNotes}
                          onChange={(e) => {
                            setClosureNotes(e.target.value);
                            setErrorMsg('');
                          }}
                          placeholder="Contoh: Tanggul longsor telah ditimbun ulang setinggi 1.8m menggunakan dozer dan dipasang patok penanda..."
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none transition-all resize-none"
                        />
                      </div>

                      {/* Verifier Name */}
                      <div>
                        <label htmlFor="closedBy" className="block text-xs font-semibold text-slate-800 mb-1">
                          Nama Verifikator SHE <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="closedBy"
                          type="text"
                          value={closedBy}
                          onChange={(e) => {
                            setClosedBy(e.target.value);
                            setErrorMsg('');
                          }}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none transition-all"
                        />
                      </div>

                      {errorMsg && (
                        <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                          {errorMsg}
                        </div>
                      )}
                    </form>
                  ) : (
                    /* VIEW MODE FOR AFTER */
                    <div className="space-y-3 flex-1 flex flex-col">
                      {/* Photo After */}
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center">
                        {hazard.closurePhotoUrl ? (
                          <>
                            <img
                              src={formatDriveImageUrl(hazard.closurePhotoUrl)}
                              alt="Bukti Selesai"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-2 left-2 bg-emerald-950/80 text-white text-[10px] px-2 py-0.5 rounded font-mono font-medium backdrop-blur-xs">
                              Foto Hasil Perbaikan
                            </span>
                            {getDriveViewerUrl(hazard.closurePhotoUrl) && (
                              <a
                                href={getDriveViewerUrl(hazard.closurePhotoUrl)!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute bottom-2 right-2 bg-emerald-900/80 hover:bg-emerald-950 text-white text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 backdrop-blur-xs transition-colors"
                              >
                                <span>Buka di Drive</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </>
                        ) : (
                          <div className="text-center p-4 text-slate-400">
                            <CheckCircle2 className="w-8 h-8 mx-auto mb-1 text-emerald-500" />
                            <span className="text-xs">Telah diverifikasi selesai tanpa foto</span>
                          </div>
                        )}
                      </div>

                      {/* Closure Notes */}
                      <div className="space-y-1 text-xs">
                        <span className="font-semibold text-slate-700 block">Tindakan Perbaikan:</span>
                        <p className="text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed font-normal">
                          {hazard.closureNotes || 'Perbaikan telah diselesaikan sesuai standar K3.'}
                        </p>
                      </div>

                      {/* Verifier Info */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-auto">
                        <div>
                          <span className="text-slate-500 block">Diverifikasi Oleh:</span>
                          <span className="font-semibold text-slate-800">{hazard.closedBy || hazard.picPerbaikan || 'SHE Team'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Tanggal Selesai:</span>
                          <span className="font-semibold text-emerald-700 font-mono">
                            {hazard.closedDate || 'Selesai'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {mode === 'resolve' ? 'Batal' : 'Tutup'}
          </button>

          {mode === 'resolve' && (
            <button
              type="submit"
              form="resolve-hazard-form"
              disabled={isProcessingPhoto}
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Verifikasi Selesai (Closed)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
