import React, { useState, useRef } from 'react';
import {
  X,
  CheckCircle2,
  Camera,
  MapPin,
  ImageOff,
  ExternalLink,
  Maximize2,
  Shield,
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
  const isClosed = hazard.status === 'Closed';
  const [currentMode, setCurrentMode] = useState<'view' | 'resolve'>(mode);
  const [closurePhoto, setClosurePhoto] = useState<string>(hazard.closurePhotoUrl || '');
  const [closureNotes, setClosureNotes] = useState<string>(hazard.closureNotes || '');
  const [closedBy, setClosedBy] = useState<string>(hazard.closedBy || 'SHE Officer Lapangan');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'both' | 'before' | 'after'>(
    isClosed && mode === 'view' ? 'both' : 'before'
  );

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
      setErrorMsg('Harap isi tindakan perbaikan yang telah dilakukan.');
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
      aria-labelledby="modal-ticket-id"
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* 1. Ultra-Clean Single Header: Ticket, Area, Risk, Status & Close */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
            <span id="modal-ticket-id" className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/30">
              {hazard.id}
            </span>
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{hazard.area} {hazard.locationDetail ? `• ${hazard.locationDetail}` : ''}</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 shrink-0">
              {hazard.hazardType}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                hazard.riskLevel === 'Tinggi'
                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                  : hazard.riskLevel === 'Sedang'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              Risiko {hazard.riskLevel}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                isClosed
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {hazard.status.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Minimal switcher only if report is closed and not in resolve mode */}
            {isClosed && currentMode === 'view' && (
              <div className="bg-slate-800 p-0.5 rounded-lg hidden sm:flex gap-1 text-xs border border-slate-700">
                <button
                  onClick={() => setViewTab('before')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    viewTab === 'before' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sebelum
                </button>
                <button
                  onClick={() => setViewTab('after')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    viewTab === 'after' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sesudah
                </button>
                <button
                  onClick={() => setViewTab('both')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    viewTab === 'both' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Berdampingan
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Tutup Modal"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Main Content Area */}
        <div className="p-4 sm:p-5">
          {/* A. RESOLVE MODE: Split Before Photo & Resolve Form */}
          {currentMode === 'resolve' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Left: Reference Before Photo */}
              <div className="md:col-span-5 flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-700">Foto Temuan Awal:</span>
                <div className="relative rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 h-56 sm:h-64 w-full">
                  {hazard.photoUrl ? (
                    <img
                      src={formatDriveImageUrl(hazard.photoUrl)}
                      alt="Temuan Awal"
                      className="max-w-full max-h-full object-contain mx-auto"
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-400 text-xs">Tidak ada foto awal</div>
                  )}
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-semibold block text-slate-800">Uraian:</span>
                  {hazard.description}
                </p>
              </div>

              {/* Right: Resolve Form */}
              <form id="resolve-hazard-form" onSubmit={handleSubmitResolve} className="md:col-span-7 space-y-3">
                <span className="text-xs font-bold text-slate-900 block">Formulir Verifikasi Selesai:</span>

                {/* Photo Upload */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {closurePhoto ? (
                    <div className="relative rounded-xl overflow-hidden bg-slate-950 h-44 flex items-center justify-center border border-emerald-400/40">
                      <img
                        src={closurePhoto}
                        alt="Bukti Selesai"
                        className="max-w-full max-h-full object-contain mx-auto"
                      />
                      <button
                        type="button"
                        onClick={() => setClosurePhoto('')}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-md text-xs cursor-pointer shadow-sm hover:bg-red-700"
                        title="Hapus foto"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl bg-slate-50 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span>Lampirkan Foto Hasil Perbaikan (Opsional)</span>
                    </button>
                  )}
                </div>

                {/* Resolution Notes */}
                <div>
                  <label htmlFor="closureNotes" className="block text-xs font-bold text-slate-700 mb-1">
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
                    placeholder="Tuliskan tindakan perbaikan yang telah dilaksanakan..."
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none resize-none shadow-2xs"
                  />
                </div>

                {/* Verifier */}
                <div>
                  <label htmlFor="closedBy" className="block text-xs font-bold text-slate-700 mb-1">
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
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none shadow-2xs"
                  />
                </div>

                {errorMsg && (
                  <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                    {errorMsg}
                  </div>
                )}
              </form>
            </div>
          ) : viewTab === 'both' && isClosed ? (
            /* B. BOTH VIEW (ONLY FOR CLOSED REPORTS): Clean side-by-side */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span>Sebelum Perbaikan</span>
                </span>
                <div className="relative rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 h-56 sm:h-64 w-full">
                  {hazard.photoUrl ? (
                    <img
                      src={formatDriveImageUrl(hazard.photoUrl)}
                      alt="Sebelum"
                      className="max-w-full max-h-full object-contain mx-auto"
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-400 text-xs">Belum ada foto</div>
                  )}
                </div>
                <p className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                  {hazard.description}
                </p>
              </div>

              {/* After */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Sesudah Perbaikan (Closed)</span>
                </span>
                <div className="relative rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 h-56 sm:h-64 w-full">
                  {hazard.closurePhotoUrl ? (
                    <img
                      src={formatDriveImageUrl(hazard.closurePhotoUrl)}
                      alt="Sesudah"
                      className="max-w-full max-h-full object-contain mx-auto"
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-400 text-xs">Selesai tanpa foto</div>
                  )}
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-xs space-y-1">
                  <span className="font-bold text-emerald-900 block">{hazard.closureNotes || 'Perbaikan selesai.'}</span>
                  <span className="text-[11px] text-emerald-700 block">
                    Diverifikasi: {hazard.closedBy || 'SHE Team'} {hazard.closedDate ? `(${hazard.closedDate})` : ''}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* C. SINGLE VIEW (DEFAULT FOR OPEN REPORTS OR SINGLE TAB): Clean 1-Screen Split */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Left Column: Photo Stage (7 Cols) */}
              <div className="md:col-span-7 flex flex-col justify-center">
                <div className="relative rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 h-64 sm:h-72 md:h-[330px] w-full group">
                  {(viewTab === 'after' && isClosed ? hazard.closurePhotoUrl : hazard.photoUrl) ? (
                    <>
                      <img
                        src={formatDriveImageUrl((viewTab === 'after' && isClosed ? hazard.closurePhotoUrl : hazard.photoUrl)!)}
                        alt="Dokumentasi"
                        className="max-w-full max-h-full object-contain mx-auto select-none"
                      />
                      {/* Floating Action Controls */}
                      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFullscreenPhoto(formatDriveImageUrl((viewTab === 'after' && isClosed ? hazard.closurePhotoUrl : hazard.photoUrl)!))}
                          className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-black text-white text-xs font-semibold flex items-center gap-1 border border-white/10 shadow-md transition-colors cursor-pointer"
                          title="Layar Penuh"
                        >
                          <Maximize2 className="w-3 h-3 text-amber-400" />
                          <span>Perbesar</span>
                        </button>
                        {getDriveViewerUrl((viewTab === 'after' && isClosed ? hazard.closurePhotoUrl : hazard.photoUrl)!) && (
                          <a
                            href={getDriveViewerUrl((viewTab === 'after' && isClosed ? hazard.closurePhotoUrl : hazard.photoUrl)!)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-black text-white text-xs font-semibold flex items-center gap-1 border border-white/10 shadow-md transition-colors"
                          >
                            <span>Drive</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 text-slate-400 flex flex-col items-center justify-center">
                      <ImageOff className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                      <span className="text-xs font-semibold text-slate-200">Belum Ada Foto</span>
                      {onAttachPhoto && (
                        <button
                          type="button"
                          onClick={() => onAttachPhoto(hazard)}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Lampirkan Foto</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Essential Details (5 Cols) */}
              <div className="md:col-span-5 flex flex-col justify-between space-y-3">
                {/* Description */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Uraian Temuan Bahaya
                  </span>
                  <p className="text-slate-900 text-sm font-semibold leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-2xs">
                    {hazard.description}
                  </p>
                </div>

                {/* Immediate Action (if any) */}
                {hazard.immediateAction && (
                  <div className="text-xs bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-950 flex items-start gap-2">
                    <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-amber-900 text-[10px] uppercase tracking-wider">
                        Tindakan Langsung:
                      </span>
                      <p className="mt-0.5 text-xs text-amber-950">{hazard.immediateAction}</p>
                    </div>
                  </div>
                )}

                {/* Identity & Time Box */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-xs space-y-1.5">
                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/70">
                    <span className="text-slate-500">Pelapor:</span>
                    <span className="font-bold text-slate-900">{hazard.reporterName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/70">
                    <span className="text-slate-500">NIK / Dept:</span>
                    <span className="font-medium text-slate-800">{hazard.reporterNik} • {hazard.department}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Waktu Lapor:</span>
                    <span className="font-medium text-slate-800">
                      {new Date(hazard.timestamp).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* If Closed, Show Closure Info */}
                {isClosed && (
                  <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-2.5 text-xs space-y-1">
                    <span className="font-bold text-emerald-900 block flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Hasil Perbaikan Selesai:</span>
                    </span>
                    <p className="text-slate-800 font-medium">{hazard.closureNotes || 'Perbaikan telah diselesaikan.'}</p>
                    <span className="text-[11px] text-emerald-700 block">
                      Verifikator: {hazard.closedBy || 'SHE Team'} {hazard.closedDate ? `(${hazard.closedDate})` : ''}
                    </span>
                  </div>
                )}

                {/* If Open and Admin can resolve, Show Quick Resolve Button */}
                {!isClosed && onConfirmResolve && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentMode('resolve');
                    }}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Selesaikan Laporan Ini Sekarang</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Minimal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={currentMode === 'resolve' ? () => setCurrentMode('view') : onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-300"
          >
            {currentMode === 'resolve' ? 'Kembali' : 'Tutup'}
          </button>

          {currentMode === 'resolve' && (
            <button
              type="submit"
              form="resolve-hazard-form"
              disabled={isProcessingPhoto}
              className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Verifikasi Selesai</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Fullscreen Lightbox Modal */}
      {fullscreenPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tampilan foto ukuran penuh"
          className="fixed inset-0 z-60 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setFullscreenPhoto(null)}
        >
          <div className="relative max-w-5xl max-h-[92vh] w-full flex items-center justify-center">
            <img
              src={fullscreenPhoto}
              alt="Foto Penuh"
              className="max-w-full max-h-[88vh] w-auto h-auto object-contain rounded-xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setFullscreenPhoto(null)}
              className="absolute top-2 right-2 sm:-top-3 sm:-right-3 w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg border border-white/20 transition-all cursor-pointer"
              aria-label="Tutup tampilan penuh"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
