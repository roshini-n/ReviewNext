import { Component, inject, ViewChild, OnInit, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink, Router } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ThemeService } from '../../services/theme.service';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule, 
    MatIconModule, 
    MatToolbarModule, 
  MatMenuModule,
  MatDividerModule,
    RouterLink, 
    FormsModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  userService = inject(UserService);
  adminService = inject(AdminService);
  searchQuery: string = '';
  avatarUrl: string = 'assets/default-avatar.png';
  isLoginOrRegister: boolean = false;
  isUserDashboard: boolean = false;
  isHomePage: boolean = false;
  isAdmin: boolean = false;

<<<<<<< Updated upstream
  constructor(public router: Router, private themeService: ThemeService) {
=======
  private readonly adminEmails = [
    'admin@example.com',
    'roshininaguru12@gmail.com',
    'admin@reviewnext.com',
    'super@admin.com'
  ];

  constructor(private router: Router, private themeService: ThemeService) {
>>>>>>> Stashed changes
    // Use effect to watch for auth state changes
    effect(() => {
      const user = this.authService.currentUserSig();
      if (user) {
        this.loadUserAvatar();
        this.checkAdminStatus();
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
    this.checkAdminStatus();
    // Check current route on initialization
    this.checkCurrentRoute();
  }

  private checkAdminStatus() {
    this.adminService.isAdmin().subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
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
        this.userService.getUserById(uid).subscribe(user => {
          if (user?.avatarUrl) {
            this.avatarUrl = user.avatarUrl;
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
<<<<<<< Updated upstream
=======

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

  isAdmin(): boolean {
    const user = this.authService.currentUserSig();
    return user?.email ? this.adminEmails.includes(user.email) : false;
  }

  navigateToAdmin() {
    this.router.navigate(['/admin']);
  }
>>>>>>> Stashed changes
}
