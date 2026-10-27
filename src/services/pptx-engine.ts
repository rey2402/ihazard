import pptxgen from 'pptxgenjs';
import { WeeklySHEReport, MonthlySHEReport } from '../types/she-report';
import { HazardReport } from '../types/hazard';

// High-End Mining SHE Design Palette
const COLOR_PRIMARY = '0F172A';    // Deep Slate Navy
const COLOR_SECONDARY = '1E293B';  // Dark Slate
const COLOR_ACCENT = 'F59E0B';     // Safety Amber
const COLOR_ORANGE = 'EA580C';     // Safety Orange
const COLOR_GREEN = '10B981';      // Emerald Green
const COLOR_RED = 'EF4444';        // High Risk Red
const COLOR_MUTED = '64748B';      // Muted Slate
const COLOR_LIGHT_BG = 'F8FAFC';   // Canvas Off-White
const COLOR_WHITE = 'FFFFFF';
const COLOR_BORDER = 'E2E8F0';

// Canvas Metrics for LAYOUT_WIDE: Width = 13.333 inches, Height = 7.5 inches
const SLIDE_WIDTH = 13.333;
const MARGIN_X = 0.8;
const USABLE_WIDTH = 11.733; // 13.333 - 1.6

/**
 * Standard Header for Content Slides
 */
function addSlideHeader(
  slide: pptxgen.Slide,
  title: string,
  subtitle: string,
  categoryTag = 'KEPMEN ESDM 1827.K • DIVISI KESELAMATAN PERTAMBANGAN'
) {
  // Top Accent Safety Line
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.12,
    fill: { color: COLOR_ACCENT },
    line: { color: COLOR_ACCENT, width: 0 },
  });

  // Category Tag
  slide.addText(categoryTag.toUpperCase(), {
    x: MARGIN_X,
    y: 0.42,
    w: 10.0,
    h: 0.25,
    fontSize: 9.5,
    bold: true,
    color: COLOR_ORANGE,
    fontFace: 'Segoe UI',
  });

  // Main Slide Title
  slide.addText(title, {
    x: MARGIN_X,
    y: 0.68,
    w: 11.0,
    h: 0.45,
    fontSize: 20,
    bold: true,
    color: COLOR_PRIMARY,
    fontFace: 'Segoe UI',
  });

  // Descriptive Subtitle
  slide.addText(subtitle, {
    x: MARGIN_X,
    y: 1.15,
    w: 11.0,
    h: 0.25,
    fontSize: 10.5,
    color: COLOR_MUTED,
    fontFace: 'Segoe UI',
  });
}

/**
 * Standard Footer for Content Slides
 */
function addSlideFooter(slide: pptxgen.Slide, currentSlide: number, totalSlides: number) {
  // Divider Line
  slide.addShape('rect', {
    x: MARGIN_X,
    y: 6.85,
    w: USABLE_WIDTH,
    h: 0.015,
    fill: { color: COLOR_BORDER },
    line: { color: COLOR_BORDER, width: 0 },
  });

  // Left Legal & Confidentiality Text
  slide.addText(
    'PT. Batu Bara Nusantara • Laporan Resmi K3LH Operasional Tambang • Dokumen Terkendali',
    {
      x: MARGIN_X,
      y: 6.95,
      w: 8.5,
      h: 0.3,
      fontSize: 8.5,
      color: COLOR_MUTED,
      fontFace: 'Segoe UI',
    }
  );

  // Right Slide Number
  slide.addText(`Slide ${currentSlide} / ${totalSlides}`, {
    x: 9.8,
    y: 6.95,
    w: 2.73,
    h: 0.3,
    fontSize: 9,
    bold: true,
    color: COLOR_MUTED,
    align: 'right',
    fontFace: 'Segoe UI',
  });
}

/**
 * Generate Laporan PPT Mingguan (Weekly SHE Report) - 6 Slide
 */
