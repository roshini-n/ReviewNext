import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { BeautyProductFirebaseService } from '../../../services/beautyProductFirebase.service';
import { BeautyProduct } from '../../../models/beauty-product.model';
import { BeautyProductSearchListComponent } from '../beauty-product-search-list/beauty-product-search-list.component';

@Component({
  selector: 'app-beauty-product-search',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, BeautyProductSearchListComponent],
  templateUrl: './beauty-product-search.component.html',
  styleUrl: './beauty-product-search.component.css'
})
export class BeautyProductSearchComponent implements OnInit {
  searchQuery: string = '';
  results: BeautyProduct[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  private route = inject(ActivatedRoute);
  private beautyService = inject(BeautyProductFirebaseService);

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
    this.beautyService.getBeautyProducts().subscribe({
      next: (items: BeautyProduct[]) => {
        const exactMatches = items.filter((p) => p.title.replace(/\s+/g, '').includes(normalizedQuery));
        if (exactMatches.length > 0) {
          this.results = exactMatches;
        } else {
          const similarRanked = items
            .map((p) => ({ product: p, score: this.getSimilarityScore(p.title.toLowerCase(), normalizedQuery.toLowerCase()) }))
            .sort((a, b) => b.score - a.score)
            .map((x) => x.product);
          const aboveThreshold = similarRanked.filter((p) => this.getSimilarityScore(p.title.toLowerCase(), normalizedQuery.toLowerCase()) > 0.3);
          this.results = aboveThreshold.length > 0 ? aboveThreshold : similarRanked.slice(0, 5);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error searching beauty products:', err);
        this.error = 'Failed to search beauty products. Please try again.';
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


