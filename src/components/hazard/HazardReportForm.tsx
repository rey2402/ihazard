import React, { useState, useRef } from 'react';
import { Camera, AlertTriangle, ShieldCheck, MapPin, Upload, AlertCircle } from 'lucide-react';
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
        // Compress image using HTML Canvas
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
      const ticketId = generateTicketId();
      const newReport: HazardReport = {
        id: ticketId,
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

      // Simpan ke local storage
      saveHazardReport(newReport);

      // Async sync ke Google Sheets (jika webhook dikonfigurasi)
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
    <div className="max-w-xl mx-auto p-4 pb-20 text-slate-800">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-300/80 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">Form Pelaporan Hazard Lapangan</h2>
            <p className="text-xs text-amber-800 font-medium">K3LH Pertambangan Batu Bara • Laporkan Bahaya Dalam 60 Detik</p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Identitas Pelapor */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            1. Identitas Pelapor
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="reporterName" className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Pelapor <span className="text-red-500">*</span>
              </label>
              <input
                id="reporterName"
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="reporterNik" className="block text-xs font-semibold text-slate-700 mb-1">
                NIK / No. Pekerja <span className="text-red-500">*</span>
              </label>
              <input
                id="reporterNik"
                type="text"
                value={reporterNik}
                onChange={(e) => setReporterNik(e.target.value)}
                placeholder="Contoh: 204918"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="department" className="block text-xs font-semibold text-slate-700 mb-1">
              Departemen
            </label>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lokasi & Area Tambang */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4 text-amber-600" />
            2. Lokasi Temuan
          </div>

          <div>
            <label htmlFor="area" className="block text-xs font-semibold text-slate-700 mb-1">
              Area Lokasi <span className="text-red-500">*</span>
            </label>
            <select
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value as MiningArea)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
            >
              {MINING_AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="locationDetail" className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan Titik Spesifik (Opsional)
            </label>
            <input
              id="locationDetail"
              type="text"
              value={locationDetail}
              onChange={(e) => setLocationDetail(e.target.value)}
              placeholder="Misal: KM 14 dekat Pos 2 / Bay 3 Workshop"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Klasifikasi Bahaya K3LH */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            3. Klasifikasi Bahaya
          </div>

          {/* Tipe KTA vs TTA */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Tipe Bahaya</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setHazardType('KTA')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  hazardType === 'KTA'
                    ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-sm font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Kondisi Tidak Aman (KTA)
              </button>
              <button
                type="button"
                onClick={() => setHazardType('TTA')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  hazardType === 'TTA'
                    ? 'bg-orange-100 border-orange-400 text-orange-900 shadow-sm font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tindakan Tidak Aman (TTA)
              </button>
            </div>
          </div>

          {/* Kategori Bahaya */}
          <div>
            <label htmlFor="category" className="block text-xs font-semibold text-slate-700 mb-1">
              Kategori Bahaya
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as HazardCategory)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
            >
              {HAZARD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Tingkat Risiko */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Tingkat Risiko (Risk Matrix)</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Rendah', 'Sedang', 'Tinggi'] as RiskLevel[]).map((level) => {
                const isSelected = riskLevel === level;
                const colors = {
                  Rendah: isSelected
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100',
                  Sedang: isSelected
                    ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100',
                  Tinggi: isSelected
                    ? 'bg-red-100 border-red-400 text-red-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100',
                };

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setRiskLevel(level)}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${colors[level]}`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Deskripsi & Dokumentasi Foto */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <Camera className="w-4 h-4 text-amber-600" />
            4. Deskripsi & Foto Temuan
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-slate-700 mb-1">
              Uraian Kondisi Bahaya <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan bahaya yang ditemukan secara singkat dan jelas..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
            />
          </div>

          <div>
            <label htmlFor="immediateAction" className="block text-xs font-semibold text-slate-700 mb-1">
              Tindakan Langsung yang Diambil (Jika Ada)
            </label>
            <input
              id="immediateAction"
              type="text"
              value={immediateAction}
              onChange={(e) => setImmediateAction(e.target.value)}
              placeholder="Contoh: Memasang safety cone di area lubang"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Upload / Kamera HP */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Foto Bukti Lapangan</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handlePhotoCapture}
              className="hidden"
            />

            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-56 bg-slate-50 flex items-center justify-center">
                <img src={photoPreview} alt="Bukti Bahaya" className="w-full h-auto object-cover max-h-56" />
                <button
                  type="button"
                  onClick={() => setPhotoPreview('')}
                  className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-600 text-white text-xs px-2.5 py-1 rounded-lg shadow-sm"
                >
                  Hapus Foto
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50/80 hover:bg-amber-50/20 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-amber-600 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-600">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-slate-800 block">Ambil Foto dari Kamera HP</span>
                  <span className="text-xs text-slate-500">atau pilih dari galeri foto perangkat</span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-base shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Menyimpan Laporan...</span>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Kirim Laporan Bahaya</span>
            </>
          )}
        </button>
      </form>

      {/* Modal Sukses */}
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
