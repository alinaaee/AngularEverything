import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardService } from './Services/dashboard.service';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [DashboardService]
})
export class AppComponent {
  // constructor(private themeService: ThemesService){}
  title = 'YayLearning';
}
