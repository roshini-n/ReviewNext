import { Component, inject, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

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
  searchQuery: string = '';

  constructor(private router: Router) {}

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { 
        queryParams: { q: this.searchQuery }
      });
    }
  }
}
