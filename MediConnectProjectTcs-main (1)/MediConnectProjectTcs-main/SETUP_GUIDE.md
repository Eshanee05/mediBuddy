# Mediconnect Setup Guide (New System)

Follow these steps to set up the project on a different machine.

## 1. Prerequisites
Ensure the following are installed on your new system:
- **Git**: [Download here](https://git-scm.com/downloads)
- **Java 17 or higher**: [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://adoptium.net/)
- **Node.js (LTS)**: [Download here](https://nodejs.org/)
- **MySQL Server**: Ensure it's running locally.

---

## 2. Clone the Repository
Open your terminal and run:
```bash
git clone https://github.com/ayush172003/MediConnectProjectTcs.git
cd MediConnectProjectTcs
```

---

## 3. Backend Setup (Spring Boot)
1. **Database Configuration**:
   - Open MySQL Workbench or your terminal.
   - Create the database: `CREATE DATABASE mediconnect_db;`
2. **Update Application Properties**:
   - Navigate to `mediconnect-backend/src/main/resources/application.yml`.
   - Update the `spring.datasource.password` to match your local MySQL password.
3. **Run the Backend**:
   - Navigate to the backend folder: `cd mediconnect-backend`
   - Run the application:
     ```bash
     mvn spring-boot:run
     ```
     *(If you don't have Maven installed globally, you can use the bundled maven version in the folder)*.

---

## 4. Frontend Setup (Angular)
1. **Install Dependencies**:
   - Navigate to the frontend folder: `cd ../mediconnect-frontend`
   - Run:
     ```bash
     npm install
     ```
2. **Run the Frontend**:
   - Run the development server:
     ```bash
     npm start
     ```
   - Open `http://localhost:4200` in your browser.

---

## 5. Troubleshooting: Port already in use (8080)
If you see an error like `Port 8080 was already in use`, follow these steps:

### A. Kill the blocking process (Windows)
1. Open PowerShell/Terminal as Administrator.
2. Find the Process ID (PID) using port 8080:
   ```powershell
   netstat -ano | findstr :8080
   ```
3. Kill the process (Replace `1234` with the actual PID from the last column):
   ```powershell
   taskkill /F /PID 1234
   ```

### B. Change the Port (Alternative)
If you can't kill the other process, change the port in `mediconnect-backend/src/main/resources/application.yml`:
```yaml
server:
  port: 9090
```
*Note: If you change this, you MUST also update the `apiUrl` in `mediconnect-frontend/src/environments/environment.ts` to reflect the new port.*

---

## 6. Important Files to Verify
- **`mediconnect-backend/.gitignore`**: Ensure it's correctly ignoring your local `target/` and sensitive config.
- **`mediconnect-frontend/src/environments/environment.ts`**: Verify the `apiUrl` points to `http://localhost:8080/api/v1`.
