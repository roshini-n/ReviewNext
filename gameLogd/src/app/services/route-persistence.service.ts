import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoutePersistenceService {
  private readonly LAST_ROUTE_KEY = 'lastRoute';
  private readonly PUBLIC_ROUTES = ['/login', '/register'];

  constructor(private router: Router) {
    // Subscribe to route changes to automatically save the last route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (!this.PUBLIC_ROUTES.includes(event.url)) {
        this.saveLastRoute(event.url);
      }
    });

    // Handle initial page load
    const lastRoute = this.getLastRoute();
    const currentUrl = window.location.pathname;
    
    // Only redirect if we're at the root and there's a saved route
    if (currentUrl === '/' && lastRoute && lastRoute !== '/') {
      this.redirectToLastRoute();
    }
  }

  saveLastRoute(route: string): void {
    localStorage.setItem(this.LAST_ROUTE_KEY, route);
  }

  getLastRoute(): string {
    const lastRoute = localStorage.getItem(this.LAST_ROUTE_KEY);
    return lastRoute && !this.PUBLIC_ROUTES.includes(lastRoute) ? lastRoute : '/';
  }

  clearLastRoute(): void {
    localStorage.removeItem(this.LAST_ROUTE_KEY);
  }

  redirectToLastRoute(): void {
    const lastRoute = this.getLastRoute();
    this.router.navigate([lastRoute]);
  }
}