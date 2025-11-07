import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { FooterComponent } from './components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { UserActivityService } from './services/user-activity.service';
import { RoutePersistenceService } from './services/route-persistence.service';
import { PwaService } from './services/pwa.service';
import { MobileService } from './services/mobile.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ReviewNext';
  authService = inject(AuthService);
  userActivityService = inject(UserActivityService);
  routePersistenceService = inject(RoutePersistenceService);
  pwaService = inject(PwaService);
  mobileService = inject(MobileService);

  ngOnInit(): void {
    // Initialize mobile features
    this.initializeMobileFeatures();
    
    // Initialize PWA
    this.initializePWA();

    this.authService.user$.subscribe((user) => {
      if (user) {
        this.authService.currentUserSig.set({
          email: user.email!,
          username: user.displayName!,
        });
        // Initialize activity monitoring when user is logged in
        this.userActivityService.initializeActivityMonitoring();
      } else {
        this.authService.currentUserSig.set(null);
        // Stop activity monitoring when user is logged out
        this.userActivityService.stopActivityMonitoring();
      }
    });
  }

  private initializeMobileFeatures(): void {
    // Add mobile CSS classes
    this.mobileService.addMobileClass();
    
    // Prevent pull-to-refresh on mobile
    this.mobileService.preventPullToRefresh();
    
    // Set up network status monitoring
    this.pwaService.onNetworkChange((isOnline: boolean) => {
      if (isOnline) {
        console.log('App is back online');
        // Trigger background sync if needed
        this.pwaService.backgroundSync('sync-offline-data');
      } else {
        console.log('App went offline');
      }
    });
  }

  private initializePWA(): void {
    // PWA service initializes automatically
    // But we can add additional setup here if needed
    
    // Request notification permission for mobile alerts
    this.pwaService.requestNotificationPermission().then(permission => {
      console.log('Notification permission:', permission);
    });
    
    // Set up network change handlers
    window.addEventListener('online', () => {
      this.pwaService.showNotification('You\'re back online!', {
        body: 'Your data will sync automatically.',
        icon: '/assets/icons/icon-192x192.png'
      });
    });
  }

  ngOnDestroy(): void {
    // Clean up activity monitoring when component is destroyed
    this.userActivityService.stopActivityMonitoring();
  }
}
