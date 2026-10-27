/**
 * Utility untuk memformat URL gambar Google Drive menjadi Direct Embeddable Image URL
 * yang dapat dirender langsung oleh tag <img> di browser tanpa terhalang preview HTML.
 */

export function formatDriveImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Jika berupa data URL base64 atau blob, langsung kembalikan
  if (trimmed.startsWith('data:image') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Jika pesan peringatan otorisasi, kembalikan string kosong
  if (trimmed.startsWith('[Foto Lapangan') || trimmed.startsWith('[Foto Perbaikan')) {
    return '';
  }

  // Deteksi Google Drive File ID dari berbagai format link Drive
  const fileIdMatch =
    trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    // lh3.googleusercontent.com/d/{fileId} adalah endpoint resmi Google untuk direct high-res image
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return trimmed;
}

/**
 * Mendapatkan URL Google Drive asli untuk dibuka di tab baru (viewer mode)
 */
export function getDriveViewerUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  const fileIdMatch =
    trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);

  if (fileIdMatch && fileIdMatch[1]) {
    return `https://drive.google.com/file/d/${fileIdMatch[1]}/view?usp=sharing`;
  }
  return null;
}
