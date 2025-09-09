import { Component } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'user-home',
  standalone: true,
  templateUrl: 'user-home.html',
  styleUrl: 'user-home.css',
  imports: [RouterLinkActive, RouterLink]
})
export class UserHomeComponent {
  constructor(private router: Router, private http: HttpClient) {}

  scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  continueRoadmap() {
    this.http.get<any>(`http://localhost:5000/api/UserRoadmap/GetMyRoadmaps?page=1&pageSize=1`)
      .subscribe({
        next: (res) => {
          if (res && res.totalItem > 0) {
            this.router.navigate(['/home-user/roadmap']); // Có lộ trình
          } else {
            this.router.navigate(['/home-user/level-test']); // Chưa có
          }
        },
        error: (err) => {
          console.error("API GetMyRoadmaps error", err);
          this.router.navigate(['/home-user/level-test']); // fallback
        }
      });
  }
}
