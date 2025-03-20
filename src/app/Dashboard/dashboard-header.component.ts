import { Component, effect, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { DashboardService } from '../Services/dashboard.service';
import { MatButtonModule } from '@angular/material/button';
import { ThemesService } from '../Services/themes.service';
import {MatToolbarModule} from '@angular/material/toolbar';

@Component({
    selector: 'app-dashboard-header',
    imports: [MatMenuModule, MatIconModule, MatButtonModule, MatMenuModule, MatToolbarModule],
    template: `
        <div class="header">
            <h2>Dashboard</h2>
            <!-- THEMES -->
                <button mat-icon-button [matMenuTriggerFor]="themeMenu">
                    <mat-icon>format_color_fill</mat-icon>
                </button>
                <mat-menu #themeMenu="matMenu">
                    @for (theme of themeService.getThemes(); track theme.id){
                        <button mat-menu-item (click)="themeService.setTheme(theme.id)">
                            {{ theme.displayName }}
                        </button>
                    } 
                </mat-menu>
            <!-- <button mat-icon-button (click)="darkMode.set(!darkMode())">
                @if(darkMode()){
                    <mat-icon>light_mode</mat-icon>
                }@else {
                    <mat-icon>dark_mode</mat-icon>
                }
            </button> -->
            <!-- WIDGETS -->
            <button mat-raised-button [mat-menu-trigger-for]="widgetMenu">
                <mat-icon>add_circle</mat-icon>Add widget
            </button>
            <mat-menu #widgetMenu="matMenu">
                @for (widget of store.widgetsToAdd(); track widget.label){
                    <button mat-menu-item (click)="store.addWidget(widget)">{{ widget.label}}</button>
                } @empty {
                    <button mat-menu-item disabled>No widgets to add</button>
                }
            </mat-menu>
        </div>
    `,
    styles: `
        .header{
            display: flex;
            justify-content: space-between; 
            margin-bottom: 14px;
        }
    `
})
export class DashboardHeaderComponent {
    themeService = inject(ThemesService);
    store = inject(DashboardService);

    darkMode = signal(false);

    setDarkMode = effect(() =>{
        document.documentElement.classList.toggle('dark', this.darkMode());
    })
}
