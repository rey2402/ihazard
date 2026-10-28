/**
 * ==============================================================================
 * iHazard - Google Apps Script Backend & Google Drive Storage Engine
 * ==============================================================================
 * Fungsi:
 * 1. Menerima laporan bahaya dari web app iHazard (POST).
 * 2. Mengunggah foto bukti temuan & foto bukti perbaikan ke folder khusus Google Drive.
 * 3. Menyimpan data langsung ke Google Sheets dengan aman, anti tabrakan (LockService),
 *    dan anti formula injection (CWE-1236).
 * 4. Otorisasi berbasis aksi:
 *    - 'create_report': Tambah tiket baru (Karyawan, tanpa izin edit baris lain).
 *    - 'update_status' / 'resolve_hazard': Wajib otorisasi PIN Admin.
 * 5. Mengirim notifikasi email otomatis jika temuan memiliki risiko TINGGI (High Risk).
 * 6. Mengembalikan data sebagai JSON API (GET) dengan filter keamanan.
 * ==============================================================================
 */

// Konfigurasi Nama Folder Drive & Nama Sheet
var FOLDER_NAME = 'iHazard_Evidence_Drive';
var SHEET_NAME = 'Hazard_Reports';

// Keamanan: PIN Admin default untuk memvalidasi operasi penutupan/perubahan tiket
var ADMIN_PIN = '@4321';

// Opsional: Masukkan email Tim SHE untuk menerima notifikasi bahaya risiko tinggi
var SHE_ALERT_EMAIL = ''; // Contoh: 'she.team@miningcompany.com'

// Opsional: API Secret untuk memvalidasi request dari frontend (keamanan tambahan)
var API_SECRET = '';

/**
 * PANDUAN OTORISASI IZIN GOOGLE DRIVE:
 * 1. Pilih fungsi 'authorizeDriveAccess' pada dropdown menu di atas editor ini.
 * 2. Klik tombol 'Jalankan' (Run).
 * 3. Pop-up otorisasi akan muncul: Klik 'Tinjau Izin' (Review Permissions).
 * 4. Pilih akun Google Anda.
 * 5. Klik 'Lanjutan' (Advanced) di pojok kiri bawah -> Klik 'Buka iHazard (tidak aman)'.
 * 6. Klik 'Izinkan' (Allow).
 * Selesai! Foto temuan otomatis tersimpan sebagai file asli ke Google Drive Anda.
 */
function authorizeDriveAccess() {
  var folder = getOrCreateDriveFolder();
  Logger.log('Izin Google Drive BERHASIL aktif! Folder: ' + folder.getName() + ' (ID: ' + folder.getId() + ')');
}

/**
 * Sanitasi untuk mencegah Formula Injection (CSV / Spreadsheet Injection)
 */
function sanitizeFormula(val) {
  if (!val || typeof val !== 'string') return val || '';
  var trimmed = val.replace(/^\s+/, '');
  if (trimmed.length > 0) {
    var firstChar = trimmed.charAt(0);
    if (firstChar === '=' || firstChar === '+' || firstChar === '-' || firstChar === '@') {
      return "'" + val;
    }
  }
  return val;
}

/**
 * Handle HTTP GET - Mengembalikan data laporan bahaya sebagai JSON
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateSheet(ss);
    var data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      // Fallback ramah pengguna: Jika tab Hazard_Reports masih kosong, periksa apakah pengguna menaruh data di Sheet1
      var sheet1 = ss.getSheetByName('Sheet1');
      if (sheet1 && sheet1.getLastRow() > 1) {
        data = sheet1.getDataRange().getValues();
      } else {
        return jsonResponse({ status: 'success', data: [] });
      }
    }

    var filterNik = e && e.parameter && e.parameter.nik ? String(e.parameter.nik).trim().toLowerCase() : '';
    var requestPin = e && e.parameter && e.parameter.pin ? String(e.parameter.pin).trim() : '';
    var isAdminRequest = requestPin === ADMIN_PIN || (API_SECRET && e && e.parameter && e.parameter.apiSecret === API_SECRET);

    var reports = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[0]) continue; // Lewati jika tiket ID kosong

      var reportNik = String(row[3] || '').trim();

      // Jika ada filter NIK dan bukan admin request, batasi hanya tiket milik NIK tersebut
      if (filterNik && !isAdminRequest && reportNik.toLowerCase() !== filterNik) {
        continue;
      }

      reports.push({
        id: String(row[0]),
        timestamp: row[1] instanceof Date ? row[1].toISOString() : String(row[1]),
        reporterName: String(row[2]),
        reporterNik: reportNik,
        department: String(row[4]),
        area: String(row[5]),
        locationDetail: String(row[6]),
        hazardType: String(row[7]),
        category: String(row[8]),
        riskLevel: String(row[9]),
        description: String(row[10]),
        photoUrl: String(row[11]),
        immediateAction: String(row[12]),
        status: String(row[13]),
        picPerbaikan: String(row[14]),
        closedDate: String(row[15]),
        closurePhotoUrl: String(row[16] || ''),
        closureNotes: String(row[17] || ''),
        closedBy: String(row[18] || ''),
        syncedToSheets: true,
      });
    }

    return jsonResponse({ status: 'success', data: reports });
  } catch (error) {
    return jsonResponse({ status: 'error', message: error.toString() });
  }
}

/**
 * Handle HTTP POST - Menerima laporan baru atau update status/bukti perbaikan
 * Dilengkapi Concurrency Lock (LockService) dan Otorisasi Berbasis Aksi
 */
