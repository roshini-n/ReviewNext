import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';

export interface OmdbMovieResult {
  Poster: string;
  Director: string;
}

@Injectable({
  providedIn: 'root'
})
export class OmdbService {
  private readonly apiKey = 'c548c414'; // <-- User's OMDb API key
  private readonly baseUrl = 'https://www.omdbapi.com/';

  constructor(private http: HttpClient) {}

  searchMovie(title: string): Observable<OmdbMovieResult> {
    const url = `${this.baseUrl}?t=${encodeURIComponent(title)}&apikey=${this.apiKey}`;
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response.Response === 'False') {
          return { Poster: '', Director: '' };
        }
        return {
          Poster: response.Poster || '',
          Director: response.Director || ''
        };
      }),
      catchError(error => {
        return throwError(() => new Error('Failed to fetch movie data'));
      })
    );
  }
} 