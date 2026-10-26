import React, { useState } from 'react';
import { Award, Save, Check, Presentation } from 'lucide-react';
import { MonthlySHEReport } from '../../types/she-report';
import { saveMonthlyReport } from '../../services/storage-service';
import { calculateLTIFR, calculateTRIFR } from '../../utils/k3-calculator';

interface MonthlyEntryFormProps {
  onSaved?: (report: MonthlySHEReport) => void;
  onGeneratePPT?: (report: MonthlySHEReport) => void;
}

export const MonthlyEntryForm: React.FC<MonthlyEntryFormProps> = ({ onSaved, onGeneratePPT }) => {
  const [periodMonth, setPeriodMonth] = useState('Oktober 2026');
  const [safeManHoursMonth, setSafeManHoursMonth] = useState<number>(145000);
  const [safeManHoursYTD, setSafeManHoursYTD] = useState<number>(1420000);
  const [incidentsFatality, setIncidentsFatality] = useState<number>(0);
  const [incidentsLTI, setIncidentsLTI] = useState<number>(0);
  const [incidentsRestrictedWork, setIncidentsRestrictedWork] = useState<number>(1);
  const [incidentsMedicalTreatment, setIncidentsMedicalTreatment] = useState<number>(2);
  const [hazardResolutionRatePercent, setHazardResolutionRatePercent] = useState<number>(85.5);
  const [plannedInspectionRatePercent, setPlannedInspectionRatePercent] = useState<number>(94.0);
  const [safetyTrainingAttendancePercent, setSafetyTrainingAttendancePercent] = useState<number>(92.0);
  const [goldenRulesCompliancePercent, setGoldenRulesCompliancePercent] = useState<number>(97.5);
  const [b3WasteVolumeTons, setB3WasteVolumeTons] = useState<number>(4.2);
  const [reclamationLandHa, setReclamationLandHa] = useState<number>(12.5);
  const [p2k3Notes, setP2k3Notes] = useState(
    'Rapat komite keselamatan bulanan menyetujui program inspeksi blind spot terpadu dan peremajaan tanggul jalan hauling.'
  );
  const [isSaved, setIsSaved] = useState(false);

  // Auto calculate LTIFR and TRIFR
  const ltifr = calculateLTIFR(incidentsLTI, safeManHoursMonth);
  const totalRecordable = incidentsFatality + incidentsLTI + incidentsRestrictedWork + incidentsMedicalTreatment;
  const trifr = calculateTRIFR(totalRecordable, safeManHoursMonth);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const report: MonthlySHEReport = {
      id: `M-${Date.now()}`,
      periodMonth,
      safeManHoursMonth,
      safeManHoursYTD,
      incidentsFatality,
      incidentsLTI,
      incidentsRestrictedWork,
      incidentsMedicalTreatment,
      ltifr,
      trifr,
      hazardResolutionRatePercent,
      plannedInspectionRatePercent,
      safetyTrainingAttendancePercent,
      goldenRulesCompliancePercent,
      b3WasteVolumeTons,
      reclamationLandHa,
      p2k3Notes,
    };

    saveMonthlyReport(report);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);

    if (onSaved) onSaved(report);
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Humanized Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Laporan Keselamatan Bulanan
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Penginputan metrik strategis, jam kerja selamat, dan perhitungan otomatis rasio frekuensi insiden kerja.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* KOLOM KIRI: Jam Kerja Selamat & Statistik Insiden */}
          <div className="space-y-5">
            {/* 1. Jam Kerja Selamat */}
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-3">
                <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <span>Jam Kerja Selamat</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="periodMonth" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Bulan dan Tahun
                  </label>
                  <input
                    id="periodMonth"
                    type="text"
                    value={periodMonth}
                    onChange={(e) => setPeriodMonth(e.target.value)}
                    placeholder="Okt 2026"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="safeManHoursMonth" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Jam Kerja Selamat
                  </label>
                  <input
                    id="safeManHoursMonth"
                    type="number"
                    value={safeManHoursMonth}
                    onChange={(e) => setSafeManHoursMonth(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="safeManHoursYTD" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Akumulasi Tahun Berjalan
                  </label>
                  <input
                    id="safeManHoursYTD"
                    type="number"
                    value={safeManHoursYTD}
                    onChange={(e) => setSafeManHoursYTD(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 2. Insiden & Otomasi Rate */}
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-3">
                <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <span>Statistik Insiden dan Rasio Keselamatan</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                  <span className="text-[10px] font-semibold text-slate-600 block mb-1">Fatal</span>
                  <input
                    type="number"
                    value={incidentsFatality}
                    onChange={(e) => setIncidentsFatality(Number(e.target.value))}
                    className="w-full bg-white text-center font-bold text-red-600 rounded-lg py-1 text-xs border border-slate-200"
                  />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                  <label htmlFor="incidentsLTI" className="text-[10px] font-semibold text-slate-600 block mb-1">
                    Jumlah LTI
                  </label>
                  <input
                    id="incidentsLTI"
                    type="number"
                    value={incidentsLTI}
                    onChange={(e) => setIncidentsLTI(Number(e.target.value))}
                    className="w-full bg-white text-center font-bold text-slate-900 rounded-lg py-1 text-xs border border-slate-200"
                  />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                  <span className="text-[10px] font-semibold text-slate-600 block mb-1">Pembatasan</span>
                  <input
                    type="number"
                    value={incidentsRestrictedWork}
                    onChange={(e) => setIncidentsRestrictedWork(Number(e.target.value))}
                    className="w-full bg-white text-center font-bold text-slate-700 rounded-lg py-1 text-xs border border-slate-200"
                  />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                  <span className="text-[10px] font-semibold text-slate-600 block mb-1">Medis</span>
                  <input
                    type="number"
                    value={incidentsMedicalTreatment}
                    onChange={(e) => setIncidentsMedicalTreatment(Number(e.target.value))}
                    className="w-full bg-white text-center font-bold text-amber-600 rounded-lg py-1 text-xs border border-slate-200"
                  />
                </div>
              </div>

              {/* Linear Style Calculated Rates Card */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-900 rounded-xl text-white shadow-xs">
                <div className="text-center">
                  <span className="text-[11px] text-amber-400 font-semibold block mb-0.5">Rasio LTIFR</span>
                  <span className="text-2xl font-bold tracking-tight text-white block">{ltifr}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">per 1.000.000 Jam Kerja</span>
                </div>
                <div className="text-center border-l border-slate-800">
                  <span className="text-[11px] text-amber-400 font-semibold block mb-0.5">Rasio TRIFR</span>
                  <span className="text-2xl font-bold tracking-tight text-white block">{trifr}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">per 1.000.000 Jam Kerja</span>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: Leading Indicators, Lingkungan & Submit */}
          <div className="space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* 3. Leading Indicators */}
              <div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-3">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <span>Indikator Pencegahan dan Pelatihan</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="hazardResolutionRate" className="block text-xs font-medium text-slate-700 mb-1.5">
                      Penyelesaian Bahaya
                    </label>
                    <div className="relative">
                      <input
                        id="hazardResolutionRate"
                        type="number"
                        step="0.1"
                        value={hazardResolutionRatePercent}
                        onChange={(e) => setHazardResolutionRatePercent(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">%</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="plannedInspectionRate" className="block text-xs font-medium text-slate-700 mb-1.5">
                      Inspeksi Terencana
                    </label>
                    <div className="relative">
                      <input
                        id="plannedInspectionRate"
                        type="number"
                        step="0.1"
                        value={plannedInspectionRatePercent}
                        onChange={(e) => setPlannedInspectionRatePercent(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">%</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="safetyTrainingAttendance" className="block text-xs font-medium text-slate-700 mb-1.5">
                      Kehadiran Pelatihan K3
                    </label>
                    <div className="relative">
                      <input
                        id="safetyTrainingAttendance"
                        type="number"
                        step="0.1"
                        value={safetyTrainingAttendancePercent}
                        onChange={(e) => setSafetyTrainingAttendancePercent(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">%</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="goldenRulesCompliance" className="block text-xs font-medium text-slate-700 mb-1.5">
                      Kepatuhan Aturan Emas
                    </label>
                    <div className="relative">
                      <input
                        id="goldenRulesCompliance"
                        type="number"
                        step="0.1"
                        value={goldenRulesCompliancePercent}
                        onChange={(e) => setGoldenRulesCompliancePercent(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Lingkungan & P2K3 */}
              <div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-3">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <span>Lingkungan dan Catatan Komite</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label htmlFor="b3WasteVolume" className="block text-xs font-medium text-slate-700 mb-1.5">
                      Volume Limbah B3 Ton
                    </label>
                    <input
                      id="b3WasteVolume"
                      type="number"
                      step="0.1"
                      value={b3WasteVolumeTons}
                      onChange={(e) => setB3WasteVolumeTons(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="reclamationLand" className="block text-xs font-medium text-slate-700 mb-1.5">
                      Reklamasi Lahan Hektar
                    </label>
                    <input
                      id="reclamationLand"
                      type="number"
                      step="0.1"
                      value={reclamationLandHa}
                      onChange={(e) => setReclamationLandHa(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="p2k3Notes" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Catatan Evaluasi Komite Keselamatan
                  </label>
                  <textarea
                    id="p2k3Notes"
                    rows={2}
                    value={p2k3Notes}
                    onChange={(e) => setP2k3Notes(e.target.value)}
                    placeholder="Arahan strategis komite keselamatan kerja..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-3">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaved ? <Check className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4 text-slate-950" />}
                <span>{isSaved ? 'Tersimpan' : 'Simpan Data Bulanan'}</span>
              </button>

              {onGeneratePPT && (
                <button
                  type="button"
                  onClick={() => {
                    const report: MonthlySHEReport = {
                      id: `M-${Date.now()}`,
                      periodMonth,
                      safeManHoursMonth,
                      safeManHoursYTD,
                      incidentsFatality,
                      incidentsLTI,
                      incidentsRestrictedWork,
                      incidentsMedicalTreatment,
                      ltifr,
                      trifr,
                      hazardResolutionRatePercent,
                      plannedInspectionRatePercent,
                      safetyTrainingAttendancePercent,
                      goldenRulesCompliancePercent,
                      b3WasteVolumeTons,
                      reclamationLandHa,
                      p2k3Notes,
                    };
                    onGeneratePPT(report);
                  }}
                  className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Presentation className="w-4 h-4 text-amber-600" />
                  <span>Unduh PPT</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
