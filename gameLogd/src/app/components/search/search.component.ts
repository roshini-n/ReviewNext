import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { GameFirebaseService } from '../../services/gameFirebase.service';
import { Game } from '../../models/game.model';
import { GameSearchListComponent } from '../game-search-list/game-search-list.component';
import { BookFirebaseService } from '../../services/bookFirebase.service';
import { Book } from '../../models/book.model';
import { BookSearchListComponent } from '../books/book-search-list/book-search-list.component';
import { MovieFirebaseService } from '../../services/movieFirebase.service';
import { Movie } from '../../models/movie.model';
import { MovieSearchListComponent } from '../movie/movie-search-list/movie-search-list.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, MatCardModule, RouterModule, GameSearchListComponent, BookSearchListComponent, MovieSearchListComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit {
  searchQuery: string = '';
  searchResults: Game[] = [];
  bookResults: Book[] = [];
  movieResults: Movie[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  gameFirebaseService = inject(GameFirebaseService);
  bookFirebaseService = inject(BookFirebaseService);
  movieFirebaseService = inject(MovieFirebaseService);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // get search query from URL parameters
    this.route.queryParams.subscribe((params) => {
      // get items from the search query
      this.searchQuery = params['q'] || '';
      // if there is a search query then do the search
      if (this.searchQuery) {
        this.performSearch();
      }
    });
  }

  performSearch() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.bookResults = [];
      this.movieResults = [];
      return;
    }

    console.log('Searching for:', this.searchQuery);
    this.isLoading = true;
    this.error = null;

    const normalizedQuery = this.searchQuery.toLowerCase().replace(/\s+/g, '');

    this.gameFirebaseService.getGames().subscribe({
      next: (results: Game[]) => {
        const exactMatches = results.filter((game: Game) => {
          const normalizedTitle = game.title.toLowerCase().replace(/\s+/g, '');
          return normalizedTitle.includes(normalizedQuery);
        });

        if (exactMatches.length > 0) {
          this.searchResults = exactMatches;
        } else {
          const similarGames = results
            .map((game) => {
              const title = game.title.toLowerCase();
              const score = this.getSimilarityScore(title, normalizedQuery);
              return { game, score };
            })
            .filter(entry => entry.score > 0.3)
            .sort((a, b) => b.score - a.score)
            .map(entry => entry.game);

          this.searchResults = similarGames;

          if (similarGames.length === 0) {
            this.error = `No games found matching "${this.searchQuery}", and no similar results found.`;
          }
        }

        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error searching games:', err);
        this.error = 'Failed to search games. Please try again.';
        this.isLoading = false;
      }
    });

    // Books
    this.bookFirebaseService.getBooks().subscribe({
      next: (books: Book[]) => {
        this.bookResults = this.filterByQuery<Book>(books, (b) => b.title);
      },
      error: (err: any) => {
        console.error('Error searching books:', err);
      }
    });

    // Movies
    this.movieFirebaseService.getMovies().subscribe({
      next: (movies: Movie[]) => {
        this.movieResults = this.filterByQuery<Movie>(movies, (m) => m.title);
      },
      error: (err: any) => {
        console.error('Error searching movies:', err);
      }
    });
  }

  getSimilarityScore(title: string, query: string): number {
    let matches = 0;
    const titleSet = new Set(title);
    for (const char of query) {
      if (titleSet.has(char)) matches++;
    }
    return matches / query.length;
  }

  private filterByQuery<T>(items: T[], getTitle: (item: T) => string): T[] {
    const normalizedQuery = this.searchQuery.toLowerCase().replace(/\s+/g, '');
    const exactMatches = items.filter((item: T) => {
      const normalizedTitle = getTitle(item).toLowerCase().replace(/\s+/g, '');
      return normalizedTitle.includes(normalizedQuery);
    });
    if (exactMatches.length > 0) return exactMatches;
    const similar = items
      .map((item) => {
        const title = getTitle(item).toLowerCase();
        const score = this.getSimilarityScore(title, normalizedQuery);
        return { item, score };
      })
      .filter(entry => entry.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .map(entry => entry.item);
    return similar;
  }
}
