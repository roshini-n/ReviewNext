// filepath: src/app/services/beautyProductReview.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';
import { ReviewService } from './review.service';

@Injectable({ providedIn: 'root' })
export class BeautyProductReviewService {
  private reviewService = inject(ReviewService);

  getReviewsByProductId(productId: string): Observable<Review[]> {
    return this.reviewService.getReviewsByItemId('beauty-product', productId);
  }

  deleteReview(reviewId: string): Observable<void> {
    return this.reviewService.deleteReview(reviewId);
  }
}
