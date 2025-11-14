import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private authService = inject(AuthService);

  // Default admin emails as specified in the README
  private adminEmails = [
    'admin@example.com',
    'roshininaguru12@gmail.com', 
    'admin@reviewnext.com',
    'super@admin.com'
  ];

  /**
   * Check if the current user is an admin
   */
  isAdmin(): Observable<boolean> {
    return this.authService.user$.pipe(
      map(user => {
        console.log('AdminAuthService: Checking user for admin status:', user?.email);
        if (!user) {
          console.log('AdminAuthService: No user found');
          return false;
        }
        const isAdmin = this.adminEmails.includes(user.email || '');
        console.log('AdminAuthService: Admin check result:', isAdmin, 'for email:', user.email);
        console.log('AdminAuthService: Admin emails list:', this.adminEmails);
        return isAdmin;
      })
    );
  }

  /**
   * Get admin emails list (for configuration purposes)
   */
  getAdminEmails(): string[] {
    return [...this.adminEmails];
  }

  /**
   * Check if a specific email is an admin email
   */
  isAdminEmail(email: string): boolean {
    return this.adminEmails.includes(email);
  }

  /**
   * Add a new admin email (for runtime configuration)
   * Note: This only affects the current session
   */
  addAdminEmail(email: string): void {
    if (!this.adminEmails.includes(email)) {
      this.adminEmails.push(email);
    }
  }

  /**
   * Remove an admin email (for runtime configuration)
   * Note: This only affects the current session
   */
  removeAdminEmail(email: string): void {
    const index = this.adminEmails.indexOf(email);
    if (index > -1) {
      this.adminEmails.splice(index, 1);
    }
  }
}
