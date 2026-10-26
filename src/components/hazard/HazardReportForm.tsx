import React, { useState, useRef } from 'react';
import { Camera, AlertTriangle, User, MapPin, AlertCircle, X, ShieldAlert, Zap } from 'lucide-react';
import { HazardReport, MiningArea, HazardCategory, RiskLevel, HazardType } from '../../types/hazard';
import { generateTicketId } from '../../utils/k3-calculator';
import { saveHazardReport } from '../../services/storage-service';
import { syncHazardToGoogleSheets } from '../../services/sheets-sync-service';
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
  'Kepatuhan Alat Pelindung Diri (APD)',
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
  const [reporterName, setReporterName] = useState('');
  const [reporterNik, setReporterNik] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
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
  const [submittedReport, setSubmittedReport] = useState<HazardReport | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setPhotoPreview(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!reporterName.trim()) {
      setErrorMessage('Nama pelapor wajib diisi');
      return;
    }
    if (!reporterNik.trim()) {
      setErrorMessage('NIK pelapor wajib diisi');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Deskripsi bahaya wajib diisi');
      return;
    }

    setIsSubmitting(true);

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
      setErrorMessage('Terjadi kesalahan saat menyimpan laporan.');
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

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-6">
      {/* Calm, concise header without text clutter */}
      <div className="mb-3.5">
        <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Lapor Temuan Bahaya</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Formulir pelaporan cepat kondisi & tindakan bahaya di area tambang.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Clean, 2-Column Responsive Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* KOLOM KIRI: Identitas, Lokasi, & Klasifikasi Bahaya */}
          <div className="space-y-4">
            {/* 1. Identitas Pelapor */}
            <div>
              <div className="text-xs font-semibold text-slate-800 pb-1.5 border-b border-slate-100 mb-2.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span>Identitas Pelapor</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="reporterName" className="block text-xs font-medium text-slate-700 mb-1">
                    Nama Pelapor <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reporterName"
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Budi Santoso"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="reporterNik" className="block text-xs font-medium text-slate-700 mb-1">
                    NIK / ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reporterNik"
                    type="text"
                    value={reporterNik}
                    onChange={(e) => setReporterNik(e.target.value)}
                    placeholder="204918"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="department" className="block text-xs font-medium text-slate-700 mb-1">
                    Departemen
                  </label>
                  <select
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
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

            {/* 2. Lokasi Temuan */}
            <div>
              <div className="text-xs font-semibold text-slate-800 pb-1.5 border-b border-slate-100 mb-2.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Lokasi Temuan</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label htmlFor="area" className="block text-xs font-medium text-slate-700 mb-1">
                    Area Lokasi <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="area"
                    value={area}
                    onChange={(e) => setArea(e.target.value as MiningArea)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  >
                    {MINING_AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="locationDetail" className="block text-xs font-medium text-slate-700 mb-1">
                    Titik Spesifik
                  </label>
                  <input
                    id="locationDetail"
                    type="text"
                    value={locationDetail}
                    onChange={(e) => setLocationDetail(e.target.value)}
                    placeholder="Misal: KM 14 Front Loading Pos 2"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 3. Klasifikasi Bahaya */}
            <div>
              <div className="text-xs font-semibold text-slate-800 pb-1.5 border-b border-slate-100 mb-2.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Klasifikasi Bahaya</span>
              </div>
              <div className="space-y-2.5">
                <div>
                  <span className="block text-xs font-medium text-slate-700 mb-1">Tipe Bahaya</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setHazardType('KTA')}
                      className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all text-center ${
                        hazardType === 'KTA'
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Kondisi Tidak Aman (KTA)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHazardType('TTA')}
                      className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all text-center ${
                        hazardType === 'TTA'
                          ? 'bg-red-500 text-white border-red-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Tindakan Tidak Aman (TTA)
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-xs font-medium text-slate-700 mb-1">
                    Kategori Bahaya
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as HazardCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  >
                    {HAZARD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-700 mb-1">Tingkat Risiko</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Rendah', 'Sedang', 'Tinggi'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRiskLevel(r)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                          riskLevel === r
                            ? r === 'Tinggi'
                              ? 'bg-red-50 text-red-700 border-red-300 shadow-xs'
                              : r === 'Sedang'
                              ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
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
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: Detail Bahaya, Foto Kamera, & Submit */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-800 pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-500" />
                <span>Deskripsi & Foto</span>
              </div>

              <div>
                <label htmlFor="description" className="block text-xs font-medium text-slate-700 mb-1">
                  Uraian Bahaya <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan kondisi atau perilaku bahaya yang ditemukan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label htmlFor="immediateAction" className="block text-xs font-medium text-slate-700 mb-1">
                  Tindakan Langsung (Opsional)
                </label>
                <input
                  id="immediateAction"
                  type="text"
                  value={immediateAction}
                  onChange={(e) => setImmediateAction(e.target.value)}
                  placeholder="Misal: Pasang safety cone di area lubang"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>

              {/* Foto Bukti */}
              <div>
                <span className="block text-xs font-medium text-slate-700 mb-1">Foto Bukti Lapangan</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />

                {photoPreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 h-28 bg-slate-100">
                    <img src={photoPreview} alt="Bukti Foto" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview('')}
                      className="absolute top-2 right-2 p-1 bg-slate-900/80 hover:bg-slate-900 text-white rounded-md transition-colors"
                      title="Hapus foto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-3 border border-dashed border-slate-300 hover:border-amber-500 rounded-lg bg-slate-50 hover:bg-amber-50/20 flex items-center justify-center gap-2 transition-all text-slate-700 group"
                  >
                    <Camera className="w-4 h-4 text-amber-600 group-hover:scale-105 transition-transform" />
                    <span className="text-xs font-medium text-slate-700">Ambil Foto / Pilih Gambar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Primary Amber Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-slate-950" />
                <span>{isSubmitting ? 'Mengirim Laporan...' : 'Kirim Laporan Bahaya'}</span>
              </button>
            </div>
          </div>
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
