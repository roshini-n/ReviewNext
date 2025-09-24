import { Component, OnInit, inject } from '@angular/core';
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
export class MovieComponent implements OnInit {
  allMovies: Movie[] = [];
  trendingMovies: Movie[] = [];
  topRatedMovies: Movie[] = [];
  popularMovies: Movie[] = [];
  movieFirebaseService = inject(MovieFirebaseService);
  authService = inject(AuthService);
  router = inject(Router);

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
} 