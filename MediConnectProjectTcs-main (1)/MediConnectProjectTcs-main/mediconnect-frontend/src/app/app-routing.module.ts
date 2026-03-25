import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterPatientComponent } from './pages/register-patient/register-patient.component';
import { RegisterDoctorComponent } from './pages/register-doctor/register-doctor.component';
import { PatientDashboardComponent } from './pages/patient-dashboard/patient-dashboard.component';
import { DoctorDashboardComponent } from './pages/doctor-dashboard/doctor-dashboard.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';

import { HelpComponent } from './pages/help/help.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'help', component: HelpComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register-patient', component: RegisterPatientComponent },
  { path: 'register-doctor', component: RegisterDoctorComponent },
  { path: 'patient-dashboard', component: PatientDashboardComponent, canActivate: [AuthGuard], data: { role: 'ROLE_PATIENT' } },
  { path: 'doctor-dashboard', component: DoctorDashboardComponent, canActivate: [AuthGuard], data: { role: 'ROLE_DOCTOR' } },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard], data: { role: 'ROLE_ADMIN' } },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { 
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
