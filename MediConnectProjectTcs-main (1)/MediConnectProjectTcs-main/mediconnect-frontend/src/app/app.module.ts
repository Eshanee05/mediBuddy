import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterPatientComponent } from './pages/register-patient/register-patient.component';
import { RegisterDoctorComponent } from './pages/register-doctor/register-doctor.component';
import { HelpComponent } from './pages/help/help.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { PatientDashboardComponent } from './pages/patient-dashboard/patient-dashboard.component';
import { DoctorDashboardComponent } from './pages/doctor-dashboard/doctor-dashboard.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { FilterByUploaderPipe } from './core/pipes/filter-by-uploader.pipe';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    LandingComponent,
    HelpComponent,
    LoginComponent,
    RegisterPatientComponent,
    RegisterDoctorComponent,
    PatientDashboardComponent,
    DoctorDashboardComponent,
    AdminDashboardComponent,
    FilterByUploaderPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
