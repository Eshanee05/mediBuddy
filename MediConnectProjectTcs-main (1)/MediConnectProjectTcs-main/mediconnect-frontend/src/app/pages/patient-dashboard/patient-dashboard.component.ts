import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css']
})
export class PatientDashboardComponent implements OnInit {
  activeTab = 'search';
  
  // Search
  searchQuery = '';
  doctors: any[] = [];
  
  // Booking
  selectedDoctor: any = null;
  bookingDate: string = '';
  bookingTime: string = '';
  minDate: string = new Date().toISOString().split('T')[0];
  
  availableSlots: string[] = [];
  next7Days: any[] = [];
  isLoadingSlots = false;

  // Data
  appointments: any[] = [];
  medicalRecords: any[] = [];
  medicalFiles: any[] = [];
  doctorFolders: any[] = [];
  
  // File Upload
  selectedFile: File | null = null;
  isUploading = false;

  // UI State
  message = '';
  isError = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.searchDoctors();
    this.fetchAppointments();
    this.fetchMedicalHistory();
    this.fetchMedicalFiles();
    this.generateNext7Days();
  }

  generateNext7Days() {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        date: d.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    this.next7Days = days;
  }

  showMessage(msg: string, error = false) {
    this.message = msg;
    this.isError = error;
    setTimeout(() => this.message = '', 5000);
  }

  // --- Search Tab ---
  searchDoctors() {
    const url = this.searchQuery ? `/patient/doctors/search?keyword=${encodeURIComponent(this.searchQuery)}` : '/patient/doctors/search';
    this.apiService.get<any[]>(url).subscribe({
      next: (res) => this.doctors = res,
      error: (err) => console.error('Failed to fetch doctors', err)
    });
  }

  selectDoctor(doc: any) {
    this.selectedDoctor = doc;
    this.bookingDate = this.next7Days[0].date;
    this.bookingTime = '';
    this.loadAvailableSlots();
  }

  loadAvailableSlots() {
    if (!this.selectedDoctor || !this.bookingDate) return;
    this.isLoadingSlots = true;
    this.availableSlots = [];
    this.apiService.get<string[]>(`/patient/doctors/${this.selectedDoctor.id}/slots?date=${this.bookingDate}`).subscribe({
      next: (res) => {
        this.availableSlots = res;
        this.isLoadingSlots = false;
      },
      error: (err) => {
        console.error('Failed to load slots', err);
        this.isLoadingSlots = false;
      }
    });
  }

  bookAppointment() {
    if (!this.selectedDoctor || !this.bookingDate || !this.bookingTime) return;
    
    const payload = {
      doctorId: this.selectedDoctor.id,
      appointmentDate: this.bookingDate,
      timeSlot: this.bookingTime
    };

    this.apiService.post('/patient/appointments/book', payload).subscribe({
      next: () => {
        this.showMessage('Appointment booked successfully!');
        this.selectedDoctor = null;
        this.fetchAppointments();
        this.activeTab = 'appointments';
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'Failed to book appointment.';
        this.showMessage(errorMsg, true);
      }
    });
  }

  // --- Appointments Tab ---
  fetchAppointments() {
    this.apiService.get<any[]>('/patient/appointments').subscribe({
      next: (res) => this.appointments = res,
      error: (err) => console.error('Failed to fetch appointments', err)
    });
  }

  // --- History & Files Logic ---
  fetchMedicalHistory() {
    this.apiService.get<any[]>('/patient/medical-history').subscribe({
      next: (res) => {
        this.medicalRecords = res;
        this.groupDataByDoctor();
      },
      error: (err) => console.error('Failed to fetch medical history', err)
    });
  }

  fetchMedicalFiles() {
    this.apiService.get<any[]>('/patient/medical-files').subscribe({
      next: (res) => {
        this.medicalFiles = res;
        this.groupDataByDoctor();
      },
      error: (err) => console.error('Failed to fetch medical files', err)
    });
  }

  viewFile(fileId: number) {
    const url = `${this.apiService.apiUrl}/files/view/${fileId}`;
    window.open(url, '_blank');
  }

  private formatDateForGroup(dateInput: any): string {
    const d = this.parseDate(dateInput);
    if (isNaN(d.getTime())) return 'Unknown Date';
    return d.toISOString().split('T')[0];
  }

  private parseDate(dateInput: any): Date {
    if (!dateInput) return new Date(NaN);
    if (Array.isArray(dateInput)) {
      return new Date(dateInput[0], dateInput[1] - 1, dateInput[2], dateInput[3] || 0, dateInput[4] || 0, dateInput[5] || 0);
    }
    return new Date(dateInput);
  }

  groupDataByDoctor() {
    const foldersMap = new Map<number, any>();

    // Process Medical Records (Prescriptions)
    if (this.medicalRecords && Array.isArray(this.medicalRecords)) {
      this.medicalRecords.forEach((rec: any) => {
        const doc = rec.doctor;
        if (!doc) return;

        if (!foldersMap.has(doc.id)) {
          foldersMap.set(doc.id, { doctor: doc, dateGroups: new Map<string, any[]>() });
        }
        
        const folder = foldersMap.get(doc.id);
        if (rec.prescriptions && Array.isArray(rec.prescriptions)) {
          rec.prescriptions.forEach((p: any) => {
            const isoDate = this.formatDateForGroup(p.createdAt);
            if (!folder.dateGroups.has(isoDate)) folder.dateGroups.set(isoDate, []);
            
            const timeStr = this.parseDate(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            folder.dateGroups.get(isoDate).push({
              type: 'PRESCRIPTION',
              time: timeStr,
              title: `Prescription: ${p.diagnosis}`,
              medicines: p.medicines,
              notes: p.notes,
              data: p
            });
          });
        }
      });
    }

    // Process Medical Files
    if (this.medicalFiles && Array.isArray(this.medicalFiles)) {
      this.medicalFiles.forEach((file: any) => {
        // If doctor exists, group under that doctor. Otherwise (my uploads), we show them separately in template
        if (file.doctor) {
          const doc = file.doctor;
          if (!foldersMap.has(doc.id)) {
            foldersMap.set(doc.id, { doctor: doc, dateGroups: new Map<string, any[]>() });
          }
          const folder = foldersMap.get(doc.id);
          const isoDate = this.formatDateForGroup(file.uploadedAt);
          if (!folder.dateGroups.has(isoDate)) folder.dateGroups.set(isoDate, []);
          
          const timeStr = this.parseDate(file.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          folder.dateGroups.get(isoDate).push({
            type: 'FILE',
            time: timeStr,
            title: file.originalName,
            id: file.id,
            data: file
          });
        }
      });
    }

    // Convert to array format for template
    const result: any[] = [];
    foldersMap.forEach((f: any) => {
      const datesArray = Array.from(f.dateGroups.entries()).map((entry: any) => ({
        date: entry[0],
        items: entry[1]
      })).sort((a: any, b: any) => b.date.localeCompare(a.date));
      
      result.push({
        doctor: f.doctor,
        dates: datesArray
      });
    });

    this.doctorFolders = result;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadFile() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.apiService.postFormData('/patient/medical-files/upload', formData).subscribe({
      next: () => {
        this.showMessage('File uploaded successfully!');
        this.selectedFile = null;
        this.isUploading = false;
        this.fetchMedicalFiles(); 
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'Failed to upload file.';
        this.showMessage(errorMsg, true);
        this.isUploading = false;
      }
    });
  }

  parseMedicines(medicinesStr: string): any[] {
    try {
      if (medicinesStr && medicinesStr.startsWith('[')) {
        return JSON.parse(medicinesStr);
      }
    } catch (e) {}
    return [];
  }

  downloadPrescription(presItem: any, doctorName: string) {
    const doc = new jsPDF();
    const rawPres = presItem.data || presItem;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text('MEDICONNECT CLINIC', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Official Digital Prescription', 14, 30);
    
    // Details
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text(`Prescribed by: Dr. ${doctorName}`, 14, 45);
    doc.text(`Date of Visit: ${new Date(rawPres.createdAt || new Date()).toLocaleDateString()}`, 14, 52);
    
    // Diagnosis
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Diagnosis: ${rawPres.diagnosis}`, 14, 70);
    
    // Medicines Table
    const meds = this.parseMedicines(rawPres.medicines);
    
    if (meds.length > 0) {
      const tableBody = meds.map(m => [m.name, m.dosage || m.frequency, `${m.days} days`, m.remarks]);
      autoTable(doc, {
        startY: 80,
        head: [['Medicine Name', 'Frequency', 'Duration', 'Remarks']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] }
      });
    } else {
      autoTable(doc, {
        startY: 80,
        head: [['Prescribed Medicines']],
        body: [[rawPres.medicines]],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] }
      });
    }
    
    // Notes
    const finalY = (doc as any).lastAutoTable.finalY || 80;
    if (rawPres.notes) {
      doc.setFontSize(12);
      doc.text('Doctor Notes:', 14, finalY + 15);
      doc.setFontSize(10);
      doc.text(rawPres.notes, 14, finalY + 22, { maxWidth: 180 });
    }
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('This is a digitally generated prescription.', 14, 280);
    
    doc.save(`Prescription_Dr_${doctorName}_${new Date(rawPres.createdAt || new Date()).getTime()}.pdf`);
  }
}
