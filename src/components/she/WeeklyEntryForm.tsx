import React, { useState } from 'react';
import { Calendar, Save, Check, Presentation } from 'lucide-react';
import { WeeklySHEReport } from '../../types/she-report';
import { saveWeeklyReport } from '../../services/storage-service';

interface WeeklyEntryFormProps {
  onSaved?: (report: WeeklySHEReport) => void;
  onGeneratePPT?: (report: WeeklySHEReport) => void;
}

export const WeeklyEntryForm: React.FC<WeeklyEntryFormProps> = ({ onSaved, onGeneratePPT }) => {
  const [periodWeek, setPeriodWeek] = useState('Minggu 4 - Oktober 2026');
  const [createdDate, setCreatedDate] = useState(new Date().toISOString().slice(0, 10));
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
      {/* Humanized Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Laporan Keselamatan Mingguan
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Pencatatan data operasional, kepatuhan inspeksi lapangan, dan pembuatan slide presentasi mingguan otomatis.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* KOLOM KIRI: Periode & Pencegahan */}
          <div className="space-y-5">
            {/* 1. Informasi Periode */}
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-3">
                <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <span>Periode dan Jam Kerja</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="periodWeek" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Periode Minggu
                  </label>
                  <input
                    id="periodWeek"
                    type="text"
                    value={periodWeek}
                    onChange={(e) => setPeriodWeek(e.target.value)}
                    placeholder="Minggu 4 - Okt 2026"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="createdDate" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Tanggal Laporan
                  </label>
                  <input
                    id="createdDate"
                    type="date"
                    value={createdDate}
                    onChange={(e) => setCreatedDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="safeManHours" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Jam Kerja Selamat Minggu Ini
                  </label>
                  <input
                    id="safeManHours"
                    type="number"
                    value={safeManHoursWeek}
                    onChange={(e) => setSafeManHoursWeek(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 2. Program Pencegahan */}
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-3">
                <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <span>Pencegahan dan Inspeksi Lapangan</span>
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pr-8"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">%</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="inspectionTarget" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Target Inspeksi
                  </label>
                  <input
                    id="inspectionTarget"
                    type="number"
                    value={plannedInspectionTarget}
                    onChange={(e) => setPlannedInspectionTarget(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="inspectionActual" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Realisasi Inspeksi
                  </label>
                  <input
                    id="inspectionActual"
                    type="number"
                    value={plannedInspectionActual}
                    onChange={(e) => setPlannedInspectionActual(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: Insiden, Catatan, & Submit */}
          <div className="space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* 3. Statistik Insiden */}
              <div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-3">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <span>Insiden dan Lingkungan</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                    <span className="text-[10px] font-semibold text-slate-600 block mb-1">Fatal</span>
                    <input
                      type="number"
                      value={incidentsFatality}
                      onChange={(e) => setIncidentsFatality(Number(e.target.value))}
                      className="w-full bg-white text-center font-bold text-slate-900 rounded-lg py-1 text-xs border border-slate-200"
                    />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                    <span className="text-[10px] font-semibold text-slate-600 block mb-1">LTI</span>
                    <input
                      type="number"
                      value={incidentsLTI}
                      onChange={(e) => setIncidentsLTI(Number(e.target.value))}
                      className="w-full bg-white text-center font-bold text-slate-900 rounded-lg py-1 text-xs border border-slate-200"
                    />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                    <span className="text-[10px] font-semibold text-slate-600 block mb-1">Unit Rusak</span>
                    <input
                      type="number"
                      value={incidentsPropertyDamage}
                      onChange={(e) => setIncidentsPropertyDamage(Number(e.target.value))}
                      className="w-full bg-white text-center font-bold text-slate-900 rounded-lg py-1 text-xs border border-slate-200"
                    />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                    <span className="text-[10px] font-semibold text-slate-600 block mb-1">Hampir Celaka</span>
                    <input
                      type="number"
                      value={incidentsNearmiss}
                      onChange={(e) => setIncidentsNearmiss(Number(e.target.value))}
                      className="w-full bg-white text-center font-bold text-slate-900 rounded-lg py-1 text-xs border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="waterPH" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Kualitas Air Tambang pH
                  </label>
                  <input
                    id="waterPH"
                    type="number"
                    step="0.1"
                    value={waterQualityPH}
                    onChange={(e) => setWaterQualityPH(Number(e.target.value))}
                    placeholder="Baku mutu: 6.0 - 9.0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              </div>

              {/* 4. Catatan Prioritas */}
              <div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-3">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaved ? <Check className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4 text-slate-950" />}
                <span>{isSaved ? 'Tersimpan' : 'Simpan Data'}</span>
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
