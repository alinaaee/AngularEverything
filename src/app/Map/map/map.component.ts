import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ImageMarkerDialogComponent } from '../image-marker-dialog/image-marker-dialog.component';
import { MarkerStorageService, MarkerData } from '../marker-storage.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-map',
  imports: [ImageMarkerDialogComponent, ToastModule],
  providers: [MessageService],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, OnDestroy {
  private map: any;
  private L: any;
  private markers: Map<string, any> = new Map();

  dialogVisible = false;
  dialogMode: 'upload' | 'view' = 'upload';
  selectedCoordinates: { lat: number; lng: number } | null = null;
  selectedImage: string | null = null;
  currentMarkerId: string | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private markerStorageService: MarkerStorageService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Only initialize map in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private async initMap(): Promise<void> {
    // Dynamically import Leaflet only in browser
    this.L = await import('leaflet');

    // Initialize the map
    this.map = this.L.map('map').setView([46.879966, -121.726909], 13);

    // Add OpenStreetMap tiles
    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add click event listener to the map
    this.map.on('click', (e: any) => {
      this.onMapClick(e.latlng.lat, e.latlng.lng);
    });

    // Load and display existing markers
    this.loadSavedMarkers();

    console.log('Map initialized successfully!');
  }

  private onMapClick(lat: number, lng: number): void {
    this.selectedCoordinates = { lat, lng };
    this.dialogMode = 'upload';
    this.selectedImage = null;
    this.currentMarkerId = null;
    this.dialogVisible = true;
  }

  onImageUploaded(imageData: string): void {
    if (this.selectedCoordinates) {
      const result = this.markerStorageService.saveMarker({
        lat: this.selectedCoordinates.lat,
        lng: this.selectedCoordinates.lng,
        image: imageData
      });

      if (result.success && result.marker) {
        this.addMarkerToMap(result.marker);
        this.messageService.add({
          severity: 'success',
          summary: 'Marker Saved',
          detail: 'Image marker saved successfully'
        });

        // Log storage info
        const storageInfo = this.markerStorageService.getStorageInfo();
        console.log(`Storage: ${storageInfo.used.toFixed(2)}MB / ${storageInfo.total.toFixed(2)}MB (${storageInfo.available.toFixed(2)}MB available)`);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Save Failed',
          detail: result.error || 'Failed to save marker',
          life: 5000
        });
      }
    }
  }

  private loadSavedMarkers(): void {
    const savedMarkers = this.markerStorageService.getAllMarkers();
    savedMarkers.forEach(markerData => {
      this.addMarkerToMap(markerData);
    });
  }

  private addMarkerToMap(markerData: MarkerData): void {
    // Create custom marker icon using Material Icons
    const customIcon = this.L.divIcon({
      html: '<span class="material-icons custom-marker">location_on</span>',
      className: 'custom-marker-wrapper',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });

    const marker = this.L.marker([markerData.lat, markerData.lng], {
      icon: customIcon
    }).addTo(this.map);

    marker.on('click', () => {
      this.onMarkerClick(markerData);
    });

    this.markers.set(markerData.id, marker);
  }

  private onMarkerClick(markerData: MarkerData): void {
    this.selectedCoordinates = { lat: markerData.lat, lng: markerData.lng };
    this.selectedImage = markerData.image;
    this.currentMarkerId = markerData.id;
    this.dialogMode = 'view';
    this.dialogVisible = true;
  }

  onDeleteMarker(): void {
    if (this.currentMarkerId) {
      const marker = this.markers.get(this.currentMarkerId);
      if (marker) {
        this.map.removeLayer(marker);
        this.markers.delete(this.currentMarkerId);
      }
      this.markerStorageService.deleteMarker(this.currentMarkerId);
    }
  }
}
