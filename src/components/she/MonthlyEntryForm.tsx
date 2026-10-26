import React, { useState } from 'react';
import { Award, Save, Check, ShieldAlert, Trees } from 'lucide-react';
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
  const [incidentsRestrictedWork, setIncidentsRestrictedWork] = useState<number>(0);
  const [incidentsMedicalTreatment, setIncidentsMedicalTreatment] = useState<number>(1);

  const [hazardResolutionRatePercent, setHazardResolutionRatePercent] = useState<number>(94.5);
  const [plannedInspectionRatePercent, setPlannedInspectionRatePercent] = useState<number>(100);
  const [safetyTrainingAttendancePercent, setSafetyTrainingAttendancePercent] = useState<number>(92.0);
  const [goldenRulesCompliancePercent, setGoldenRulesCompliancePercent] = useState<number>(97.5);

  const [b3WasteVolumeTons, setB3WasteVolumeTons] = useState<number>(12.4);
  const [reclamationLandHa, setReclamationLandHa] = useState<number>(4.5);
  const [p2k3Notes, setP2k3Notes] = useState(
    'Rapat Komite P2K3 menyetujui program re-sertifikasi operator alat berat dan audit kesiapan tanggap darurat (ERT).'
  );
  const [isSaved, setIsSaved] = useState(false);

  // Auto calculate K3 rates
  const totalRecordable = incidentsFatality + incidentsLTI + incidentsRestrictedWork + incidentsMedicalTreatment;
  const ltifr = calculateLTIFR(incidentsLTI, safeManHoursYTD);
  const trifr = calculateTRIFR(totalRecordable, safeManHoursYTD);

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
    <div className="max-w-2xl mx-auto pb-16">
      {/* Header section - Clean */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
          Input Log Laporan Bulanan SHE
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          K3LH Pertambangan • Metrik strategis, jam kerja selamat, dan rasio LTIFR / TRIFR
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-zinc-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
        {/* 1. Jam Kerja Selamat */}
        <div>
          <div className="text-xs font-semibold text-zinc-900 pb-2 border-b border-zinc-100 mb-3">
            1. Jam Kerja Selamat (Safe Man Hours)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="periodMonth" className="block text-xs font-medium text-zinc-700 mb-1">
                Bulan & Tahun
              </label>
              <input
                id="periodMonth"
                type="text"
                value={periodMonth}
                onChange={(e) => setPeriodMonth(e.target.value)}
                placeholder="Misal: Oktober 2026"
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="safeManHoursMonth" className="block text-xs font-medium text-zinc-700 mb-1">
                Jam Kerja Selamat Bulan Ini
              </label>
              <input
                id="safeManHoursMonth"
                type="number"
                value={safeManHoursMonth}
                onChange={(e) => setSafeManHoursMonth(Number(e.target.value))}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="safeManHoursYTD" className="block text-xs font-medium text-zinc-700 mb-1">
                Akumulasi YTD
              </label>
              <input
                id="safeManHoursYTD"
                type="number"
                value={safeManHoursYTD}
                onChange={(e) => setSafeManHoursYTD(Number(e.target.value))}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 2. Statistik Insiden & Otomasi Rate */}
        <div>
          <div className="text-xs font-semibold text-zinc-900 pb-2 border-b border-zinc-100 mb-3">
            2. Statistik Insiden & Indikator LTIFR / TRIFR
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-center">
              <span className="text-[10px] font-medium text-zinc-500 block mb-1">FATALITY</span>
              <input
                type="number"
                value={incidentsFatality}
                onChange={(e) => setIncidentsFatality(Number(e.target.value))}
                className="w-14 mx-auto bg-white text-center font-semibold text-red-600 rounded py-1 text-xs border border-zinc-200 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-center">
              <label htmlFor="incidentsLTI" className="text-[10px] font-medium text-zinc-500 block mb-1">
                Jumlah LTI
              </label>
              <input
                id="incidentsLTI"
                type="number"
                value={incidentsLTI}
                onChange={(e) => setIncidentsLTI(Number(e.target.value))}
                className="w-14 mx-auto bg-white text-center font-semibold text-zinc-900 rounded py-1 text-xs border border-zinc-200 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-center">
              <span className="text-[10px] font-medium text-zinc-500 block mb-1">RESTRICTED</span>
              <input
                type="number"
                value={incidentsRestrictedWork}
                onChange={(e) => setIncidentsRestrictedWork(Number(e.target.value))}
                className="w-14 mx-auto bg-white text-center font-semibold text-zinc-700 rounded py-1 text-xs border border-zinc-200 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-center">
              <span className="text-[10px] font-medium text-zinc-500 block mb-1">MEDICAL TRT</span>
              <input
                type="number"
                value={incidentsMedicalTreatment}
                onChange={(e) => setIncidentsMedicalTreatment(Number(e.target.value))}
                className="w-14 mx-auto bg-white text-center font-semibold text-amber-600 rounded py-1 text-xs border border-zinc-200 focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          {/* Minimalist Rates Display */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50/70 border border-zinc-200/60 rounded-xl">
            <div className="text-center">
              <span className="text-[11px] text-zinc-500 block">LTIFR (Lost Time Injury Rate)</span>
              <span className="text-2xl font-bold font-mono text-zinc-950 mt-0.5 block">{ltifr}</span>
              <span className="text-[10px] text-zinc-400 block">per 1.000.000 Jam Kerja</span>
            </div>
            <div className="text-center">
              <span className="text-[11px] text-zinc-500 block">TRIFR (Recordable Injury Rate)</span>
              <span className="text-2xl font-bold font-mono text-zinc-950 mt-0.5 block">{trifr}</span>
              <span className="text-[10px] text-zinc-400 block">per 1.000.000 Jam Kerja</span>
            </div>
          </div>
        </div>

        {/* 3. Leading Indicators */}
        <div>
          <div className="text-xs font-semibold text-zinc-900 pb-2 border-b border-zinc-100 mb-3">
            3. Persentase Leading Indicators K3LH
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="hazardResolutionRate" className="block text-xs font-medium text-zinc-700 mb-1">
                Penyelesaian Hazard Report (&lt; 14 hari) (%)
              </label>
              <input
                id="hazardResolutionRate"
                type="number"
                step="0.1"
                value={hazardResolutionRatePercent}
                onChange={(e) => setHazardResolutionRatePercent(Number(e.target.value))}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="plannedInspectionRate" className="block text-xs font-medium text-zinc-700 mb-1">
                Inspeksi Terencana & Walkthrough (%)
              </label>
              <input
                id="plannedInspectionRate"
                type="number"
                step="0.1"
                value={plannedInspectionRatePercent}
                onChange={(e) => setPlannedInspectionRatePercent(Number(e.target.value))}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="safetyTrainingAttendance" className="block text-xs font-medium text-zinc-700 mb-1">
                Kepatuhan Training & Induksi K3 (%)
              </label>
              <input
                id="safetyTrainingAttendance"
                type="number"
                step="0.1"
                value={safetyTrainingAttendancePercent}
                onChange={(e) => setSafetyTrainingAttendancePercent(Number(e.target.value))}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="goldenRulesCompliance" className="block text-xs font-medium text-zinc-700 mb-1">
                Kepatuhan Golden Rules Tambang (%)
              </label>
              <input
                id="goldenRulesCompliance"
                type="number"
                step="0.1"
                value={goldenRulesCompliancePercent}
                onChange={(e) => setGoldenRulesCompliancePercent(Number(e.target.value))}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 4. Lingkungan & Komite P2K3 */}
        <div>
          <div className="text-xs font-semibold text-zinc-900 pb-2 border-b border-zinc-100 mb-3">
            4. Kinerja Lingkungan & Catatan Komite P2K3
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label htmlFor="b3WasteVolume" className="block text-xs font-medium text-zinc-700 mb-1">
                Pengelolaan Limbah B3 (Ton)
              </label>
              <input
                id="b3WasteVolume"
                type="number"
                step="0.1"
                value={b3WasteVolumeTons}
                onChange={(e) => setB3WasteVolumeTons(Number(e.target.value))}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="reclamationLand" className="block text-xs font-medium text-zinc-700 mb-1">
                Rehabilitasi & Reklamasi Lahan (Ha)
              </label>
              <input
                id="reclamationLand"
                type="number"
                step="0.1"
                value={reclamationLandHa}
                onChange={(e) => setReclamationLandHa(Number(e.target.value))}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="p2k3Notes" className="block text-xs font-medium text-zinc-700 mb-1">
              Catatan Evaluasi Komite P2K3
            </label>
            <textarea
              id="p2k3Notes"
              rows={3}
              value={p2k3Notes}
              onChange={(e) => setP2k3Notes(e.target.value)}
              className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Data Tersimpan!' : 'Simpan Data Bulanan'}</span>
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
              className="py-2.5 px-4 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold rounded-xl transition-colors"
            >
              Download Monthly PPT
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
