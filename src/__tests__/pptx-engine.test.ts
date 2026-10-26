import { describe, it, expect } from 'vitest';
import { generateWeeklyPPT, generateMonthlyPPT } from '../services/pptx-engine';
import { WeeklySHEReport, MonthlySHEReport } from '../types/she-report';

describe('PowerPoint Generation Engine', () => {
  const mockWeekly: WeeklySHEReport = {
    id: 'W-01',
    periodWeek: 'Minggu 4 - Okt 2026',
    createdDate: '2026-10-26',
    safeManHoursWeek: 25000,
    toolboxMeetingPercent: 98,
    plannedInspectionTarget: 5,
    plannedInspectionActual: 5,
    fatigueCheckPercent: 96,
    incidentsFatality: 0,
    incidentsLTI: 0,
    incidentsPropertyDamage: 1,
    incidentsNearmiss: 2,
    waterQualityPH: 7.2,
    topPriorityNotes: 'Pengawasan tanggul disposal',
    totalHazardsReported: 12,
    hazardsClosedPercent: 83.3,
  };

  const mockMonthly: MonthlySHEReport = {
    id: 'M-01',
    periodMonth: 'Oktober 2026',
    safeManHoursMonth: 145000,
    safeManHoursYTD: 1420000,
    incidentsFatality: 0,
    incidentsLTI: 0,
    incidentsRestrictedWork: 0,
    incidentsMedicalTreatment: 1,
    ltifr: 0.0,
    trifr: 0.7,
    hazardResolutionRatePercent: 94.5,
    plannedInspectionRatePercent: 100,
    safetyTrainingAttendancePercent: 92.0,
    goldenRulesCompliancePercent: 97.5,
    b3WasteVolumeTons: 12.4,
    reclamationLandHa: 4.5,
    p2k3Notes: 'Audit K3 bulanan selesai.',
  };

  it('generates weekly PPT presentation', async () => {
    const pres = await generateWeeklyPPT(mockWeekly, []);
    expect(pres).toBeDefined();
  });

  it('generates monthly PPT presentation', async () => {
    const pres = await generateMonthlyPPT(mockMonthly, []);
    expect(pres).toBeDefined();
  });
});
