import { describe, it, expect } from 'vitest';
import { formatDriveImageUrl, getDriveViewerUrl } from '../utils/drive-image';

describe('Drive Image Utility', () => {
  it('converts google drive file view link to direct lh3 image link', () => {
    const driveView = 'https://drive.google.com/file/d/1w8y5b6c7d8e9f/view?usp=drivesdk';
    expect(formatDriveImageUrl(driveView)).toBe('https://lh3.googleusercontent.com/d/1w8y5b6c7d8e9f');
  });

  it('converts google drive open?id link to direct lh3 image link', () => {
    const driveOpen = 'https://drive.google.com/open?id=1AbCdEfGhIjKlMn';
    expect(formatDriveImageUrl(driveOpen)).toBe('https://lh3.googleusercontent.com/d/1AbCdEfGhIjKlMn');
  });

  it('leaves base64 data unmodified', () => {
    const b64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';
    expect(formatDriveImageUrl(b64)).toBe(b64);
  });

  it('handles empty or warning strings gracefully', () => {
    expect(formatDriveImageUrl('')).toBe('');
    expect(formatDriveImageUrl(null)).toBe('');
    expect(formatDriveImageUrl('[Foto Lapangan - Jalankan authorizeDriveAccess]')).toBe('');
  });

  it('extracts drive viewer url correctly', () => {
    const driveView = 'https://drive.google.com/file/d/1w8y5b6c7d8e9f/view?usp=drivesdk';
    expect(getDriveViewerUrl(driveView)).toBe('https://drive.google.com/file/d/1w8y5b6c7d8e9f/view?usp=sharing');
  });
});
