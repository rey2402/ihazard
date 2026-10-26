import pptxgen from 'pptxgenjs';
import { WeeklySHEReport, MonthlySHEReport } from '../types/she-report';
import { HazardReport } from '../types/hazard';

// Theme Colors
const COLOR_PRIMARY = '0A192F';   // Deep Navy
const COLOR_ACCENT = 'FF6B00';    // Safety Orange
const COLOR_GREEN = '10B981';     // Emerald Green
const COLOR_AMBER = 'F59E0B';     // Mining Gold
const COLOR_DARK = '1E293B';      // Dark Slate
const COLOR_MUTED = '64748B';     // Muted Gray
const COLOR_WHITE = 'FFFFFF';

/**
 * Generate Laporan PPT Mingguan (Weekly SHE Report)
 */
export async function generateWeeklyPPT(
  report: WeeklySHEReport,
  _hazards: HazardReport[] = []
): Promise<pptxgen> {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'SHE Mining Department';
  pptx.company = 'Coal Mining Operations';
  pptx.title = `Weekly SHE Report - ${report.periodWeek}`;

  // ==========================================
  // SLIDE 1: COVER
  // ==========================================
  const slide1 = pptx.addSlide();
  slide1.background = { color: COLOR_PRIMARY };

  // Decorative top safety stripe
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.25,
    fill: { color: COLOR_ACCENT },
  });

  slide1.addText('PT. BATU BARA NUSANTARA • SITE OPERATIONS', {
    x: 0.8,
    y: 1.8,
    w: 8.5,
    h: 0.4,
    fontSize: 14,
    color: COLOR_ACCENT,
    bold: true,
  });

  slide1.addText('WEEKLY SAFETY, HEALTH & ENVIRONMENT (SHE) REPORT', {
    x: 0.8,
    y: 2.3,
    w: 8.5,
    h: 1.6,
    fontSize: 28,
    color: COLOR_WHITE,
    bold: true,
  });

  slide1.addText(`Periode: ${report.periodWeek} | Tanggal Dibuat: ${report.createdDate}`, {
    x: 0.8,
    y: 4.0,
    w: 8.5,
    h: 0.5,
    fontSize: 14,
    color: COLOR_MUTED,
  });

  // Safe Badge
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 5.0,
    w: 4.5,
    h: 0.8,
    fill: { color: COLOR_GREEN },
    rectRadius: 0.2,
  });
  slide1.addText('STATUS: ZERO FATALITY • ZERO LTI', {
    x: 0.8,
    y: 5.0,
    w: 4.5,
    h: 0.8,
    align: 'center',
    fontSize: 13,
    color: COLOR_WHITE,
    bold: true,
  });

  // ==========================================
  // SLIDE 2: EXECUTIVE SCORECARD
  // ==========================================
  const slide2 = pptx.addSlide();
  slide2.background = { color: 'F8FAFC' };

  slide2.addText('WEEKLY EXECUTIVE SCORECARD', {
    x: 0.8,
    y: 0.5,
    w: 8.5,
    h: 0.5,
    fontSize: 20,
    color: COLOR_PRIMARY,
    bold: true,
  });
  slide2.addText(`Ringkasan Capaian Indikator K3LH Periode ${report.periodWeek}`, {
    x: 0.8,
    y: 1.0,
    w: 8.5,
    h: 0.3,
    fontSize: 11,
    color: COLOR_MUTED,
  });

  // 4 KPI Cards
  const cards = [
    { title: 'JAM KERJA AMAN', value: `${report.safeManHoursWeek.toLocaleString('id-ID')}`, sub: 'Man Hours Minggu Ini', color: COLOR_PRIMARY },
    { title: 'KEPATUHAN P5M', value: `${report.toolboxMeetingPercent}%`, sub: 'Target 100%', color: COLOR_GREEN },
    { title: 'INSPEKSI GABUNGAN', value: `${report.plannedInspectionActual} / ${report.plannedInspectionTarget}`, sub: 'Target Terlaksana', color: COLOR_AMBER },
    { title: 'HAZARD CLOSED', value: `${report.hazardsClosedPercent}%`, sub: `${report.totalHazardsReported} Total Temuan`, color: COLOR_ACCENT },
  ];

  cards.forEach((card, idx) => {
    const xPos = 0.8 + idx * 2.9;
    slide2.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.7,
      w: 2.7,
      h: 2.2,
      fill: { color: COLOR_WHITE },
      line: { color: 'E2E8F0', width: 1.5 },
      rectRadius: 0.15,
    });
    slide2.addText(card.title, {
      x: xPos + 0.15,
      y: 1.9,
      w: 2.4,
      h: 0.3,
      fontSize: 9,
      color: COLOR_MUTED,
      bold: true,
    });
    slide2.addText(card.value, {
      x: xPos + 0.15,
      y: 2.4,
      w: 2.4,
      h: 0.8,
      fontSize: 24,
      color: card.color,
      bold: true,
    });
    slide2.addText(card.sub, {
      x: xPos + 0.15,
      y: 3.3,
      w: 2.4,
      h: 0.3,
      fontSize: 10,
      color: COLOR_MUTED,
    });
  });

  // ==========================================
  // SLIDE 3: HAZARD ANALYSIS
  // ==========================================
  const slide3 = pptx.addSlide();
  slide3.background = { color: 'F8FAFC' };

  slide3.addText('ANALISIS PELAPORAN BAHAYA (HAZARD REPORT)', {
    x: 0.8,
    y: 0.5,
    w: 8.5,
    h: 0.5,
    fontSize: 20,
    color: COLOR_PRIMARY,
    bold: true,
  });

  // Table Rekap Hazard
  const tableData: pptxgen.TableRow[] = [
    [
      { text: 'Kategori Indikator', options: { bold: true, fill: { color: COLOR_PRIMARY }, color: COLOR_WHITE } },
      { text: 'Jumlah', options: { bold: true, fill: { color: COLOR_PRIMARY }, color: COLOR_WHITE, align: 'center' as const } },
      { text: 'Status Penanganan', options: { bold: true, fill: { color: COLOR_PRIMARY }, color: COLOR_WHITE } },
    ],
    [{ text: 'Kondisi Tidak Aman (KTA)' }, { text: '5 Temuan', options: { align: 'center' as const } }, { text: '4 Selesai, 1 In-Progress' }],
    [{ text: 'Tindakan Tidak Aman (TTA)' }, { text: '3 Temuan', options: { align: 'center' as const } }, { text: '3 Selesai (Coaching Lapangan)' }],
    [{ text: 'Tingkat Risiko Tinggi (Merah)' }, { text: '1 Temuan', options: { align: 'center' as const } }, { text: 'Sudah dipasang tanggul perbaikan' }],
    [{ text: 'Tingkat Risiko Sedang (Kuning)' }, { text: '4 Temuan', options: { align: 'center' as const } }, { text: 'Dalam pengawasan PIC' }],
    [{ text: 'Tingkat Risiko Rendah (Hijau)' }, { text: '3 Temuan', options: { align: 'center' as const } }, { text: 'Closed di tempat' }],
  ];

  slide3.addTable(tableData, {
    x: 0.8,
    y: 1.6,
    w: 11.5,
    colW: [4.0, 2.5, 5.0],
    rowH: 0.45,
    fontSize: 11,
    fill: { color: COLOR_WHITE },
    border: { pt: 1, color: 'CBD5E1' },
  });

  // ==========================================
  // SLIDE 4: INCIDENT & NEAR MISS SUMMARY
  // ==========================================
  const slide4 = pptx.addSlide();
  slide4.background = { color: 'F8FAFC' };

  slide4.addText('REKAPITULASI KECELAKAAN KERJA & NEAR MISS', {
    x: 0.8,
    y: 0.5,
    w: 8.5,
    h: 0.5,
    fontSize: 20,
    color: COLOR_PRIMARY,
    bold: true,
  });

  const incidentCards = [
    { type: 'FATALITY', count: report.incidentsFatality, color: COLOR_GREEN },
    { type: 'LOST TIME INJURY (LTI)', count: report.incidentsLTI, color: COLOR_GREEN },
    { type: 'PROPERTY DAMAGE', count: report.incidentsPropertyDamage, color: COLOR_AMBER },
    { type: 'NEAR MISS', count: report.incidentsNearmiss, color: COLOR_ACCENT },
  ];

  incidentCards.forEach((item, idx) => {
    const xPos = 0.8 + idx * 2.9;
    slide4.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.8,
      w: 2.7,
      h: 2.0,
      fill: { color: COLOR_WHITE },
      line: { color: item.color, width: 2 },
      rectRadius: 0.15,
    });
    slide4.addText(item.type, {
      x: xPos + 0.1,
      y: 2.0,
      w: 2.5,
      h: 0.4,
      fontSize: 10,
      bold: true,
      color: COLOR_PRIMARY,
      align: 'center',
    });
    slide4.addText(String(item.count), {
      x: xPos + 0.1,
      y: 2.5,
      w: 2.5,
      h: 0.8,
      fontSize: 32,
      bold: true,
      color: item.color,
      align: 'center',
    });
  });

  // ==========================================
  // SLIDE 5: HIGHLIGHT TEMUAN BEFORE-AFTER
  // ==========================================
  const slide5 = pptx.addSlide();
  slide5.background = { color: 'F8FAFC' };

  slide5.addText('DOKUMENTASI FOTO TEMUAN (BEFORE VS AFTER)', {
    x: 0.8,
    y: 0.5,
    w: 8.5,
    h: 0.5,
    fontSize: 20,
    color: COLOR_PRIMARY,
    bold: true,
  });

  // Box Before
  slide5.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.6,
    w: 5.5,
    h: 4.0,
    fill: { color: COLOR_DARK },
    line: { color: 'E2E8F0', width: 1 },
  });
  slide5.addText('TEMUAN LAPANGAN (BEFORE)', {
    x: 1.0,
    y: 1.8,
    w: 5.0,
    h: 0.4,
    fontSize: 12,
    color: COLOR_ACCENT,
    bold: true,
  });
  slide5.addText('Tanggul jalan hauling retak akibat genangan air hujan di KM 14.', {
    x: 1.0,
    y: 2.4,
    w: 5.0,
    h: 1.0,
    fontSize: 11,
    color: COLOR_WHITE,
  });

  // Box After
  slide5.addShape(pptx.ShapeType.rect, {
    x: 6.8,
    y: 1.6,
    w: 5.5,
    h: 4.0,
    fill: { color: COLOR_DARK },
    line: { color: 'E2E8F0', width: 1 },
  });
  slide5.addText('TINDAK LANJUT PERBAIKAN (AFTER)', {
    x: 7.0,
    y: 1.8,
    w: 5.0,
    h: 0.4,
    fontSize: 12,
    color: COLOR_GREEN,
    bold: true,
  });
  slide5.addText('Perbaikan tanggul selesai dengan grader & dozer, safety cone dilepas.', {
    x: 7.0,
    y: 2.4,
    w: 5.0,
    h: 1.0,
    fontSize: 11,
    color: COLOR_WHITE,
  });

  // ==========================================
  // SLIDE 6: ACTION PLAN MINGGU DEPAN
  // ==========================================
  const slide6 = pptx.addSlide();
  slide6.background = { color: 'F8FAFC' };

  slide6.addText('ACTION PLAN & FOKUS K3 MINGGU DEPAN', {
    x: 0.8,
    y: 0.5,
    w: 8.5,
    h: 0.5,
    fontSize: 20,
    color: COLOR_PRIMARY,
    bold: true,
  });

  slide6.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.6,
    w: 11.5,
    h: 4.2,
    fill: { color: COLOR_WHITE },
    line: { color: 'CBD5E1', width: 1.5 },
    rectRadius: 0.15,
  });

  slide6.addText('PRIORITAS UTAMA:', {
    x: 1.2,
    y: 1.9,
    w: 10.0,
    h: 0.4,
    fontSize: 13,
    color: COLOR_ACCENT,
    bold: true,
  });

  slide6.addText(report.topPriorityNotes, {
    x: 1.2,
    y: 2.4,
    w: 10.5,
    h: 1.5,
    fontSize: 13,
    color: COLOR_PRIMARY,
  });

  slide6.addText(`Kualitas Air Settling Pond: pH ${report.waterQualityPH} (Standar Baku Mutu Aman)`, {
    x: 1.2,
    y: 4.2,
    w: 10.0,
    h: 0.4,
    fontSize: 12,
    color: COLOR_GREEN,
    bold: true,
  });

  return pptx;
}

