import React, { useState } from 'react';
import { Calendar, Save, Check, Presentation, Clock } from 'lucide-react';
import { WeeklySHEReport } from '../../types/she-report';
import { saveWeeklyReport } from '../../services/storage-service';
import { getWeekOfMonth, formatWeeklyPeriod, INDONESIAN_MONTHS, getWeekDateRange } from '../../utils/date-utils';

interface WeeklyEntryFormProps {
  onSaved?: (report: WeeklySHEReport) => void;
  onGeneratePPT?: (report: WeeklySHEReport) => void;
}

export const WeeklyEntryForm: React.FC<WeeklyEntryFormProps> = ({ onSaved, onGeneratePPT }) => {
  const initialDateStr = new Date().toISOString().slice(0, 10);
  const initialDateObj = new Date();
  const initialWeekNum = getWeekOfMonth(initialDateObj);

  const [createdDate, setCreatedDate] = useState<string>(initialDateStr);
  const [selectedWeek, setSelectedWeek] = useState<number>(initialWeekNum);
  const [periodWeek, setPeriodWeek] = useState<string>(() => formatWeeklyPeriod(initialWeekNum, initialDateObj));
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);

  const [safeManHoursWeek, setSafeManHoursWeek] = useState<number>(35000);
  const [toolboxMeetingPercent, setToolboxMeetingPercent] = useState<number>(98.5);
  const [plannedInspectionTarget, setPlannedInspectionTarget] = useState<number>(8);
  const [plannedInspectionActual, setPlannedInspectionActual] = useState<number>(8);
  const [fatigueCheckPercent, setFatigueCheckPercent] = useState<number>(96.0);
  const [incidentsFatality, setIncidentsFatality] = useState<number>(0);
  const [incidentsLTI, setIncidentsLTI] = useState<number>(0);
  const [incidentsPropertyDamage, setIncidentsPropertyDamage] = useState<number>(1);
  const [incidentsNearmiss, setIncidentsNearmiss] = useState<number>(2);
  const [waterQualityPH, setWaterQualityPH] = useState<number>(7.2);
  const [topPriorityNotes, setTopPriorityNotes] = useState(
    'Fokus penertiban batas kecepatan unit hauling di KM 14-18 dan perapian tanggul penahan air hujan pit timur.'
  );
  const [totalHazardsReported] = useState<number>(5);
  const [hazardsClosedPercent] = useState<number>(80);
  const [isSaved, setIsSaved] = useState(false);

  const handleDateChange = (newDateStr: string) => {
    setCreatedDate(newDateStr);
    if (!newDateStr) return;
    const [year, month, day] = newDateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const weekNum = getWeekOfMonth(dateObj);
    setSelectedWeek(weekNum);
    setIsManualOverride(false);
    setPeriodWeek(formatWeeklyPeriod(weekNum, dateObj));
  };

  const handleWeekChange = (newWeekNum: number) => {
    setSelectedWeek(newWeekNum);
    setIsManualOverride(true);
    let dateObj = new Date();
    if (createdDate) {
      const [year, month, day] = createdDate.split('-').map(Number);
      dateObj = new Date(year, month - 1, day);
    }
    setPeriodWeek(formatWeeklyPeriod(newWeekNum, dateObj));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const report: WeeklySHEReport = {
      id: `W-${Date.now()}`,
      periodWeek,
      createdDate,
      safeManHoursWeek,
      toolboxMeetingPercent,
      plannedInspectionTarget,
      plannedInspectionActual,
      fatigueCheckPercent,
      incidentsFatality,
      incidentsLTI,
      incidentsPropertyDamage,
      incidentsNearmiss,
      waterQualityPH,
      topPriorityNotes,
      totalHazardsReported,
      hazardsClosedPercent,
    };

    saveWeeklyReport(report);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);

    if (onSaved) onSaved(report);
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Subtitle / Context Bar */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-xs sm:text-sm text-slate-500">
          Pencatatan data operasional K3LH, kepatuhan inspeksi lapangan, dan pembuatan slide presentasi mingguan otomatis.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* KOLOM KIRI: Periode & Pencegahan */}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="periodWeek" className="block text-xs font-semibold text-slate-700">
                        Periode Minggu
                      </label>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        isManualOverride ? 'bg-amber-100 text-amber-800' : 'bg-slate-200/70 text-slate-600'
                      }`}>
                        {isManualOverride ? 'Kustom' : 'Otomatis'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <select
                        id="periodWeek"
                        aria-label="Periode Minggu"
                        value={selectedWeek}
                        onChange={(e) => handleWeekChange(Number(e.target.value))}
                        className="w-1/2 bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer shadow-2xs"
                      >
                        <option value={1}>Minggu 1</option>
                        <option value={2}>Minggu 2</option>
                        <option value={3}>Minggu 3</option>
                        <option value={4}>Minggu 4</option>
                        <option value={5}>Minggu 5</option>
                      </select>
                      <div
                        className="w-1/2 bg-white/90 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 truncate text-center select-none shadow-2xs"
                        title={periodWeek}
                      >
                        {createdDate ? (() => {
                          const [y, m, d] = createdDate.split('-').map(Number);
                          const dObj = new Date(y, m - 1, d);
                          return `${INDONESIAN_MONTHS[dObj.getMonth()]} ${dObj.getFullYear()}`;
                        })() : 'Bulan Aktif'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="createdDate" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tanggal Laporan
                    </label>
                    <input
                      id="createdDate"
                      type="date"
                      value={createdDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer shadow-2xs"
                    />
                  </div>
                </div>

                {/* Info Rentang Tanggal Pekan Otomatis */}
                <div className="px-3 py-2 bg-amber-50/80 rounded-xl border border-amber-200/60 flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-900">Rentang Tanggal Pekan:</span>
                  <span className="font-mono text-amber-900 font-bold">
                    {(() => {
                      if (!createdDate) return `Minggu ${selectedWeek}`;
                      const [y, m] = createdDate.split('-').map(Number);
                      const daysInMonth = new Date(y, m, 0).getDate();
                      const startDay = selectedWeek === 5 ? 29 : (selectedWeek - 1) * 7 + 1;
                      const endDay = selectedWeek === 5 ? daysInMonth : Math.min(selectedWeek * 7, daysInMonth);
                      return `Tgl ${startDay} - ${endDay}`;
                    })()}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/70">
                  <label htmlFor="safeManHours" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Jam Kerja Selamat Minggu Ini
                  </label>
                  <div className="relative">
                    <input
                      id="safeManHours"
                      type="number"
                      value={safeManHoursWeek}
                      onChange={(e) => setSafeManHoursWeek(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">Jam</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Pencegahan & Inspeksi Lapangan */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3.5">
                <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-xs">
                  2
                </div>
                <span>Pencegahan &amp; Inspeksi Lapangan</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="p5m" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Kepatuhan P5M dan Safety Talk
                  </label>
                  <div className="relative">
                    <input
                      id="p5m"
                      type="number"
                      step="0.1"
                      value={toolboxMeetingPercent}
                      onChange={(e) => setToolboxMeetingPercent(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">%</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="fatigue" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Kepatuhan Cek Kelelahan
                  </label>
                  <div className="relative">
                    <input
                      id="fatigue"
                      type="number"
                      step="0.1"
                      value={fatigueCheckPercent}
                      onChange={(e) => setFatigueCheckPercent(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">%</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="inspectionTarget" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Target Inspeksi
                  </label>
                  <div className="relative">
                    <input
                      id="inspectionTarget"
                      type="number"
                      value={plannedInspectionTarget}
                      onChange={(e) => setPlannedInspectionTarget(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-medium">Lokasi</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="inspectionActual" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Realisasi Inspeksi
                  </label>
                  <div className="relative">
                    <input
                      id="inspectionActual"
                      type="number"
                      value={plannedInspectionActual}
                      onChange={(e) => setPlannedInspectionActual(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-medium">Lokasi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: Insiden, Catatan, & Submit */}
          <div className="space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              {/* 3. Statistik Insiden & Lingkungan */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-xs">
                    3
                  </div>
                  <span>Insiden &amp; Kualitas Lingkungan</span>
                </div>
                <div className="space-y-3.5">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-center shadow-2xs">
                      <span className="text-[10px] font-semibold text-slate-600 block mb-1">Fatal</span>
                      <input
                        type="number"
                        value={incidentsFatality}
                        onChange={(e) => setIncidentsFatality(Number(e.target.value))}
                        className="w-full bg-slate-50 text-center font-bold text-slate-900 rounded-lg py-1.5 text-xs border border-slate-200 focus:outline-none focus:bg-white focus:border-amber-400"
                      />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-center shadow-2xs">
                      <span className="text-[10px] font-semibold text-slate-600 block mb-1">LTI</span>
                      <input
                        type="number"
                        value={incidentsLTI}
                        onChange={(e) => setIncidentsLTI(Number(e.target.value))}
                        className="w-full bg-slate-50 text-center font-bold text-slate-900 rounded-lg py-1.5 text-xs border border-slate-200 focus:outline-none focus:bg-white focus:border-amber-400"
                      />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-center shadow-2xs">
                      <span className="text-[10px] font-semibold text-slate-600 block mb-1">Unit Rusak</span>
                      <input
                        type="number"
                        value={incidentsPropertyDamage}
                        onChange={(e) => setIncidentsPropertyDamage(Number(e.target.value))}
                        className="w-full bg-slate-50 text-center font-bold text-slate-900 rounded-lg py-1.5 text-xs border border-slate-200 focus:outline-none focus:bg-white focus:border-amber-400"
                      />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-center shadow-2xs">
                      <span className="text-[10px] font-semibold text-slate-600 block mb-1">Hampir Celaka</span>
                      <input
                        type="number"
                        value={incidentsNearmiss}
                        onChange={(e) => setIncidentsNearmiss(Number(e.target.value))}
                        className="w-full bg-slate-50 text-center font-bold text-slate-900 rounded-lg py-1.5 text-xs border border-slate-200 focus:outline-none focus:bg-white focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70">
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="waterPH" className="block text-xs font-medium text-slate-700">
                        Kualitas Air Tambang pH
                      </label>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
                        Baku Mutu: 6.0 – 9.0
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        id="waterPH"
                        type="number"
                        step="0.1"
                        value={waterQualityPH}
                        onChange={(e) => setWaterQualityPH(Number(e.target.value))}
                        placeholder="Baku mutu: 6.0 - 9.0"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">pH</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Catatan Prioritas Tindak Lanjut */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-xs">
                    4
                  </div>
                  <span>Catatan Prioritas Tindak Lanjut</span>
                </div>
                <textarea
                  id="priorityNotes"
                  rows={2}
                  value={topPriorityNotes}
                  onChange={(e) => setTopPriorityNotes(e.target.value)}
                  placeholder="Tuliskan poin penting arahan keselamatan minggu ini..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none shadow-2xs"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaved ? <Check className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4 text-slate-950" />}
                <span>{isSaved ? 'Tersimpan' : 'Simpan Data Mingguan'}</span>
              </button>

              {onGeneratePPT && (
                <button
                  type="button"
                  onClick={() => {
                    const report: WeeklySHEReport = {
                      id: `W-${Date.now()}`,
                      periodWeek,
                      createdDate,
                      safeManHoursWeek,
                      toolboxMeetingPercent,
                      plannedInspectionTarget,
                      plannedInspectionActual,
                      fatigueCheckPercent,
                      incidentsFatality,
                      incidentsLTI,
                      incidentsPropertyDamage,
                      incidentsNearmiss,
                      waterQualityPH,
                      topPriorityNotes,
                      totalHazardsReported,
                      hazardsClosedPercent,
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
