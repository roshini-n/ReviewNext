import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { WebSeriesFirebaseService } from '../../../services/webSeriesFirebase.service';
import { OmdbService, OmdbMovieResult } from '../../../services/omdb.service';
import { TMDBService, TmdbTVResult } from '../../../services/tmdb.service';

@Component({
  selector: 'app-add-web-series',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './add-web-series.component.html',
  styleUrls: ['./add-web-series.component.css']
})
export class AddWebSeriesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private webSeriesService = inject(WebSeriesFirebaseService);
  private snackBar = inject(MatSnackBar);
  private omdbService = inject(OmdbService);
  private tmdbService = inject(TMDBService);

  webSeriesForm: FormGroup;
  isSubmitting = false;
  isSearchingImage = false;

  constructor() {
    this.webSeriesForm = this.fb.group({
      title: ['', Validators.required],
      creator: ['', Validators.required],
      description: ['', Validators.required],
      platform: ['', Validators.required],
      imageUrl: ['', Validators.required],
      episodes: [''],
      duration: ['', Validators.required],
      releaseYear: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]]
    });
  }

  ngOnInit(): void {
    this.webSeriesForm.get('title')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(title => {
        if (title && title.length >= 2) {
          this.isSearchingImage = true;
          return this.omdbService.searchMovie(title).pipe(
            catchError(() => of(null as OmdbMovieResult | null))
          );
        }
        return of(null);
      })
    ).subscribe({
      next: (result: OmdbMovieResult | null) => {
        if (result && (result.Poster || result.Writer)) {
          // ✅ OMDb success
          this.webSeriesForm.patchValue({
            imageUrl: result.Poster || '',
            creator: result.Writer || ''
          });
          this.isSearchingImage = false;
        } else {
          // ❌ OMDb failed → fallback to TMDB
          const title = this.webSeriesForm.get('title')?.value;
          if (title) {
            this.tmdbService.searchTV(title).subscribe({
              next: (tmdbResult: TmdbTVResult | null) => {
                if (tmdbResult && tmdbResult.poster_path) {
                  this.webSeriesForm.patchValue({
                    imageUrl: `https://image.tmdb.org/t/p/w500${tmdbResult.poster_path}`
                  });
                }
                this.isSearchingImage = false;
              },
              error: (err: any) => {
                console.error('TMDB fallback failed:', err);
                this.isSearchingImage = false;
              }
            });
          }
        }
      },
      error: (error: any) => {
        console.error('Error fetching web series data:', error);
        this.isSearchingImage = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.webSeriesForm.valid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;
    const webSeriesData = this.webSeriesForm.value;

    this.webSeriesService.addWebSeries(webSeriesData)
      .then(() => {
        this.snackBar.open('Web series added successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/web-series']);
      })
      .catch((error: Error) => {
        console.error('Error adding web series:', error);
        this.snackBar.open('Error adding web series. Please try again.', 'Close', { duration: 3000 });
        this.isSubmitting = false;
      });
  }

  onCancel(): void {
    this.router.navigate(['/web-series']);
  }
}
