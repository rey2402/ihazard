import { HazardReport } from '../types/hazard';

export const SHEETS_WEBHOOK_KEY = 'SHE_SHEETS_WEBHOOK_URL';
export const DEFAULT_SHEETS_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbwjQ7IvKENqmyo_XEdQyQ51O0eFxRndVnMHXxHpy2v8g8W1L_cVSF5FKq6bE_Um8pjP/exec';

export function getActiveWebhookUrl(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(SHEETS_WEBHOOK_KEY) || DEFAULT_SHEETS_WEBHOOK_URL;
  }
  return DEFAULT_SHEETS_WEBHOOK_URL;
}

export async function syncHazardToGoogleSheets(
  report: HazardReport,
  webhookUrl?: string
): Promise<boolean> {
  const targetUrl = webhookUrl || getActiveWebhookUrl();
  if (!targetUrl) return false;

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
      closedDate: report.closedDate || '',
      closurePhotoUrl: report.closurePhotoUrl || '',
      closureNotes: report.closureNotes || '',
      closedBy: report.closedBy || '',
      apiSecret: (typeof window !== 'undefined' ? localStorage.getItem('SHE_API_SECRET') : '') || '',
    };

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return true;
      }
      return true;
    } catch (fetchErr) {
      // Browser fallback: Google Apps Script 302 redirect can trigger CORS block in some browsers
      // Using mode: 'no-cors' sends the payload to Google Sheets without crashing the client
      try {
        await fetch(targetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(payload),
        });
        return true;
      } catch (err2) {
        console.warn('Gagal sinkronisasi ke Google Sheets:', err2);
        return false;
      }
    }
  } catch (err) {
    console.warn('Gagal sinkronisasi ke Google Sheets:', err);
    return false;
  }
}

export async function fetchHazardsFromGoogleSheets(webhookUrl?: string): Promise<HazardReport[] | null> {
  const targetUrl = webhookUrl || getActiveWebhookUrl();
  if (!targetUrl) return null;

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) return null;
    const json = await response.json();
    if (json.status === 'success' && Array.isArray(json.data)) {
      return json.data as HazardReport[];
    }
    return null;
  } catch (err) {
    console.warn('Gagal mengambil data dari Google Sheets:', err);
    return null;
  }
}
