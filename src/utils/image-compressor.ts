/**
 * Utility to compress images in-browser using HTML5 Canvas
 * Keeps Google Apps Script & Google Drive payloads lightweight and fast (< 300KB)
 */
export async function compressImageFile(file: File, maxWidth = 1200, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    // Basic file type security validation
    if (!file.type.startsWith('image/')) {
      reject(new Error('File yang diunggah harus berupa gambar (JPEG, PNG, WebP)'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak valid atau rusak'));
      img.onload = () => {
        try {
          const maxDimension = maxWidth; // Default 1200px (cocok untuk HP portrait & landscape)
          let width = img.width;
          let height = img.height;

          // Skala proporsional untuk foto portrait maupun landscape
          if (width > maxDimension || height > maxDimension) {
            if (width >= height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          // Gunakan algoritma smoothing kualitas tinggi agar tulisan, rambu K3, dan retakan bahaya tetap tajam
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch {
          // Fallback to original base64 if canvas fails
          resolve(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
