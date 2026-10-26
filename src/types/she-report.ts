export interface WeeklySHEReport {
  id: string;
  periodWeek: string; // e.g. "Minggu 4 - Okt 2026"
  createdDate: string;
  safeManHoursWeek: number;
  toolboxMeetingPercent: number;
  plannedInspectionTarget: number;
  plannedInspectionActual: number;
  fatigueCheckPercent: number;
  incidentsFatality: number;
  incidentsLTI: number;
  incidentsPropertyDamage: number;
  incidentsNearmiss: number;
  waterQualityPH: number;
  topPriorityNotes: string;
  totalHazardsReported: number;
  hazardsClosedPercent: number;
}

export interface MonthlySHEReport {
  id: string;
  periodMonth: string; // e.g. "Oktober 2026"
  safeManHoursMonth: number;
  safeManHoursYTD: number;
  incidentsFatality: number;
  incidentsLTI: number;
  incidentsRestrictedWork: number;
  incidentsMedicalTreatment: number;
  ltifr: number;
  trifr: number;
  hazardResolutionRatePercent: number;
  plannedInspectionRatePercent: number;
  safetyTrainingAttendancePercent: number;
  goldenRulesCompliancePercent: number;
  b3WasteVolumeTons: number;
  reclamationLandHa: number;
  p2k3Notes: string;
}
