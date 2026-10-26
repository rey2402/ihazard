import React, { useState } from 'react';
import { Award, Save, Check } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header section - Compact Industrial Telemetry */}
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-zinc-950 uppercase flex items-center gap-2">
              <span>Input Log Laporan Bulanan SHE</span>
            </h1>
            <span className="text-[10px] bg-slate-900 text-amber-400 px-2 py-0.5 rounded font-mono font-bold uppercase border border-zinc-700 tracking-wider">
              MONTHLY PPT // EXECUTIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            K3LH Pertambangan • Metrik strategis, jam kerja selamat, dan rasio LTIFR / TRIFR standar Kepmen ESDM
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">
        {/* Signature Hazard Accent Line */}
        <div className="h-1 w-full bg-hazard-stripes" />

        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* KOLOM KIRI: Jam Kerja Selamat & Statistik Insiden */}
          <div className="space-y-3.5">
            {/* 1. Jam Kerja Selamat */}
            <div>
              <div className="text-[11px] font-mono font-black text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200 mb-2">
                [ 01. Jam Kerja Selamat (Safe Man Hours) ]
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="periodMonth" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Bulan & Tahun
                  </label>
                  <input
                    id="periodMonth"
                    type="text"
                    value={periodMonth}
                    onChange={(e) => setPeriodMonth(e.target.value)}
                    placeholder="Okt 2026"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="safeManHoursMonth" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Jam Kerja Selamat Bulan Ini
                  </label>
                  <input
                    id="safeManHoursMonth"
                    type="number"
                    value={safeManHoursMonth}
                    onChange={(e) => setSafeManHoursMonth(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="safeManHoursYTD" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Akumulasi YTD
                  </label>
                  <input
                    id="safeManHoursYTD"
                    type="number"
                    value={safeManHoursYTD}
                    onChange={(e) => setSafeManHoursYTD(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 2. Insiden & Otomasi Rate */}
            <div>
              <div className="text-[11px] font-mono font-black text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200 mb-2">
                [ 02. Statistik Insiden & Rasio K3 ]
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                <div className="bg-slate-50 border border-slate-300 rounded p-1.5 text-center">
                  <span className="text-[9px] font-mono font-black text-slate-600 block">FATALITY</span>
                  <input
                    type="number"
                    value={incidentsFatality}
                    onChange={(e) => setIncidentsFatality(Number(e.target.value))}
                    className="w-10 mx-auto bg-white text-center font-mono font-bold text-red-600 rounded py-0.5 text-xs border border-slate-300"
                  />
                </div>
                <div className="bg-slate-50 border border-slate-300 rounded p-1.5 text-center">
                  <label htmlFor="incidentsLTI" className="text-[9px] font-mono font-black text-slate-600 block">
                    Jumlah LTI
                  </label>
                  <input
                    id="incidentsLTI"
                    type="number"
                    value={incidentsLTI}
                    onChange={(e) => setIncidentsLTI(Number(e.target.value))}
                    className="w-10 mx-auto bg-white text-center font-mono font-bold text-slate-900 rounded py-0.5 text-xs border border-slate-300"
                  />
                </div>
                <div className="bg-slate-50 border border-slate-300 rounded p-1.5 text-center">
                  <span className="text-[9px] font-mono font-black text-slate-600 block">RESTRICTED</span>
                  <input
                    type="number"
                    value={incidentsRestrictedWork}
                    onChange={(e) => setIncidentsRestrictedWork(Number(e.target.value))}
                    className="w-10 mx-auto bg-white text-center font-mono font-bold text-slate-700 rounded py-0.5 text-xs border border-slate-300"
                  />
                </div>
                <div className="bg-slate-50 border border-slate-300 rounded p-1.5 text-center">
                  <span className="text-[9px] font-mono font-black text-slate-600 block">MEDICAL</span>
                  <input
                    type="number"
                    value={incidentsMedicalTreatment}
                    onChange={(e) => setIncidentsMedicalTreatment(Number(e.target.value))}
                    className="w-10 mx-auto bg-white text-center font-mono font-bold text-amber-600 rounded py-0.5 text-xs border border-slate-300"
                  />
                </div>
              </div>

              {/* Digital Telemetry Rates Display */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-[#181A1F] border border-zinc-800 rounded-md text-white shadow-xs">
                <div className="text-center">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">[ LTIFR RATE ]</span>
                  <span className="text-2xl font-black font-mono text-white mt-0.5 block">{ltifr}</span>
                  <span className="text-[9px] text-zinc-400 block font-mono">per 1.000.000 Jam</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">[ TRIFR RATE ]</span>
                  <span className="text-2xl font-black font-mono text-white mt-0.5 block">{trifr}</span>
                  <span className="text-[9px] text-zinc-400 block font-mono">per 1.000.000 Jam</span>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: Leading Indicators, Lingkungan & Submit */}
          <div className="space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              {/* 3. Leading Indicators */}
              <div>
                <div className="text-[11px] font-mono font-black text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200 mb-2">
                  [ 03. Leading Indicators K3LH (%) ]
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="hazardResolutionRate" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Penyelesaian Hazard (%)
                    </label>
                    <input
                      id="hazardResolutionRate"
                      type="number"
                      step="0.1"
                      value={hazardResolutionRatePercent}
                      onChange={(e) => setHazardResolutionRatePercent(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="plannedInspectionRate" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Inspeksi Terencana (%)
                    </label>
                    <input
                      id="plannedInspectionRate"
                      type="number"
                      step="0.1"
                      value={plannedInspectionRatePercent}
                      onChange={(e) => setPlannedInspectionRatePercent(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="safetyTrainingAttendance" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Training K3 (%)
                    </label>
                    <input
                      id="safetyTrainingAttendance"
                      type="number"
                      step="0.1"
                      value={safetyTrainingAttendancePercent}
                      onChange={(e) => setSafetyTrainingAttendancePercent(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="goldenRulesCompliance" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Golden Rules (%)
                    </label>
                    <input
                      id="goldenRulesCompliance"
                      type="number"
                      step="0.1"
                      value={goldenRulesCompliancePercent}
                      onChange={(e) => setGoldenRulesCompliancePercent(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Lingkungan & P2K3 */}
              <div>
                <div className="text-[11px] font-mono font-black text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200 mb-2">
                  [ 04. Lingkungan & Catatan P2K3 ]
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label htmlFor="b3WasteVolume" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Limbah B3 (Ton)
                    </label>
                    <input
                      id="b3WasteVolume"
                      type="number"
                      step="0.1"
                      value={b3WasteVolumeTons}
                      onChange={(e) => setB3WasteVolumeTons(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="reclamationLand" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      Reklamasi Lahan (Ha)
                    </label>
                    <input
                      id="reclamationLand"
                      type="number"
                      step="0.1"
                      value={reclamationLandHa}
                      onChange={(e) => setReclamationLandHa(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="p2k3Notes" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Catatan Evaluasi Komite P2K3
                  </label>
                  <textarea
                    id="p2k3Notes"
                    rows={2}
                    value={p2k3Notes}
                    onChange={(e) => setP2k3Notes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 text-xs font-black uppercase tracking-wider rounded shadow-md border border-amber-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSaved ? <Check className="w-3.5 h-3.5 text-zinc-950" /> : <Save className="w-3.5 h-3.5 text-zinc-950" />}
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
                  className="py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold uppercase rounded shadow-xs transition-colors"
                >
                  Download Monthly PPT
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
