import { Component, inject, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

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
export class NavbarComponent {
  authService = inject(AuthService);
  userService = inject(UserService);
  searchQuery: string = '';
  avatarUrl: string = 'assets/default-avatar.png';

  constructor(private router: Router) {
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
}
