import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit, OnDestroy {
  searchQuery = '';
  featuredDoctors: any[] = [];
  isLoading = true;

  // Search suggestions
  allDoctorsForSearch: any[] = [];
  searchSuggestions: any[] = [];
  showSuggestions = false;

  // Health quotes ticker
  healthQuotes = [
    '🌟 "Your health is your wealth — invest in it every day."',
    '💪 "A healthy outside starts from the inside."',
    '🏃 "Take care of your body. It\'s the only place you have to live."',
    '🍎 "An apple a day keeps the doctor away — but a checkup keeps the worries at bay."',
    '🌿 "Wellness is not a destination, it\'s a way of life."',
    '❤️ "The greatest wealth is health."',
    '🌞 "Start each day with a grateful heart and a healthy mind."',
    '💊 "Prevention is better than cure — book your checkup today!"',
  ];
  currentQuoteIndex = 0;
  private quoteInterval: any;

  // Doctor avatar mapping
  avatarMap: {[key: string]: string} = {
    'Cardiology': 'assets/doctor_cardiology.png',
    'Neurology': 'assets/doctor_neurology.png',
    'Pediatrics': 'assets/doctor_pediatrics.png',
    'Orthopedics': 'assets/doctor_orthopedics.png',
  };

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.fetchFeaturedDoctors();
    this.startQuoteTicker();
  }

  ngOnDestroy(): void {
    if (this.quoteInterval) clearInterval(this.quoteInterval);
  }

  startQuoteTicker() {
    this.quoteInterval = setInterval(() => {
      this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.healthQuotes.length;
    }, 4000);
  }

  fetchFeaturedDoctors() {
    this.apiService.get<any[]>('/public/doctors/featured').subscribe({
      next: (res) => {
        this.featuredDoctors = res;
        this.allDoctorsForSearch = res;
        this.isLoading = false;
      },
      error: () => {
        this.featuredDoctors = [
          { name: 'Dr. Sarah Jane', specialization: 'Cardiology', experience: 15, rating: 4.8 },
          { name: 'Dr. Michael Chen', specialization: 'Neurology', experience: 10, rating: 4.5 },
          { name: 'Dr. Emily Davis', specialization: 'Pediatrics', experience: 8, rating: 4.9 },
          { name: 'Dr. Robert Wilson', specialization: 'Orthopedics', experience: 20, rating: 4.7 },
        ];
        this.allDoctorsForSearch = this.featuredDoctors;
        this.isLoading = false;
      }
    });
  }

  getDoctorAvatar(specialization: string): string {
    return this.avatarMap[specialization] || 'assets/doctor_cardiology.png';
  }

  onSearchInput() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q || q.length < 2) {
      this.searchSuggestions = [];
      this.showSuggestions = false;
      return;
    }
    this.apiService.get<any[]>(`/auth/search/doctors?keyword=${q}`).subscribe({
      next: (res) => {
        this.searchSuggestions = res.slice(0, 5);
        this.showSuggestions = this.searchSuggestions.length > 0;
      }
    });
  }

  selectSuggestion(doc: any) {
    this.searchQuery = doc.name;
    this.showSuggestions = false;
  }

  hideSuggestions() {
    setTimeout(() => { this.showSuggestions = false; }, 200);
  }

  search() {
    this.showSuggestions = false;
    if (this.searchQuery.trim()) {
      this.router.navigate(['/login']);
    }
  }
}
