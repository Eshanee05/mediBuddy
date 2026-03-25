import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.authService.currentUserValue;
    if (user) {
      if (route.data['role'] && route.data['role'] !== user.role) {
        this.router.navigate(['/']);
        return false;
      }
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
