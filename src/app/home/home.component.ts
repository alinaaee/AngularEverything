import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface FeatureCard {
  title: string;
  emoji: string;
  description: string;
  route: string;
  color: string;
  accentColor: string;
  tags: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(private router: Router) {}

  features: FeatureCard[] = [
    {
      title: 'Dashboard',
      emoji: '📊',
      description: 'Drag-and-drop widget board with real-time SignalR data, resizable widgets, and Chart.js analytics.',
      route: '/dashboard',
      color: '#FFB3D9',
      accentColor: '#FF69B4',
      tags: ['Drag & Drop', 'SignalR', 'Chart.js', 'Signals']
    },
    {
      title: 'Interactive Map',
      emoji: '🗺️',
      description: 'Leaflet-powered map with custom image markers, image compression, and localStorage persistence.',
      route: '/maps',
      color: '#B3E5FC',
      accentColor: '#29B6F6',
      tags: ['Leaflet', 'LocalStorage', 'Image Upload']
    },
    {
      title: 'Hello Kitty Coin Grab',
      emoji: '🐱',
      description: 'A canvas-based game — collect coins, dodge obstacles, and rack up your high score!',
      route: '/coin-grab',
      color: '#F8BBD9',
      accentColor: '#E91E8C',
      tags: ['Canvas', 'Game', 'Keyboard Controls']
    },
    {
      title: 'Excel to PDF Converter',
      emoji: '📄',
      description: 'Upload an XLSX file and convert it to a styled PDF with tables using jsPDF and SheetJS.',
      route: '/convert',
      color: '#C8E6C9',
      accentColor: '#4CAF50',
      tags: ['jsPDF', 'XLSX', 'File Upload']
    },
    {
      title: ':host CSS Explorer',
      emoji: '🎨',
      description: 'Hands-on experiments with Angular :host, :host(), and :host-context() CSS selectors.',
      route: '/tryHost',
      color: '#E1BEE7',
      accentColor: '#AB47BC',
      tags: [':host', ':host-context', 'Component Styles']
    },
    {
      title: 'Reusable Widgets',
      emoji: '🧩',
      description: 'Demonstrates the reusable widget pattern — composable, configurable component architecture.',
      route: '/reusable',
      color: '#FFE0B2',
      accentColor: '#FB8C00',
      tags: ['Component Composition', 'Patterns']
    },
    {
      title: 'Infinite Scroll',
      emoji: '♾️',
      description: 'Infinite scrolling list — load more content as you scroll down the page.',
      route: '/infiniteScroll',
      color: '#B2EBF2',
      accentColor: '#00ACC1',
      tags: ['Scroll', 'Lazy Load']
    }
  ];

  navigate(route: string) {
    this.router.navigate([route]);
  }
}
