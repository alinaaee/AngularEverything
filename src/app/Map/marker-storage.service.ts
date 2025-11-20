import { Injectable } from '@angular/core';

export interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  image: string; // base64 encoded image
  timestamp: number;
}

export interface SaveResult {
  success: boolean;
  marker?: MarkerData;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MarkerStorageService {
  private readonly STORAGE_KEY = 'map-markers';

  constructor() {}

  saveMarker(marker: Omit<MarkerData, 'id' | 'timestamp'>): SaveResult {
    try {
      const markers = this.getAllMarkers();
      const newMarker: MarkerData = {
        ...marker,
        id: this.generateId(),
        timestamp: Date.now()
      };
      markers.push(newMarker);

      this.saveToStorage(markers);

      return {
        success: true,
        marker: newMarker
      };
    } catch (error: any) {
      if (error.name === 'QuotaExceededError') {
        return {
          success: false,
          error: 'Storage quota exceeded. Try deleting some markers or use smaller images.'
        };
      }
      return {
        success: false,
        error: 'Failed to save marker: ' + error.message
      };
    }
  }

  getAllMarkers(): MarkerData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load markers:', error);
      return [];
    }
  }

  deleteMarker(id: string): void {
    try {
      const markers = this.getAllMarkers().filter(m => m.id !== id);
      this.saveToStorage(markers);
    } catch (error) {
      console.error('Failed to delete marker:', error);
    }
  }

  getStorageInfo(): { used: number; total: number; available: number } {
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    const total = 10 * 1024 * 1024; // ~10MB (typical browser limit)
    const available = total - used;

    return {
      used: used / (1024 * 1024), // Convert to MB
      total: total / (1024 * 1024),
      available: available / (1024 * 1024)
    };
  }

  private saveToStorage(markers: MarkerData[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(markers));
  }

  private generateId(): string {
    return `marker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