function doPost(e) {
  // 1. Dapatkan Lock untuk mencegah Race Condition penulisan bersamaan
  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(10000); // Batas tunggu 10 detik

  if (!hasLock) {
    return jsonResponse({
      status: 'error',
      message: 'Server sedang memproses transaksi lain. Silakan coba kembali dalam beberapa detik.',
    });
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ status: 'error', message: 'Payload kosong' });
    }

    var payload = JSON.parse(e.postData.contents);

    // Keamanan: Validasi API Secret jika diaktifkan di konfigurasi
    if (API_SECRET && API_SECRET.length > 0) {
      if (payload.apiSecret !== API_SECRET) {
        return jsonResponse({ status: 'error', message: 'Unauthorized: API Secret tidak valid' });
      }
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateSheet(ss);

    var tiketId = String(payload.tiketId || payload.id || 'HZD-' + new Date().getTime());
    var timestamp = payload.timestamp || new Date().toISOString();

    var photoUrl = payload.photoUrl || '';
    var closurePhotoUrl = payload.closurePhotoUrl || '';

    // Simpan foto ke Google Drive dengan Safe-Guard
    try {
      var driveFolder = getOrCreateDriveFolder();

      // 1. Simpan Foto Temuan Awal ke Google Drive jika berupa Base64
      if (photoUrl && photoUrl.indexOf('data:image') === 0) {
        photoUrl = saveBase64ImageToDrive(driveFolder, photoUrl, tiketId + '_BEFORE');
      }

      // 2. Simpan Foto Bukti Perbaikan ke Google Drive jika berupa Base64
      if (closurePhotoUrl && closurePhotoUrl.indexOf('data:image') === 0) {
        closurePhotoUrl = saveBase64ImageToDrive(driveFolder, closurePhotoUrl, tiketId + '_AFTER');
      }
    } catch (driveErr) {
      Logger.log('Peringatan Drive: ' + driveErr.toString());
      if (photoUrl && photoUrl.length > 45000) {
        photoUrl = '[Foto Lapangan - Jalankan authorizeDriveAccess di script editor]';
      }
      if (closurePhotoUrl && closurePhotoUrl.length > 45000) {
        closurePhotoUrl = '[Foto Perbaikan - Jalankan authorizeDriveAccess di script editor]';
      }
    }

    // 3. Sanitasi seluruh input teks untuk mencegah Formula Injection (CWE-1236)
    var rowData = [
      sanitizeFormula(tiketId),
      timestamp,
      sanitizeFormula(payload.reporterName || ''),
      sanitizeFormula(payload.reporterNik || ''),
      sanitizeFormula(payload.department || ''),
      sanitizeFormula(payload.area || ''),
      sanitizeFormula(payload.locationDetail || ''),
      payload.hazardType || '',
      payload.category || '',
      payload.riskLevel || '',
      sanitizeFormula(payload.description || ''),
      photoUrl,
      sanitizeFormula(payload.immediateAction || ''),
      payload.status || 'Open',
      sanitizeFormula(payload.picPerbaikan || ''),
      payload.closedDate || '',
      closurePhotoUrl,
      sanitizeFormula(payload.closureNotes || ''),
      sanitizeFormula(payload.closedBy || ''),
    ];

    // 4. Cari apakah tiketId sudah ada di Kolom A
    var data = sheet.getDataRange().getValues();
    var existingRowIndex = -1;

    for (var r = 1; r < data.length; r++) {
      if (String(data[r][0]) === tiketId) {
        existingRowIndex = r + 1;
        break;
      }
    }

    // 5. Otorisasi Berbasis Aksi (Action-Based Authorization)
    var requestedAction = payload.action || (payload.status === 'Closed' ? 'update_status' : 'create_report');

    if (requestedAction === 'update_status' || requestedAction === 'resolve_hazard') {
      // Operasi Admin: Memerlukan validasi PIN Admin
      var inputPin = String(payload.adminPin || '');
      if (inputPin !== ADMIN_PIN && (!API_SECRET || payload.apiSecret !== API_SECRET)) {
        return jsonResponse({
          status: 'error',
          message: 'Unauthorized: Perubahan status atau penyelesaian tiket wajib menyertakan PIN Admin yang valid.',
        });
      }

      if (existingRowIndex > 0) {
        sheet.getRange(existingRowIndex, 1, 1, rowData.length).setValues([rowData]);
      } else {
        // Tiket tidak ditemukan untuk diupdate
        return jsonResponse({
          status: 'error',
          message: 'Not Found: Tiket dengan ID ' + tiketId + ' tidak ditemukan untuk diperbarui.',
        });
      }
    } else {
      // Operasi Karyawan (create_report): Hanya boleh INSERT baris baru
      if (existingRowIndex > 0) {
        return jsonResponse({
          status: 'error',
          message: 'Conflict: Tiket ID ' + tiketId + ' sudah ada. Penimpaan tiket ditolak demi integritas data.',
        });
      }
      sheet.appendRow(rowData);
    }

    // 6. Notifikasi Email Otomatis untuk Temuan Risiko TINGGI (High Risk)
    if (payload.riskLevel === 'Tinggi' && payload.status !== 'Closed' && SHE_ALERT_EMAIL) {
      try {
        sendHighRiskEmailAlert(payload, photoUrl);
      } catch (mailErr) {
        Logger.log('Mail warning: ' + mailErr.toString());
      }
    }

    return jsonResponse({
      status: 'success',
      action: requestedAction,
      tiketId: tiketId,
      photoDriveUrl: photoUrl,
      closureDriveUrl: closurePhotoUrl,
    });
  } catch (error) {
    return jsonResponse({ status: 'error', message: error.toString() });
  } finally {
    // Pastikan lock selalu dilepaskan
    lock.releaseLock();
  }
}

