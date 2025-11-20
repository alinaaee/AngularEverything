
┌─────────────────────────────────────────────────────────┐
│                   USER INTERACTIONS                      │
└─────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    Click Map        Click Marker      Upload Image
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                    MapComponent                          │
│  - Handles map clicks                                    │
│  - Opens dialog                                          │
│  - Creates markers                                       │
└─────────────────────────────────────────────────────────┘
          │                                    │
          ▼                                    ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│ ImageMarkerDialogComponent│   │  MarkerStorageService    │
│  - Upload form            │    │  - Save to localStorage  │
│  - Image preview          │    │  - Load from localStorage│
│  - Compress image         │    │  - Delete markers        │
└──────────────────────────┘    └──────────────────────────┘
          │                                    │
          ▼                                    ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│ ImageCompressionService  │    │      localStorage         │
│  - Resize image           │    │  { markers: [...] }      │
│  - Compress to JPEG       │    │                          │
│  - Return base64          │    │                          │
└──────────────────────────┘    └──────────────────────────┘
```

## Important Code Patterns

### 1. **Event Flow (Parent ↔ Child)**

```typescript
// Parent (MapComponent) → Child (Dialog)
<app-image-marker-dialog
  [mode]="dialogMode"              // Input: Parent sends data to child
  (imageUploaded)="onImageUploaded($event)">  // Output: Child sends data to parent
</app-image-marker-dialog>
```

**How it works:**
- `[property]` → Parent sends data IN to child
- `(event)` → Child sends data OUT to parent

---

### 2. **Async/Await Pattern**

```typescript
async onNativeFileSelected(event: Event): Promise<void> {
  // Wait for compression to finish before continuing
  this.selectedImage = await this.imageCompressionService.compressImage(file);
  // This line won't run until compression is done
  console.log('Compression complete!');
}
```

**Why:** Image compression takes time, so we wait for it to finish.

---

### 3. **Try-Catch for Error Handling**

```typescript
try {
  // Try to save
  localStorage.setItem(key, value);
  return { success: true };
} catch (error) {
  // If it fails, handle the error gracefully
  if (error.name === 'QuotaExceededError') {
    return { success: false, error: 'Storage full!' };
  }
}
```

**Why:** Prevents app from crashing when storage is full.

---

## Debugging Tips

### Check if markers are saved:

```javascript
// Open browser console (F12)
localStorage.getItem('map-markers')
// You should see JSON with all markers
```

### Check storage usage:

```javascript
// In browser console
let total = 0;
for (let key in localStorage) {
  total += localStorage[key].length;
}
console.log('Storage used:', (total / 1024 / 1024).toFixed(2), 'MB');
```

### Clear all markers:

```javascript
// In browser console
localStorage.removeItem('map-markers')
// Refresh page
```

---

## Code Execution Order

When you load the page:

```
1. Angular bootstraps → AppComponent loads
2. User navigates to map route
3. MapComponent constructor runs
4. ngOnInit() runs
   └─→ initMap() runs
       ├─→ Create Leaflet map
       ├─→ Add map tiles
       ├─→ Setup click listener
       └─→ loadSavedMarkers()
           └─→ MarkerStorageService.getAllMarkers()
               └─→ Read from localStorage
                   └─→ For each marker: addMarkerToMap()
```

When you click the map:

```
1. Leaflet triggers click event
2. onMapClick(lat, lng) runs
3. dialogVisible = true
4. Angular detects change
5. Dialog component renders
6. User sees dialog
```

When you upload:

```
1. User selects file
2. onNativeFileSelected() runs
3. ImageCompressionService.compressImage() runs
   ├─→ FileReader reads file
   ├─→ Create Image object
   ├─→ Draw on canvas (resized)
   └─→ Convert to base64 JPEG
4. selectedImage = compressed base64
5. Preview shows in dialog
```

When you save:

```
1. User clicks Save
2. saveImage() runs in dialog
3. Emits imageUploaded event to parent
4. MapComponent.onImageUploaded() runs
5. MarkerStorageService.saveMarker() runs
   ├─→ Generate unique ID
   ├─→ Create marker object
   ├─→ Add to array
   └─→ localStorage.setItem()
6. addMarkerToMap() runs
7. Marker appears on map
8. Toast notification shows
```