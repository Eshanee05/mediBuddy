import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewChecked {
  activeTab = 'overview';
  
  stats: any = null;
  pendingDoctors: any[] = [];
  allDoctors: any[] = [];
  allPatients: any[] = [];
  
  selectedDoctorAppointments: any[] | null = null;
  selectedDoctorName: string = '';
  
  message = '';
  isError = false;
  
  chartRendered = false;
  chartInstance: any;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  ngAfterViewChecked(): void {
    if (this.activeTab === 'overview' && this.stats && !this.chartRendered) {
      setTimeout(() => this.renderChart(), 100);
      this.chartRendered = true;
    } else if (this.activeTab !== 'overview') {
      this.chartRendered = false;
      if (this.chartInstance) {
         this.chartInstance.destroy();
         this.chartInstance = null;
      }
    }
  }

  showMessage(msg: string, error = false) {
    this.message = msg;
    this.isError = error;
    setTimeout(() => this.message = '', 5000);
  }

  fetchData() {
    this.apiService.get<any>('/admin/stats').subscribe(res => {
      this.stats = res;
      this.chartRendered = false; // Trigger re-render of chart with new data
    });
    this.apiService.get<any[]>('/admin/doctors/pending').subscribe(res => this.pendingDoctors = res);
    this.apiService.get<any[]>('/admin/doctors').subscribe(res => this.allDoctors = res);
    this.apiService.get<any[]>('/admin/patients').subscribe(res => this.allPatients = res);
  }

  verifyDoctor(id: number, verify: boolean) {
    this.apiService.post(`/admin/doctors/${id}/verify?verify=${verify}`, {}).subscribe({
      next: () => {
        this.showMessage(`Doctor ${verify ? 'verified' : 'rejected'} successfully.`);
        this.fetchData();
      },
      error: () => this.showMessage('Action failed', true)
    });
  }

  toggleDoctorStatus(id: number) {
    this.apiService.post(`/admin/doctors/${id}/toggle-status`, {}).subscribe({
      next: () => {
        this.showMessage('Status toggled successfully.');
        this.fetchData();
      },
      error: () => this.showMessage('Action failed', true)
    });
  }

  renderChart() {
    const ctx = document.getElementById('overviewChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Patients', 'Doctors', 'Appointments'],
        datasets: [{
          label: 'System Metrics',
          data: [this.stats.totalPatients, this.stats.totalDoctors, this.stats.totalAppointments],
          backgroundColor: [
            'rgba(37, 99, 235, 0.6)',  // Primary
            'rgba(14, 165, 233, 0.6)', // Secondary
            'rgba(16, 185, 129, 0.6)'  // Success
          ],
          borderColor: [
            'rgb(37, 99, 235)',
            'rgb(14, 165, 233)',
            'rgb(16, 185, 129)'
          ],
          borderWidth: 1,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, grid: { display: true, color: '#f1f5f9' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  viewAppointments(doc: any) {
    this.selectedDoctorName = doc.name;
    this.apiService.get<any[]>(`/admin/doctors/${doc.id}/appointments`).subscribe({
      next: (res) => {
        this.selectedDoctorAppointments = res;
      },
      error: () => this.showMessage('Failed to load appointments', true)
    });
  }

  closeAppointmentsModal() {
    this.selectedDoctorAppointments = null;
    this.selectedDoctorName = '';
  }
}
