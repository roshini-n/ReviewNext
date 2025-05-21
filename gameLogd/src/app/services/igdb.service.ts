import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IGDBService {
  private readonly clientId = 'YOUR_TWITCH_CLIENT_ID'; // Replace with your Twitch Client ID
  private readonly clientSecret = 'YOUR_TWITCH_CLIENT_SECRET'; // Replace with your Twitch Client Secret
  private readonly baseUrl = 'https://api.igdb.com/v4';
  private readonly imageBaseUrl = 'https://images.igdb.com/igdb/image/upload/t_cover_big';
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private http: HttpClient) {}

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials'
      })
    }).then(res => res.json());

    this.accessToken = response.access_token;
    this.tokenExpiry = Date.now() + (response.expires_in * 1000);
    return this.accessToken;
  }

  searchGame(title: string, year?: number): Observable<string> {
    return new Observable(observer => {
      this.getAccessToken().then(token => {
        const headers = new HttpHeaders({
          'Client-ID': this.clientId,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

        // Clean the title for better matching
        const cleanTitle = this.cleanTitle(title);

        // Build the query with more fields for better matching
        let query = `search "${cleanTitle}"; fields name,cover.image_id,first_release_date,slug,alternative_names; limit 20;`;
        if (year) {
          const startDate = new Date(year, 0, 1).getTime() / 1000;
          const endDate = new Date(year, 11, 31).getTime() / 1000;
          query = `search "${cleanTitle}"; fields name,cover.image_id,first_release_date,slug,alternative_names; where first_release_date >= ${startDate} & first_release_date <= ${endDate}; limit 20;`;
        }

        this.http.post<any[]>(`${this.baseUrl}/games`, query, { headers }).pipe(
          map(response => {
            if (response && response.length > 0) {
              // Try to find exact match first
              const exactMatch = response.find(game => 
                this.cleanTitle(game.name) === cleanTitle ||
                (game.alternative_names && game.alternative_names.some((alt: string) => 
                  this.cleanTitle(alt) === cleanTitle
                ))
              );

              if (exactMatch && exactMatch.cover) {
                return `${this.imageBaseUrl}/${exactMatch.cover.image_id}.jpg`;
              }

              // If no exact match, try to find closest match
              const closestMatch = response.find(game => {
                const gameTitle = this.cleanTitle(game.name);
                return gameTitle.includes(cleanTitle) || 
                       cleanTitle.includes(gameTitle) ||
                       (game.alternative_names && game.alternative_names.some((alt: string) => 
                         this.cleanTitle(alt).includes(cleanTitle) || 
                         cleanTitle.includes(this.cleanTitle(alt))
                       ));
              });

              if (closestMatch && closestMatch.cover) {
                return `${this.imageBaseUrl}/${closestMatch.cover.image_id}.jpg`;
              }

              // If still no match, return the first result with a cover
              const firstWithCover = response.find(game => game.cover);
              if (firstWithCover) {
                return `${this.imageBaseUrl}/${firstWithCover.cover.image_id}.jpg`;
              }
            }
            return '';
          })
        ).subscribe({
          next: (imageUrl) => observer.next(imageUrl),
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
      });
    });
  }

  private cleanTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove special characters and spaces
      .replace(/the/g, '') // Remove common words
      .replace(/game/g, '')
      .replace(/edition/g, '')
      .trim();
  }
} 