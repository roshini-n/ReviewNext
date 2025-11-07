import { inject } from '@angular/core';
import { Router } from '@angular/router';
<<<<<<< Updated upstream
import { AdminService } from '../services/admin.service';
=======
import { AuthService } from '../services/auth.service';
>>>>>>> Stashed changes
import { map, take } from 'rxjs/operators';

export const adminGuard = () => {
  const router = inject(Router);
<<<<<<< Updated upstream
  const adminService = inject(AdminService);

  return adminService.isAdmin().pipe(
    take(1),
    map(isAdmin => {
      if (isAdmin) {
        return true;
      } else {
        // Redirect to dashboard if not admin
=======
  const authService = inject(AuthService);
  
  const adminEmails = [
    'admin@example.com',
    'roshininaguru12@gmail.com',
    'admin@reviewnext.com',
    'super@admin.com'
  ];

  return authService.user$.pipe(
    take(1),
    map(user => {
      if (user && user.email && adminEmails.includes(user.email)) {
        return true;
      } else {
>>>>>>> Stashed changes
        router.navigate(['/dashboard']);
        return false;
      }
    })
  );
<<<<<<< Updated upstream
};
=======
};
>>>>>>> Stashed changes
