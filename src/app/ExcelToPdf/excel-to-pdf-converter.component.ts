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

    // Extract the dynamic title from the first row (Assuming it's not part of the table header)
    const title = this.excelData[0][0]; // First column, first row contains title
    const pageWidth = pdf.internal.pageSize.getWidth(); 

    pdf.setFontSize(12);
    pdf.setFont("bold");
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(173, 216, 230);
    pdf.rect(10, 10, pageWidth - 20, 10, "F"); // Background for title
    pdf.text(title, pageWidth / 2, 17, { align: "center" });

    // Remove title row from the table before generating PDF
    const tableHeaders = this.excelData[1]; // The second row should be actual table headers
    const tableBody = this.excelData.slice(2); // Remaining data after title and headers

    autoTable(pdf, {
        head: [tableHeaders], // Table headers
        body: tableBody, // Table data
        startY: 25, // Position below the title
        styles: { 
            fontSize: 8,
            cellPadding: 2,
            textColor: [0,0,0],
        },
        headStyles: {
            fillColor: [173, 216, 230], 
            textColor: [0, 0, 0], 
            fontStyle: "bold",
            fontSize: 10,
        },
        columnStyles: {
            0: { cellWidth: 15 },  // Fixed width for S.no
            1: { cellWidth: 'auto' },  // Expandable Enroll No.
            2: { cellWidth: 'auto' },  // Expandable Membership No.
            3: { cellWidth: 'auto' },  // Expandable Name
            4: { cellWidth: 'auto' },  // Expandable Card No.
        },
        theme: 'grid'
    });

    const pdfFileName = this.fileName ? this.fileName.replace(/\.[^/.]+$/, ".pdf") : "converted.pdf";
    pdf.save(pdfFileName);
}

}
