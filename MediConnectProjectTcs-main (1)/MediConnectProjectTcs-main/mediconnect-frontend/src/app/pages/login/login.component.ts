import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  isLoading = false;
  errorMessage = '';
  selectedRole: 'PATIENT' | 'DOCTOR' | 'ADMIN' = 'PATIENT';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const roleParam = this.route.snapshot.queryParams['role'];
    if (roleParam) {
      this.selectedRole = roleParam.toUpperCase() as any;
    }
    
    // Always reset form on init to avoid sticky credentials
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    if (this.authService.currentUserValue) {
      this.redirectUser(this.authService.currentUserValue.role);
    }
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.redirectUser(res.role);
      },
      error: (err) => {
        this.isLoading = false;
        // The global exception handler from backend wraps errors
        if (err.error && err.error.error) {
           this.errorMessage = err.error.error;
        } else {
           this.errorMessage = 'Invalid email or password';
        }
      }
    });
  }

  private redirectUser(role: string) {
    if (role === 'ROLE_PATIENT') this.router.navigate(['/patient-dashboard']);
    else if (role === 'ROLE_DOCTOR') this.router.navigate(['/doctor-dashboard']);
    else if (role === 'ROLE_ADMIN') this.router.navigate(['/admin-dashboard']);
    else this.router.navigate(['/']);
  }
}
