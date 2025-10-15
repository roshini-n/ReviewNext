import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { map, take } from 'rxjs/operators';

export const adminGuard = () => {
  const router = inject(Router);
  const adminService = inject(AdminService);

  return adminService.isAdmin().pipe(
    take(1),
    map(isAdmin => {
      if (isAdmin) {
        return true;
      } else {
        // Redirect to dashboard if not admin
        router.navigate(['/dashboard']);
        return false;
      }
    })
  );
};