import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { AdminAnalyticsService, AdminAnalytics } from '../../../services/admin-analytics.service';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatGridListModule
  ],
  templateUrl: './admin-analytics.component.html',
  styleUrls: ['./admin-analytics.component.css']
})
export class AdminAnalyticsComponent implements OnInit {
  @ViewChild('userGrowthChart', { static: false }) userGrowthChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('contentDistributionChart', { static: false }) contentDistributionChart!: ElementRef<HTMLCanvasElement>;

  private adminAnalyticsService = inject(AdminAnalyticsService);
  
  analytics: AdminAnalytics | null = null;
  isLoading = true;
  userGrowthData: { date: string, count: number }[] = [];
  contentDistributionData: { category: string, count: number }[] = [];

  ngOnInit(): void {
    this.loadAnalytics();
  }

  private loadAnalytics(): void {
    this.isLoading = true;

    // Load main analytics
    this.adminAnalyticsService.getAnalytics().subscribe(analytics => {
      this.analytics = analytics;
      this.isLoading = false;
    });

    // Load chart data
    this.adminAnalyticsService.getUserGrowthData().subscribe(data => {
      this.userGrowthData = data;
      this.createUserGrowthChart();
    });

    this.adminAnalyticsService.getContentDistribution().subscribe(data => {
      this.contentDistributionData = data;
      this.createContentDistributionChart();
    });
  }

  private createUserGrowthChart(): void {
    setTimeout(() => {
      if (this.userGrowthChart) {
        const canvas = this.userGrowthChart.nativeElement;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          this.drawLineChart(ctx, this.userGrowthData);
        }
      }
    }, 100);
  }

  private createContentDistributionChart(): void {
    setTimeout(() => {
      if (this.contentDistributionChart) {
        const canvas = this.contentDistributionChart.nativeElement;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          this.drawBarChart(ctx, this.contentDistributionData);
        }
      }
    }, 100);
  }

  private drawLineChart(ctx: CanvasRenderingContext2D, data: { date: string, count: number }[]): void {
    const canvas = ctx.canvas;
    const padding = 40;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (data.length === 0) return;

    const maxValue = Math.max(...data.map(d => d.count));
    const minValue = Math.min(...data.map(d => d.count));
    const valueRange = maxValue - minValue || 1;

    // Draw axes
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw line
    ctx.strokeStyle = '#3f51b5';
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1)) * width;
      const y = canvas.height - padding - ((point.count - minValue) / valueRange) * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      // Draw points
      ctx.fillStyle = '#3f51b5';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    ctx.stroke();

    // Add labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1)) * width;
      ctx.fillText(point.date.split('/').slice(0, 2).join('/'), x, canvas.height - 10);
    });
  }

  private drawBarChart(ctx: CanvasRenderingContext2D, data: { category: string, count: number }[]): void {
    const canvas = ctx.canvas;
    const padding = 40;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (data.length === 0) return;

    const maxValue = Math.max(...data.map(d => d.count));
    const barWidth = width / data.length * 0.8;
    const barSpacing = width / data.length * 0.2;

    const colors = ['#3f51b5', '#f44336', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4'];

    data.forEach((item, index) => {
      const barHeight = (item.count / maxValue) * height;
      const x = padding + index * (barWidth + barSpacing);
      const y = canvas.height - padding - barHeight;

      // Draw bar
      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(x, y, barWidth, barHeight);

      // Add value label on top of bar
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.count.toString(), x + barWidth / 2, y - 5);

      // Add category label
      ctx.save();
      ctx.translate(x + barWidth / 2, canvas.height - 10);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = 'right';
      ctx.fillText(item.category, 0, 0);
      ctx.restore();
    });
  }

  refresh(): void {
    this.loadAnalytics();
  }
}
