// filepath: src/app/services/review-event.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReviewEventService {
  private reviewChangedSubject = new Subject<void>();
  reviewChanged$ = this.reviewChangedSubject.asObservable();

  notifyReviewChanged() {
    this.reviewChangedSubject.next();
  }
}
