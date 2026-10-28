import React, { useState, useRef } from 'react';
import { Camera, Upload, X, CheckCircle2, AlertCircle, HardHat, RefreshCw } from 'lucide-react';
import { HazardReport } from '../../types/hazard';
import { compressImageFile } from '../../utils/image-compressor';
import { updateHazardPhoto } from '../../services/storage-service';
import { syncHazardToGoogleSheets } from '../../services/sheets-sync-service';

interface AttachPhotoModalProps {
  hazard: HazardReport;
  onClose: () => void;
  onSuccess: (updated: HazardReport) => void;
}

export const AttachPhotoModal: React.FC<AttachPhotoModalProps> = ({
  hazard,
  onClose,
  onSuccess,
}) => {
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setErrorMsg('');
      const compressed = await compressImageFile(file, 1200, 0.75);
      setPhotoPreview(compressed);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses file foto');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSavePhoto = async () => {
    if (!photoPreview) {
      setErrorMsg('Silakan pilih atau ambil foto terlebih dahulu');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg('');

      // 1. Simpan foto ke LocalStorage
      const updated = updateHazardPhoto(hazard.id, photoPreview);
      if (!updated) {
        throw new Error('Tiket laporan tidak ditemukan di penyimpanan');
      }

      // 2. Sinkronisasikan foto ke Google Sheets / Google Drive
      syncHazardToGoogleSheets(updated).catch(() => {
        // Sinkronisasi background bila offline
      });

      setSuccessMsg('Foto temuan bahaya berhasil dilampirkan!');
      setTimeout(() => {
        onSuccess(updated);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan lampiran foto');
      setIsProcessing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="attach-photo-title"
      className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 id="attach-photo-title" className="text-sm font-bold text-slate-900">Lampirkan Foto Temuan</h3>
              <p className="text-[11px] text-slate-500 font-mono">Tiket: {hazard.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup modal lampiran foto"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Isi Modal */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Ringkasan Laporan Singkat */}
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-700">{hazard.area}</span>
              <span className="text-slate-500 font-mono">{hazard.reporterName} ({hazard.reporterNik})</span>
            </div>
            <p className="text-slate-600 line-clamp-2 leading-relaxed">
              {hazard.description}
            </p>
          </div>

          {/* Area Upload Foto */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Pilih / Ambil Foto Temuan Lapangan
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {!photoPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-amber-50/20 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-800 text-xs">
                  Klik untuk Buka Kamera atau Pilih Galeri
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Format: JPG, PNG, atau WebP (otomatis dioptimasi ringan &lt; 300KB)
                </p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 h-56 sm:h-64 flex items-center justify-center group shadow-inner">
                <img
                  src={photoPreview}
                  alt="Pratinjau Foto"
                  className="max-w-full max-h-full w-auto h-auto object-contain mx-auto"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Ganti Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoPreview('')}
                    className="px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
                <span className="absolute bottom-2 left-2 bg-slate-950/75 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                  Pratinjau Lampiran Baru
                </span>
              </div>
            )}
          </div>

          {/* Feedback Error / Sukses */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Tombol Aksi */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSavePhoto}
            disabled={!photoPreview || isProcessing}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Simpan Lampiran Foto</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
