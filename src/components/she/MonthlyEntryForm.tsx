import React, { useState } from 'react';
import { Save, Check, Presentation } from 'lucide-react';
import { MonthlySHEReport } from '../../types/she-report';
import { saveMonthlyReport } from '../../services/storage-service';
import { calculateLTIFR, calculateTRIFR } from '../../utils/k3-calculator';
import { INDONESIAN_MONTHS, formatMonthlyPeriod } from '../../utils/date-utils';

interface MonthlyEntryFormProps {
  onSaved?: (report: MonthlySHEReport) => void;
  onGeneratePPT?: (report: MonthlySHEReport) => void;
}

export const MonthlyEntryForm: React.FC<MonthlyEntryFormProps> = ({ onSaved, onGeneratePPT }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const periodMonth = formatMonthlyPeriod(selectedMonth, selectedYear);
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

  // Quick navigation helpers for Month and Year
  const now = new Date();
  const currentCalMonth = now.getMonth();
  const currentCalYear = now.getFullYear();
  const prevDate = new Date(currentCalYear, currentCalMonth - 1, 1);
  const prevCalMonth = prevDate.getMonth();
  const prevCalYear = prevDate.getFullYear();

  const isCurrentMonth = selectedMonth === currentCalMonth && selectedYear === currentCalYear;
  const isPrevMonth = selectedMonth === prevCalMonth && selectedYear === prevCalYear;

  const setThisMonth = () => {
    setSelectedMonth(currentCalMonth);
    setSelectedYear(currentCalYear);
  };

  const setPreviousMonth = () => {
    setSelectedMonth(prevCalMonth);
    setSelectedYear(prevCalYear);
  };

  const availableYears = Array.from(
    new Set([2024, 2025, 2026, 2027, 2028, 2029, 2030, currentCalYear, selectedYear])
  ).sort((a, b) => a - b);

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
      {/* Subtitle / Context Bar */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-xs sm:text-sm text-slate-500">
          Penginputan metrik strategis K3LH, jam kerja selamat, dan perhitungan otomatis rasio insiden kerja (LTIFR &amp; TRIFR).
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* KOLOM KIRI: Jam Kerja Selamat & Statistik Insiden */}
          <div className="space-y-5">
            {/* 1. Periode & Jam Kerja Selamat */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3.5">
                <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-xs">
                  1
                </div>
                <span>Periode & Jam Kerja Selamat</span>
              </div>

              <div className="space-y-3.5">
                {/* Baris 1: Bulan dan Tahun dengan Tombol Cepat */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="selectMonth" className="block text-xs font-semibold text-slate-700">
                      Bulan dan Tahun Pelaporan
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={setThisMonth}
                        className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold border transition-all cursor-pointer ${
                          isCurrentMonth
                            ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                        }`}
                        title="Set ke Bulan Berjalan"
                      >
                        Bulan Ini
                      </button>
                      <button
                        type="button"
                        onClick={setPreviousMonth}
                        className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold border transition-all cursor-pointer ${
                          isPrevMonth
                            ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                        }`}
                        title="Set ke Bulan Kemarin (Rekap)"
                      >
                        Bulan Lalu
                      </button>
                    </div>
                  </div>

                  {/* Dropdown Bulan (3 bagian) dan Tahun (2 bagian) dengan ruang lebar dan tanpa terpotong */}
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-3">
                      <select
                        id="selectMonth"
                        aria-label="Pilih Bulan"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer shadow-2xs"
                      >
                        {INDONESIAN_MONTHS.map((m, idx) => (
                          <option key={m} value={idx}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <select
                        id="selectYear"
                        aria-label="Pilih Tahun"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer shadow-2xs"
                      >
                        {availableYears.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Baris 2: Dua Input Jam Kerja Selamat (100% Sejajar Sempurna 50:50) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/70">
                  <div>
                    <label htmlFor="safeManHoursMonth" className="block text-xs font-medium text-slate-700 mb-1.5 truncate">
                      Jam Kerja Selamat (Bulan Ini)
                    </label>
                    <input
                      id="safeManHoursMonth"
                      type="number"
                      value={safeManHoursMonth}
                      onChange={(e) => setSafeManHoursMonth(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="safeManHoursYTD" className="block text-xs font-medium text-slate-700 mb-1.5 truncate">
                      Akumulasi Tahun Berjalan (YTD)
                    </label>
                    <input
                      id="safeManHoursYTD"
                      type="number"
                      value={safeManHoursYTD}
                      onChange={(e) => setSafeManHoursYTD(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Insiden & Otomasi Rate */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3.5">
                <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-xs">
                  2
                </div>
                <span>Statistik Insiden &amp; Rasio Keselamatan</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3.5">
                <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-center shadow-2xs">
                  <span className="text-[10px] font-semibold text-slate-600 block mb-1">Fatal</span>
                  <input
                    type="number"
                    value={incidentsFatality}
                    onChange={(e) => setIncidentsFatality(Number(e.target.value))}
                    className="w-full bg-slate-50 text-center font-bold text-red-600 rounded-lg py-1.5 text-xs border border-slate-200 focus:outline-none focus:border-red-400 focus:bg-white"
                  />
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-center shadow-2xs">
                  <label htmlFor="incidentsLTI" className="text-[10px] font-semibold text-slate-600 block mb-1">
                    Jumlah LTI
                  </label>
                  <input
                    id="incidentsLTI"
                    type="number"
                    value={incidentsLTI}
                    onChange={(e) => setIncidentsLTI(Number(e.target.value))}
                    className="w-full bg-slate-50 text-center font-bold text-slate-900 rounded-lg py-1.5 text-xs border border-slate-200 focus:outline-none focus:border-amber-400 focus:bg-white"
                  />
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-center shadow-2xs">
                  <span className="text-[10px] font-semibold text-slate-600 block mb-1">Pembatasan</span>
                  <input
                    type="number"
                    value={incidentsRestrictedWork}
                    onChange={(e) => setIncidentsRestrictedWork(Number(e.target.value))}
                    className="w-full bg-slate-50 text-center font-bold text-slate-700 rounded-lg py-1.5 text-xs border border-slate-200 focus:outline-none focus:border-amber-400 focus:bg-white"
                  />
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-center shadow-2xs">
                  <span className="text-[10px] font-semibold text-slate-600 block mb-1">Medis</span>
                  <input
                    type="number"
                    value={incidentsMedicalTreatment}
                    onChange={(e) => setIncidentsMedicalTreatment(Number(e.target.value))}
                    className="w-full bg-slate-50 text-center font-bold text-amber-600 rounded-lg py-1.5 text-xs border border-slate-200 focus:outline-none focus:border-amber-400 focus:bg-white"
                  />
                </div>
              </div>

              {/* Calculated Rates Card */}
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
            <div className="space-y-5">
              {/* 3. Leading Indicators */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-xs">
                    3
                  </div>
                  <span>Indikator Pencegahan &amp; Pelatihan</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="hazardResolutionRate" className="block text-xs font-medium text-slate-700 mb-1.5 truncate">
                      Penyelesaian Bahaya
                    </label>
                    <div className="relative">
                      <input
                        id="hazardResolutionRate"
                        type="number"
                        step="0.1"
                        value={hazardResolutionRatePercent}
                        onChange={(e) => setHazardResolutionRatePercent(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pr-8 shadow-2xs"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">%</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="plannedInspectionRate" className="block text-xs font-medium text-slate-700 mb-1.5 truncate">
                      Inspeksi Terencana
                    </label>
                    <div className="relative">
                      <input
                        id="plannedInspectionRate"
                        type="number"
                        step="0.1"
                        value={plannedInspectionRatePercent}
                        onChange={(e) => setPlannedInspectionRatePercent(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pr-8 shadow-2xs"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">%</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="safetyTrainingAttendance" className="block text-xs font-medium text-slate-700 mb-1.5 truncate">
                      Kehadiran Pelatihan K3
                    </label>
                    <div className="relative">
                      <input
                        id="safetyTrainingAttendance"
                        type="number"
                        step="0.1"
                        value={safetyTrainingAttendancePercent}
                        onChange={(e) => setSafetyTrainingAttendancePercent(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pr-8 shadow-2xs"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">%</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="goldenRulesCompliance" className="block text-xs font-medium text-slate-700 mb-1.5 truncate">
                      Kepatuhan Aturan Emas
                    </label>
                    <div className="relative">
                      <input
                        id="goldenRulesCompliance"
                        type="number"
                        step="0.1"
                        value={goldenRulesCompliancePercent}
                        onChange={(e) => setGoldenRulesCompliancePercent(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pr-8 shadow-2xs"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Lingkungan & P2K3 */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-xs">
                    4
                  </div>
                  <span>Lingkungan &amp; Catatan Komite</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label htmlFor="b3WasteVolume" className="block text-xs font-medium text-slate-700 mb-1.5 truncate">
                      Volume Limbah B3
                    </label>
                    <div className="relative">
                      <input
                        id="b3WasteVolume"
                        type="number"
                        step="0.1"
                        value={b3WasteVolumeTons}
                        onChange={(e) => setB3WasteVolumeTons(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pr-12 shadow-2xs"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">Ton</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="reclamationLand" className="block text-xs font-medium text-slate-700 mb-1.5 truncate">
                      Reklamasi Lahan
                    </label>
                    <div className="relative">
                      <input
                        id="reclamationLand"
                        type="number"
                        step="0.1"
                        value={reclamationLandHa}
                        onChange={(e) => setReclamationLandHa(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pr-10 shadow-2xs"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">Ha</span>
                    </div>
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
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2">
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
