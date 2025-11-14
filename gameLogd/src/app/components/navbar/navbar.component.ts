import { Component, inject, ViewChild, OnInit, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ThemeService } from '../../services/theme.service';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatButtonModule, 
    MatIconModule, 
    MatToolbarModule, 
    MatMenuModule,
    RouterLink, 
    FormsModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  userService = inject(UserService);
  adminAuthService = inject(AdminAuthService);
  searchQuery: string = '';
  avatarUrl: string = 'assets/default-avatar.png';
  isLoginOrRegister: boolean = false;
  isUserDashboard: boolean = false;
  isHomePage: boolean = false;
  isMobileMenuOpen: boolean = false;
  isAdmin: boolean = false;

  constructor(private router: Router, private themeService: ThemeService) {
    // Use effect to watch for auth state changes
    effect(() => {
      const user = this.authService.currentUserSig();
      if (user) {
        this.loadUserAvatar();
        // Check admin status when user changes
        this.adminAuthService.isAdmin().subscribe(isAdmin => {
          console.log('Navbar: Admin status changed to:', isAdmin, 'for user:', user.email);
          this.isAdmin = isAdmin;
        });
      } else {
        this.avatarUrl = 'assets/default-avatar.png';
        this.isAdmin = false;
      }
    });

    // Subscribe to router events to detect current page
    this.router.events.subscribe(() => {
      this.checkCurrentRoute();
    });
  }

  ngOnInit() {
    this.loadUserAvatar();
    // Check current route on initialization
    this.checkCurrentRoute();
  }

  private checkCurrentRoute() {
    const currentUrl = this.router.url;
    this.isLoginOrRegister = currentUrl.includes('/login') || currentUrl.includes('/register');
    this.isUserDashboard = currentUrl.includes('/dashboard');
    this.isHomePage = currentUrl === '/' || currentUrl === '/home';
  }

  loadUserAvatar() {
    this.authService.getUid().then(uid => {
      if (uid) {
        // Subscribe to live changes so avatar updates immediately after change
        this.userService.observeUserById(uid).subscribe(user => {
          if (user?.avatarUrl) {
            this.avatarUrl = user.avatarUrl;
          } else {
            this.avatarUrl = 'assets/default-avatar.png';
          }
        });
      }
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      const url = this.router.url.split('?')[0];
      if (url === '/' || url.startsWith('/dashboard')) {
        this.router.navigate(['/search-all'], { queryParams: { q: this.searchQuery } });
      } else if (url.startsWith('/books') || url.startsWith('/book-search')) {
        this.router.navigate(['/book-search'], { queryParams: { q: this.searchQuery } });
      } else if (url.startsWith('/movies') || url.startsWith('/movie-search')) {
        this.router.navigate(['/movie-search'], { queryParams: { q: this.searchQuery } });
      } else if (url.startsWith('/beauty-products') || url.startsWith('/beauty-product-search')) {
        this.router.navigate(['/beauty-product-search'], { queryParams: { q: this.searchQuery } });
      } else if (url.startsWith('/web-series') || url.startsWith('/web-series-search')) {
        this.router.navigate(['/web-series-search'], { queryParams: { q: this.searchQuery } });
      } else if (url.startsWith('/electronic-gadgets') || url.startsWith('/electronic-gadget-search')) {
        this.router.navigate(['/electronic-gadget-search'], { queryParams: { q: this.searchQuery } });
      } else if (url.startsWith('/games') || url.startsWith('/search')) {
        this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
      } else {
        this.router.navigate(['/search-all'], { queryParams: { q: this.searchQuery } });
      }
      this.searchQuery = '';
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }

  // Switch to dark theme
  switchToDarkTheme() {
    this.themeService.setTheme('dark');
  }

  // Switch to light theme
  switchToLightTheme() {
    this.themeService.setTheme('light');
  }

  // Switch to custom theme
  switchToCustomTheme() {
    this.themeService.setTheme('custom');
  }

  // Mobile menu methods
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  onMobileMenuItemClick() {
    this.closeMobileMenu();
  }

  // Navigate to admin dashboard with proper error handling
  navigateToAdmin() {
    console.log('Admin button clicked, checking admin status...');
    this.adminAuthService.isAdmin().subscribe(isAdmin => {
      console.log('Admin status check result:', isAdmin);
      if (isAdmin) {
        console.log('Navigating to admin dashboard...');
        this.router.navigate(['/admin']).then(
          (success) => {
            console.log('Navigation successful:', success);
          },
          (error) => {
            console.error('Navigation failed:', error);
          }
        );
      } else {
        console.warn('Access denied: User is not an admin');
        alert('Access denied: Admin privileges required');
      }
    });
  }
}
