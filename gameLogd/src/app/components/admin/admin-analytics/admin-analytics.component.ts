import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './admin-analytics.component.html',
  styleUrl: './admin-analytics.component.css'
})
export class AdminAnalyticsComponent implements OnInit {
  adminService = inject(AdminService);

  analytics = signal<any>({
    users: {
      newUsersLast30Days: 0,
      registrationTrend: {}
    },
    reviews: {
      reviewsLast30Days: 0,
      reviewTrend: {},
      reviewsByCategory: {}
    },
    products: {
      games: 0,
      books: 0,
      movies: 0,
      webSeries: 0,
      electronicGadgets: 0,
      beautyProducts: 0
    }
  });

  loading = signal(true);

  ngOnInit() {
    this.loadAnalytics();
  }

  private async loadAnalytics() {
    try {
      this.loading.set(true);
      const analyticsData = await this.adminService.getAnalytics();
      this.analytics.set(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      this.loading.set(false);
    }
  }

  getRegistrationTrendData(): any[] {
    const trend = this.analytics().users.registrationTrend;
    return Object.entries(trend).map(([date, count]) => ({ date, count }));
  }

  getReviewTrendData(): any[] {
    const trend = this.analytics().reviews.reviewTrend;
    return Object.entries(trend).map(([date, count]) => ({ date, count }));
  }

  getReviewsByCategoryData(): any[] {
    const reviews = this.analytics().reviews.reviewsByCategory;
    return Object.entries(reviews).map(([category, count]) => ({ 
      category: this.formatCategoryName(category), 
      count 
    }));
  }

  getProductDistributionData(): any[] {
    const products = this.analytics().products;
    return [
      { category: 'Games', count: products.games },
      { category: 'Books', count: products.books },
      { category: 'Movies', count: products.movies },
      { category: 'Web Series', count: products.webSeries },
      { category: 'Electronics', count: products.electronicGadgets },
      { category: 'Beauty Products', count: products.beautyProducts }
    ].filter(item => item.count > 0);
  }

  private formatCategoryName(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'games': 'Games',
      'books': 'Books',
      'movies': 'Movies',
      'web-series': 'Web Series',
      'electronic-gadgets': 'Electronics',
      'beauty-products': 'Beauty Products'
    };
    return categoryMap[category] || category;
  }

  getTotalProducts(): number {
    const products = this.analytics().products;
    return products.games + products.books + products.movies + 
           products.webSeries + products.electronicGadgets + products.beautyProducts;
  }

  getMostPopularCategory(): string {
    const reviewsByCategory = this.analytics().reviews.reviewsByCategory;
    const entries = Object.entries(reviewsByCategory);
    
    if (entries.length === 0) return 'No data';
    
    const mostPopular = entries.reduce((max: [string, any], current: [string, any]) => 
      (current[1] as number) > (max[1] as number) ? current : max
    );
    
    return this.formatCategoryName(mostPopular[0]);
  }

  getPercentageForCategory(category: string, total: number): number {
    if (total === 0) return 0;
    const products = this.analytics().products;
    const categoryMap: { [key: string]: number } = {
      'Games': products.games,
      'Books': products.books,
      'Movies': products.movies,
      'Web Series': products.webSeries,
      'Electronics': products.electronicGadgets,
      'Beauty Products': products.beautyProducts
    };
    
    return Math.round((categoryMap[category] / total) * 100);
  }

  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  }

  getMaxRegistrationCount(): number {
    const data = this.getRegistrationTrendData();
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => d.count as number));
  }

  getMaxReviewCount(): number {
    const data = this.getReviewTrendData();
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => d.count as number));
  }

  getMaxCategoryCount(): number {
    const data = this.getReviewsByCategoryData();
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => d.count as number));
  }

  getRegistrationPercentage(count: number): number {
    return (count / this.getMaxRegistrationCount()) * 100;
  }

  getReviewPercentage(count: number): number {
    return (count / this.getMaxReviewCount()) * 100;
  }

  getCategoryPercentage(count: number): number {
    return (count / this.getMaxCategoryCount()) * 100;
  }
}
