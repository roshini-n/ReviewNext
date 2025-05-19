import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { GameFirebaseService } from '../../services/gameFirebase.service';
import { Game } from '../../models/game.model';
import { GameSearchListComponent } from '../game-search-list/game-search-list.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, MatCardModule, RouterModule, GameSearchListComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit {
  searchQuery: string = '';
  searchResults: Game[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  gameFirebaseService = inject(GameFirebaseService);

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
    return;
  }

  console.log('Searching for:', this.searchQuery);
  this.isLoading = true;
  this.error = null;

  this.gameFirebaseService.getGames().subscribe({
    next: (results: Game[]) => {
      // Normalize query: lowercase and remove all extra spaces
      const normalizedQuery = this.searchQuery.toLowerCase().replace(/\s+/g, '');

      this.searchResults = results.filter((game: Game) => {
        const normalizedTitle = game.title.toLowerCase().replace(/\s+/g, '');
        return normalizedTitle.includes(normalizedQuery);
      });

      this.isLoading = false;
    },
    error: (err: any) => {
      console.error('Error searching games:', err);
      this.error = 'Failed to search games. Please try again.';
      this.isLoading = false;
    },
  });
}
}