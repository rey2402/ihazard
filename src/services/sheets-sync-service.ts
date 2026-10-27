import { HazardReport } from '../types/hazard';

export const SHEETS_WEBHOOK_KEY = 'SHE_SHEETS_WEBHOOK_URL';

export async function syncHazardToGoogleSheets(
  report: HazardReport,
  webhookUrl?: string
): Promise<boolean> {
  const targetUrl = webhookUrl || localStorage.getItem(SHEETS_WEBHOOK_KEY);
  if (!targetUrl) {
    // Mode offline / belum memasukkan Webhook URL Google Sheets
    return false;
  }

  try {
    const payload = {
      tiketId: report.id,
      timestamp: report.timestamp,
      reporterName: report.reporterName,
      reporterNik: report.reporterNik,
      department: report.department,
      area: report.area,
      locationDetail: report.locationDetail,
      hazardType: report.hazardType,
      category: report.category,
      riskLevel: report.riskLevel,
      description: report.description,
      photoUrl: report.photoUrl,
      immediateAction: report.immediateAction || '',
      status: report.status,
      picPerbaikan: report.picPerbaikan || '',
    };

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (err) {
    console.warn('Gagal sinkronisasi ke Google Sheets:', err);
    return false;
  }
}