export async function generateWeeklyPPT(
  report: WeeklySHEReport,
  _hazards: HazardReport[] = []
): Promise<pptxgen> {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE'; // Standard 16:9 Widescreen (13.333" x 7.5")
  pptx.author = 'iHazard - Divisi Keselamatan Pertambangan';
  pptx.company = 'iHazard Mining Safety System';
  pptx.title = `iHazard Weekly Report - ${report.periodWeek}`;

  const TOTAL_SLIDES = 6;

  // ==========================================
  // SLIDE 1: COVER
  // ==========================================
  const slide1 = pptx.addSlide();
  slide1.background = { color: COLOR_PRIMARY };

  // Top Safety Orange Accent Stripe
  slide1.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.25,
    fill: { color: COLOR_ACCENT },
    line: { color: COLOR_ACCENT, width: 0 },
  });

  slide1.addText('iHAZARD • SISTEM KESELAMATAN & LAPORAN TAMBANG', {
    x: MARGIN_X,
    y: 1.6,
    w: 11.5,
    h: 0.35,
    fontSize: 13,
    color: COLOR_ACCENT,
    bold: true,
    fontFace: 'Segoe UI',
  });

  slide1.addText('WEEKLY SAFETY, HEALTH & ENVIRONMENT (SHE) REPORT', {
    x: MARGIN_X,
    y: 2.1,
    w: 11.5,
    h: 1.4,
    fontSize: 28,
    color: COLOR_WHITE,
    bold: true,
    fontFace: 'Segoe UI',
  });

  slide1.addText(
    `Periode Operasional: ${report.periodWeek}   |   Tanggal Rilis: ${report.createdDate}   |   Standar: Kepmen ESDM 1827.K/30/MEM/2018`,
    {
      x: MARGIN_X,
      y: 3.6,
      w: 11.5,
      h: 0.4,
      fontSize: 12,
      color: COLOR_MUTED,
      fontFace: 'Segoe UI',
    }
  );

  // Safe Badge (Zero Fatality / Zero LTI)
  slide1.addShape('roundRect', {
    x: MARGIN_X,
    y: 4.5,
    w: 5.5,
    h: 0.9,
    fill: { color: '065F46' }, // Dark Emerald
    line: { color: COLOR_GREEN, width: 1.5 },
    rectRadius: 0.15,
  });

  slide1.addText('STATUS OPERASIONAL: ZERO FATALITY • ZERO LTI', {
    x: MARGIN_X,
    y: 4.5,
    w: 5.5,
    h: 0.9,
    align: 'center',
    fontSize: 13,
    color: COLOR_WHITE,
    bold: true,
    fontFace: 'Segoe UI',
  });

  // Footer on cover
  slide1.addText('KOMITE KESELAMATAN PERTAMBANGAN (P2K3) • COAL MINING DIVISION', {
    x: MARGIN_X,
    y: 6.8,
    w: 11.5,
    h: 0.3,
    fontSize: 9.5,
    color: '94A3B8',
    fontFace: 'Segoe UI',
  });

  // ==========================================
  // SLIDE 2: EXECUTIVE SCORECARD
  // ==========================================
  const slide2 = pptx.addSlide();
  slide2.background = { color: COLOR_LIGHT_BG };
  addSlideHeader(
    slide2,
    'WEEKLY EXECUTIVE SCORECARD',
    `Ringkasan capaian indikator utama K3LH untuk periode ${report.periodWeek}`
  );

  // 4 KPI Cards: evenly spaced across USABLE_WIDTH (11.733")
  // card width: 2.75", gap: 0.24" -> 4*2.75 + 3*0.24 = 11.72"
  const cards = [
    {
      title: 'JAM KERJA AMAN',
      value: `${report.safeManHoursWeek.toLocaleString('id-ID')}`,
      sub: 'Man Hours Minggu Ini',
      accentColor: COLOR_PRIMARY,
      borderColor: 'CBD5E1',
    },
    {
      title: 'KEPATUHAN P5M',
      value: `${report.toolboxMeetingPercent}%`,
      sub: 'Target 100% Shift Pagi & Malam',
      accentColor: COLOR_GREEN,
      borderColor: '86EFAC',
    },
    {
      title: 'INSPEKSI GABUNGAN',
      value: `${report.plannedInspectionActual} / ${report.plannedInspectionTarget}`,
      sub: 'Inspeksi Bersama Pengawas',
      accentColor: COLOR_ORANGE,
      borderColor: 'FED7AA',
    },
    {
      title: 'HAZARD CLOSED',
      value: `${report.hazardsClosedPercent}%`,
      sub: `${report.totalHazardsReported} Total Temuan Terdata`,
      accentColor: COLOR_ACCENT,
      borderColor: 'FDE68A',
    },
  ];

  const cardW = 2.75;
  const cardGap = 0.244;
  cards.forEach((card, idx) => {
    const xPos = MARGIN_X + idx * (cardW + cardGap);
    slide2.addShape('roundRect', {
      x: xPos,
      y: 1.6,
      w: cardW,
      h: 2.3,
      fill: { color: COLOR_WHITE },
      line: { color: card.borderColor, width: 1.5 },
      rectRadius: 0.15,
    });

    slide2.addText(card.title, {
      x: xPos + 0.15,
      y: 1.8,
      w: cardW - 0.3,
      h: 0.3,
      fontSize: 9.5,
      color: COLOR_MUTED,
      bold: true,
      fontFace: 'Segoe UI',
    });

    slide2.addText(card.value, {
      x: xPos + 0.15,
      y: 2.25,
      w: cardW - 0.3,
      h: 0.8,
      fontSize: 26,
      color: card.accentColor,
      bold: true,
      fontFace: 'Segoe UI',
    });

    slide2.addText(card.sub, {
      x: xPos + 0.15,
      y: 3.2,
      w: cardW - 0.3,
      h: 0.4,
      fontSize: 9,
      color: COLOR_MUTED,
      fontFace: 'Segoe UI',
    });
  });

  // Callout Box (Ringkasan Eksekutif)
  slide2.addShape('roundRect', {
    x: MARGIN_X,
    y: 4.2,
    w: USABLE_WIDTH,
    h: 2.3,
    fill: { color: COLOR_WHITE },
    line: { color: COLOR_BORDER, width: 1.5 },
    rectRadius: 0.15,
  });

  slide2.addText('EVALUASI CAPAIAN & FOKUS KESELAMATAN MINGGU INI:', {
    x: MARGIN_X + 0.3,
    y: 4.4,
    w: USABLE_WIDTH - 0.6,
    h: 0.35,
    fontSize: 11,
    bold: true,
    color: COLOR_PRIMARY,
    fontFace: 'Segoe UI',
  });

  const bulletPoints = [
    `• Jam kerja aman kumulatif minggu ini mencapai ${report.safeManHoursWeek.toLocaleString('id-ID')} jam tanpa ada kecelakaan kerja berakibat cedera hilang (Zero LTI).`,
    `• Kepatuhan safety talk harian (P5M) mencapai ${report.toolboxMeetingPercent}%, fokus materi difokuskan pada antisipasi blind spot unit hauling dan jalan licin musim hujan.`,
    `• Inspeksi bersama (Joint Inspection) terlaksana ${report.plannedInspectionActual} kali dari target ${report.plannedInspectionTarget} kali di area Pit North dan Workshop.`,
    `• Rasio penyelesaian temuan bahaya (Closure Rate) tercatat ${report.hazardsClosedPercent}% dengan SLA tindak lanjut risiko tinggi di bawah 24 jam.`,
  ];

  slide2.addText(bulletPoints.join('\n'), {
    x: MARGIN_X + 0.3,
    y: 4.8,
    w: USABLE_WIDTH - 0.6,
    h: 1.5,
    fontSize: 10,
    color: COLOR_SECONDARY,
    fontFace: 'Segoe UI',
    lineSpacing: 18,
  });

  addSlideFooter(slide2, 2, TOTAL_SLIDES);

  // ==========================================
  // SLIDE 3: HAZARD ANALYSIS (TABLE REKAP)
  // ==========================================
  const slide3 = pptx.addSlide();
  slide3.background = { color: COLOR_LIGHT_BG };
  addSlideHeader(
    slide3,
    'ANALISIS LAPORAN BAHAYA (HAZARD REPORT)',
    'Rekapitulasi temuan kondisi & tindakan tidak aman (KTA/TTA) serta status perbaikan lapangan'
  );

  // Table Rekap Hazard (Properly fitted within USABLE_WIDTH = 11.733")
  const tableData: pptxgen.TableRow[] = [
    [
      {
        text: 'Kategori Indikator Bahaya',
        options: {
          bold: true,
          fill: { color: COLOR_SECONDARY },
          color: COLOR_WHITE,
          fontSize: 11,
          fontFace: 'Segoe UI',
        },
      },
      {
        text: 'Jumlah Temuan',
        options: {
          bold: true,
          fill: { color: COLOR_SECONDARY },
          color: COLOR_WHITE,
          align: 'center' as const,
          fontSize: 11,
          fontFace: 'Segoe UI',
        },
      },
      {
        text: 'Status Tindak Lanjut & Mitigasi',
        options: {
          bold: true,
          fill: { color: COLOR_SECONDARY },
          color: COLOR_WHITE,
          fontSize: 11,
          fontFace: 'Segoe UI',
        },
      },
    ],
    [
      { text: 'Kondisi Tidak Aman (KTA)', options: { fontSize: 10, fontFace: 'Segoe UI', bold: true } },
      { text: '5 Temuan', options: { fontSize: 10, fontFace: 'Segoe UI', align: 'center' as const, bold: true, color: COLOR_ORANGE } },
      { text: '4 Selesai (Closed), 1 Dalam Progres Penimbunan Tanggul', options: { fontSize: 10, fontFace: 'Segoe UI' } },
    ],
    [
      { text: 'Tindakan Tidak Aman (TTA)', options: { fontSize: 10, fontFace: 'Segoe UI', bold: true } },
      { text: '3 Temuan', options: { fontSize: 10, fontFace: 'Segoe UI', align: 'center' as const, bold: true, color: COLOR_RED } },
      { text: '3 Selesai (Coaching & Briefing Langsung kepada Operator)', options: { fontSize: 10, fontFace: 'Segoe UI' } },
    ],
    [
      { text: 'Tingkat Risiko Tinggi (High Risk)', options: { fontSize: 10, fontFace: 'Segoe UI', bold: true, color: COLOR_RED } },
      { text: '1 Temuan', options: { fontSize: 10, fontFace: 'Segoe UI', align: 'center' as const, bold: true, color: COLOR_RED } },
      { text: 'Tanggul retak KM 14 telah selesai diperbaiki dozer < 24 jam', options: { fontSize: 10, fontFace: 'Segoe UI' } },
    ],
    [
      { text: 'Tingkat Risiko Sedang (Medium Risk)', options: { fontSize: 10, fontFace: 'Segoe UI', bold: true, color: COLOR_ORANGE } },
      { text: '4 Temuan', options: { fontSize: 10, fontFace: 'Segoe UI', align: 'center' as const, bold: true, color: COLOR_ORANGE } },
      { text: 'Kabel terbuka & rambu miring dalam pengawasan pengawas shift', options: { fontSize: 10, fontFace: 'Segoe UI' } },
    ],
    [
      { text: 'Tingkat Risiko Rendah (Low Risk)', options: { fontSize: 10, fontFace: 'Segoe UI', bold: true, color: COLOR_GREEN } },
      { text: '3 Temuan', options: { fontSize: 10, fontFace: 'Segoe UI', align: 'center' as const, bold: true, color: COLOR_GREEN } },
      { text: 'Housekeeping workshop & APD telah diselesaikan langsung di tempat', options: { fontSize: 10, fontFace: 'Segoe UI' } },
    ],
  ];

  // Exact Table Sizing: 4.2 + 2.3 + 5.233 = 11.733" (Perfect match with margins!)
  slide3.addTable(tableData, {
    x: MARGIN_X,
    y: 1.6,
    w: USABLE_WIDTH,
    colW: [4.2, 2.3, 5.233],
    rowH: 0.52,
    fill: { color: COLOR_WHITE },
    border: { pt: 1, color: COLOR_BORDER },
  });

  // Callout Box di bawah tabel
  slide3.addShape('roundRect', {
    x: MARGIN_X,
    y: 5.15,
    w: USABLE_WIDTH,
    h: 1.45,
    fill: { color: 'F0FDF4' }, // Soft green
    line: { color: 'BBF7D0', width: 1.5 },
    rectRadius: 0.15,
  });

  slide3.addText('CATATAN PENGAWASAN K3LH & VERIFIKASI LAPANGAN:', {
    x: MARGIN_X + 0.25,
    y: 5.3,
    w: USABLE_WIDTH - 0.5,
    h: 0.3,
    fontSize: 10.5,
    bold: true,
    color: '166534',
    fontFace: 'Segoe UI',
  });

  slide3.addText(
    'Seluruh temuan berkategori Risiko Tinggi telah ditindaklanjuti dalam batas waktu Service Level Agreement (SLA < 24 Jam). ' +
      'Pengawas lapangan diinstruksikan untuk meningkatkan patroli pada jalur tikungan hauling rawan blind spot dan genangan air saat hujan lebat.',
    {
      x: MARGIN_X + 0.25,
      y: 5.65,
      w: USABLE_WIDTH - 0.5,
      h: 0.8,
      fontSize: 9.5,
      color: '14532D',
      fontFace: 'Segoe UI',
      lineSpacing: 16,
    }
  );

  addSlideFooter(slide3, 3, TOTAL_SLIDES);

  // ==========================================
  // SLIDE 4: REKAPITULASI KECELAKAAN & NEAR MISS
  // ==========================================
  const slide4 = pptx.addSlide();
  slide4.background = { color: COLOR_LIGHT_BG };
  addSlideHeader(
    slide4,
    'REKAPITULASI KECELAKAAN KERJA & NEAR MISS',
    'Catatan insiden operasional, kerusakan properti, dan kejadian hampir celaka'
  );

  const incidentCards = [
    { type: 'FATALITY', count: report.incidentsFatality, color: COLOR_GREEN, note: 'Target: 0 Kasus' },
    { type: 'LOST TIME INJURY (LTI)', count: report.incidentsLTI, color: COLOR_GREEN, note: 'Target: 0 Kasus' },
    { type: 'PROPERTY DAMAGE', count: report.incidentsPropertyDamage, color: report.incidentsPropertyDamage > 0 ? COLOR_ORANGE : COLOR_GREEN, note: 'Kerusakan Ringan Unit' },
    { type: 'NEAR MISS (HAMPIR CELAKA)', count: report.incidentsNearmiss, color: report.incidentsNearmiss > 0 ? COLOR_ACCENT : COLOR_GREEN, note: 'Terekam Lapor Bahaya' },
  ];

  incidentCards.forEach((item, idx) => {
    const xPos = MARGIN_X + idx * (cardW + cardGap);
    slide4.addShape('roundRect', {
      x: xPos,
      y: 1.6,
      w: cardW,
      h: 2.3,
      fill: { color: COLOR_WHITE },
      line: { color: item.color, width: 2 },
      rectRadius: 0.15,
    });

    slide4.addText(item.type, {
      x: xPos + 0.1,
      y: 1.8,
      w: cardW - 0.2,
      h: 0.45,
      fontSize: 10,
      bold: true,
      color: COLOR_PRIMARY,
      align: 'center',
      fontFace: 'Segoe UI',
    });

    slide4.addText(String(item.count), {
      x: xPos + 0.1,
      y: 2.35,
      w: cardW - 0.2,
      h: 0.8,
      fontSize: 34,
      bold: true,
      color: item.color,
      align: 'center',
      fontFace: 'Segoe UI',
    });

    slide4.addText(item.note, {
      x: xPos + 0.1,
      y: 3.25,
      w: cardW - 0.2,
      h: 0.35,
      fontSize: 9,
      color: COLOR_MUTED,
      align: 'center',
      fontFace: 'Segoe UI',
    });
  });

  // Callout Investigasi & Severity
  slide4.addShape('roundRect', {
    x: MARGIN_X,
    y: 4.2,
    w: USABLE_WIDTH,
    h: 2.3,
    fill: { color: COLOR_WHITE },
    line: { color: COLOR_BORDER, width: 1.5 },
    rectRadius: 0.15,
  });

  slide4.addText('HASIL ANALISIS INVESTIGASI & KOREKSI TEKNIS:', {
    x: MARGIN_X + 0.3,
    y: 4.4,
    w: USABLE_WIDTH - 0.6,
    h: 0.35,
    fontSize: 11,
    bold: true,
    color: COLOR_PRIMARY,
    fontFace: 'Segoe UI',
  });

  const incidentNotes = [
    `• Tidak terdapat kejadian kecelakaan fatal (Fatality) maupun kecelakaan yang menghilangkan hari kerja (Lost Time Injury / LTI).`,
    `• Tercatat ${report.incidentsPropertyDamage} insiden Property Damage ringan berupa spion unit dump truck tersenggol dahan pohon di jalur hauling; perbaikan telah selesai dilakukan di workshop.`,
    `• Terekam ${report.incidentsNearmiss} kejadian Near Miss yang segera diintervensi oleh pengawas lapangan melalui toolbox meeting shift terkait.`,
    `• Sosialisasi SOP jarak aman antarkendaraan (safe following distance minimum 30 meter) telah diinstruksikan ulang ke seluruh driver.`,
  ];

  slide4.addText(incidentNotes.join('\n'), {
    x: MARGIN_X + 0.3,
    y: 4.8,
    w: USABLE_WIDTH - 0.6,
    h: 1.5,
    fontSize: 10,
    color: COLOR_SECONDARY,
    fontFace: 'Segoe UI',
    lineSpacing: 18,
  });

  addSlideFooter(slide4, 4, TOTAL_SLIDES);

  // ==========================================
  // SLIDE 5: HIGHLIGHT TEMUAN BEFORE-AFTER
  // ==========================================
  const slide5 = pptx.addSlide();
  slide5.background = { color: COLOR_LIGHT_BG };
  addSlideHeader(
    slide5,
    'DOKUMENTASI FOTO TEMUAN (BEFORE VS AFTER)',
    'Verifikasi visual kondisi bahaya lapangan dan bukti penyelesaian perbaikan fisik'
  );

  const halfW = (USABLE_WIDTH - 0.3) / 2; // 5.716" each

  // Box Before
  slide5.addShape('roundRect', {
    x: MARGIN_X,
    y: 1.6,
    w: halfW,
    h: 4.9,
    fill: { color: COLOR_WHITE },
    line: { color: 'FED7AA', width: 1.5 },
    rectRadius: 0.15,
  });

  // Top banner for Before
  slide5.addShape('rect', {
    x: MARGIN_X,
    y: 1.6,
    w: halfW,
    h: 0.45,
    fill: { color: COLOR_ORANGE },
  });

  slide5.addText('KONDISI TEMUAN AWAL (BEFORE)', {
    x: MARGIN_X + 0.2,
    y: 1.68,
    w: halfW - 0.4,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: COLOR_WHITE,
    fontFace: 'Segoe UI',
  });

  slide5.addText(
    'Lokasi: Hauling Road KM 14 Pos 2\n' +
      'Tipe: Kondisi Tidak Aman (KTA) - Risiko Tinggi\n' +
      'Deskripsi Temuan: Tanggul pengaman di sisi jurang tergerus air hujan setinggi 40cm, rawan amblas saat dilewati unit muatan batubara.',
    {
      x: MARGIN_X + 0.25,
      y: 2.2,
      w: halfW - 0.5,
      h: 1.2,
      fontSize: 10,
      color: COLOR_PRIMARY,
      fontFace: 'Segoe UI',
      lineSpacing: 16,
    }
  );

  // Photo placeholder area
  slide5.addShape('rect', {
    x: MARGIN_X + 0.25,
    y: 3.5,
    w: halfW - 0.5,
    h: 2.7,
    fill: { color: 'F1F5F9' },
    line: { color: 'CBD5E1', width: 1 },
  });
  slide5.addText('[ BUKTI FOTO KONDISI AWAL / BEFORE ]\nTanggul Retak Tergerus Air Hujan', {
    x: MARGIN_X + 0.25,
    y: 4.6,
    w: halfW - 0.5,
    h: 0.6,
    align: 'center',
    fontSize: 10,
    color: COLOR_MUTED,
    fontFace: 'Segoe UI',
  });

  // Box After
  const rightX = MARGIN_X + halfW + 0.3;
  slide5.addShape('roundRect', {
    x: rightX,
    y: 1.6,
    w: halfW,
    h: 4.9,
    fill: { color: COLOR_WHITE },
    line: { color: 'A7F3D0', width: 1.5 },
    rectRadius: 0.15,
  });

  // Top banner for After
  slide5.addShape('rect', {
    x: rightX,
    y: 1.6,
    w: halfW,
    h: 0.45,
    fill: { color: COLOR_GREEN },
  });

  slide5.addText('TINDAK LANJUT SELESAI (AFTER)', {
    x: rightX + 0.2,
    y: 1.68,
    w: halfW - 0.4,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: COLOR_WHITE,
    fontFace: 'Segoe UI',
  });

  slide5.addText(
    'Tindakan Koreksi: Rekonstruksi tanggul pengaman dengan penimbunan batuan keras (capping) dan pemadatan dozer.\n' +
      'PIC Penanganan: Foreman Pit North & Tim Road Maintenance\n' +
      'Status: CLOSED (Diverifikasi Pengawas K3LH)',
    {
      x: rightX + 0.25,
      y: 2.2,
      w: halfW - 0.5,
      h: 1.2,
      fontSize: 10,
      color: COLOR_PRIMARY,
      fontFace: 'Segoe UI',
      lineSpacing: 16,
    }
  );

  // Photo placeholder area
  slide5.addShape('rect', {
    x: rightX + 0.25,
    y: 3.5,
    w: halfW - 0.5,
    h: 2.7,
    fill: { color: 'F1F5F9' },
    line: { color: 'CBD5E1', width: 1 },
  });
  slide5.addText('[ BUKTI FOTO HASIL PERBAIKAN / AFTER ]\nTanggul Kokoh & Dipasang Safety Cone Baru', {
    x: rightX + 0.25,
    y: 4.6,
    w: halfW - 0.5,
    h: 0.6,
    align: 'center',
    fontSize: 10,
    color: COLOR_MUTED,
    fontFace: 'Segoe UI',
  });

  addSlideFooter(slide5, 5, TOTAL_SLIDES);

  // ==========================================
  // SLIDE 6: ACTION PLAN MINGGU DEPAN
  // ==========================================
  const slide6 = pptx.addSlide();
  slide6.background = { color: COLOR_LIGHT_BG };
  addSlideHeader(
    slide6,
    'ACTION PLAN & FOKUS K3 MINGGU DEPAN',
    'Rencana kerja prioritas mitigasi bahaya operasional dan kepatuhan lingkungan tambang'
  );

  // Left Box: Operasional K3
  slide6.addShape('roundRect', {
    x: MARGIN_X,
    y: 1.6,
    w: halfW,
    h: 4.9,
    fill: { color: COLOR_WHITE },
    line: { color: COLOR_BORDER, width: 1.5 },
    rectRadius: 0.15,
  });

  slide6.addText('FOKUS OPERASIONAL & KESELAMATAN PIT:', {
    x: MARGIN_X + 0.3,
    y: 1.85,
    w: halfW - 0.6,
    h: 0.35,
    fontSize: 11,
    bold: true,
    color: COLOR_ORANGE,
    fontFace: 'Segoe UI',
  });

  const leftActions = [
    '1. Inspeksi Stabilitas Tanggul & Lereng:',
    '   Monitoring harian keretakan tanah di disposal dan front loading pasca hujan.',
    '',
    '2. Pemeriksaan Kelaikan Unit (P2H):',
    '   Audit ketat fungsi rem, steering, klakson, dan wiper seluruh unit armada tambang.',
    '',
    '3. Fatigue Monitoring & Fit to Work:',
    '   Pemeriksaan ketat jam tidur operator sebelum memulai shift kerja malam.',
    '',
    '4. Penataan Rambu Jalan Tambang:',
    '   Pembersihan rambu dari debu batubara dan penambahan delineator pemantul cahaya.',
  ];

  slide6.addText(leftActions.join('\n'), {
    x: MARGIN_X + 0.3,
    y: 2.3,
    w: halfW - 0.6,
    h: 4.0,
    fontSize: 9.5,
    color: COLOR_PRIMARY,
    fontFace: 'Segoe UI',
    lineSpacing: 14,
  });

  // Right Box: Lingkungan & Komite
  slide6.addShape('roundRect', {
    x: rightX,
    y: 1.6,
    w: halfW,
    h: 4.9,
    fill: { color: COLOR_WHITE },
    line: { color: COLOR_BORDER, width: 1.5 },
    rectRadius: 0.15,
  });

  slide6.addText('PENGELOLAAN LINGKUNGAN & KEPATUHAN P2K3:', {
    x: rightX + 0.3,
    y: 1.85,
    w: halfW - 0.6,
    h: 0.35,
    fontSize: 11,
    bold: true,
    color: COLOR_GREEN,
    fontFace: 'Segoe UI',
  });

  const rightActions = [
    `• Kualitas Air Settling Pond: Tercatat pH ${report.waterQualityPH} (Baku Mutu Aman 6.0 - 9.0).`,
    '• Pengelolaan Limbah B3: Penjadwalan serah terima oli bekas & filter ke pihak pengangkut resmi.',
    '• P5M Rutin: Mewajibkan 100% kehadiran pekerja dalam briefing keselamatan awal shift.',
    `• Catatan Khusus KTT / Pengawas: "${report.topPriorityNotes}"`,
  ];

  slide6.addText(rightActions.join('\n'), {
    x: rightX + 0.3,
    y: 2.3,
    w: halfW - 0.6,
    h: 4.0,
    fontSize: 9.5,
    color: COLOR_PRIMARY,
    fontFace: 'Segoe UI',
    lineSpacing: 18,
  });

  addSlideFooter(slide6, 6, TOTAL_SLIDES);

  return pptx;
}

