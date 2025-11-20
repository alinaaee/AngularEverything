import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageCompressionService {

  /**
   * Compresses and resizes an image to reduce file size
   * @param file The original image file
   * @param maxWidth Maximum width (default: 800px)
   * @param maxHeight Maximum height (default: 800px)
   * @param quality JPEG quality 0-1 (default: 0.7)
   * @returns Promise with compressed base64 image
   */
  async compressImage(
    file: File,
    maxWidth: number = 800,
    maxHeight: number = 800,
    quality: number = 0.7
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Draw the resized image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = e.target.result;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Estimates the size of a base64 string in MB
   */
  getBase64SizeInMB(base64String: string): number {
    const sizeInBytes = (base64String.length * 3) / 4;
    return sizeInBytes / (1024 * 1024);
  }
}
