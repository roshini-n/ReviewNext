import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';

interface RAWGGame {
  id: number;
  name: string;
  background_image: string;
  rating: number;
  released: string;
}

interface RAWGResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RAWGGame[];
}

@Injectable({
  providedIn: 'root'
})
export class IGDBService {
  private readonly apiKey = '873b450f6ff648fdbdaf5de426e99436';
  private readonly baseUrl = 'https://api.rawg.io/api/games';

  constructor(private http: HttpClient) {}

  searchGame(title: string, year?: number): Observable<string> {
    console.log('Searching for game:', title, year ? `(Year: ${year})` : '');
    
    if (!title || title.length < 2) {
      console.log('Title too short, skipping search');
      return new Observable(observer => {
        observer.next('');
        observer.complete();
      });
    }

    // Clean the title for better matching
    const cleanTitle = this.cleanTitle(title);
    console.log('Cleaned title:', cleanTitle);

    // Build the search URL with more parameters
    let url = `${this.baseUrl}?key=${this.apiKey}&search=${encodeURIComponent(title)}&page_size=10&ordering=-rating`;
    
    if (year) {
      url += `&dates=${year}-01-01,${year}-12-31`;
    }

    console.log('Making request to RAWG API:', url);

    return this.http.get<RAWGResponse>(url).pipe(
      map(response => {
        console.log('RAWG response:', response);
        
        if (!response.results || response.results.length === 0) {
          console.log('No results found');
          return '';
        }

        // Try to find exact match first
        const exactMatch = response.results.find((game: RAWGGame) => 
          this.cleanTitle(game.name) === cleanTitle ||
          this.cleanTitle(game.name).includes(cleanTitle) ||
          cleanTitle.includes(this.cleanTitle(game.name))
        );

        if (exactMatch?.background_image) {
          console.log('Found exact match:', exactMatch.name);
          return exactMatch.background_image;
        }

        // If no exact match, try to find closest match
        const closestMatch = response.results.find((game: RAWGGame) => {
          const gameTitle = this.cleanTitle(game.name);
          return gameTitle.includes(cleanTitle) || 
                 cleanTitle.includes(gameTitle) ||
                 this.calculateSimilarity(gameTitle, cleanTitle) > 0.7;
        });

        if (closestMatch?.background_image) {
          console.log('Found closest match:', closestMatch.name);
          return closestMatch.background_image;
        }

        // If still no match, return the highest rated game's image
        const highestRated = response.results[0];
        if (highestRated?.background_image) {
          console.log('Using highest rated game:', highestRated.name);
          return highestRated.background_image;
        }

        console.log('No suitable image found');
        return '';
      }),
      catchError(error => {
        console.error('Error searching game:', error);
        if (error.status === 401) {
          console.error('API key might be invalid or not yet approved');
        }
        return throwError(() => new Error('Failed to search for game image'));
      })
    );
  }

  private cleanTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove special characters and spaces
      .replace(/the/g, '') // Remove common words
      .replace(/game/g, '')
      .replace(/edition/g, '')
      .replace(/deluxe/g, '')
      .replace(/special/g, '')
      .replace(/collectors/g, '')
      .replace(/remastered/g, '')
      .replace(/remaster/g, '')
      .replace(/hd/g, '')
      .replace(/definitive/g, '')
      .trim();
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) {
      return 1.0;
    }
    
    return (longer.length - this.editDistance(longer, shorter)) / longer.length;
  }

  private editDistance(str1: string, str2: string): number {
    const track = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1, // deletion
          track[j - 1][i] + 1, // insertion
          track[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return track[str2.length][str1.length];
  }
} 