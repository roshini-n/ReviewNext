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
  searchQuery: string = '';
  avatarUrl: string = 'assets/default-avatar.png';

  constructor(private router: Router, private themeService: ThemeService) {
    // Use effect to watch for auth state changes
    effect(() => {
      const user = this.authService.currentUserSig();
      if (user) {
        this.loadUserAvatar();
      } else {
        this.avatarUrl = 'assets/default-avatar.png';
      }
    });
  }

  ngOnInit() {
    this.loadUserAvatar();
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
      this.router.navigate(['/search'], { 
        queryParams: { q: this.searchQuery }
      });
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
}
