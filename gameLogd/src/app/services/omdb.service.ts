import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';

export interface OmdbMovieResult {
  Poster: string;
  Director: string;
  Writer: string;   // 👈 add Writer for Web Series Creator
}

@Injectable({
  providedIn: 'root'
})
export class OmdbService {
  private readonly apiKey = 'c548c414'; // <-- your OMDb API key
  private readonly baseUrl = 'https://www.omdbapi.com/';

  constructor(private http: HttpClient) {}

  searchMovie(title: string): Observable<OmdbMovieResult> {
    const url = `${this.baseUrl}?t=${encodeURIComponent(title)}&apikey=${this.apiKey}`;
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response.Response === 'False') {
          return { Poster: '', Director: '', Writer: '' };
        }
        return {
          Poster: response.Poster || '',
          Director: response.Director || '',
          Writer: response.Writer || ''  // 👈 mapped from OMDb response
        };
      }),
      catchError(() => {
        return throwError(() => new Error('Failed to fetch movie data'));
      })
    );
  }
}
