import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { FooterComponent } from './components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { UserActivityService } from './services/user-activity.service';
import { RoutePersistenceService } from './services/route-persistence.service';

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

  ngOnInit(): void {
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

  ngOnDestroy(): void {
    // Clean up activity monitoring when component is destroyed
    this.userActivityService.stopActivityMonitoring();
  }
}
