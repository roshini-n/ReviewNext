import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewEventService {
  // Subject to notify when a review/rating is deleted or updated
  private reviewChangedSubject = new Subject<void>();
  
  // Observable that components can subscribe to
  reviewChanged$ = this.reviewChangedSubject.asObservable();

  // Method to notify that a review/rating has been deleted or updated
  notifyReviewChanged(): void {
    this.reviewChangedSubject.next();
  }
}
