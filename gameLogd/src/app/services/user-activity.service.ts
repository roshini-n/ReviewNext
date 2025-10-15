import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserActivityService {
  private inactivityTimeout = 10 * 60 * 1000; // 10 minutes in milliseconds
  private timeoutId: any;
  private userLoggedOut = new Subject<void>();
  userLoggedOut$ = this.userLoggedOut.asObservable();

  constructor(
    private router: Router,
    private ngZone: NgZone
  ) {}

  initializeActivityMonitoring(): void {
    this.resetTimer();
    this.setupActivityListeners();
  }

  private setupActivityListeners(): void {
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    
    events.forEach(eventName => {
      document.addEventListener(eventName, () => this.resetTimer());
    });
  }

  private resetTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Using NgZone to ensure the timeout runs within Angular's zone
    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          this.handleInactivityTimeout();
        });
      }, this.inactivityTimeout);
    });
  }

  private handleInactivityTimeout(): void {
    this.saveCurrentRoute();
    this.userLoggedOut.next();
    this.router.navigate(['/']);
  }

  private saveCurrentRoute(): void {
    const currentRoute = this.router.url;
    localStorage.setItem('lastRoute', currentRoute);
  }

  stopActivityMonitoring(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  getLastRoute(): string {
    return localStorage.getItem('lastRoute') || '/';
  }
}