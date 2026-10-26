import React, { useState } from 'react';
import { Calendar, Save, Check } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header section - Compact */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-950 flex items-center gap-2">
            <span>Input Log Laporan Mingguan SHE</span>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono border border-blue-200/60 font-medium">
              WEEKLY PPT
            </span>
          </h1>
          <p className="text-xs text-zinc-500">
            K3LH Pertambangan • Data operasional taktis, kepatuhan inspeksi, dan ringkasan mingguan
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-zinc-200/80 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* KOLOM KIRI: Periode & Pencegahan */}
          <div className="space-y-3.5">
            {/* 1. Informasi Periode */}
            <div>
              <div className="text-[11px] font-semibold text-zinc-900 uppercase tracking-wider pb-1 border-b border-zinc-100 mb-2">
                1. Informasi Periode & Jam Kerja
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="periodWeek" className="block text-[11px] font-medium text-zinc-700 mb-0.5">
                    Periode Minggu
                  </label>
                  <input
                    id="periodWeek"
                    type="text"
                    value={periodWeek}
                    onChange={(e) => setPeriodWeek(e.target.value)}
                    placeholder="Minggu 4 - Okt 2026"
                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="createdDate" className="block text-[11px] font-medium text-zinc-700 mb-0.5">
                    Tanggal Laporan
                  </label>
                  <input
                    id="createdDate"
                    type="date"
                    value={createdDate}
                    onChange={(e) => setCreatedDate(e.target.value)}
                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 transition-colors"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="safeManHours" className="block text-[11px] font-medium text-zinc-700 mb-0.5">
                    Jam Kerja Selamat Minggu Ini (Safe Man Hours)
                  </label>
                  <input
                    id="safeManHours"
                    type="number"
                    value={safeManHoursWeek}
                    onChange={(e) => setSafeManHoursWeek(Number(e.target.value))}
                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 2. Program Pencegahan */}
            <div>
              <div className="text-[11px] font-semibold text-zinc-900 uppercase tracking-wider pb-1 border-b border-zinc-100 mb-2">
                2. Program Pencegahan Lapangan
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="p5m" className="block text-[11px] font-medium text-zinc-700 mb-0.5">
                    Kepatuhan P5M / Safety Talk (%)
                  </label>
                  <input
                    id="p5m"
                    type="number"
                    step="0.1"
                    value={toolboxMeetingPercent}
                    onChange={(e) => setToolboxMeetingPercent(Number(e.target.value))}
                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="fatigue" className="block text-[11px] font-medium text-zinc-700 mb-0.5">
                    Kepatuhan Cek Fatigue (%)
                  </label>
                  <input
                    id="fatigue"
                    type="number"
                    step="0.1"
                    value={fatigueCheckPercent}
                    onChange={(e) => setFatigueCheckPercent(Number(e.target.value))}
                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="inspectionTarget" className="block text-[11px] font-medium text-zinc-700 mb-0.5">
                    Target Inspeksi
                  </label>
                  <input
                    id="inspectionTarget"
                    type="number"
                    value={plannedInspectionTarget}
                    onChange={(e) => setPlannedInspectionTarget(Number(e.target.value))}
                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="inspectionActual" className="block text-[11px] font-medium text-zinc-700 mb-0.5">
                    Realisasi Inspeksi
                  </label>
                  <input
                    id="inspectionActual"
                    type="number"
                    value={plannedInspectionActual}
                    onChange={(e) => setPlannedInspectionActual(Number(e.target.value))}
                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: Insiden, Catatan, & Submit */}
          <div className="space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              {/* 3. Statistik Insiden */}
              <div>
                <div className="text-[11px] font-semibold text-zinc-900 uppercase tracking-wider pb-1 border-b border-zinc-100 mb-2">
                  3. Statistik Insiden & Kualitas Air
                </div>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  <div className="bg-zinc-50/70 border border-zinc-200 rounded-md p-1.5 text-center">
                    <span className="text-[9px] font-medium text-zinc-500 block">FATALITY</span>
                    <input
                      type="number"
                      value={incidentsFatality}
                      onChange={(e) => setIncidentsFatality(Number(e.target.value))}
                      className="w-10 mx-auto bg-white text-center font-semibold text-zinc-900 rounded py-0.5 text-xs border border-zinc-200"
                    />
                  </div>
                  <div className="bg-zinc-50/70 border border-zinc-200 rounded-md p-1.5 text-center">
                    <span className="text-[9px] font-medium text-zinc-500 block">LTI</span>
                    <input
                      type="number"
                      value={incidentsLTI}
                      onChange={(e) => setIncidentsLTI(Number(e.target.value))}
                      className="w-10 mx-auto bg-white text-center font-semibold text-zinc-900 rounded py-0.5 text-xs border border-zinc-200"
                    />
                  </div>
                  <div className="bg-zinc-50/70 border border-zinc-200 rounded-md p-1.5 text-center">
                    <span className="text-[9px] font-medium text-zinc-500 block">PROPERTY</span>
                    <input
                      type="number"
                      value={incidentsPropertyDamage}
                      onChange={(e) => setIncidentsPropertyDamage(Number(e.target.value))}
                      className="w-10 mx-auto bg-white text-center font-semibold text-zinc-900 rounded py-0.5 text-xs border border-zinc-200"
                    />
                  </div>
                  <div className="bg-zinc-50/70 border border-zinc-200 rounded-md p-1.5 text-center">
                    <span className="text-[9px] font-medium text-zinc-500 block">NEAR MISS</span>
                    <input
                      type="number"
                      value={incidentsNearmiss}
                      onChange={(e) => setIncidentsNearmiss(Number(e.target.value))}
                      className="w-10 mx-auto bg-white text-center font-semibold text-zinc-900 rounded py-0.5 text-xs border border-zinc-200"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="waterPH" className="block text-[11px] font-medium text-zinc-700 mb-0.5">
                    Kualitas Air Tambang (pH)
                  </label>
                  <input
                    id="waterPH"
                    type="number"
                    step="0.1"
                    value={waterQualityPH}
                    onChange={(e) => setWaterQualityPH(Number(e.target.value))}
                    placeholder="Baku mutu: 6.0 - 9.0"
                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 transition-colors"
                  />
                </div>
              </div>

              {/* 4. Catatan Prioritas */}
              <div>
                <div className="text-[11px] font-semibold text-zinc-900 uppercase tracking-wider pb-1 border-b border-zinc-100 mb-1.5">
                  4. Catatan Prioritas Tindak Lanjut
                </div>
                <textarea
                  id="priorityNotes"
                  rows={2}
                  value={topPriorityNotes}
                  onChange={(e) => setTopPriorityNotes(e.target.value)}
                  className="w-full bg-zinc-50/50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none focus:bg-white focus:border-zinc-900 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isSaved ? 'Tersimpan!' : 'Simpan Data'}</span>
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
                  className="py-2 px-3 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold rounded-lg transition-colors"
                >
                  Download Weekly PPT
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
