import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleBooksService {
  private readonly baseUrl = 'https://www.googleapis.com/books/v1/volumes';

  constructor(private http: HttpClient) {}

  searchBook(title: string, author?: string, year?: number): Observable<string> {
    // Build the search query
    let query = `intitle:${encodeURIComponent(title)}`;
    if (author) {
      query += `+inauthor:${encodeURIComponent(author)}`;
    }
    if (year) {
      query += `+publishedDate:${year}`;
    }

    return this.http.get<any>(`${this.baseUrl}?q=${query}&maxResults=5`).pipe(
      map(response => {
        if (response.items && response.items.length > 0) {
          // Try to find exact match first
          const exactMatch = response.items.find((book: any) => {
            const bookTitle = book.volumeInfo.title.toLowerCase();
            const searchTitle = title.toLowerCase();
            return bookTitle === searchTitle;
          });

          if (exactMatch?.volumeInfo?.imageLinks?.thumbnail) {
            return this.getHighQualityImage(exactMatch.volumeInfo.imageLinks.thumbnail);
          }

          // If no exact match, try to find closest match
          const closestMatch = response.items.find((book: any) => {
            const bookTitle = book.volumeInfo.title.toLowerCase();
            const searchTitle = title.toLowerCase();
            return bookTitle.includes(searchTitle) || searchTitle.includes(bookTitle);
          });

          if (closestMatch?.volumeInfo?.imageLinks?.thumbnail) {
            return this.getHighQualityImage(closestMatch.volumeInfo.imageLinks.thumbnail);
          }

          // If still no match, return the first result with an image
          const firstWithImage = response.items.find((book: any) => 
            book.volumeInfo?.imageLinks?.thumbnail
          );

          if (firstWithImage?.volumeInfo?.imageLinks?.thumbnail) {
            return this.getHighQualityImage(firstWithImage.volumeInfo.imageLinks.thumbnail);
          }
        }
        return '';
      })
    );
  }

  private getHighQualityImage(thumbnailUrl: string): string {
    // Google Books API returns small thumbnails by default
    // This function converts the URL to get a higher quality image
    return thumbnailUrl
      .replace('zoom=1', 'zoom=3')  // Increase zoom level
      .replace('&edge=curl', '')    // Remove curl effect
      .replace('&source=gbs_api', ''); // Remove API source
  }
} 