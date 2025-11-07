import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { map, take } from 'rxjs/operators';
import { AdminConfig } from '../config/admin.config';

export const adminGuard = () => {
  const router = inject(Router);
  const adminService = inject(AdminService);

  return adminService.isAdmin().pipe(
    take(1),
    map(isAdmin => {
      if (isAdmin) return true;
      router.navigate([AdminConfig.security.unauthorizedRedirect]);
      return false;
    })
  );
};