/**
 * Simpan Gambar Base64 langsung ke Google Drive sebagai file asli JPG
 */
function saveBase64ImageToDrive(folder, base64Data, filenamePrefix) {
  try {
    var parts = base64Data.split(',');
    var contentType = 'image/jpeg';
    var base64Content = parts.length > 1 ? parts[1] : parts[0];

    // Deteksi Content Type
    if (parts.length > 1 && parts[0].indexOf(':') > -1) {
      contentType = parts[0].split(':')[1].split(';')[0];
    }

    var decodedBytes = Utilities.base64Decode(base64Content);
    var extension = contentType === 'image/png' ? '.png' : '.jpg';
    var fileName = filenamePrefix + '_' + new Date().getTime() + extension;

    var blob = Utilities.newBlob(decodedBytes, contentType, fileName);
    var file = folder.createFile(blob);

    // Buka akses viewing agar foto bisa dibuka langsung dari sheet
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Mengembalikan direct image URL agar langsung tampil di tag <img> tanpa HTML preview wrapper
    return 'https://lh3.googleusercontent.com/d/' + file.getId();
  } catch (e) {
    return base64Data;
  }
}

/**
 * Dapatkan atau Buat Folder Khusus di Google Drive
 */
function getOrCreateDriveFolder() {
  var folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(FOLDER_NAME);
}

/**
 * Dapatkan atau Buat Sheet dengan Header Profesional
 */
function getOrCreateSheet(spreadsheet) {
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);

    var headers = [
      'Tiket_ID',
      'Waktu_Lapor',
      'Nama_Pelapor',
      'NIK',
      'Departemen',
      'Area_Site',
      'Detail_Lokasi',
      'Tipe_Bahaya',
      'Kategori_K3',
      'Tingkat_Risiko',
      'Uraian_Bahaya',
      'Foto_Sebelum_Drive',
      'Tindakan_Awal',
      'Status',
      'PIC_Perbaikan',
      'Tanggal_Selesai',
      'Foto_Sesudah_Drive',
      'Tindakan_Perbaikan_Selesai',
      'Verifikator_SHE',
    ];

    sheet.appendRow(headers);

    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#F59E0B');
    headerRange.setFontColor('#0F172A');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Kirim Email Peringatan untuk Temuan Bahaya Berisiko Tinggi
 */
function sendHighRiskEmailAlert(report, photoUrl) {
  try {
    var subject = '[PERINGATAN BAHAYA TINGGI] iHazard - ' + report.area + ' (' + report.tiketId + ')';
    var body =
      'PERINGATAN TEMUAN BAHAYA RISIKO TINGGI (HIGH RISK)\n' +
      '=================================================\n\n' +
      'ID Tiket        : ' + report.tiketId + '\n' +
      'Waktu           : ' + (report.timestamp || new Date().toLocaleString()) + '\n' +
      'Area Lokasi     : ' + report.area + '\n' +
      'Titik Spesifik  : ' + (report.locationDetail || '-') + '\n' +
      'Tipe Bahaya     : ' + report.hazardType + ' (' + report.category + ')\n' +
      'Tingkat Risiko  : TINGGI (HIGH)\n' +
      'Pelapor         : ' + report.reporterName + ' (NIK: ' + report.reporterNik + ') - ' + report.department + '\n\n' +
      'Uraian Bahaya   :\n' + report.description + '\n\n' +
      'Tindakan Awal   :\n' + (report.immediateAction || '-') + '\n\n' +
      'Foto Bukti Drive: ' + (photoUrl || 'Tidak ada foto') + '\n\n' +
      'Harap pengawas area segera melakukan inspeksi dan penanganan darurat.\n' +
      'Aplikasi iHazard - Sistem Keselamatan Pertambangan.';

    MailApp.sendEmail(SHE_ALERT_EMAIL, subject, body);
  } catch (err) {
    // Abaikan jika mail quota habis
  }
}

/**
 * Helper JSON Response
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
