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
  Clock,
  Maximize2,
  ZoomIn,
  Building2,
  HardHat,
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
    isClosed || mode === 'resolve' ? 'both' : 'before'
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
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div className="bg-slate-50 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-800/20 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* 1. Machined Executive Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm shadow-inner">
              <Layers className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/25 tracking-wide">
                  {hazard.id}
                </span>
                <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>{hazard.area}</span>
                </span>
              </div>
              <h3 id="before-after-title" className="text-sm sm:text-base font-bold text-white mt-0.5 tracking-tight">
                {currentMode === 'resolve'
                  ? 'Verifikasi & Dokumentasi Perbaikan Bahaya'
                  : isClosed
                  ? 'Dokumentasi Sebelum & Sesudah Perbaikan (Before & After)'
                  : 'Dokumentasi Temuan Bahaya Lapangan'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup modal perbaikan"
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Floating Segmented Tab Switcher (Apple/Linear-style) */}
        {currentMode === 'view' && (
          <div className="flex items-center justify-center px-4 py-3 bg-white border-b border-slate-200/80 shrink-0">
            <div className="bg-slate-100 p-1 rounded-2xl inline-flex gap-1 border border-slate-200 shadow-inner max-w-full overflow-x-auto">
              <button
                onClick={() => setViewTab('before')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  viewTab === 'before'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Kondisi Awal (Sebelum)</span>
              </button>
              <button
                onClick={() => setViewTab('both')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  viewTab === 'both'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Berdampingan {isClosed ? '(Before & After)' : '(Temuan & Status)'}</span>
              </button>
              {isClosed && (
                <button
                  onClick={() => setViewTab('after')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    viewTab === 'after'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Hasil Perbaikan (Sesudah)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. Main Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          <div className={viewTab === 'both' || currentMode === 'resolve' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'w-full'}>
            {/* ========================================================= */}
            {/* BEFORE: KONDISI SEBELUM PERBAIKAN                        */}
            {/* ========================================================= */}
            {(currentMode === 'resolve' || viewTab === 'both' || viewTab === 'before') && (
              <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden flex flex-col shadow-xs">
                {/* Card Title Bar */}
                <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                    <span>Kondisi Awal (Temuan Bahaya)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-700 bg-white border border-slate-300 px-2 py-0.5 rounded-md shadow-2xs">
                      {hazard.hazardType}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border shadow-2xs ${
                        hazard.riskLevel === 'Tinggi'
                          ? 'bg-red-50 text-red-700 border-red-300'
                          : hazard.riskLevel === 'Sedang'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      Risiko {hazard.riskLevel}
                    </span>
                  </div>
                </div>

                {/* Sub-layout: Side-by-side on PC if viewTab === 'before', stacked if 'both' */}
                <div className={`p-4 flex-1 ${viewTab === 'before' ? 'grid grid-cols-1 md:grid-cols-12 gap-5 items-start' : 'flex flex-col space-y-3.5'}`}>
                  {/* Photo Before (Machined Double-Bezel Frame) */}
                  <div className={viewTab === 'before' ? 'md:col-span-7 flex flex-col gap-2' : 'w-full'}>
                    <div className="rounded-2xl p-2 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl shadow-slate-950/20 group">
                      <div
                        className={`relative rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/5 ${
                          viewTab === 'before' ? 'h-64 sm:h-72 md:h-80 w-full' : 'h-48 sm:h-56 md:h-60 w-full'
                        }`}
                      >
                        {/* HUD Technical Viewfinder Corners */}
                        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white/20 pointer-events-none"></div>
                        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-white/20 pointer-events-none"></div>
                        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-white/20 pointer-events-none"></div>
                        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white/20 pointer-events-none"></div>

                        {hazard.photoUrl ? (
                          <>
                            <img
                              src={formatDriveImageUrl(hazard.photoUrl)}
                              alt="Temuan Bahaya"
                              className="max-w-full max-h-full w-auto h-auto object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                            />

                            {/* Floating Haptic Control Island */}
                            <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                              <span className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/15 text-[10px] sm:text-[11px] font-medium text-slate-200 shadow-lg">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]"></span>
                                <span>Foto Temuan</span>
                              </span>

                              <div className="pointer-events-auto inline-flex items-center gap-1 p-0.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/15 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => setFullscreenPhoto(formatDriveImageUrl(hazard.photoUrl))}
                                  className="px-2.5 py-1 rounded-full hover:bg-white/10 text-white text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Tampilkan Ukuran Penuh"
                                >
                                  <Maximize2 className="w-3 h-3 text-amber-400" />
                                  <span>Perbesar</span>
                                </button>
                                {getDriveViewerUrl(hazard.photoUrl) && (
                                  <>
                                    <span className="text-white/20 text-xs">|</span>
                                    <a
                                      href={getDriveViewerUrl(hazard.photoUrl)!}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2.5 py-1 rounded-full hover:bg-white/10 text-slate-300 hover:text-white text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 transition-colors"
                                    >
                                      <span>Drive</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-6 text-slate-400 flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mb-2 text-slate-400">
                              <ImageOff className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-slate-200">Belum Ada Foto Dokumentasi</span>
                            <span className="text-[11px] text-slate-500 mt-0.5">Laporan belum disertai bukti visual lapangan</span>
                            {onAttachPhoto && (
                              <button
                                type="button"
                                onClick={() => onAttachPhoto(hazard)}
                                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Lampirkan Foto Sekarang</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Micro Status Ribbon */}
                    {viewTab === 'before' && hazard.photoUrl && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-0.5 font-medium">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Rasio Asli Terjaga • Bebas Distorsi</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setFullscreenPhoto(formatDriveImageUrl(hazard.photoUrl))}
                          className="text-amber-600 hover:text-amber-700 font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <ZoomIn className="w-3 h-3" />
                          <span>Buka Layar Penuh</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Information Bento Details */}
                  <div className={viewTab === 'before' ? 'md:col-span-5 flex flex-col gap-3' : 'space-y-3 flex-1 flex flex-col'}>
                    {/* Description Bento Card */}
                    <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 relative">
                      <div className="flex items-center gap-1.5 text-slate-700 text-xs font-bold mb-1.5">
                        <HardHat className="w-3.5 h-3.5 text-amber-600" />
                        <span>Uraian Temuan Bahaya:</span>
                      </div>
                      <p className="text-slate-800 text-xs leading-relaxed font-normal bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
                        {hazard.description}
                      </p>
                    </div>

                    {/* Immediate Action Bento Card */}
                    {hazard.immediateAction && (
                      <div className="text-xs text-amber-950 bg-amber-50/80 p-3 rounded-2xl border border-amber-200/80 font-medium flex items-start gap-2.5 shadow-2xs">
                        <div className="w-7 h-7 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                          <ShieldAlert className="w-4 h-4 text-amber-700" />
                        </div>
                        <div>
                          <span className="font-bold text-amber-900 block text-xs">Tindakan Langsung Dilakukan:</span>
                          <span className="text-[11px] leading-relaxed text-amber-900/90">{hazard.immediateAction}</span>
                        </div>
                      </div>
                    )}

                    {/* Metadata Bento 4-Cell Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Pelapor</span>
                        <span className="font-bold text-slate-900 block text-xs mt-0.5 truncate">{hazard.reporterName}</span>
                        <span className="text-slate-500 font-mono text-[10px]">NIK: {hazard.reporterNik}</span>
                      </div>
                      <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Departemen</span>
                        <span className="font-bold text-slate-900 block text-xs mt-0.5 truncate">{hazard.department}</span>
                        <span className="text-slate-500 text-[10px]">Operasional Tambang</span>
                      </div>
                      <div className="col-span-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                        <div>
                          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Waktu Laporan</span>
                          <span className="font-mono font-bold text-slate-800 text-xs">
                            {new Date(hazard.timestamp).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Status</span>
                          <span className="font-mono font-bold text-xs uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {hazard.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Resolve Button for Admin */}
                    {viewTab === 'before' && !isClosed && onConfirmResolve && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentMode('resolve');
                          setViewTab('both');
                        }}
                        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-1 group"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-700/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </span>
                        <span>Input Hasil Perbaikan Sekarang</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* AFTER: KONDISI SESUDAH PERBAIKAN                         */}
            {/* ========================================================= */}
            {(currentMode === 'resolve' || viewTab === 'both' || viewTab === 'after') && (
              <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden flex flex-col shadow-xs">
                {/* Card Title Bar */}
                <div
                  className={`px-4 py-3 border-b flex items-center justify-between ${
                    isClosed || currentMode === 'resolve'
                      ? 'bg-emerald-50/70 border-emerald-200/80'
                      : 'bg-amber-50/70 border-amber-200/80'
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 font-bold text-xs ${
                      isClosed || currentMode === 'resolve' ? 'text-emerald-900' : 'text-amber-900'
                    }`}
                  >
                    {isClosed ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    ) : currentMode === 'resolve' ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    )}
                    <span>
                      {currentMode === 'resolve'
                        ? 'Formulir Verifikasi Perbaikan'
                        : isClosed
                        ? 'Hasil Perbaikan (Dokumentasi Selesai)'
                        : 'Status Penanganan Lapangan'}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md border shadow-2xs ${
                      currentMode === 'resolve'
                        ? 'text-emerald-800 bg-white border-emerald-300'
                        : isClosed
                        ? 'text-emerald-800 bg-white border-emerald-300'
                        : 'text-amber-800 bg-white border-amber-300'
                    }`}
                  >
                    {currentMode === 'resolve'
                      ? 'Verifikasi Aktif'
                      : isClosed
                      ? 'Status: CLOSED'
                      : `Status: ${hazard.status.toUpperCase()}`}
                  </span>
                </div>

                {/* Sub-layout */}
                <div className={`p-4 flex-1 ${viewTab === 'after' ? 'grid grid-cols-1 md:grid-cols-12 gap-5 items-start' : 'flex flex-col space-y-3.5'}`}>
                  {currentMode === 'resolve' ? (
                    /* FORM INPUT FOR RESOLUTION */
                    <form id="resolve-hazard-form" onSubmit={handleSubmitResolve} className="space-y-3.5 flex-1 flex flex-col w-full">
                      {/* Photo Upload Area */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
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
                          <div className="rounded-2xl p-2 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl shadow-emerald-950/20">
                            <div className="relative rounded-xl overflow-hidden bg-black h-52 sm:h-60 flex items-center justify-center border border-white/5 group">
                              <img
                                src={closurePhoto}
                                alt="Bukti Perbaikan"
                                className="max-w-full max-h-full w-auto h-auto object-contain mx-auto"
                              />
                              <button
                                type="button"
                                onClick={() => setClosurePhoto('')}
                                className="absolute top-2.5 right-2.5 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-xl text-xs shadow-md transition-colors cursor-pointer"
                                title="Hapus foto"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <span className="absolute bottom-2.5 left-2.5 bg-emerald-950/85 text-white text-[10px] px-2.5 py-0.5 rounded-full font-mono font-medium backdrop-blur-xs border border-emerald-400/30">
                                Foto Siap Disimpan
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 rounded-2xl p-6 text-center cursor-pointer transition-colors"
                          >
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                              <Camera className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-emerald-900 block">
                              Ambil Foto atau Pilih Gambar Perbaikan
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Format JPG / PNG (Otomatis dikompresi ringan & proporsional)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Resolution Notes */}
                      <div>
                        <label htmlFor="closureNotes" className="block text-xs font-bold text-slate-800 mb-1">
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
                          className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none transition-all resize-none shadow-2xs"
                        />
                      </div>

                      {/* Verifier Name */}
                      <div>
                        <label htmlFor="closedBy" className="block text-xs font-bold text-slate-800 mb-1">
                          Nama Verifikator SHE / Pengawas <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="closedBy"
                          type="text"
                          value={closedBy}
                          onChange={(e) => {
                            setClosedBy(e.target.value);
                            setErrorMsg('');
                          }}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none transition-all shadow-2xs"
                        />
                      </div>

                      {errorMsg && (
                        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                          {errorMsg}
                        </div>
                      )}
                    </form>
                  ) : isClosed ? (
                    /* VIEW MODE FOR AFTER (ALREADY CLOSED) */
                    <>
                      {/* Photo After (Double-Bezel Frame) */}
                      <div className={viewTab === 'after' ? 'md:col-span-7 flex flex-col gap-2' : 'w-full'}>
                        <div className="rounded-2xl p-2 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl shadow-slate-950/20 group">
                          <div
                            className={`relative rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/5 ${
                              viewTab === 'after' ? 'h-64 sm:h-72 md:h-80 w-full' : 'h-48 sm:h-56 md:h-60 w-full'
                            }`}
                          >
                            {/* Technical HUD Corner Viewfinder */}
                            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white/20 pointer-events-none"></div>
                            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-white/20 pointer-events-none"></div>
                            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-white/20 pointer-events-none"></div>
                            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white/20 pointer-events-none"></div>

                            {hazard.closurePhotoUrl ? (
                              <>
                                <img
                                  src={formatDriveImageUrl(hazard.closurePhotoUrl)}
                                  alt="Bukti Selesai"
                                  className="max-w-full max-h-full w-auto h-auto object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                                />
                                {/* Floating Haptic Control Island */}
                                <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                                  <span className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-emerald-400/30 text-[10px] sm:text-[11px] font-medium text-emerald-200 shadow-lg">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
                                    <span>Bukti Perbaikan Selesai</span>
                                  </span>

                                  <div className="pointer-events-auto inline-flex items-center gap-1 p-0.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/15 shadow-lg">
                                    <button
                                      type="button"
                                      onClick={() => setFullscreenPhoto(formatDriveImageUrl(hazard.closurePhotoUrl!))}
                                      className="px-2.5 py-1 rounded-full hover:bg-white/10 text-white text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                      title="Tampilkan Ukuran Penuh"
                                    >
                                      <Maximize2 className="w-3 h-3 text-emerald-400" />
                                      <span>Perbesar</span>
                                    </button>
                                    {getDriveViewerUrl(hazard.closurePhotoUrl) && (
                                      <>
                                        <span className="text-white/20 text-xs">|</span>
                                        <a
                                          href={getDriveViewerUrl(hazard.closurePhotoUrl)!}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-2.5 py-1 rounded-full hover:bg-white/10 text-slate-300 hover:text-white text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 transition-colors"
                                        >
                                          <span>Drive</span>
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="text-center p-6 text-slate-400">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                                  <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold text-slate-200">Telah Diverifikasi Selesai</span>
                                <p className="text-[11px] text-slate-400 mt-0.5">Penanganan diselesaikan tanpa lampiran foto</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {viewTab === 'after' && hazard.closurePhotoUrl && (
                          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-0.5 font-medium">
                            <span className="flex items-center gap-1.5 text-emerald-700">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>Hasil Perbaikan Terverifikasi</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setFullscreenPhoto(formatDriveImageUrl(hazard.closurePhotoUrl!))}
                              className="text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <ZoomIn className="w-3 h-3" />
                              <span>Buka Layar Penuh</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Closure Information Bento Details */}
                      <div className={viewTab === 'after' ? 'md:col-span-5 flex flex-col gap-3' : 'space-y-3 flex-1 flex flex-col'}>
                        {/* Tindakan Perbaikan Card */}
                        <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200/80 shadow-2xs">
                          <span className="font-bold text-emerald-950 text-xs block mb-1.5 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tindakan Perbaikan Korektif:</span>
                          </span>
                          <p className="text-slate-800 bg-white p-2.5 rounded-xl border border-emerald-200/60 leading-relaxed font-normal text-xs shadow-2xs">
                            {hazard.closureNotes || 'Perbaikan telah diselesaikan sesuai standar K3.'}
                          </p>
                        </div>

                        {/* Verifier Info 2-Cell Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                            <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Diverifikasi Oleh</span>
                            <span className="font-bold text-slate-900 block text-xs mt-0.5 truncate">
                              {hazard.closedBy || hazard.picPerbaikan || 'SHE Team'}
                            </span>
                            <span className="text-emerald-700 font-medium text-[10px]">K3 Verifier</span>
                          </div>
                          <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                            <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Tanggal Selesai</span>
                            <span className="font-mono font-bold text-emerald-700 text-xs mt-0.5 block">
                              {hazard.closedDate || 'Closed'}
                            </span>
                            <span className="text-slate-500 text-[10px]">Status: Closed</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* VIEW MODE FOR AFTER (STILL OPEN OR IN PROGRESS) */
                    <div className="space-y-4 flex-1 flex flex-col justify-center items-center text-center p-8 bg-slate-50/70 rounded-2xl border border-amber-200/70 w-full shadow-inner">
                      <div className="w-14 h-14 rounded-2xl bg-amber-100/80 border border-amber-200 text-amber-700 flex items-center justify-center shadow-xs">
                        <Clock className="w-7 h-7 text-amber-600" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900">Perbaikan Belum Tersedia</h4>
                        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                          Laporan ini masih berstatus <span className="font-bold text-amber-700 uppercase bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-300">{hazard.status}</span>. Dokumentasi bukti penanganan belum diunggah.
                        </p>
                      </div>

                      {onConfirmResolve && (
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentMode('resolve');
                            setViewTab('both');
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer group"
                        >
                          <span className="w-4 h-4 rounded-full bg-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </span>
                          <span>Input Hasil Perbaikan Sekarang</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Footer Actions Bar */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200/90 bg-white flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
          >
            {currentMode === 'resolve' ? 'Batal' : 'Tutup'}
          </button>

          {currentMode === 'resolve' && (
            <button
              type="submit"
              form="resolve-hazard-form"
              disabled={isProcessingPhoto}
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Verifikasi Selesai (Closed)</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. Fullscreen Lightbox Modal */}
      {fullscreenPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tampilan foto ukuran penuh"
          className="fixed inset-0 z-60 bg-slate-950/92 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setFullscreenPhoto(null)}
        >
          <div className="relative max-w-5xl max-h-[92vh] w-full flex items-center justify-center">
            <img
              src={fullscreenPhoto}
              alt="Foto Dokumentasi Penuh"
              className="max-w-full max-h-[88vh] w-auto h-auto object-contain rounded-2xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setFullscreenPhoto(null)}
              className="absolute top-3 right-3 sm:-top-3 sm:-right-3 w-10 h-10 rounded-full bg-slate-900/95 hover:bg-slate-800 text-white flex items-center justify-center shadow-xl border border-white/20 transition-all cursor-pointer hover:scale-105"
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
