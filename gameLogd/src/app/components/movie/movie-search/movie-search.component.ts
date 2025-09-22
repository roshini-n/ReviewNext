import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MovieFirebaseService } from '../../../services/movieFirebase.service';
import { Movie } from '../../../models/movie.model';
import { MovieSearchListComponent } from '../movie-search-list/movie-search-list.component';

@Component({
  selector: 'app-movie-search',
  standalone: true,
  imports: [CommonModule, MatCardModule, RouterModule, MovieSearchListComponent],
  templateUrl: './movie-search.component.html',
  styleUrl: './movie-search.component.css',
})
export class MovieSearchComponent implements OnInit {
  searchQuery: string = '';
  results: Movie[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  private route = inject(ActivatedRoute);
  private movieFirebaseService = inject(MovieFirebaseService);

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
    this.movieFirebaseService.getMovies().subscribe({
      next: (movies: Movie[]) => {
        const exactMatches = movies.filter((m) => m.title.replace(/\s+/g, '').includes(normalizedQuery));
        if (exactMatches.length > 0) {
          this.results = exactMatches;
        } else {
          const similarRanked = movies
            .map((m) => ({ movie: m, score: this.getSimilarityScore(m.title.toLowerCase(), normalizedQuery.toLowerCase()) }))
            .sort((a, b) => b.score - a.score)
            .map((x) => x.movie);
          const aboveThreshold = similarRanked.filter((m) => this.getSimilarityScore(m.title.toLowerCase(), normalizedQuery.toLowerCase()) > 0.3);
          this.results = aboveThreshold.length > 0 ? aboveThreshold : similarRanked.slice(0, 5);
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error searching movies:', err);
        this.error = 'Failed to search movies. Please try again.';
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


