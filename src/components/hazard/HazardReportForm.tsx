import React, { useState, useRef } from 'react';
import { Camera, AlertTriangle, User, MapPin, AlertCircle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { HazardReport, MiningArea, HazardCategory, RiskLevel, HazardType } from '../../types/hazard';
import { generateTicketId } from '../../utils/k3-calculator';
import { saveHazardReport } from '../../services/storage-service';
import { syncHazardToGoogleSheets } from '../../services/sheets-sync-service';
import { compressImageFile } from '../../utils/image-compressor';
import { HazardSuccessModal } from './HazardSuccessModal';

const MINING_AREAS: MiningArea[] = [
  'Pit North / Front Loading',
  'Pit South / Front Loading',
  'Hauling Road',
  'Disposal Area',
  'ROM Stockpile',
  'Workshop / Plant',
  'Port / Jetty Pelabuhan',
  'Camp / Office Area',
  'Fuel Station',
];

const HAZARD_CATEGORIES: HazardCategory[] = [
  'Jalan Tambang, Tanggul, & Lereng',
  'Kelaikan Unit & Kendaraan Tambang',
  'Housekeeping & Kerapian 5S',
  'Kepatuhan Alat Pelindung Diri',
  'Tumpahan Oli, BBM, & Lingkungan',
  'Blind Spot, Debu, & Rambu Keselamatan',
  'Bahaya Kelistrikan & Panas',
];

const DEPARTMENTS = [
  'Mining Operation',
  'Hauling & Transport',
  'Coal Processing / ROM',
  'Workshop & Plant',
  'SHE / K3LH',
  'Logistik & Warehouse',
  'Geology & Survey',
  'Sub-Kontraktor',
];

interface HazardReportFormProps {
  onSubmitSuccess?: (report: HazardReport) => void;
  onNavigateToDashboard?: () => void;
}

export const HazardReportForm: React.FC<HazardReportFormProps> = ({
  onSubmitSuccess,
  onNavigateToDashboard,
}) => {
  // Prepopulate reporter identity from localStorage for maximum worker convenience
  const [reporterName, setReporterName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('SHE_REPORTER_NAME') || '';
    }
    return '';
  });
  const [reporterNik, setReporterNik] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('SHE_REPORTER_NIK') || '';
    }
    return '';
  });
  const [department, setDepartment] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('SHE_REPORTER_DEPT') || DEPARTMENTS[0];
    }
    return DEPARTMENTS[0];
  });

  const [area, setArea] = useState<MiningArea>(MINING_AREAS[0]);
  const [locationDetail, setLocationDetail] = useState('');
  const [hazardType, setHazardType] = useState<HazardType>('KTA');
  const [category, setCategory] = useState<HazardCategory>(HAZARD_CATEGORIES[0]);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('Sedang');
  const [description, setDescription] = useState('');
  const [immediateAction, setImmediateAction] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [submittedReport, setSubmittedReport] = useState<HazardReport | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file, 1024, 0.7);
      setPhotoPreview(compressed);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses gambar');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const newErrors: { [key: string]: string } = {};

    // Validate required fields
    if (!description.trim()) {
      newErrors.description = 'Deskripsi bahaya wajib diisi';
    }
    if (!reporterName.trim()) {
      newErrors.reporterName = 'Nama pelapor wajib diisi';
    }
    if (!reporterNik.trim()) {
      newErrors.reporterNik = 'NIK pelapor wajib diisi';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setErrorMessage('Ada kolom wajib yang belum diisi. Halaman diarahkan langsung ke kolom terkait.');

      // Auto-scroll and focus to the FIRST missing field in natural visual order
      const targetId = !description.trim()
        ? 'description'
        : !reporterName.trim()
        ? 'reporterName'
        : 'reporterNik';

      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          if (typeof el.scrollIntoView === 'function') {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          if (typeof el.focus === 'function') {
            el.focus();
          }
        }
      }, 50);

      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    // Save identity for next submissions
    try {
      localStorage.setItem('SHE_REPORTER_NAME', reporterName.trim());
      localStorage.setItem('SHE_REPORTER_NIK', reporterNik.trim());
      localStorage.setItem('SHE_REPORTER_DEPT', department);
    } catch {
      // Ignore localStorage issues
    }

    try {
      const newReport: HazardReport = {
        id: generateTicketId(),
        timestamp: new Date().toISOString(),
        reporterName: reporterName.trim(),
        reporterNik: reporterNik.trim(),
        department,
        area,
        locationDetail: locationDetail.trim(),
        hazardType,
        category,
        riskLevel,
        description: description.trim(),
        photoUrl: photoPreview || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
        immediateAction: immediateAction.trim() || undefined,
        status: 'Open',
        syncedToSheets: false,
      };

      saveHazardReport(newReport);

      const synced = await syncHazardToGoogleSheets(newReport);
      if (synced) {
        newReport.syncedToSheets = true;
        saveHazardReport(newReport);
      }

      setSubmittedReport(newReport);
      if (onSubmitSuccess) {
        onSubmitSuccess(newReport);
      }
    } catch {
      setErrorMessage('Terjadi kendala saat menyimpan laporan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setDescription('');
    setImmediateAction('');
    setPhotoPreview('');
    setLocationDetail('');
    setSubmittedReport(null);
  };

  if (submittedReport) {
    return (
      <div className="max-w-xl mx-auto pb-28 md:pb-8 pt-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 text-center shadow-xs">
          <img
            src="/logo_ihazard.png"
            alt="iHazard"
            className="w-16 h-16 rounded-2xl mx-auto mb-4 object-cover shadow-sm border border-slate-200"
          />
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            Laporan Berhasil Terkirim!
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Terima kasih atas kontribusi Anda dalam menjaga keselamatan kerja operasional tambang.
          </p>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-left mb-6 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Nomor Tiket</span>
              <span className="font-mono font-bold text-slate-900">{submittedReport.id}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Area Tambang</span>
              <span className="font-medium text-slate-800">{submittedReport.area}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Tingkat Risiko</span>
              <span className="font-semibold text-amber-600">{submittedReport.riskLevel}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Status</span>
              <span className="font-semibold text-blue-600">Open (Menunggu Tindak Lanjut)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleResetForm}
              className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Kirim Laporan Lain
            </button>
            {onNavigateToDashboard && (
              <button
                onClick={onNavigateToDashboard}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Lihat di Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-28 md:pb-8">
      {/* Calm, Humanized Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Lapor Temuan Bahaya
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Bantu ciptakan lingkungan tambang yang aman dengan melaporkan setiap kondisi atau tindakan yang berisiko.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-800 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form Card - Linear / Stripe Style */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
        
        {/* ================================================================ */}
        {/* 1. LOKASI KEJADIAN                                              */}
        {/* ================================================================ */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <span>Di Mana Lokasinya?</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="area" className="block text-xs font-medium text-slate-700 mb-1.5">
                Area Lokasi <span className="text-red-500">*</span>
              </label>
              <select
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value as MiningArea)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
              >
                {MINING_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="locationDetail" className="block text-xs font-medium text-slate-700 mb-1.5">
                Titik Spesifik
              </label>
              <input
                id="locationDetail"
                type="text"
                value={locationDetail}
                onChange={(e) => setLocationDetail(e.target.value)}
                placeholder="Contoh: Dekat bench 4 loading point"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 2. TEMUAN BAHAYA & FOTO BUKTI                                    */}
        {/* ================================================================ */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <span>Apa Bahayanya?</span>
          </div>

          {/* Tipe Bahaya: Kondisi vs Tindakan */}
          <div>
            <span className="block text-xs font-medium text-slate-700 mb-1.5">
              Jenis Bahaya
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setHazardType('KTA')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  hazardType === 'KTA'
                    ? 'bg-amber-50/70 border-amber-500 text-slate-900 shadow-xs ring-1 ring-amber-500/30'
                    : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="block text-xs font-bold text-slate-900 mb-0.5">Kondisi Tidak Aman</span>
                <span className="block text-[11px] text-slate-500">Kondisi jalan, alat berat, lereng, atau lingkungan</span>
              </button>

              <button
                type="button"
                onClick={() => setHazardType('TTA')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  hazardType === 'TTA'
                    ? 'bg-amber-50/70 border-amber-500 text-slate-900 shadow-xs ring-1 ring-amber-500/30'
                    : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="block text-xs font-bold text-slate-900 mb-0.5">Tindakan Tidak Aman</span>
                <span className="block text-[11px] text-slate-500">Perilaku kerja, kelalaian, atau pelanggaran prosedur</span>
              </button>
            </div>
          </div>

          {/* Kategori Bahaya */}
          <div>
            <label htmlFor="category" className="block text-xs font-medium text-slate-700 mb-1.5">
              Kategori Bahaya
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as HazardCategory)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
            >
              {HAZARD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Uraian Bahaya */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="description" className="block text-xs font-medium text-slate-700">
                Penjelasan Bahaya <span className="text-red-500">*</span>
              </label>
              {fieldErrors.description && (
                <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Wajib diisi
                </span>
              )}
            </div>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (fieldErrors.description) {
                  setFieldErrors((prev) => ({ ...prev, description: '' }));
                }
              }}
              placeholder="Ceritakan temuan bahaya secara singkat dan jelas..."
              className={`w-full rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all resize-none ${
                fieldErrors.description
                  ? 'bg-red-50/50 border-2 border-red-500 ring-2 ring-red-500/20'
                  : 'bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
              }`}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">
                {fieldErrors.description}
              </p>
            )}
          </div>

          {/* Foto Bukti */}
          <div>
            <span className="block text-xs font-medium text-slate-700 mb-1.5">
              Foto Bukti Lapangan
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
            />

            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 h-36 bg-slate-100">
                <img src={photoPreview} alt="Bukti Foto Temuan" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoPreview('')}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg transition-colors cursor-pointer"
                  title="Hapus foto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 px-4 border border-dashed border-slate-300 hover:border-amber-500 rounded-xl bg-slate-50/70 hover:bg-amber-50/20 flex flex-col items-center justify-center gap-1.5 transition-all text-slate-600 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-amber-600 group-hover:scale-105 transition-all shadow-xs">
                  <Camera className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-700">Ambil Foto atau Pilih dari Galeri</span>
                <span className="text-[11px] text-slate-400">Format gambar JPEG atau PNG</span>
              </button>
            )}
          </div>
        </div>

        {/* ================================================================ */}
        {/* 3. TINGKAT BAHAYA & PENANGANAN CEPAT                             */}
        {/* ================================================================ */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <span>Seberapa Mendesak?</span>
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-700 mb-1.5">Tingkat Risiko</span>
            <div className="grid grid-cols-3 gap-2.5">
              {(['Rendah', 'Sedang', 'Tinggi'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRiskLevel(r)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    riskLevel === r
                      ? r === 'Tinggi'
                        ? 'bg-red-50 text-red-700 border-red-300 ring-1 ring-red-400 shadow-xs'
                        : r === 'Sedang'
                        ? 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400 shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400 shadow-xs'
                      : 'bg-slate-50/70 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      r === 'Tinggi'
                        ? 'bg-red-500'
                        : r === 'Sedang'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span>{r}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="immediateAction" className="block text-xs font-medium text-slate-700 mb-1.5">
              Tindakan Awal yang Sudah Diambil
            </label>
            <input
              id="immediateAction"
              type="text"
              value={immediateAction}
              onChange={(e) => setImmediateAction(e.target.value)}
              placeholder="Contoh: Memasang rambu peringatan sementara"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* ================================================================ */}
        {/* 4. IDENTITAS PELAPOR (TERSIMPAN OTOMATIS)                        */}
        {/* ================================================================ */}
        <div className="p-5 sm:p-6 space-y-3.5 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <div className="w-7 h-7 rounded-lg bg-slate-200/80 text-slate-700 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <span>Identitas Pelapor</span>
            </div>
            <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Tersimpan di perangkat
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="reporterName" className="block text-xs font-medium text-slate-700">
                  Nama Pelapor <span className="text-red-500">*</span>
                </label>
                {fieldErrors.reporterName && (
                  <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Wajib diisi
                  </span>
                )}
              </div>
              <input
                id="reporterName"
                type="text"
                value={reporterName}
                onChange={(e) => {
                  setReporterName(e.target.value);
                  if (fieldErrors.reporterName) {
                    setFieldErrors((prev) => ({ ...prev, reporterName: '' }));
                  }
                }}
                placeholder="Budi Santoso"
                className={`w-full rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none transition-all ${
                  fieldErrors.reporterName
                    ? 'bg-red-50/50 border-2 border-red-500 ring-2 ring-red-500/20'
                    : 'bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                }`}
              />
              {fieldErrors.reporterName && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">
                  {fieldErrors.reporterName}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="reporterNik" className="block text-xs font-medium text-slate-700">
                  NIK Karyawan <span className="text-red-500">*</span>
                </label>
                {fieldErrors.reporterNik && (
                  <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Wajib diisi
                  </span>
                )}
              </div>
              <input
                id="reporterNik"
                type="text"
                value={reporterNik}
                onChange={(e) => {
                  setReporterNik(e.target.value);
                  if (fieldErrors.reporterNik) {
                    setFieldErrors((prev) => ({ ...prev, reporterNik: '' }));
                  }
                }}
                placeholder="204918"
                className={`w-full rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none transition-all ${
                  fieldErrors.reporterNik
                    ? 'bg-red-50/50 border-2 border-red-500 ring-2 ring-red-500/20'
                    : 'bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                }`}
              />
              {fieldErrors.reporterNik && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">
                  {fieldErrors.reporterNik}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="department" className="block text-xs font-medium text-slate-700 mb-1">
                Departemen Kerja
              </label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit Action Area */}
        <div className="p-5 sm:p-6 bg-white">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-slate-950" />
            <span>{isSubmitting ? 'Mengirim Laporan...' : 'Kirim Laporan Bahaya'}</span>
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {submittedReport && (
        <HazardSuccessModal
          report={submittedReport}
          onClose={() => {
            setSubmittedReport(null);
            if (onNavigateToDashboard) onNavigateToDashboard();
          }}
          onReset={handleResetForm}
        />
      )}
    </div>
  );
};
