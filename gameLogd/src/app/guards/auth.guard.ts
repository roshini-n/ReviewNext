import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoutePersistenceService } from '../services/route-persistence.service';
import { map, take } from 'rxjs/operators';

export const authGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const routePersistenceService = inject(RoutePersistenceService);

  return authService.user$.pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      } else {
        // Save the attempted route before redirecting to login
        routePersistenceService.saveLastRoute(router.url);
        router.navigate(['/login']);
        return false;
      }
    })
  );
};