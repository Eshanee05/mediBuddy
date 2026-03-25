import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register-doctor',
  templateUrl: './register-doctor.component.html',
  styleUrls: ['./register-doctor.component.css']
})
export class RegisterDoctorComponent implements OnInit {
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

    const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=_]).{8,}$/;
    
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      mobile: ['', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      doctorId: ['', Validators.required],
      specialization: ['', Validators.required],
      experience: ['', [Validators.required, Validators.min(0)]],
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
    this.authService.registerDoctor(this.registerForm.value).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.successMessage = res.message || 'Registration submitted successfully. Please wait for admin approval before logging in.';
        this.registerForm.reset();
        this.submitted = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.error && err.error.error) {
           this.errorMessage = err.error.error;
        } else if (err.error && typeof err.error === 'object') {
           const errMap = Object.values(err.error).join(', ');
           this.errorMessage = errMap || 'Registration failed';
        } else {
           this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }
}
