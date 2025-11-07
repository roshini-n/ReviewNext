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
  isMobileMenuOpen: boolean = false;

  constructor(private router: Router, private themeService: ThemeService) {
    effect(() => {
      const user = this.authService.currentUserSig();
      if (user) {
        this.loadUserAvatar();
      } else {
        this.avatarUrl = 'assets/default-avatar.png';
        this.isAdmin = false;
      }
    });

    this.router.events.subscribe(() => this.checkCurrentRoute());
  }

  ngOnInit() {
    this.loadUserAvatar();
    this.checkCurrentRoute();
    this.adminService.isAdmin().subscribe(isAdmin => this.isAdmin = isAdmin);
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
    if (!this.searchQuery.trim()) return;
    const url = this.router.url.split('?')[0];
    const params = { queryParams: { q: this.searchQuery } };
    if (url === '/' || url.startsWith('/dashboard')) this.router.navigate(['/search-all'], params);
    else if (url.startsWith('/books')) this.router.navigate(['/book-search'], params);
    else if (url.startsWith('/movies')) this.router.navigate(['/movie-search'], params);
    else if (url.startsWith('/beauty-products')) this.router.navigate(['/beauty-product-search'], params);
    else if (url.startsWith('/web-series')) this.router.navigate(['/web-series-search'], params);
    else if (url.startsWith('/electronic-gadgets')) this.router.navigate(['/electronic-gadget-search'], params);
    else if (url.startsWith('/games') || url.startsWith('/search')) this.router.navigate(['/search'], params);
    else this.router.navigate(['/search-all'], params);
    this.searchQuery = '';
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/');
    this.isMobileMenuOpen = false;
  }

  switchToDarkTheme() { this.themeService.setTheme('dark'); }
  switchToLightTheme() { this.themeService.setTheme('light'); }
  switchToCustomTheme() { this.themeService.setTheme('custom'); }

  toggleMobileMenu() { this.isMobileMenuOpen = !this.isMobileMenuOpen; }
  closeMobileMenu() { this.isMobileMenuOpen = false; }
  onMobileMenuItemClick() { this.closeMobileMenu(); }

  navigateToAdmin() { this.router.navigate(['/admin']); this.closeMobileMenu(); }
}
