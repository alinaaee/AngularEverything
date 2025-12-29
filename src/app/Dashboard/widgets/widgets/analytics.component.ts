import { Component, ElementRef, OnInit, viewChild } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [],
  template: `
    <div class="chart-container">
      <canvas #chart></canvas>
    </div>
  `,
  styles:`
    .chart-container{
      height: calc(100% - 100px);
      width: 100%;
    }
  `
})
export class AnalyticsComponent implements OnInit{
  chart = viewChild.required<ElementRef>('chart'); 
  ngOnInit(){
    new Chart(this.chart().nativeElement,{
      type: 'line',
      data:{
        labels: ['Aug', 'Sept', 'June', 'Mar', 'Apr'],
        datasets: [
          {
            label: 'Data',
            data: [100,234,115,100,50],
            borderColor: 'rgb(227, 187, 27)',
            backgroundColor: 'rgb(227, 187, 27, 0.5)',
            fill: 'start'
          },
        ],
      },
    options: {
      maintainAspectRatio: false,
      elements: {
        line: {
          tension: 0.4,
        }
      }
    }
  });
  }
}
