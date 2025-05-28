import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError, switchMap, of } from 'rxjs';

interface RAWGGame {
  id: number;
  name: string;
  background_image: string;
  rating: number;
  released: string;
}

interface RAWGGameDetails extends RAWGGame {
  developers?: { id: number; name: string }[];
  publishers?: { id: number; name: string }[];
}

interface RAWGResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RAWGGame[];
}

interface GameSearchResult {
  imageUrl: string;
  developer: string;
  publisher: string;
}

@Injectable({
  providedIn: 'root'
})
export class IGDBService {
  private readonly apiKey = '873b450f6ff648fdbdaf5de426e99436';
  private readonly baseUrl = 'https://api.rawg.io/api/games';

  constructor(private http: HttpClient) {}

  private cleanTitle(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = this.cleanTitle(str1);
    const s2 = this.cleanTitle(str2);
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    return (longer.length - this.editDistance(longer, shorter)) / longer.length;
  }

  private editDistance(s1: string, s2: string): number {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  searchGame(title: string, year?: number): Observable<GameSearchResult> {
    console.log('Searching for game:', title, year ? `(Year: ${year})` : '');

    const cleanTitle = this.cleanTitle(title);
    let url = `${this.baseUrl}?key=${this.apiKey}&search=${encodeURIComponent(title)}&ordering=-rating&page_size=10`;

    if (year) {
      url += `&dates=${year}-01-01,${year}-12-31`;
    }

    return this.http.get<RAWGResponse>(url).pipe(
      switchMap(response => {
        if (!response.results || response.results.length === 0) {
          return of({ imageUrl: '', developer: '', publisher: '' });
        }
        // Try to find exact match first
        const exactMatch = response.results.find((game: RAWGGame) => 
          this.cleanTitle(game.name) === cleanTitle ||
          this.cleanTitle(game.name).includes(cleanTitle) ||
          cleanTitle.includes(this.cleanTitle(game.name))
        );
        const match = exactMatch || response.results[0];
        if (!match) {
          return of({ imageUrl: '', developer: '', publisher: '' });
        }
        // Second call: fetch full details
        return this.http.get<RAWGGameDetails>(`${this.baseUrl}/${match.id}?key=${this.apiKey}`).pipe(
          map(details => {
            return {
              imageUrl: details.background_image || '',
              developer: details.developers?.map(d => d.name).join(', ') || '',
              publisher: details.publishers?.map(p => p.name).join(', ') || ''
            };
          }),
          catchError(error => {
            // fallback to image only if details call fails
            return of({ imageUrl: match.background_image || '', developer: '', publisher: '' });
          })
        );
      }),
      catchError(error => {
        console.error('Error searching game:', error);
        if (error.status === 401) {
          console.error('API key might be invalid or not yet approved');
        }
        return throwError(() => new Error('Failed to search for game information'));
      })
    );
  }
} 