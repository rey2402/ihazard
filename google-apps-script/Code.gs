/**
 * ==============================================================================
 * iHazard - Google Apps Script Backend & Google Drive Storage Engine
 * ==============================================================================
 * Fungsi:
 * 1. Menerima laporan bahaya dari web app iHazard (POST).
 * 2. Mengunggah foto bukti temuan & foto bukti perbaikan ke folder khusus Google Drive.
 * 3. Menyimpan data langsung ke Google Sheets dengan aman & anti gagal.
 * 4. Melakukan UPSERT (Update status jika tiket sudah ada, Insert jika baru).
 * 5. Mengirim notifikasi email otomatis jika temuan memiliki risiko TINGGI (High Risk).
 * 6. Mengembalikan seluruh data sebagai JSON API (GET) untuk sinkronisasi dashboard.
 * ==============================================================================
 */

// Konfigurasi Nama Folder Drive & Nama Sheet
var FOLDER_NAME = 'iHazard_Evidence_Drive';
var SHEET_NAME = 'Hazard_Reports';

// Opsional: Masukkan email Tim SHE untuk menerima notifikasi bahaya risiko tinggi
var SHE_ALERT_EMAIL = ''; // Contoh: 'she.team@miningcompany.com' (bisa dikosongkan jika belum perlu)

// Opsional: API Secret untuk memvalidasi request dari frontend (keamanan tambahan)
var API_SECRET = ''; // Contoh: 'ihazard-secure-token-2026'

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
 * Handle HTTP GET - Mengembalikan data laporan bahaya sebagai JSON
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateSheet(ss);
    var data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return jsonResponse({ status: 'success', data: [] });
    }

    var reports = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[0]) continue; // Lewati jika tiket ID kosong

      reports.push({
        id: String(row[0]),
        timestamp: row[1] instanceof Date ? row[1].toISOString() : String(row[1]),
        reporterName: String(row[2]),
        reporterNik: String(row[3]),
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
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ status: 'error', message: 'Payload kosong' });
    }

    var payload = JSON.parse(e.postData.contents);

    // Keamanan: Validasi API Secret jika diaktifkan
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

    // Simpan foto ke Google Drive dengan Safe-Guard (Anti Gagal)
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
      // Jika izin Drive belum diotorisasi di editor, tetap lanjutkan simpan ke Google Sheet!
      Logger.log('Peringatan Drive (Belum diotorisasi): ' + driveErr.toString());

      // Cegah error batas 50rb karakter cell Google Sheets jika belum di-upload ke Drive
      if (photoUrl && photoUrl.length > 45000) {
        photoUrl = '[Foto Lapangan - Buka Editor Apps Script dan jalankan authorizeDriveAccess untuk simpan ke Drive]';
      }
      if (closurePhotoUrl && closurePhotoUrl.length > 45000) {
        closurePhotoUrl = '[Foto Perbaikan - Buka Editor Apps Script dan jalankan authorizeDriveAccess untuk simpan ke Drive]';
      }
    }

    // 3. Susun data baris sesuai struktur tabel 19 kolom
    var rowData = [
      tiketId,
      timestamp,
      payload.reporterName || '',
      payload.reporterNik || '',
      payload.department || '',
      payload.area || '',
      payload.locationDetail || '',
      payload.hazardType || '',
      payload.category || '',
      payload.riskLevel || '',
      payload.description || '',
      photoUrl,
      payload.immediateAction || '',
      payload.status || 'Open',
      payload.picPerbaikan || '',
      payload.closedDate || '',
      closurePhotoUrl,
      payload.closureNotes || '',
      payload.closedBy || '',
    ];

    // 4. Logika UPSERT (Cari apakah tiketId sudah ada sebelumnya di Kolom A)
    var data = sheet.getDataRange().getValues();
    var existingRowIndex = -1;

    for (var r = 1; r < data.length; r++) {
      if (String(data[r][0]) === tiketId) {
        existingRowIndex = r + 1; // 1-indexed untuk Google Sheets
        break;
      }
    }

    var action = 'created';
    if (existingRowIndex > 0) {
      // Tiket sudah ada -> UPDATE baris yang ada
      sheet.getRange(existingRowIndex, 1, 1, rowData.length).setValues([rowData]);
      action = 'updated';
    } else {
      // Tiket baru -> INSERT baris di akhir
      sheet.appendRow(rowData);
    }

    // 5. Notifikasi Email Otomatis untuk Temuan Risiko TINGGI (High Risk)
    if (payload.riskLevel === 'Tinggi' && payload.status !== 'Closed' && SHE_ALERT_EMAIL) {
      try {
        sendHighRiskEmailAlert(payload, photoUrl);
      } catch (mailErr) {
        Logger.log('Mail warning: ' + mailErr.toString());
      }
    }

    return jsonResponse({
      status: 'success',
      action: action,
      tiketId: tiketId,
      photoDriveUrl: photoUrl,
      closureDriveUrl: closurePhotoUrl,
    });
  } catch (error) {
    return jsonResponse({ status: 'error', message: error.toString() });
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

    // Mengembalikan URL Drive yang mudah diakses
    return file.getUrl();
  } catch (e) {
    return base64Data; // Kembalikan data awal jika gagal
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

    // Buat Header Kolom
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

    // Format Header Style
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#F59E0B'); // Safety Amber
    headerRange.setFontColor('#0F172A'); // Slate 900
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
    // Abaikan jika mail quota habis atau email salah
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
