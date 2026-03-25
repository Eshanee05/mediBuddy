import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  private autoSub!: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.autoSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout() {
    this.authService.logout();
  }

  getDashboardLink(): string {
    if (!this.currentUser) return '/';
    switch (this.currentUser.role) {
      case 'ROLE_PATIENT': return '/patient-dashboard';
      case 'ROLE_DOCTOR': return '/doctor-dashboard';
      case 'ROLE_ADMIN': return '/admin-dashboard';
      default: return '/';
    }
  }

  ngOnDestroy(): void {
    if (this.autoSub) this.autoSub.unsubscribe();
  }
}
