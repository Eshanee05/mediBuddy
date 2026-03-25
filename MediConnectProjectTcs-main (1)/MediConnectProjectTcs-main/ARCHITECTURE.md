# Mediconnect Project Architecture Overview

This project is a full-stack medical appointment and record management system. Here is the detailed breakdown of the project structure.

## 📁 Backend (Spring Boot)
Located in `mediconnect-backend/src/main/java/com/mediconnect/`

### 🏗️ Core Modules

| Package | Responsibility | Key Files |
| :--- | :--- | :--- |
| **`config`** | Application-wide settings and data seeding. | `DataSeeder.java` (Test Users), `CorsConfig.java` |
| **`security`** | JWT authentication and access control. | `SecurityConfiguration.java` (URL whitelisting), `JwtService.java` |
| **`controller`**| API entry points. Routes requests to services. | `AuthController.java` (Login/Reg), `PatientController.java`, `FileController.java` |
| **`service`** | Business logic layer. Contains the "brains" of the app. | `DoctorService.java` (Slot calculation), `AuthService.java` |
| **`entity`** | Database models (JPA Entities). Maps to SQL tables. | `User.java`, `Doctor.java`, `Patient.java`, `MedicalFile.java` |
| **`repository`**| Data access layer using Spring Data JPA. | Interfaces for performing CRUD on Database. |
| **`dto`** | Data Transfer Objects for clean request/response handling. | `LoginRequest.java`, `DoctorRegisterRequest.java` |
| **`exception`** | Centeralized error handling. | `GlobalExceptionHandler.java` (Formats error responses) |

---

## 🎨 Frontend (Angular)
Located in `mediconnect-frontend/src/app/`

### 🧩 Component Hierarchy

| Category | Description | Key Components |
| :--- | :--- | :--- |
| **`core/services`** | Logic for API calls and state management. | `api.service.ts`, `auth.service.ts` |
| **`core/guards`** | Protecting routes based on authentication. | `auth.guard.ts` (Redirects if not logged in) |
| **`core/interceptors`**| Automatically adding JWT tokens to headers. | `auth.interceptor.ts` |
| **`layout`** | Global UI elements. | `navbar` (Navigation), `footer` |
| **`pages`** | High-level views/screens. | `landing` (Home), `login`, `patient-dashboard`, `doctor-dashboard` |

### 🛠️ Key Frontend Logic
- **Routing**: Managed in `app-routing.module.ts`. Defines URL paths.
- **Environment**: Managed in `src/environments/environment.ts`. Defines the Backend API URL.
- **Styling**: `styles.css` contains the global design system (Theming, Buttons, Cards).

---

## 🔄 How it Works Together
1. **Request**: User clicks "Login" in the Angular Frontend (`login.component.ts`).
2. **API Call**: `auth.service.ts` sends a POST request to the Backend `AuthController`.
3. **Logic**: `AuthService` in Java verifies credentials and generates a JWT token.
4. **Interception**: For every future request, `auth.interceptor.ts` in Angular adds that token automatically.
5. **Security**: The Backend `SecurityConfiguration` checks the token for every protected API call (like viewing medical records).
