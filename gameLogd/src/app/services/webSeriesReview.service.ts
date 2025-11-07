// filepath: src/app/services/webSeriesReview.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';
import { ReviewService } from './review.service';

@Injectable({ providedIn: 'root' })
export class WebSeriesReviewService {
  private reviewService = inject(ReviewService);

  getReviewsBySeriesId(seriesId: string): Observable<Review[]> {
    return this.reviewService.getReviewsByItemId('web-series', seriesId);
  }

  deleteReview(reviewId: string): Observable<void> {
    return this.reviewService.deleteReview(reviewId);
  }
}
