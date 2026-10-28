import { HazardReport } from '../types/hazard';

export const SHEETS_WEBHOOK_KEY = 'SHE_SHEETS_WEBHOOK_URL';
export const DEFAULT_SHEETS_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbwBk_JwNw4t1NK1KzpVjEN6tNY-WnVpR35HGx-ZXNDWcP737SwP43ofQ7oMvRBkrHI2/exec';

export function normalizeWebhookUrl(url: string | undefined | null): string {
  if (!url) return '';
  let trimmed = url.trim();
  if (trimmed.includes('script.google.com/macros/s/') && !trimmed.includes('/exec')) {
    trimmed = trimmed.replace(/\/?$/, '/exec');
  }
  return trimmed;
}

export function getActiveWebhookUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem(SHEETS_WEBHOOK_KEY);
    return normalizeWebhookUrl(custom) || DEFAULT_SHEETS_WEBHOOK_URL;
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
    // Tentukan aksi: jika status closed atau sudah memiliki PIC/closedDate, gunakan update_status
    const isUpdate = report.status === 'Closed' || !!report.closedDate || (report.status === 'In Progress' && !!report.picPerbaikan);
    const action = isUpdate ? 'update_status' : 'create_report';
    const adminPin = typeof window !== 'undefined' ? localStorage.getItem('SHE_CUSTOM_ADMIN_PIN') || '1234' : '1234';

    const payload = {
      action,
      adminPin: isUpdate ? adminPin : undefined,
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

export async function fetchHazardsFromGoogleSheets(webhookUrl?: string, nik?: string): Promise<HazardReport[] | null> {
  const targetUrl = normalizeWebhookUrl(webhookUrl) || getActiveWebhookUrl();
  if (!targetUrl) return null;

  try {
    let finalUrl = targetUrl;
    if (typeof window !== 'undefined') {
      const urlObj = new URL(targetUrl);
      const isAdmin = sessionStorage.getItem('SHE_ADMIN_SESSION') === 'active';
      if (isAdmin) {
        urlObj.searchParams.set('pin', localStorage.getItem('SHE_CUSTOM_ADMIN_PIN') || '1234');
      } else if (nik) {
        urlObj.searchParams.set('nik', nik);
      }
      finalUrl = urlObj.toString();
    }

    const response = await fetch(finalUrl);
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
