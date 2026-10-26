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
    <div className="max-w-4xl mx-auto">
      {/* Compact Header with Mining Operational Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-zinc-950 uppercase flex items-center gap-2">
              <span>Form Pelaporan Hazard Lapangan</span>
            </h1>
            <span className="text-[10px] bg-amber-500 text-zinc-950 px-2 py-0.5 rounded font-mono font-black border border-amber-600/30 shadow-xs uppercase">
              60 DETIK // QUICK DISPATCH
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Laporan temuan kondisi (KTA) & tindakan tidak aman (TTA) standar Kepmen ESDM 1827.K
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-3 p-2.5 bg-red-100 border border-red-300 rounded-md flex items-center gap-2 text-red-900 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2-Column Responsive Bento Layout with Industrial Accent Bar */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">
        {/* Signature Hazard Accent Line */}
        <div className="h-1 w-full bg-hazard-stripes" />

        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* KOLOM KIRI: Identitas, Lokasi, & Klasifikasi Bahaya */}
          <div className="space-y-3.5">
            {/* 1. Identitas Pelapor */}
            <div>
              <div className="text-[11px] font-mono font-black text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200 mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span>[ 01. Identitas Pelapor ]</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="reporterName" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Nama Pelapor <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reporterName"
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Budi Santoso"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="reporterNik" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    NIK / ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reporterNik"
                    type="text"
                    value={reporterNik}
                    onChange={(e) => setReporterNik(e.target.value)}
                    placeholder="204918"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono font-medium focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="department" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Departemen
                  </label>
                  <select
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
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
              <div className="text-[11px] font-mono font-black text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>[ 02. Lokasi Temuan Pit ]</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="area" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Area Lokasi <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="area"
                    value={area}
                    onChange={(e) => setArea(e.target.value as MiningArea)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  >
                    {MINING_AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="locationDetail" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Titik Spesifik
                  </label>
                  <input
                    id="locationDetail"
                    type="text"
                    value={locationDetail}
                    onChange={(e) => setLocationDetail(e.target.value)}
                    placeholder="KM 14 Front Loading Pos 2"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 3. Klasifikasi Bahaya */}
            <div>
              <div className="text-[11px] font-mono font-black text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>[ 03. Klasifikasi Bahaya ]</span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="block text-[11px] font-bold text-slate-700 mb-1">Tipe Bahaya</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setHazardType('KTA')}
                      className={`py-1.5 px-2 rounded text-xs font-black uppercase tracking-wide border text-center transition-all ${
                        hazardType === 'KTA'
                          ? 'bg-amber-500 text-zinc-950 border-amber-600 shadow-sm'
                          : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      Kondisi Tidak Aman (KTA)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHazardType('TTA')}
                      className={`py-1.5 px-2 rounded text-xs font-black uppercase tracking-wide border text-center transition-all ${
                        hazardType === 'TTA'
                          ? 'bg-red-600 text-white border-red-700 shadow-sm'
                          : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      Tindakan Tidak Aman (TTA)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="category" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Kategori
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as HazardCategory)}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                    >
                      {HAZARD_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold text-slate-700 mb-0.5">Tingkat Risiko</span>
                    <div className="grid grid-cols-3 gap-1">
                      {(['Rendah', 'Sedang', 'Tinggi'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRiskLevel(r)}
                          className={`py-1.5 px-1 rounded text-[11px] font-black uppercase tracking-wider border text-center transition-all ${
                            riskLevel === r
                              ? r === 'Tinggi'
                                ? 'bg-red-600 text-white border-red-700 shadow-sm'
                                : r === 'Sedang'
                                ? 'bg-amber-500 text-zinc-950 border-amber-600 shadow-sm'
                                : 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                              : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: Detail Bahaya, Foto Kamera, & Submit */}
          <div className="space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="text-[11px] font-mono font-black text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-500" />
                <span>[ 04. Deskripsi & Bukti Temuan ]</span>
              </div>

              <div>
                <label htmlFor="description" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Uraian Bahaya <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan kondisi atau perilaku bahaya yang ditemukan secara singkat..."
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none font-medium"
                />
              </div>

              <div>
                <label htmlFor="immediateAction" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Tindakan Langsung yang Diambil (Opsional)
                </label>
                <input
                  id="immediateAction"
                  type="text"
                  value={immediateAction}
                  onChange={(e) => setImmediateAction(e.target.value)}
                  placeholder="Misal: Pasang safety cone di area lubang"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors font-medium"
                />
              </div>

              {/* Foto Bukti */}
              <div>
                <span className="block text-[11px] font-bold text-slate-700 mb-1">Foto Bukti Lapangan</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />

                {photoPreview ? (
                  <div className="relative rounded overflow-hidden border border-slate-300 h-28">
                    <img src={photoPreview} alt="Bukti Foto" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview('')}
                      className="absolute top-1.5 right-1.5 p-1 bg-zinc-900/90 hover:bg-zinc-900 text-amber-400 rounded transition-colors"
                      title="Hapus foto"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3.5 border-2 border-dashed border-amber-400/70 hover:border-amber-500 rounded bg-amber-50/20 hover:bg-amber-50/50 flex items-center justify-center gap-2.5 transition-colors text-slate-700"
                  >
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-900">Ambil Foto dari Kamera HP</span>
                    <span className="text-[10px] font-mono text-slate-500">/ Pilih Galeri</span>
                  </button>
                )}
              </div>
            </div>

            {/* Primary Hi-Vis Amber Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 text-xs font-black uppercase tracking-wider rounded shadow-md border border-amber-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-zinc-950" />
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
