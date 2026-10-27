import ExcelJS from 'exceljs';
import { HazardReport } from '../types/hazard';

/**
 * Service to generate and download professional Microsoft Excel (.xlsx) workbooks
 * for Mining SHE / K3LH Hazard Reports.
 */
export async function exportReportsToExcel(
  reports: HazardReport[],
  customFileName?: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'iHazard System';
  workbook.lastModifiedBy = 'iHazard SHE Officer';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ---------------------------------------------------------
  // SHEET 1: DETAIL LAPORAN HAZARD
  // ---------------------------------------------------------
  const sheet = workbook.addWorksheet('Data Laporan iHazard', {
    views: [{ showGridLines: true }],
    pageSetup: { orientation: 'landscape', paperSize: 9 }, // A4 Landscape
  });

  // 1. Title Banner
  sheet.mergeCells('A1:Q1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'iHAZARD - LAPORAN TEMUAN KESELAMATAN & BAHAYA TAMBANG';
  titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' }, // Slate 800
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 34;

  // 2. Subtitle / Metadata
  sheet.mergeCells('A2:Q2');
  const subCell = sheet.getCell('A2');
  const exportDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  subCell.value = `Standar Keselamatan Operasional Pertambangan (Kepmen ESDM 1827.K/30/MEM/2018)  |  Diekspor pada: ${exportDate}  |  Total Temuan: ${reports.length}`;
  subCell.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FF475569' } };
  subCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' }, // Slate 100
  };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(2).height = 20;

  // Empty separator row
  sheet.getRow(3).height = 10;

  // 3. Table Column Headers
  const headers = [
    { key: 'no', header: 'No', width: 6 },
    { key: 'id', header: 'No. Tiket', width: 18 },
    { key: 'timestamp', header: 'Tanggal & Jam', width: 18 },
    { key: 'reporterName', header: 'Nama Pelapor', width: 20 },
    { key: 'reporterNik', header: 'NIK / ID', width: 14 },
    { key: 'department', header: 'Departemen', width: 22 },
    { key: 'area', header: 'Area Lokasi', width: 24 },
    { key: 'locationDetail', header: 'Titik Spesifik', width: 24 },
    { key: 'hazardType', header: 'Tipe Bahaya', width: 14 },
    { key: 'category', header: 'Kategori Bahaya', width: 28 },
    { key: 'riskLevel', header: 'Tingkat Risiko', width: 16 },
    { key: 'description', header: 'Uraian Temuan Bahaya', width: 36 },
    { key: 'immediateAction', header: 'Tindakan Langsung / Koreksi', width: 30 },
    { key: 'status', header: 'Status Progres', width: 15 },
    { key: 'picPerbaikan', header: 'PIC Perbaikan', width: 18 },
    { key: 'tanggalSelesai', header: 'Tgl Selesai', width: 14 },
    { key: 'syncedToSheets', header: 'Sync Sheets', width: 14 },
  ];

  sheet.columns = headers.map((h) => ({
    key: h.key,
    width: h.width,
  }));

  const headerRow = sheet.getRow(4);
  headerRow.height = 28;
  headers.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h.header;
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF59E0B' }, // Safety Amber #F59E0B
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FFD97706' } },
      bottom: { style: 'medium', color: { argb: 'FFD97706' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    };
  });

  // 4. Data Rows
  reports.forEach((report, index) => {
    const rowNum = index + 5;
    const row = sheet.getRow(rowNum);
    row.height = 24;

    const formattedDate = report.timestamp
      ? new Date(report.timestamp).toLocaleString('id-ID', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '-';

    row.values = [
      index + 1,
      report.id,
      formattedDate,
      report.reporterName,
      report.reporterNik,
      report.department,
      report.area,
      report.locationDetail || '-',
      report.hazardType === 'KTA' ? 'KTA (Kondisi)' : 'TTA (Tindakan)',
      report.category,
      report.riskLevel,
      report.description,
      report.immediateAction || '-',
      report.status,
      report.picPerbaikan || '-',
      report.closedDate || '-',
      report.syncedToSheets ? 'Tersinkron' : 'Lokal',
    ];

    // Zebra background
    const isEven = index % 2 === 0;
    const baseBgColor = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    // Borders & Base Styles
    for (let c = 1; c <= headers.length; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Segoe UI', size: 9, color: { argb: 'FF1E293B' } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: baseBgColor },
      };

      // Alignment rules
      if (c === 1 || c === 2 || c === 5 || c === 9 || c === 11 || c === 14 || c === 16 || c === 17) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (c === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: c === 12 || c === 13 };
      }
    }

    // Special highlights for Risk Level (Col 11)
    const riskCell = row.getCell(11);
    if (report.riskLevel === 'Tinggi') {
      riskCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
      riskCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF991B1B' } };
    } else if (report.riskLevel === 'Sedang') {
      riskCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
      riskCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF92400E' } };
    } else {
      riskCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
      riskCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF166534' } };
    }

    // Special highlights for Status (Col 14)
    const statusCell = row.getCell(14);
    if (report.status === 'Closed') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
      statusCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF065F46' } };
    } else if (report.status === 'In Progress') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
      statusCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF1E40AF' } };
    } else {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEDD5' } };
      statusCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF9A3412' } };
    }

    // Highlight Tipe Bahaya (Col 9)
    const typeCell = row.getCell(9);
    if (report.hazardType === 'TTA') {
      typeCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFDC2626' } };
    } else {
      typeCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFD97706' } };
    }
  });

  // ---------------------------------------------------------
  // SHEET 2: RINGKASAN STATISTIK & KPI
  // ---------------------------------------------------------
  const summarySheet = workbook.addWorksheet('Ringkasan Statistik KPI', {
    views: [{ showGridLines: true }],
  });

  summarySheet.columns = [
    { header: '', width: 4 },
    { header: '', width: 28 },
    { header: '', width: 16 },
    { header: '', width: 28 },
  ];

  // Header Ringkasan
  summarySheet.mergeCells('B2:D2');
  const sumTitle = summarySheet.getCell('B2');
  sumTitle.value = 'RINGKASAN STATISTIK KESELAMATAN (SHE)';
  sumTitle.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  sumTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  sumTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  summarySheet.getRow(2).height = 28;

  const totalReports = reports.length;
  const ktaCount = reports.filter((r) => r.hazardType === 'KTA').length;
  const ttaCount = reports.filter((r) => r.hazardType === 'TTA').length;
  const highRiskCount = reports.filter((r) => r.riskLevel === 'Tinggi').length;
  const medRiskCount = reports.filter((r) => r.riskLevel === 'Sedang').length;
  const lowRiskCount = reports.filter((r) => r.riskLevel === 'Rendah').length;
  const closedCount = reports.filter((r) => r.status === 'Closed').length;
  const progressCount = reports.filter((r) => r.status === 'In Progress').length;
  const openCount = reports.filter((r) => r.status === 'Open').length;
  const closureRate = totalReports > 0 ? ((closedCount / totalReports) * 100).toFixed(1) : '0';

  const summaryData = [
    ['Total Temuan Hazard Terdata', totalReports, 'Seluruh laporan masuk'],
    ['Kondisi Tidak Aman (KTA)', ktaCount, `${totalReports > 0 ? ((ktaCount / totalReports) * 100).toFixed(0) : 0}% dari total`],
    ['Tindakan Tidak Aman (TTA)', ttaCount, `${totalReports > 0 ? ((ttaCount / totalReports) * 100).toFixed(0) : 0}% dari total`],
    ['Risiko Tinggi (High)', highRiskCount, 'Butuh penanganan prioritas < 24 jam'],
    ['Risiko Sedang (Medium)', medRiskCount, 'Tenggat perbaikan 3x24 jam'],
    ['Risiko Rendah (Low)', lowRiskCount, 'Tindakan perbaikan rutin'],
    ['Status Selesai (Closed)', closedCount, 'Telah diverifikasi SHE'],
    ['Status Dalam Progres', progressCount, 'Sedang dalam tindakan PIC'],
    ['Status Terbuka (Open)', openCount, 'Menunggu tindak lanjut'],
    ['Tingkat Penyelesaian (Closure Rate)', `${closureRate}%`, 'Target standar K3LH: >= 85%'],
  ];

  summaryData.forEach((row, i) => {
    const rowNum = i + 4;
    const r = summarySheet.getRow(rowNum);
    r.height = 22;
    r.getCell(2).value = row[0];
    r.getCell(3).value = row[1];
    r.getCell(4).value = row[2];

    r.getCell(2).font = { name: 'Segoe UI', size: 10, bold: i === 0 || i === 9 };
    r.getCell(3).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    r.getCell(4).font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FF64748B' } };

    r.getCell(2).border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
    r.getCell(3).border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
    r.getCell(4).border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };

    r.getCell(3).alignment = { horizontal: 'center' };
  });

  // ---------------------------------------------------------
  // GENERATE AND TRIGGER BROWSER DOWNLOAD (.xlsx)
  // ---------------------------------------------------------
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const fileName =
    customFileName ||
    `Laporan_iHazard_Mining_${new Date().toISOString().slice(0, 10)}.xlsx`;

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