/**
 * Generate Laporan PPT Bulanan (Monthly SHE Report) - 5 Slide
 */
export async function generateMonthlyPPT(
  report: MonthlySHEReport,
  _hazards: HazardReport[] = []
): Promise<pptxgen> {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE'; // Standard 16:9 Widescreen (13.333" x 7.5")
  pptx.author = 'iHazard - Divisi Keselamatan Pertambangan';
  pptx.company = 'iHazard Mining Safety System';
  pptx.title = `iHazard Monthly Report - ${report.periodMonth}`;

  const TOTAL_SLIDES = 5;
  const halfW = (USABLE_WIDTH - 0.3) / 2;

  // ==========================================
  // SLIDE 1: COVER
  // ==========================================
  const slide1 = pptx.addSlide();
  slide1.background = { color: COLOR_PRIMARY };

  slide1.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.25,
    fill: { color: COLOR_ACCENT },
    line: { color: COLOR_ACCENT, width: 0 },
  });

  slide1.addText('iHAZARD • SISTEM KESELAMATAN & LAPORAN TAMBANG', {
    x: MARGIN_X,
    y: 1.6,
    w: 11.5,
    h: 0.35,
    fontSize: 13,
    color: COLOR_ACCENT,
    bold: true,
    fontFace: 'Segoe UI',
  });

  slide1.addText('MONTHLY SHE MANAGEMENT PERFORMANCE REVIEW', {
    x: MARGIN_X,
    y: 2.1,
    w: 11.5,
    h: 1.4,
    fontSize: 28,
    color: COLOR_WHITE,
    bold: true,
    fontFace: 'Segoe UI',
  });

  slide1.addText(
    `Periode Laporan: ${report.periodMonth}   |   Komite Keselamatan Pertambangan (P2K3)   |   Kepmen ESDM 1827.K/2018`,
    {
      x: MARGIN_X,
      y: 3.6,
      w: 11.5,
      h: 0.4,
      fontSize: 12,
      color: COLOR_MUTED,
      fontFace: 'Segoe UI',
    }
  );

  slide1.addShape('roundRect', {
    x: MARGIN_X,
    y: 4.5,
    w: 5.5,
    h: 0.9,
    fill: { color: '065F46' },
    line: { color: COLOR_GREEN, width: 1.5 },
    rectRadius: 0.15,
  });

  slide1.addText('KINERJA K3: ZERO FATALITY • ZERO LTI', {
    x: MARGIN_X,
    y: 4.5,
    w: 5.5,
    h: 0.9,
    align: 'center',
    fontSize: 13,
    color: COLOR_WHITE,
    bold: true,
    fontFace: 'Segoe UI',
  });

  slide1.addText('LAPORAN PERTANGGUNGJAWABAN BULANAN KEPADA DIREKSI & KTT', {
    x: MARGIN_X,
    y: 6.8,
    w: 11.5,
    h: 0.3,
    fontSize: 9.5,
    color: '94A3B8',
    fontFace: 'Segoe UI',
  });

  // ==========================================
  // SLIDE 2: EXECUTIVE DASHBOARD & MILESTONE
  // ==========================================
  const slide2 = pptx.addSlide();
  slide2.background = { color: COLOR_LIGHT_BG };
  addSlideHeader(
    slide2,
    'EXECUTIVE DASHBOARD & JAM KERJA AMAN',
    `Pencapaian jam kerja selamat dan rasio frekuensi cedera periode ${report.periodMonth}`
  );

  // Big Milestone Card YTD
  slide2.addShape('roundRect', {
    x: MARGIN_X,
    y: 1.6,
    w: USABLE_WIDTH,
    h: 1.7,
    fill: { color: COLOR_PRIMARY },
    rectRadius: 0.15,
  });

  slide2.addText('AKUMULASI JAM KERJA SELAMAT TANPA KECELAKAAN (YEAR-TO-DATE):', {
    x: MARGIN_X + 0.3,
    y: 1.85,
    w: USABLE_WIDTH - 0.6,
    h: 0.3,
    fontSize: 11,
    color: COLOR_ACCENT,
    bold: true,
    fontFace: 'Segoe UI',
  });

  slide2.addText(`${report.safeManHoursYTD.toLocaleString('id-ID')} MAN HOURS`, {
    x: MARGIN_X + 0.3,
    y: 2.2,
    w: USABLE_WIDTH - 0.6,
    h: 0.8,
    fontSize: 34,
    color: COLOR_WHITE,
    bold: true,
    fontFace: 'Segoe UI',
  });

  // 3 Metric Cards below
  const monthlyCards = [
    { title: 'JAM KERJA BULAN INI', val: `${report.safeManHoursMonth.toLocaleString('id-ID')}`, sub: 'Man Hours Operasional' },
    { title: 'LTIFR (Lost Time Injury Rate)', val: `${report.ltifr}`, sub: 'Target Standar K3: 0.00' },
    { title: 'TRIFR (Total Recordable Rate)', val: `${report.trifr}`, sub: 'Target Standar K3: < 1.00' },
  ];

  const mCardW = (USABLE_WIDTH - 0.48) / 3;
  monthlyCards.forEach((c, idx) => {
    const xPos = MARGIN_X + idx * (mCardW + 0.24);
    slide2.addShape('roundRect', {
      x: xPos,
      y: 3.6,
      w: mCardW,
      h: 2.9,
      fill: { color: COLOR_WHITE },
      line: { color: COLOR_BORDER, width: 1.5 },
      rectRadius: 0.15,
    });

    slide2.addText(c.title, {
      x: xPos + 0.2,
      y: 3.85,
      w: mCardW - 0.4,
      h: 0.35,
      fontSize: 10,
      color: COLOR_MUTED,
      bold: true,
      fontFace: 'Segoe UI',
    });

    slide2.addText(c.val, {
      x: xPos + 0.2,
      y: 4.4,
      w: mCardW - 0.4,
      h: 0.8,
      fontSize: 26,
      color: COLOR_GREEN,
      bold: true,
      fontFace: 'Segoe UI',
    });

    slide2.addText(c.sub, {
      x: xPos + 0.2,
      y: 5.4,
      w: mCardW - 0.4,
      h: 0.4,
      fontSize: 9.5,
      color: COLOR_MUTED,
      fontFace: 'Segoe UI',
    });
  });

  addSlideFooter(slide2, 2, TOTAL_SLIDES);

  // ==========================================
  // SLIDE 3: LEADING INDICATORS COMPLIANCE
  // ==========================================
  const slide3 = pptx.addSlide();
  slide3.background = { color: COLOR_LIGHT_BG };
  addSlideHeader(
    slide3,
    'PERSENTASE KEPATUHAN LEADING INDICATORS',
    'Evaluasi kepatuhan terhadap indikator proaktif keselamatan operasional tambang'
  );

  const leading = [
    { label: 'Penyelesaian Temuan Bahaya / Hazard Resolution (< 14 Hari)', percent: report.hazardResolutionRatePercent, target: 'Target: >= 85%' },
    { label: 'Pelaksanaan Inspeksi Gabungan K3 Terencana (Planned Inspection)', percent: report.plannedInspectionRatePercent, target: 'Target: 100%' },
    { label: 'Kehadiran Pekerja dalam Safety Induction & Refresher Training', percent: report.safetyTrainingAttendancePercent, target: 'Target: >= 90%' },
    { label: 'Tingkat Kepatuhan Prosedur Kritis Tambang (Golden Rules Compliance)', percent: report.goldenRulesCompliancePercent, target: 'Target: >= 95%' },
  ];

  leading.forEach((item, idx) => {
    const yPos = 1.6 + idx * 1.25;
    slide3.addShape('roundRect', {
      x: MARGIN_X,
      y: yPos,
      w: USABLE_WIDTH,
      h: 1.05,
      fill: { color: COLOR_WHITE },
      line: { color: COLOR_BORDER, width: 1.5 },
      rectRadius: 0.12,
    });

    slide3.addText(item.label, {
      x: MARGIN_X + 0.3,
      y: yPos + 0.22,
      w: 8.0,
      h: 0.35,
      fontSize: 12,
      bold: true,
      color: COLOR_PRIMARY,
      fontFace: 'Segoe UI',
    });

    slide3.addText(item.target, {
      x: MARGIN_X + 0.3,
      y: yPos + 0.58,
      w: 8.0,
      h: 0.3,
      fontSize: 9.5,
      color: COLOR_MUTED,
      fontFace: 'Segoe UI',
    });

    slide3.addText(`${item.percent}%`, {
      x: 10.0,
      y: yPos + 0.25,
      w: 2.2,
      h: 0.55,
      fontSize: 22,
      bold: true,
      color: item.percent >= 90 ? COLOR_GREEN : COLOR_ORANGE,
      align: 'right',
      fontFace: 'Segoe UI',
    });
  });

  addSlideFooter(slide3, 3, TOTAL_SLIDES);

  // ==========================================
  // SLIDE 4: PENGELOLAAN LINGKUNGAN PERTAMBANGAN
  // ==========================================
  const slide4 = pptx.addSlide();
  slide4.background = { color: COLOR_LIGHT_BG };
  addSlideHeader(
    slide4,
    'KINERJA PENGELOLAAN LINGKUNGAN TAMBANG',
    'Realisasi pengelolaan limbah B3, kualitas air limpasan, dan progres reklamasi lahan'
  );

  const rightX = MARGIN_X + halfW + 0.3;

  // Box 1: Limbah B3
  slide4.addShape('roundRect', {
    x: MARGIN_X,
    y: 1.6,
    w: halfW,
    h: 4.9,
    fill: { color: COLOR_WHITE },
    line: { color: COLOR_BORDER, width: 1.5 },
    rectRadius: 0.15,
  });

  slide4.addText('PENGELOLAAN LIMBAH BAHAN BERBAHAYA & BERACUN (B3)', {
    x: MARGIN_X + 0.3,
    y: 1.85,
    w: halfW - 0.6,
    h: 0.4,
    fontSize: 11,
    bold: true,
    color: COLOR_ORANGE,
    fontFace: 'Segoe UI',
  });

  slide4.addText(`${report.b3WasteVolumeTons} TON`, {
    x: MARGIN_X + 0.3,
    y: 2.35,
    w: halfW - 0.6,
    h: 0.8,
    fontSize: 32,
    bold: true,
    color: COLOR_ORANGE,
    fontFace: 'Segoe UI',
  });

  slide4.addText(
    'Rincian Pengelolaan Limbah B3 Bulanan:\n' +
      '• Limbah oli bekas mesin alat berat dan pelumas hidrolik.\n' +
      '• Filter oli, filter solar, kain majun terkontaminasi, dan baterai/aki bekas.\n' +
      '• Seluruh limbah disimpan di TPS Limbah B3 berizin dan diserahterimakan kepada pihak ketiga berizin KLHK.',
    {
      x: MARGIN_X + 0.3,
      y: 3.3,
      w: halfW - 0.6,
      h: 2.8,
      fontSize: 10,
      color: COLOR_SECONDARY,
      fontFace: 'Segoe UI',
      lineSpacing: 18,
    }
  );

  // Box 2: Reklamasi & Revegetasi Lahan
  slide4.addShape('roundRect', {
    x: rightX,
    y: 1.6,
    w: halfW,
    h: 4.9,
    fill: { color: COLOR_WHITE },
    line: { color: COLOR_BORDER, width: 1.5 },
    rectRadius: 0.15,
  });

  slide4.addText('PROGRES REKLAMASI & REVEGETASI LAHAN TAMBANG', {
    x: rightX + 0.3,
    y: 1.85,
    w: halfW - 0.6,
    h: 0.4,
    fontSize: 11,
    bold: true,
    color: COLOR_GREEN,
    fontFace: 'Segoe UI',
  });

  slide4.addText(`${report.reclamationLandHa} HEKTAR`, {
    x: rightX + 0.3,
    y: 2.35,
    w: halfW - 0.6,
    h: 0.8,
    fontSize: 32,
    bold: true,
    color: COLOR_GREEN,
    fontFace: 'Segoe UI',
  });

  slide4.addText(
    'Realisasi Revegetasi Sesuai Dokumen Rencana Reklamasi:\n' +
      '• Penataan lahan dan penebaran tanah pucuk (top soil) pada disposal area final.\n' +
      '• Penanaman tanaman pionir (cover crops) jenis Centrosema dan pohon fast-growing (Sengon, Johar).\n' +
      '• Pemeliharaan tanaman dan penyulaman pohon pada area revegetasi tahun sebelumnya.',
    {
      x: rightX + 0.3,
      y: 3.3,
      w: halfW - 0.6,
      h: 2.8,
      fontSize: 10,
      color: COLOR_SECONDARY,
      fontFace: 'Segoe UI',
      lineSpacing: 18,
    }
  );

  addSlideFooter(slide4, 4, TOTAL_SLIDES);

  // ==========================================
  // SLIDE 5: EVALUASI P2K3 & REKOMENDASI STRATEGIS
  // ==========================================
  const slide5 = pptx.addSlide();
  slide5.background = { color: COLOR_LIGHT_BG };
  addSlideHeader(
    slide5,
    'EVALUASI KOMITE P2K3 & REKOMENDASI STRATEGIS',
    'Kesepakatan rapat pleno P2K3 bulanan dan arahan perbaikan berkelanjutan'
  );

  slide5.addShape('roundRect', {
    x: MARGIN_X,
    y: 1.6,
    w: USABLE_WIDTH,
    h: 4.9,
    fill: { color: COLOR_WHITE },
    line: { color: COLOR_BORDER, width: 1.5 },
    rectRadius: 0.15,
  });

  slide5.addText('NOTULENSI KESEPAKATAN & ARAHAN STRATEGIS KOMITE K3LH:', {
    x: MARGIN_X + 0.4,
    y: 1.9,
    w: USABLE_WIDTH - 0.8,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: COLOR_PRIMARY,
    fontFace: 'Segoe UI',
  });

  slide5.addText(report.p2k3Notes, {
    x: MARGIN_X + 0.4,
    y: 2.4,
    w: USABLE_WIDTH - 0.8,
    h: 3.8,
    fontSize: 11,
    color: COLOR_SECONDARY,
    fontFace: 'Segoe UI',
    lineSpacing: 20,
  });

  addSlideFooter(slide5, 5, TOTAL_SLIDES);

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
