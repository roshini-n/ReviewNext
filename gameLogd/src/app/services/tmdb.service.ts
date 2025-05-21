import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TMDBService {
  private readonly accessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmODlkMWFlYmMyMjk3Y2U0ZjBmODA3N2M1ODIyNmUxOCIsIm5iZiI6MTc0NzgwMTUyNy4wMTcsInN1YiI6IjY4MmQ1NWI3YjYwMjQ2MDMxNDBiZTAxNyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.dwc7or1T7pP1hVWPN_aDhoYTq2kGy6bGTSUhGFdHbPw';
  private readonly baseUrl = 'https://api.themoviedb.org/3';
  private readonly imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  constructor(private http: HttpClient) {}

  searchMovie(title: string, year?: number): Observable<string> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    // First try exact search with year if provided
    let searchParams: any = {
      query: title,
      include_adult: 'false',
      language: 'en-US',
      page: '1'
    };

    if (year) {
      searchParams.year = year;
    }

    return this.http.get<any>(`${this.baseUrl}/search/movie`, {
      headers,
      params: searchParams
    }).pipe(
      map(response => {
        if (response.results && response.results.length > 0) {
          // Try to find exact match first
          const exactMatch = response.results.find((movie: any) => {
            const movieTitle = movie.title.toLowerCase();
            const searchTitle = title.toLowerCase();
            return movieTitle === searchTitle;
          });

          if (exactMatch) {
            return this.getBestImage(exactMatch);
          }

          // If no exact match, try to find closest match
          const closestMatch = response.results.find((movie: any) => {
            const movieTitle = movie.title.toLowerCase();
            const searchTitle = title.toLowerCase();
            return movieTitle.includes(searchTitle) || searchTitle.includes(movieTitle);
          }) || response.results[0];

          return this.getBestImage(closestMatch);
        }
        return '';
      })
    );
  }

  private getBestImage(movie: any): string {
    // Try to get the highest quality poster first
    if (movie.poster_path) {
      return `${this.imageBaseUrl}${movie.poster_path}`;
    }
    
    // Fall back to backdrop if no poster
    if (movie.backdrop_path) {
      return `${this.imageBaseUrl}${movie.backdrop_path}`;
    }

    return '';
  }
} 