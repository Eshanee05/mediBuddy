import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit {
  activeTab = 'today';
  
  todayAppointments: any[] = [];
  allAppointments: any[] = [];
  medicalRecords: any[] = [];
  availabilities: any[] = [];
  
  daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  
  message = '';
  isError = false;

  // Prescription Modal State
  selectedAppointment: any = null;
  prescriptionData: any = {
    diagnosis: '',
    medicinesList: [{ name: '', days: null, frequency: '', remarks: '' }],
    notes: ''
  };
  
  // File Upload State
  uploadPatientId: number | null = null;
  selectedFile: File | null = null;
  isUploading = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchAppointments();
    this.fetchRecords();
    this.fetchAvailability();
  }

  showMessage(msg: string, error = false) {
    this.message = msg;
    this.isError = error;
    setTimeout(() => this.message = '', 5000);
  }

  fetchAppointments() {
    this.apiService.get<any[]>('/doctor/appointments/today').subscribe(res => this.todayAppointments = res);
    this.apiService.get<any[]>('/doctor/appointments').subscribe(res => this.allAppointments = res);
  }

  fetchRecords() {
    this.apiService.get<any[]>('/doctor/records').subscribe(res => this.medicalRecords = res);
  }

  updateStatus(id: number, status: string) {
    this.apiService.put(`/doctor/appointments/${id}/status?status=${status}`, {}).subscribe({
      next: () => {
        this.showMessage(`Appointment marked as ${status}`);
        this.fetchAppointments();
      },
      error: () => this.showMessage('Failed to update status', true)
    });
  }

  openPrescriptionModal(appt: any) {
    this.selectedAppointment = appt;
    this.prescriptionData = { 
      diagnosis: '', 
      medicinesList: [{ name: '', days: null, frequency: '', remarks: '' }], 
      notes: '' 
    };
  }

  addMedicine() {
    this.prescriptionData.medicinesList.push({ name: '', days: null, frequency: '', remarks: '' });
  }

  removeMedicine(idx: number) {
    this.prescriptionData.medicinesList.splice(idx, 1);
  }

  submitPrescription() {
    if (!this.selectedAppointment || !this.prescriptionData.diagnosis || this.prescriptionData.medicinesList.length === 0) return;
    
    const payload = {
      diagnosis: this.prescriptionData.diagnosis,
      medicines: JSON.stringify(this.prescriptionData.medicinesList),
      notes: this.prescriptionData.notes
    };
    
    this.apiService.post(`/doctor/appointments/${this.selectedAppointment.id}/prescription`, payload).subscribe({
      next: () => {
        this.showMessage('Prescription saved and appointment completed!');
        this.selectedAppointment = null;
        this.fetchAppointments();
        this.fetchRecords(); // Update records with new prescription
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'Failed to save prescription.';
        this.showMessage(errorMsg, true);
        this.selectedAppointment = null;
      }
    });
  }

  fetchAvailability() {
    this.apiService.get<any[]>('/doctor/availability').subscribe(res => {
      this.availabilities = res;
    });
  }

  addAvailability(day: string) {
    this.availabilities.push({
      dayOfWeek: day,
      startTime: '09:00:00',
      endTime: '17:00:00',
      slotDuration: 30
    });
  }

  removeAvailability(index: number) {
    this.availabilities.splice(index, 1);
  }

  saveAvailability() {
    this.apiService.post('/doctor/availability', this.availabilities).subscribe({
      next: () => this.showMessage('Availability saved successfully'),
      error: () => this.showMessage('Failed to save availability', true)
    });
  }

  hasAvailability(day: string): boolean {
    return this.availabilities.some(a => a.dayOfWeek === day);
  }

  // --- Clinical Document Upload ---
  onFileSelected(event: any, patientId: number) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadPatientId = patientId;
      this.uploadClinicalFile();
    }
  }

  uploadClinicalFile() {
    if (!this.selectedFile || !this.uploadPatientId) return;

    this.isUploading = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.apiService.postFormData(`/doctor/upload-clinical-file/${this.uploadPatientId}`, formData).subscribe({
      next: () => {
        this.showMessage('Clinical file uploaded for patient successfully!');
        this.selectedFile = null;
        this.uploadPatientId = null;
        this.isUploading = false;
        this.fetchRecords();
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'Failed to upload clinical file.';
        this.showMessage(errorMsg, true);
        this.isUploading = false;
      }
    });
  }

  viewFile(fileId: number) {
    const url = `${this.apiService.apiUrl}/files/view/${fileId}`;
    window.open(url, '_blank');
  }

  parseMedicines(medicinesStr: string): any[] {
    try {
      if (medicinesStr && medicinesStr.startsWith('[')) {
        return JSON.parse(medicinesStr);
      }
    } catch (e) {}
    return [];
  }

  downloadPrescription(pres: any, patientInfo: any) {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text('MEDICONNECT CLINIC', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Official Digital Prescription', 14, 30);
    
    // Patient Details
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text(`Patient Name: ${patientInfo.name}`, 14, 45);
    doc.text(`Patient ID: ${patientInfo.patientIdentifier}`, 14, 52);
    doc.text(`Date of Visit: ${new Date(pres.createdAt).toLocaleDateString()}`, 14, 59);
    
    // Diagnosis
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Diagnosis: ${pres.diagnosis}`, 14, 75);
    
    // Medicines Table
    const meds = this.parseMedicines(pres.medicines);
    
    if (meds.length > 0) {
      const tableBody = meds.map(m => [m.name, m.dosage || m.frequency, `${m.days} days`, m.remarks]);
      autoTable(doc, {
        startY: 85,
        head: [['Medicine Name', 'Frequency', 'Duration', 'Remarks']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] }
      });
    } else {
      autoTable(doc, {
        startY: 85,
        head: [['Prescribed Medicines']],
        body: [[pres.medicines]],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] }
      });
    }
    
    // Notes
    const finalY = (doc as any).lastAutoTable.finalY || 85;
    if (pres.notes) {
      doc.setFontSize(12);
      doc.text('Doctor Notes:', 14, finalY + 15);
      doc.setFontSize(10);
      doc.text(pres.notes, 14, finalY + 22, { maxWidth: 180 });
    }
    
    // Footer validation
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('This is a digitally generated prescription.', 14, 280);
    
    doc.save(`Prescription_${patientInfo.name}_${new Date(pres.createdAt).getTime()}.pdf`);
  }
}
