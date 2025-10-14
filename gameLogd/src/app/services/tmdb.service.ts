import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface TmdbTVResult {
  poster_path?: string;
  name?: string;
  overview?: string;
  first_air_date?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class TMDBService {
  private readonly accessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmODlkMWFlYmMyMjk3Y2U0ZjBmODA3N2M1ODIyNmUxOCIsIm5iZiI6MTc0NzgwMTUyNy4wMTcsInN1YiI6IjY4MmQ1NWI3YjYwMjQ2MDMxNDBiZTAxNyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.dwc7or1T7pP1hVWPN_aDhoYTq2kGy6bGTSUhGFdHbPw';
  private readonly baseUrl = 'https://api.themoviedb.org/3';
  private readonly imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  constructor(private http: HttpClient) {}

  // Search movies (existing)
  searchMovie(title: string, year?: number): Observable<string> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    let searchParams: any = {
      query: title,
      include_adult: 'false',
      language: 'en-US',
      page: '1'
    };
    if (year) searchParams.year = year;

    return this.http.get<any>(`${this.baseUrl}/search/movie`, { headers, params: searchParams }).pipe(
      map(response => {
        if (response.results && response.results.length > 0) {
          const exactMatch = response.results.find((movie: any) => movie.title.toLowerCase() === title.toLowerCase());
          return exactMatch ? this.getBestImage(exactMatch) : this.getBestImage(response.results[0]);
        }
        return '';
      })
    );
  }

  // 🔹 New: Search TV shows / web series
  searchTV(title: string): Observable<TmdbTVResult | null> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    const searchParams = {
      query: title,
      language: 'en-US',
      page: '1'
    };

    return this.http.get<any>(`${this.baseUrl}/search/tv`, { headers, params: searchParams }).pipe(
      map(response => (response.results && response.results.length > 0 ? response.results[0] : null))
    );
  }

  private getBestImage(item: any): string {
    if (item.poster_path) return `${this.imageBaseUrl}${item.poster_path}`;
    if (item.backdrop_path) return `${this.imageBaseUrl}${item.backdrop_path}`;
    return '';
  }
}

