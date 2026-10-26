import React, { useState, useRef } from 'react';
import { Camera, AlertTriangle, User, MapPin, AlertCircle, X } from 'lucide-react';
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
    <div className="max-w-xl mx-auto pb-16">
      {/* Header section - Clean & Light */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
          Form Pelaporan Hazard Lapangan
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Laporkan temuan kondisi atau tindakan tidak aman dalam waktu kurang dari 60 detik.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50/80 border border-red-200/80 rounded-xl flex items-center gap-2 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form - Single Clean Surface */}
      <form onSubmit={handleSubmit} className="bg-white border border-zinc-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
        {/* 1. Identitas Pelapor */}
        <div>
          <div className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5 pb-2 border-b border-zinc-100 mb-3">
            <User className="w-3.5 h-3.5 text-zinc-500" />
            <span>1. Identitas Pelapor</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="reporterName" className="block text-xs font-medium text-zinc-700 mb-1">
                Nama Pelapor <span className="text-red-500">*</span>
              </label>
              <input
                id="reporterName"
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="reporterNik" className="block text-xs font-medium text-zinc-700 mb-1">
                NIK / No. Pekerja <span className="text-red-500">*</span>
              </label>
              <input
                id="reporterNik"
                type="text"
                value={reporterNik}
                onChange={(e) => setReporterNik(e.target.value)}
                placeholder="Contoh: 204918"
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="department" className="block text-xs font-medium text-zinc-700 mb-1">
                Departemen / Divisi
              </label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
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
          <div className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5 pb-2 border-b border-zinc-100 mb-3">
            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
            <span>2. Lokasi Temuan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="area" className="block text-xs font-medium text-zinc-700 mb-1">
                Area Lokasi <span className="text-red-500">*</span>
              </label>
              <select
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value as MiningArea)}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              >
                {MINING_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="locationDetail" className="block text-xs font-medium text-zinc-700 mb-1">
                Titik Spesifik (Opsional)
              </label>
              <input
                id="locationDetail"
                type="text"
                value={locationDetail}
                onChange={(e) => setLocationDetail(e.target.value)}
                placeholder="Misal: KM 14 Tikungan Pos 2"
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 3. Klasifikasi Bahaya */}
        <div>
          <div className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5 pb-2 border-b border-zinc-100 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-zinc-500" />
            <span>3. Klasifikasi Bahaya</span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="block text-xs font-medium text-zinc-700 mb-1.5">Tipe Bahaya</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setHazardType('KTA')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                    hazardType === 'KTA'
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-zinc-50/70 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  Kondisi Tidak Aman (KTA)
                </button>
                <button
                  type="button"
                  onClick={() => setHazardType('TTA')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                    hazardType === 'TTA'
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-zinc-50/70 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  Tindakan Tidak Aman (TTA)
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-xs font-medium text-zinc-700 mb-1">
                Kategori Bahaya
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as HazardCategory)}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              >
                {HAZARD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-xs font-medium text-zinc-700 mb-1.5">Tingkat Risiko</span>
              <div className="grid grid-cols-3 gap-2">
                {(['Rendah', 'Sedang', 'Tinggi'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRiskLevel(r)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                      riskLevel === r
                        ? r === 'Tinggi'
                          ? 'bg-red-600 text-white border-red-600'
                          : r === 'Sedang'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-zinc-50/70 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Deskripsi & Bukti Foto */}
        <div>
          <div className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5 pb-2 border-b border-zinc-100 mb-3">
            <Camera className="w-3.5 h-3.5 text-zinc-500" />
            <span>4. Deskripsi & Foto Temuan</span>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="description" className="block text-xs font-medium text-zinc-700 mb-1">
                Uraian Bahaya <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan kondisi atau perilaku bahaya yang ditemukan secara singkat..."
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors resize-none"
              />
            </div>

            <div>
              <label htmlFor="immediateAction" className="block text-xs font-medium text-zinc-700 mb-1">
                Tindakan Langsung yang Diambil (Opsional)
              </label>
              <input
                id="immediateAction"
                type="text"
                value={immediateAction}
                onChange={(e) => setImmediateAction(e.target.value)}
                placeholder="Misal: Memasang safety cone di area lubang"
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>

            {/* Foto Upload Zone */}
            <div>
              <span className="block text-xs font-medium text-zinc-700 mb-1">Foto Bukti Lapangan</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />

              {photoPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-zinc-200">
                  <img src={photoPreview} alt="Bukti Foto" className="w-full h-44 object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview('')}
                    className="absolute top-2 right-2 p-1 bg-zinc-900/70 hover:bg-zinc-900 text-white rounded-full transition-colors"
                    title="Hapus foto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-5 border border-dashed border-zinc-300 hover:border-zinc-400 rounded-xl bg-zinc-50/50 hover:bg-zinc-50 flex flex-col items-center justify-center gap-1.5 transition-colors text-zinc-600"
                >
                  <Camera className="w-5 h-5 text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-700">Ambil Foto dari Kamera HP</span>
                  <span className="text-[10px] text-zinc-400">Atau pilih dari galeri dokumen</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
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
