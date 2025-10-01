import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BeautyProductsApiService {
  private makeupApiBase = 'https://makeup-api.herokuapp.com/api/v1/products.json';

  constructor(private http: HttpClient) {}

  searchProduct(title: string, brand: string): Observable<{ imageUrl: string; usageInstructions: string } | null> {
    if (!title && !brand) {
      return of(null);
    }

    const brandParam = encodeURIComponent(brand.toLowerCase());
    const productTypeParam = encodeURIComponent(title.toLowerCase());

    const url = `${this.makeupApiBase}?brand=${brandParam}&product_type=${productTypeParam}`;

    return this.http.get<any[]>(url).pipe(
      map(results => {
        if (results && results.length > 0) {
          const first = results[0];
          return {
            imageUrl: first.image_link || '',
            usageInstructions: first.description
              ? first.description
              : 'No usage instructions available. Please check packaging.'
          };
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }
}