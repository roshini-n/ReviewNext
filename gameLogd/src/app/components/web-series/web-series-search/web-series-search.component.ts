import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { WebSeriesFirebaseService } from '../../../services/webSeriesFirebase.service';
import { WebSeries } from '../../../models/web-series.model';
import { WebSeriesSearchListComponent } from '../web-series-search-list/web-series-search-list.component';

@Component({
  selector: 'app-web-series-search',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, WebSeriesSearchListComponent],
  templateUrl: './web-series-search.component.html',
  styleUrl: './web-series-search.component.css'
})
export class WebSeriesSearchComponent implements OnInit {
  searchQuery: string = '';
  results: WebSeries[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  private route = inject(ActivatedRoute);
  private webService = inject(WebSeriesFirebaseService);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchQuery = params['q'] || '';
      if (this.searchQuery) {
        this.performSearch();
      } else {
        this.results = [];
      }
    });
  }

  private performSearch(): void {
    if (!this.searchQuery.trim()) {
      this.results = [];
      return;
    }
    this.isLoading = true;
    this.error = null;
    const normalizedQuery = this.searchQuery.replace(/\s+/g, '');
    this.webService.getWebSeries().subscribe({
      next: (items: WebSeries[]) => {
        const exactMatches = items.filter((w) => w.title.replace(/\s+/g, '').includes(normalizedQuery));
        if (exactMatches.length > 0) {
          this.results = exactMatches;
        } else {
          const similarRanked = items
            .map((w) => ({ series: w, score: this.getSimilarityScore(w.title.toLowerCase(), normalizedQuery.toLowerCase()) }))
            .sort((a, b) => b.score - a.score)
            .map((x) => x.series);
          const aboveThreshold = similarRanked.filter((w) => this.getSimilarityScore(w.title.toLowerCase(), normalizedQuery.toLowerCase()) > 0.3);
          this.results = aboveThreshold.length > 0 ? aboveThreshold : similarRanked.slice(0, 5);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error searching web series:', err);
        this.error = 'Failed to search web series. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private getSimilarityScore(title: string, query: string): number {
    let matches = 0;
    const titleSet = new Set(title);
    for (const char of query) {
      if (titleSet.has(char)) matches++;
    }
    return query.length ? matches / query.length : 0;
  }
}