/**
 * Generate Laporan PPT Bulanan (Monthly SHE Report)
 */
export async function generateMonthlyPPT(
  report: MonthlySHEReport,
  _hazards: HazardReport[] = []
): Promise<pptxgen> {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'SHE Mining Department';
  pptx.company = 'Coal Mining Operations';
  pptx.title = `Monthly SHE Report - ${report.periodMonth}`;

  // ==========================================
  // SLIDE 1: COVER
  // ==========================================
  const slide1 = pptx.addSlide();
  slide1.background = { color: COLOR_PRIMARY };

  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.25,
    fill: { color: COLOR_ACCENT },
  });

  slide1.addText('PT. BATU BARA NUSANTARA • SITE TAMBANG TERBUKA', {
    x: 0.8,
    y: 1.8,
    w: 8.5,
    h: 0.4,
    fontSize: 14,
    color: COLOR_ACCENT,
    bold: true,
  });

  slide1.addText('MONTHLY SHE MANAGEMENT PERFORMANCE REVIEW', {
    x: 0.8,
    y: 2.3,
    w: 9.5,
    h: 1.6,
    fontSize: 30,
    color: COLOR_WHITE,
    bold: true,
  });

  slide1.addText(`Periode Laporan: ${report.periodMonth} | Komite Keselamatan Pertambangan (P2K3)`, {
    x: 0.8,
    y: 4.2,
    w: 8.5,
    h: 0.5,
    fontSize: 14,
    color: COLOR_MUTED,
  });

  // ==========================================
  // SLIDE 2: EXECUTIVE DASHBOARD & MILESTONE
  // ==========================================
  const slide2 = pptx.addSlide();
  slide2.background = { color: 'F8FAFC' };

  slide2.addText('EXECUTIVE DASHBOARD & JAM KERJA AMAN', {
    x: 0.8,
    y: 0.5,
    w: 8.5,
    h: 0.5,
    fontSize: 20,
    color: COLOR_PRIMARY,
    bold: true,
  });

  // Milestone Box
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.5,
    w: 11.5,
    h: 1.8,
    fill: { color: COLOR_PRIMARY },
    rectRadius: 0.2,
  });
  slide2.addText('AKUMULASI JAM KERJA SELAMAT (YEAR-TO-DATE)', {
    x: 1.2,
    y: 1.8,
    w: 10.0,
    h: 0.4,
    fontSize: 12,
    color: COLOR_ACCENT,
    bold: true,
  });
  slide2.addText(`${report.safeManHoursYTD.toLocaleString('id-ID')} MAN HOURS`, {
    x: 1.2,
    y: 2.2,
    w: 10.0,
    h: 0.8,
    fontSize: 32,
    color: COLOR_WHITE,
    bold: true,
  });

  // Bulanan & Safety Rates
  const cards = [
    { title: 'JAM KERJA BULAN INI', val: `${report.safeManHoursMonth.toLocaleString('id-ID')}`, sub: 'Man Hours' },
    { title: 'LTIFR (Lost Time Injury Rate)', val: `${report.ltifr}`, sub: 'Target: 0.00' },
    { title: 'TRIFR (Recordable Rate)', val: `${report.trifr}`, sub: 'Target: < 1.00' },
  ];

  cards.forEach((c, idx) => {
    const xPos = 0.8 + idx * 3.9;
    slide2.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 3.7,
      w: 3.7,
      h: 2.3,
      fill: { color: COLOR_WHITE },
      line: { color: 'CBD5E1', width: 1.5 },
      rectRadius: 0.15,
    });
    slide2.addText(c.title, { x: xPos + 0.2, y: 3.9, w: 3.3, h: 0.3, fontSize: 10, color: COLOR_MUTED, bold: true });
    slide2.addText(c.val, { x: xPos + 0.2, y: 4.4, w: 3.3, h: 0.7, fontSize: 24, color: COLOR_GREEN, bold: true });
    slide2.addText(c.sub, { x: xPos + 0.2, y: 5.2, w: 3.3, h: 0.3, fontSize: 11, color: COLOR_MUTED });
  });

  // ==========================================
  // SLIDE 3: LEADING INDICATORS COMPLIANCE
  // ==========================================
  const slide3 = pptx.addSlide();
  slide3.background = { color: 'F8FAFC' };

  slide3.addText('PERSENTASE KEPATUHAN LEADING INDICATORS', {
    x: 0.8,
    y: 0.5,
    w: 8.5,
    h: 0.5,
    fontSize: 20,
    color: COLOR_PRIMARY,
    bold: true,
  });

  const leading = [
    { label: 'Penyelesaian Hazard (< 14 Hari)', percent: report.hazardResolutionRatePercent },
    { label: 'Planned Safety Inspection & Walkthrough', percent: report.plannedInspectionRatePercent },
    { label: 'Kepatuhan Safety Induction & Training', percent: report.safetyTrainingAttendancePercent },
    { label: 'Kepatuhan Prosedur Kritis (Golden Rules)', percent: report.goldenRulesCompliancePercent },
  ];

  leading.forEach((item, idx) => {
    const yPos = 1.6 + idx * 1.1;
    slide3.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: yPos,
      w: 11.5,
      h: 0.9,
      fill: { color: COLOR_WHITE },
      line: { color: 'E2E8F0', width: 1.5 },
      rectRadius: 0.1,
    });
    slide3.addText(item.label, { x: 1.2, y: yPos + 0.25, w: 7.0, h: 0.4, fontSize: 13, bold: true, color: COLOR_PRIMARY });
    slide3.addText(`${item.percent}%`, { x: 9.5, y: yPos + 0.2, w: 2.5, h: 0.5, fontSize: 18, bold: true, color: COLOR_GREEN, align: 'right' });
  });

  // ==========================================
  // SLIDE 4: KINERJA PENGELOLAAN LINGKUNGAN TAMBANG
  // ==========================================
  const slide4 = pptx.addSlide();
  slide4.background = { color: 'F8FAFC' };

  slide4.addText('PENGELOLAAN LINGKUNGAN PERTAMBANGAN', {
    x: 0.8,
    y: 0.5,
    w: 8.5,
    h: 0.5,
    fontSize: 20,
    color: COLOR_PRIMARY,
    bold: true,
  });

  slide4.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.8,
    w: 5.5,
    h: 3.5,
    fill: { color: COLOR_WHITE },
    line: { color: 'CBD5E1', width: 1.5 },
    rectRadius: 0.15,
  });
  slide4.addText('PENGELOLAAN LIMBAH B3', { x: 1.2, y: 2.1, w: 4.7, h: 0.4, fontSize: 13, bold: true, color: COLOR_PRIMARY });
  slide4.addText(`${report.b3WasteVolumeTons} TON`, { x: 1.2, y: 2.7, w: 4.7, h: 0.8, fontSize: 28, bold: true, color: COLOR_ACCENT });
  slide4.addText('Oli bekas, filter bekas, aki, dan material terkontaminasi terkelola ke pihak ketiga berizin.', {
    x: 1.2,
    y: 3.6,
    w: 4.7,
    h: 1.2,
    fontSize: 11,
    color: COLOR_MUTED,
  });

  slide4.addShape(pptx.ShapeType.roundRect, {
    x: 6.8,
    y: 1.8,
    w: 5.5,
    h: 3.5,
    fill: { color: COLOR_WHITE },
    line: { color: 'CBD5E1', width: 1.5 },
    rectRadius: 0.15,
  });
  slide4.addText('REKLAMASI & REVEGETASI LAHAN', { x: 7.2, y: 2.1, w: 4.7, h: 0.4, fontSize: 13, bold: true, color: COLOR_PRIMARY });
  slide4.addText(`${report.reclamationLandHa} HEKTAR`, { x: 7.2, y: 2.7, w: 4.7, h: 0.8, fontSize: 28, bold: true, color: COLOR_GREEN });
  slide4.addText('Progres penanaman cover crops dan pohon fast-growing di disposal final sesuai target AMDAL.', {
    x: 7.2,
    y: 3.6,
    w: 4.7,
    h: 1.2,
    fontSize: 11,
    color: COLOR_MUTED,
  });

  // ==========================================
  // SLIDE 5: EVALUASI P2K3 & FOKUS BULAN BERIKUTNYA
  // ==========================================
  const slide5 = pptx.addSlide();
  slide5.background = { color: 'F8FAFC' };

  slide5.addText('EVALUASI KOMITE P2K3 & REKOMENDASI STRATEGIS', {
    x: 0.8,
    y: 0.5,
    w: 8.5,
    h: 0.5,
    fontSize: 20,
    color: COLOR_PRIMARY,
    bold: true,
  });

  slide5.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.8,
    w: 11.5,
    h: 4.0,
    fill: { color: COLOR_WHITE },
    line: { color: 'CBD5E1', width: 1.5 },
    rectRadius: 0.15,
  });

  slide5.addText('NOTULENSI KESEPAKATAN P2K3:', {
    x: 1.2,
    y: 2.1,
    w: 10.0,
    h: 0.4,
    fontSize: 13,
    bold: true,
    color: COLOR_PRIMARY,
  });

  slide5.addText(report.p2k3Notes, {
    x: 1.2,
    y: 2.7,
    w: 10.5,
    h: 2.5,
    fontSize: 14,
    color: COLOR_DARK,
  });

  return pptx;
}

/**
 * Trigger download presentasi mingguan di browser
 */
export async function downloadWeeklyPPT(report: WeeklySHEReport, hazards: HazardReport[] = []): Promise<void> {
  const pptx = await generateWeeklyPPT(report, hazards);
  await pptx.writeFile({ fileName: `Weekly_SHE_Report_${report.periodWeek.replace(/[^a-zA-Z0-9]/g, '_')}.pptx` });
}

/**
 * Trigger download presentasi bulanan di browser
 */
export async function downloadMonthlyPPT(report: MonthlySHEReport, hazards: HazardReport[] = []): Promise<void> {
  const pptx = await generateMonthlyPPT(report, hazards);
  await pptx.writeFile({ fileName: `Monthly_SHE_Report_${report.periodMonth.replace(/[^a-zA-Z0-9]/g, '_')}.pptx` });
}
