import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Game } from '../../models/game.model';
import { Book } from '../../models/book.model';
import { Movie } from '../../models/movie.model';
import { GameFirebaseService } from '../../services/gameFirebase.service';
import { BookFirebaseService } from '../../services/bookFirebase.service';
import { MovieFirebaseService } from '../../services/movieFirebase.service';
import { GameSearchListComponent } from '../game-search-list/game-search-list.component';
import { BookSearchListComponent } from '../books/book-search-list/book-search-list.component';
import { MovieSearchListComponent } from '../movie/movie-search-list/movie-search-list.component';

@Component({
  selector: 'app-all-search',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, GameSearchListComponent, BookSearchListComponent, MovieSearchListComponent],
  templateUrl: './all-search.component.html',
  styleUrl: './all-search.component.css'
})
export class AllSearchComponent implements OnInit {
  searchQuery: string = '';
  gameResults: Game[] = [];
  bookResults: Book[] = [];
  movieResults: Movie[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  private route = inject(ActivatedRoute);
  private gameFirebaseService = inject(GameFirebaseService);
  private bookFirebaseService = inject(BookFirebaseService);
  private movieFirebaseService = inject(MovieFirebaseService);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchQuery = params['q'] || '';
      if (this.searchQuery) {
        this.performSearch();
      } else {
        this.gameResults = [];
        this.bookResults = [];
        this.movieResults = [];
      }
    });
  }

  private performSearch(): void {
    if (!this.searchQuery.trim()) {
      this.gameResults = [];
      this.bookResults = [];
      this.movieResults = [];
      return;
    }
    this.isLoading = true;
    this.error = null;
    const normalizedQuery = this.searchQuery.toLowerCase().replace(/\s+/g, '');

    // Games
    this.gameFirebaseService.getGames().subscribe({
      next: (results: Game[]) => {
        this.gameResults = this.filterByQuery<Game>(results, (g) => g.title, normalizedQuery);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });

    // Books
    this.bookFirebaseService.getBooks().subscribe({
      next: (books: Book[]) => {
        this.bookResults = this.filterByQuery<Book>(books, (b) => b.title, normalizedQuery);
      },
      error: () => {}
    });

    // Movies
    this.movieFirebaseService.getMovies().subscribe({
      next: (movies: Movie[]) => {
        this.movieResults = this.filterByQuery<Movie>(movies, (m) => m.title, normalizedQuery);
      },
      error: () => {}
    });
  }

  private filterByQuery<T>(items: T[], getTitle: (item: T) => string, normalizedQuery: string): T[] {
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

  private getSimilarityScore(title: string, query: string): number {
    let matches = 0;
    const titleSet = new Set(title);
    for (const char of query) {
      if (titleSet.has(char)) matches++;
    }
    return query.length ? matches / query.length : 0;
  }
}


