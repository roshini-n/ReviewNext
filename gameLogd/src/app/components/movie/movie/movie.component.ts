import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CarouselModule } from 'primeng/carousel';
import { MovieFirebaseService } from '../../../services/movieFirebase.service';
import { Movie } from '../../../models/movie.model';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movie',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    CarouselModule
  ],
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.css']
})
export class MovieComponent implements OnInit, OnDestroy {
  allMovies: Movie[] = [];
  trendingMovies: Movie[] = [];
  topRatedMovies: Movie[] = [];
  popularMovies: Movie[] = [];
  movieFirebaseService = inject(MovieFirebaseService);
  authService = inject(AuthService);
  router = inject(Router);

  // Hover overlay properties
  showOverlay = false;
  selectedMovie: Movie | null = null;
  overlayPosition = { x: 0, y: 0 };
  hoverTimeout: any;

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.movieFirebaseService.getMovies().subscribe((movies: Movie[]) => {
      this.allMovies = movies;
      this.trendingMovies = movies;
      this.topRatedMovies = movies.filter(movie => movie.rating >= 3.5);
      this.popularMovies = movies;
    });
  }

  onAddMovie(): void {
    this.router.navigate(['/add_movie']);
  }

  showHoverOverlay(movie: Movie, event: MouseEvent): void {
    // Clear any existing timeout
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }

    // Set a small delay to prevent flickering
    this.hoverTimeout = setTimeout(() => {
      this.selectedMovie = movie;
      this.updateHoverPosition(event);
      this.showOverlay = true;
    }, 200); // Reduced delay for better responsiveness
  }

  hideHoverOverlay(): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    this.showOverlay = false;
    this.selectedMovie = null;
  }

  updateHoverPosition(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const movieCard = target.closest('.movie-card') as HTMLElement;
    
    if (!movieCard) return;

    const rect = movieCard.getBoundingClientRect();
    const overlayWidth = 600;
    const overlayHeight = 400;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Determine which movie card position (left, middle, right) based on its position
    const cardCenterX = rect.left + rect.width / 2;
    const viewportCenterX = viewportWidth / 2;
    
    let x, y;
    
    // Position overlay next to the movie card so both are visible
    if (cardCenterX < viewportCenterX - 200) {
      // Left movie card - show overlay to the right
      x = rect.right + 20;
      y = rect.top;
    } else if (cardCenterX > viewportCenterX + 200) {
      // Right movie card - show overlay to the left with proper spacing
      x = rect.left - overlayWidth - 30; // 30px spacing between card and hover
      y = rect.top;
    } else {
      // Middle movie card - always show overlay to the right with spacing
      x = rect.right + 20; // 20px spacing between card and hover
      y = rect.top;
    }

    // Adjust if overlay would go off screen horizontally
    if (x < 20) x = 20;
    if (x + overlayWidth > viewportWidth - 20) x = viewportWidth - overlayWidth - 20;
    
    // Adjust if overlay would go off screen vertically
    if (y < 20) y = 20;
    if (y + overlayHeight > viewportHeight - 20) y = viewportHeight - overlayHeight - 20;

    this.overlayPosition = { x, y };
  }

  ngOnDestroy(): void {
    // Clean up timeout to prevent memory leaks
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
  }
} 