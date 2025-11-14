import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';
import { AuthService } from '../services/auth.service';
import { map, take, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export const adminGuard = () => {
  const router = inject(Router);
  const adminAuthService = inject(AdminAuthService);
  const authService = inject(AuthService);

  return authService.user$.pipe(
    take(1),
    switchMap(user => {
      console.log('Admin Guard: Checking user:', user?.email);
      if (!user) {
        // User not authenticated, redirect to login
        console.log('Admin Guard: User not authenticated, redirecting to login');
        router.navigate(['/login']);
        return of(false);
      }
      
      // User is authenticated, check if they're admin
      return adminAuthService.isAdmin().pipe(
        take(1),
        map(isAdmin => {
          console.log('Admin Guard: Admin check result:', isAdmin, 'for user:', user.email);
          if (isAdmin) {
            console.log('Admin Guard: Access granted');
            return true;
          } else {
            // User is not admin, redirect to dashboard with message
            console.warn('Admin Guard: Access denied - Admin privileges required for:', user.email);
            router.navigate(['/dashboard']);
            return false;
          }
        })
      );
    })
  );
};
