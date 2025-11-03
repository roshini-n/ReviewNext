import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Movie } from '../../../models/movie.model';

@Component({
  selector: 'app-movie-search-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './movie-search-list.component.html',
  styleUrl: './movie-search-list.component.css'
})
export class MovieSearchListComponent {
  @Input() movies: Movie[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() emptyMessage = 'No movies found.';
  @Output() movieSelected = new EventEmitter<Movie>();

  onMovieClick(movie: Movie): void {
    this.movieSelected.emit(movie);
  }
}


