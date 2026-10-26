import React, { useState } from 'react';
import { Calendar, Save, CheckCircle2, TrendingUp, AlertOctagon } from 'lucide-react';
import { WeeklySHEReport } from '../../types/she-report';
import { saveWeeklyReport, getAllHazardReports } from '../../services/storage-service';

interface WeeklyEntryFormProps {
  onSaved?: (report: WeeklySHEReport) => void;
  onGeneratePPT?: (report: WeeklySHEReport) => void;
}

export const WeeklyEntryForm: React.FC<WeeklyEntryFormProps> = ({ onSaved, onGeneratePPT }) => {
  const [periodWeek, setPeriodWeek] = useState('Minggu 4 - Oktober 2026');
  const [safeManHoursWeek, setSafeManHoursWeek] = useState<number>(35000);
  const [toolboxMeetingPercent, setToolboxMeetingPercent] = useState<number>(98);
  const [plannedInspectionTarget, setPlannedInspectionTarget] = useState<number>(8);
  const [plannedInspectionActual, setPlannedInspectionActual] = useState<number>(8);
  const [fatigueCheckPercent, setFatigueCheckPercent] = useState<number>(96);
  const [incidentsFatality, setIncidentsFatality] = useState<number>(0);
  const [incidentsLTI, setIncidentsLTI] = useState<number>(0);
  const [incidentsPropertyDamage, setIncidentsPropertyDamage] = useState<number>(1);
  const [incidentsNearmiss, setIncidentsNearmiss] = useState<number>(2);
  const [waterQualityPH, setWaterQualityPH] = useState<number>(7.2);
  const [topPriorityNotes, setTopPriorityNotes] = useState(
    'Pengawasan perbaikan tanggul jalan hauling KM 14 dan penertiban jarak aman alat berat di front loading pit.'
  );
  const [isSaved, setIsSaved] = useState(false);

  // Ambil data agregat hazard lokal
  const allHazards = getAllHazardReports();
  const totalHazardsReported = allHazards.length || 8;
  const closedHazardsCount = allHazards.filter((h) => h.status === 'Closed').length;
  const hazardsClosedPercent = totalHazardsReported > 0 
    ? Number(((closedHazardsCount / totalHazardsReported) * 100).toFixed(1)) 
    : 75.0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const report: WeeklySHEReport = {
      id: `W-${Date.now()}`,
      periodWeek,
      createdDate: new Date().toISOString().slice(0, 10),
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
    <div className="max-w-2xl mx-auto p-4 pb-20 text-slate-800">
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-blue-950 leading-tight">Input Log Laporan Mingguan SHE</h2>
            <p className="text-xs text-blue-700 font-medium">K3LH Pertambangan • Data Taktis Operasional Mingguan</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Identitas Periode */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4 space-y-3">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            1. Informasi Periode & Jam Kerja
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="periodWeek" className="block text-xs font-semibold text-slate-700 mb-1">
                Periode Minggu
              </label>
              <input
                id="periodWeek"
                type="text"
                value={periodWeek}
                onChange={(e) => setPeriodWeek(e.target.value)}
                placeholder="Misal: Minggu 4 - Okt 2026"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="safeManHoursWeek" className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Kerja Aman Minggu Ini (Man Hours)
              </label>
              <input
                id="safeManHoursWeek"
                type="number"
                value={safeManHoursWeek}
                onChange={(e) => setSafeManHoursWeek(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Persentase Indikator Operasional */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            2. Persentase Kepatuhan Operasional
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="toolboxMeetingPercent" className="block text-xs font-semibold text-slate-700 mb-1">
                Kepatuhan P5M / Toolbox Meeting (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="toolboxMeetingPercent"
                  type="number"
                  min="0"
                  max="100"
                  value={toolboxMeetingPercent}
                  onChange={(e) => setToolboxMeetingPercent(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-500 font-bold">%</span>
              </div>
            </div>

            <div>
              <label htmlFor="fatigueCheckPercent" className="block text-xs font-semibold text-slate-700 mb-1">
                Kepatuhan Uji Bugar / Fatigue Check (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="fatigueCheckPercent"
                  type="number"
                  min="0"
                  max="100"
                  value={fatigueCheckPercent}
                  onChange={(e) => setToolboxMeetingPercent(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-500 font-bold">%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div>
              <label htmlFor="plannedInspectionTarget" className="block text-xs font-semibold text-slate-700 mb-1">
                Target Inspeksi Gabungan
              </label>
              <input
                id="plannedInspectionTarget"
                type="number"
                value={plannedInspectionTarget}
                onChange={(e) => setPlannedInspectionTarget(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:bg-white"
              />
            </div>
            <div>
              <label htmlFor="plannedInspectionActual" className="block text-xs font-semibold text-slate-700 mb-1">
                Inspeksi Terlaksana (Aktual)
              </label>
              <input
                id="plannedInspectionActual"
                type="number"
                value={plannedInspectionActual}
                onChange={(e) => setPlannedInspectionActual(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Statistik Insiden Minggu Berjalan */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4 text-amber-600" />
            3. Rekap Insiden Minggu Berjalan
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-600 font-bold block mb-1">FATALITY</span>
              <input
                type="number"
                value={incidentsFatality}
                onChange={(e) => setIncidentsFatality(Number(e.target.value))}
                className="w-16 mx-auto bg-white text-center font-bold text-emerald-700 rounded py-1 text-sm border border-slate-300 shadow-sm"
              />
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-600 font-bold block mb-1">LTI</span>
              <input
                type="number"
                value={incidentsLTI}
                onChange={(e) => setIncidentsLTI(Number(e.target.value))}
                className="w-16 mx-auto bg-white text-center font-bold text-emerald-700 rounded py-1 text-sm border border-slate-300 shadow-sm"
              />
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-600 font-bold block mb-1">PROPERTY DAMAGE</span>
              <input
                type="number"
                value={incidentsPropertyDamage}
                onChange={(e) => setIncidentsPropertyDamage(Number(e.target.value))}
                className="w-16 mx-auto bg-white text-center font-bold text-amber-700 rounded py-1 text-sm border border-slate-300 shadow-sm"
              />
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-600 font-bold block mb-1">NEAR MISS</span>
              <input
                type="number"
                value={incidentsNearmiss}
                onChange={(e) => setIncidentsNearmiss(Number(e.target.value))}
                className="w-16 mx-auto bg-white text-center font-bold text-blue-700 rounded py-1 text-sm border border-slate-300 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Lingkungan & Catatan Prioritas */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4 space-y-3">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            4. Kualitas Air Tambang & Catatan Prioritas
          </div>

          <div>
            <label htmlFor="waterQualityPH" className="block text-xs font-semibold text-slate-700 mb-1">
              Rata-rata pH Air Settling Pond (Baku Mutu: 6.0 - 9.0)
            </label>
            <input
              id="waterQualityPH"
              type="number"
              step="0.1"
              value={waterQualityPH}
              onChange={(e) => setWaterQualityPH(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="topPriorityNotes" className="block text-xs font-semibold text-slate-700 mb-1">
              Fokus Isu K3 Minggu Depan
            </label>
            <textarea
              id="topPriorityNotes"
              rows={3}
              value={topPriorityNotes}
              onChange={(e) => setTopPriorityNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            {isSaved ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : <Save className="w-5 h-5" />}
            <span>{isSaved ? 'Tersimpan!' : 'Simpan Data Mingguan'}</span>
          </button>

          {onGeneratePPT && (
            <button
              type="button"
              onClick={() => {
                const report: WeeklySHEReport = {
                  id: `W-${Date.now()}`,
                  periodWeek,
                  createdDate: new Date().toISOString().slice(0, 10),
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
              className="py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20"
            >
              Download Weekly PPT
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
