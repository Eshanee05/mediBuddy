import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register-patient',
  templateUrl: './register-patient.component.html',
  styleUrls: ['./register-patient.component.css']
})
export class RegisterPatientComponent implements OnInit {
  registerForm!: FormGroup;
  submitted = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
    
    // Pattern matches Backend regex exactly
    const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=_]).{8,}$/;
    
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      mobile: ['', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      password: ['', [Validators.required, Validators.pattern(passwordPattern)]]
    });
  }

  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.registerPatient(this.registerForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Patient registered successfully! You will be redirected shortly...';
        setTimeout(() => this.router.navigate(['/patient-dashboard']), 2500);
      },
      error: (err) => {
        this.isLoading = false;
        
        // Handle ProgressEvent (network errors -> isTrusted yields "true" otherwise)
        if (err.name === 'HttpErrorResponse' && err.status === 0) {
          this.errorMessage = 'Network Error: Cannot reach the backend. Please ensure Spring Boot is running!';
        }
        else if (err.error && err.error.error) {
           this.errorMessage = err.error.error;
        } else if (err.error && typeof err.error === 'object') {
           const errVals = Object.values(err.error).filter(v => typeof v === 'string');
           this.errorMessage = errVals.join(', ') || 'Registration failed';
        } else {
           this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }
}
