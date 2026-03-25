# Mediconnect - Source Code Setup Guide

This guide will help you set up and run the Mediconnect Healthcare System on any PC.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:
1. **Java JDK 17 or 21**
2. **Node.js & npm** (Latest LTS)
3. **MySQL Server**
4. **Angular CLI** (`npm install -g @angular/cli`)

---

## 🗄️ Step 1: Database Setup

1. Open your MySQL terminal (or Workbench).
2. Create the database:
   ```sql
   CREATE DATABASE mediconnect_db;
   ```
3. Open `mediconnect-backend/src/main/resources/application.yml`.
4. Update the `username` and `password` under `datasource` to match your local MySQL credentials.

---

## ⚙️ Step 2: Running the Backend (Java/Spring Boot)

1. Open a command prompt and navigate to the backend folder:
   ```cmd
   cd mediconnect-backend
   ```
2. Build and run the application:
   - If you have Maven installed: `mvn spring-boot:run`
   - If not, use the included Maven binaries (if available): `apache-maven-3.9.6\bin\mvn spring-boot:run`
3. Wait for the log: `Started MediconnectBackendApplication in X seconds`.
4. **First Run Note:** On the first run, the system will automatically create the Admin account and sample doctors.

---

## 💻 Step 3: Running the Frontend (Angular)

1. Open a **NEW** command prompt window and navigate to the frontend folder:
   ```cmd
   cd mediconnect-frontend
   ```
2. Install the necessary dependencies (this may take a few minutes):
   ```cmd
   npm install
   ```
3. Start the development server:
   ```cmd
   npm start
   ```
4. If it asks to use a different port (like 62533), type **y** and press **Enter**.
5. Open your browser to the URL shown in the terminal (usually `http://localhost:4200` or `http://localhost:62533`).

---

## 🔑 Testing Credentials

| Role | Username (Email) | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@mediconnect.com` | `Admin@123` |
| **Doctor** | `sarah@mediconnect.com` | `Doctor@123` |
| **Patient** | *Register a new account on the login page* | *Your choice* |

---

## 🛠️ Running with Visual Studio Code (Recommended)

For the best experience, follow these steps in VS Code:

### 1. Recommended Extensions
Install these from the VS Code Marketplace:
- **Extension Pack for Java** (by Microsoft)
- **Spring Boot Extension Pack** (by VMware)
- **Angular Language Service** (by Angular)

### 2. Opening the Project
1. Open VS Code.
2. Go to `File` > `Open Folder` and select the **root** folder (the one containing this README).

### 3. Running the Backend
1. In the file explorer, navigate to `mediconnect-backend/src/main/java/com/mediconnect/MediconnectApplication.java`.
2. Click the **"Run"** button that appears above the `main` method.
3. *Alternatively:* Press `F5` to start debugging.

### 4. Running the Frontend
1. Open the Integrated Terminal in VS Code (`Ctrl + ` ` ` - backtick).
2. Type:
   ```cmd
   cd mediconnect-frontend
   npm start
   ```
3. Follow the terminal prompts to open the app in your browser.

---

## 🚀 Key Features to Test

1. **Admin Dashboard**: Go to the "Patients" tab to see all users. Verify new doctors in the "Verification" tab.
2. **Medical File Upload**: Login as a Patient, go to "Medical History", and upload PDFs/Images (Google Drive style).
3. **Appointment Booking**: As a patient, search for doctors and book a slot.
4. **Prescriptions**: Once a doctor prescribes medicine, it will appear in the Patient's medical history immediately.
