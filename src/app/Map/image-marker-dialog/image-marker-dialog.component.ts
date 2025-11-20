import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ImageCompressionService } from '../image-compression.service';

@Component({
  selector: 'app-image-marker-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, FileUploadModule, ToastModule],
  providers: [MessageService],
  templateUrl: './image-marker-dialog.component.html',
  styleUrls: ['./image-marker-dialog.component.scss']
})
export class ImageMarkerDialogComponent {
  @Input() visible: boolean = false;
  @Input() mode: 'upload' | 'view' = 'upload';
  @Input() existingImage: string | null = null;
  @Input() coordinates: { lat: number; lng: number } | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() imageUploaded = new EventEmitter<string>();
  @Output() deleteMarker = new EventEmitter<void>();

  selectedImage: string | null = null;
  isCompressing: boolean = false;

  constructor(
    private imageCompressionService: ImageCompressionService,
    private messageService: MessageService
  ) {}

  onHide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.selectedImage = null;
    this.isCompressing = false;
  }

  async onNativeFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid File',
          detail: 'Please select an image file'
        });
        return;
      }

      try {
        this.isCompressing = true;

        // Compress the image (max 800x800, quality 0.7)
        this.selectedImage = await this.imageCompressionService.compressImage(
          file,
          800,
          800,
          0.7
        );

        const sizeInMB = this.imageCompressionService.getBase64SizeInMB(this.selectedImage);
        console.log(`Compressed image size: ${sizeInMB.toFixed(2)} MB`);

        this.messageService.add({
          severity: 'success',
          summary: 'Image Loaded',
          detail: `Image compressed to ${sizeInMB.toFixed(2)} MB`
        });

      } catch (error) {
        console.error('Error compressing image:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Compression Failed',
          detail: 'Failed to process image'
        });
      } finally {
        this.isCompressing = false;
      }
    }
  }

  saveImage(): void {
    if (this.selectedImage) {
      this.imageUploaded.emit(this.selectedImage);
      this.onHide();
    }
  }

  onDelete(): void {
    this.deleteMarker.emit();
    this.onHide();
  }
}
