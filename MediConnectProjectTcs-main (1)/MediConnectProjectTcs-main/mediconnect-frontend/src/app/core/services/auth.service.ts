import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService, private router: Router) {
    this.checkToken();
  }

  private checkToken() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const isExpired = decodedToken.exp * 1000 < Date.now();
        if (isExpired) {
          this.logout();
        } else {
          // In a real app, you might fetch user profile here. For now, decode token.
          const userStr = localStorage.getItem('user');
          if (userStr) {
             this.currentUserSubject.next(JSON.parse(userStr));
          }
        }
      } catch (e) {
        this.logout();
      }
    }
  }

  login(credentials: any): Observable<any> {
    return this.apiService.post('/auth/login', credentials).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          const userObj = { email: res.email, role: res.role, name: res.name };
          localStorage.setItem('user', JSON.stringify(userObj));
          this.currentUserSubject.next(userObj);
        }
      })
    );
  }

  registerPatient(data: any): Observable<any> {
    return this.apiService.post('/auth/register/patient', data).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          const userObj = { email: res.email, role: res.role, name: res.name };
          localStorage.setItem('user', JSON.stringify(userObj));
          this.currentUserSubject.next(userObj);
        }
      })
    );
  }

  registerDoctor(data: any): Observable<any> {
    return this.apiService.post('/auth/register/doctor', data);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  get currentUserValue() {
    return this.currentUserSubject.value;
  }
}
