import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { BookFirebaseService } from '../../../services/bookFirebase.service';
import { Book } from '../../../models/book.model';
import { BookSearchListComponent } from '../book-search-list/book-search-list.component';

@Component({
  selector: 'app-book-search',
  standalone: true,
  imports: [CommonModule, MatCardModule, RouterModule, BookSearchListComponent],
  templateUrl: './book-search.component.html',
  styleUrl: './book-search.component.css',
})
export class BookSearchComponent implements OnInit {
  searchQuery: string = '';
  results: Book[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  private route = inject(ActivatedRoute);
  private bookFirebaseService = inject(BookFirebaseService);

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
    this.bookFirebaseService.getBooks().subscribe({
      next: (books: Book[]) => {
        const exactMatches = books.filter((b) => b.title.replace(/\s+/g, '').includes(normalizedQuery));
        if (exactMatches.length > 0) {
          this.results = exactMatches;
        } else {
          const similarRanked = books
            .map((b) => ({ book: b, score: this.getSimilarityScore(b.title.toLowerCase(), normalizedQuery.toLowerCase()) }))
            .sort((a, b) => b.score - a.score)
            .map((x) => x.book);
          const aboveThreshold = similarRanked.filter((b) => this.getSimilarityScore(b.title.toLowerCase(), normalizedQuery.toLowerCase()) > 0.3);
          this.results = aboveThreshold.length > 0 ? aboveThreshold : similarRanked.slice(0, 5);
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error searching books:', err);
        this.error = 'Failed to search books. Please try again.';
        this.isLoading = false;
      },
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


