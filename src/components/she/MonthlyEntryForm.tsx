import React, { useState } from 'react';
import { Award, Save, CheckCircle2, ShieldAlert, Trees } from 'lucide-react';
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
    <div className="max-w-2xl mx-auto p-4 pb-20 text-slate-800">
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-emerald-950 leading-tight">Input Log Laporan Bulanan SHE</h2>
            <p className="text-xs text-emerald-700 font-medium">K3LH Pertambangan • Metrik Strategis & Statistik Jam Kerja Selamat</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Periode & Safe Man Hours */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4 space-y-3">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            1. Jam Kerja Selamat (Safe Man Hours)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="periodMonth" className="block text-xs font-semibold text-slate-700 mb-1">
                Bulan & Tahun
              </label>
              <input
                id="periodMonth"
                type="text"
                value={periodMonth}
                onChange={(e) => setPeriodMonth(e.target.value)}
                placeholder="Misal: Oktober 2026"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="safeManHoursMonth" className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Kerja Selamat Bulan Ini
              </label>
              <input
                id="safeManHoursMonth"
                type="number"
                value={safeManHoursMonth}
                onChange={(e) => setSafeManHoursMonth(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="safeManHoursYTD" className="block text-xs font-semibold text-slate-700 mb-1">
                Akumulasi YTD
              </label>
              <input
                id="safeManHoursYTD"
                type="number"
                value={safeManHoursYTD}
                onChange={(e) => setSafeManHoursYTD(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Insiden & Otomatisasi Rate */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            2. Statistik Insiden & Indikator LTIFR / TRIFR
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-600 font-bold block mb-1">FATALITY</span>
              <input
                type="number"
                value={incidentsFatality}
                onChange={(e) => setIncidentsFatality(Number(e.target.value))}
                className="w-16 mx-auto bg-white text-center font-bold text-red-600 rounded py-1 text-sm border border-slate-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
              <label htmlFor="incidentsLTI" className="text-[10px] text-slate-600 font-bold block mb-1">
                Jumlah LTI
              </label>
              <input
                id="incidentsLTI"
                type="number"
                value={incidentsLTI}
                onChange={(e) => setIncidentsLTI(Number(e.target.value))}
                className="w-16 mx-auto bg-white text-center font-bold text-emerald-700 rounded py-1 text-sm border border-slate-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-600 font-bold block mb-1">RESTRICTED WORK</span>
              <input
                type="number"
                value={incidentsRestrictedWork}
                onChange={(e) => setIncidentsRestrictedWork(Number(e.target.value))}
                className="w-16 mx-auto bg-white text-center font-bold text-slate-700 rounded py-1 text-sm border border-slate-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-600 font-bold block mb-1">MEDICAL TREATMENT</span>
              <input
                type="number"
                value={incidentsMedicalTreatment}
                onChange={(e) => setIncidentsMedicalTreatment(Number(e.target.value))}
                className="w-16 mx-auto bg-white text-center font-bold text-amber-600 rounded py-1 text-sm border border-slate-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
            <div className="text-center">
              <span className="text-xs text-slate-600 font-medium block">LTIFR (Lost Time Injury Rate)</span>
              <span className="text-2xl font-bold font-mono text-emerald-700">{ltifr}</span>
              <span className="text-[10px] text-slate-500 block">per 1.000.000 Jam Kerja</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-slate-600 font-medium block">TRIFR (Recordable Injury Rate)</span>
              <span className="text-2xl font-bold font-mono text-emerald-700">{trifr}</span>
              <span className="text-[10px] text-slate-500 block">per 1.000.000 Jam Kerja</span>
            </div>
          </div>
        </div>

        {/* Persentase Leading Indicators */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4 space-y-3">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            3. Persentase Leading Indicators K3LH
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="hazardResolutionRate" className="block text-xs font-semibold text-slate-700 mb-1">
                Penyelesaian Hazard Report (&lt; 14 hari) (%)
              </label>
              <input
                id="hazardResolutionRate"
                type="number"
                step="0.1"
                value={hazardResolutionRatePercent}
                onChange={(e) => setHazardResolutionRatePercent(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="plannedInspectionRate" className="block text-xs font-semibold text-slate-700 mb-1">
                Inspeksi Terencana & Walkthrough (%)
              </label>
              <input
                id="plannedInspectionRate"
                type="number"
                step="0.1"
                value={plannedInspectionRatePercent}
                onChange={(e) => setPlannedInspectionRatePercent(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="safetyTrainingAttendance" className="block text-xs font-semibold text-slate-700 mb-1">
                Kepatuhan Training & Induksi K3 (%)
              </label>
              <input
                id="safetyTrainingAttendance"
                type="number"
                step="0.1"
                value={safetyTrainingAttendancePercent}
                onChange={(e) => setSafetyTrainingAttendancePercent(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="goldenRulesCompliance" className="block text-xs font-semibold text-slate-700 mb-1">
                Kepatuhan Golden Rules Tambang (%)
              </label>
              <input
                id="goldenRulesCompliance"
                type="number"
                step="0.1"
                value={goldenRulesCompliancePercent}
                onChange={(e) => setGoldenRulesCompliancePercent(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Lingkungan & Rekomendasi P2K3 */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <Trees className="w-4 h-4 text-emerald-600" />
            4. Kinerja Lingkungan & Catatan Komite P2K3
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="b3WasteVolume" className="block text-xs font-semibold text-slate-700 mb-1">
                Pengelolaan Limbah B3 (Ton)
              </label>
              <input
                id="b3WasteVolume"
                type="number"
                step="0.1"
                value={b3WasteVolumeTons}
                onChange={(e) => setB3WasteVolumeTons(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="reclamationLand" className="block text-xs font-semibold text-slate-700 mb-1">
                Rehabilitasi & Reklamasi Lahan (Ha)
              </label>
              <input
                id="reclamationLand"
                type="number"
                step="0.1"
                value={reclamationLandHa}
                onChange={(e) => setReclamationLandHa(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="p2k3Notes" className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Evaluasi Komite P2K3
            </label>
            <textarea
              id="p2k3Notes"
              rows={3}
              value={p2k3Notes}
              onChange={(e) => setP2k3Notes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {isSaved ? <CheckCircle2 className="w-5 h-5 text-emerald-200" /> : <Save className="w-5 h-5" />}
            <span>{isSaved ? 'Tersimpan!' : 'Simpan Data Bulanan'}</span>
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
              className="py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl transition-all shadow-sm"
            >
              Download Monthly PPT
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
