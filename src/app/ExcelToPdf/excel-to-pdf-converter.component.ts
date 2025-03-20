import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-excel-to-pdf',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, CommonModule],
  template: `
        <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div class="card shadow-lg p-4" style="width: 400px;">
        <h2 class="text-center text-primary mb-3">Excel to PDF Converter</h2>

        <label for="file-upload" class="btn btn-outline-primary w-100 mb-3">
          <mat-icon>upload</mat-icon> Upload Excel File
          <input id="file-upload" type="file" class="d-none" (change)="onFileChange($event)" accept=".xls,.xlsx" />
        </label>

        <p *ngIf="fileName" class="text-muted text-center">📄 {{ fileName }}</p>

        <button mat-raised-button color="primary" class="w-100 mt-2"
          (click)="convertToPdf()" [disabled]="!excelData.length">
          <mat-icon>picture_as_pdf</mat-icon> Convert to PDF
        </button>
      </div>
    </div>
  `,
  styles: [`
    
  `]
})
export class ExcelToPdfConverterComponent {
  excelData: any[][] = [];
  fileName: string | null = null;

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;
  
    this.fileName = file.name; // Store file name for display
  
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
  
      // Ensure the Excel data updates correctly
      setTimeout(() => {
        this.excelData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      }, 0); // Ensures change detection happens
    };
    reader.readAsArrayBuffer(file);
  }
  

  convertToPdf() {
    if (!this.excelData.length) return;

    const pdf = new jsPDF();
    // Use autoTable to retain table format
    autoTable(pdf, {
      head: [this.excelData[0]], // Headers
      body: this.excelData.slice(1), // Data rows
      startY: 20,
      styles: { 
        fontSize: 8,
        cellPadding: 2,
        fontStyle: 'bold',
        textColor: [0,0,0],
      },
      
      headStyles: {
        fillColor: [173, 216, 230], 
        textColor: [0, 0, 0], 
        fontStyle: "bold",
        fontSize: 12,
        cellWidth: "auto"
      },

      bodyStyles: {cellWidth: "auto"},

      theme: 'grid'
    });

    // Derive the file name from the uploaded file
    const pdfFileName = this.fileName ? this.fileName.replace(/\.[^/.]+$/, ".pdf") : "converted.pdf";
    pdf.save(pdfFileName);
    
  }
}
