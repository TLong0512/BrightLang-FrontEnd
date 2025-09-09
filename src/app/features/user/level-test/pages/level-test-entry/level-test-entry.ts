import { Component, signal, output } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-level-test-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './level-test-entry.html',
  styleUrls: ['./level-test-entry.css']
})
export class LevelTestEntryComponent {
  levelSelected = output<string>();
  
  selectedLevel = signal<string>('');
  
  topikLevels = [
    { value: 'topik1', label: 'TOPIK I - Level 1', description: 'Sơ cấp - Có thể hiểu và sử dụng từ vựng, cụm từ cơ bản' },
    { value: 'topik2', label: 'TOPIK I - Level 2', description: 'Sơ cấp - Có thể giao tiếp trong các tình huống đơn giản' },
    { value: 'topik3', label: 'TOPIK II - Level 3', description: 'Trung cấp - Có thể thực hiện các chức năng cơ bản trong cuộc sống hàng ngày' },
    { value: 'topik4', label: 'TOPIK II - Level 4', description: 'Trung cấp - Có thể sử dụng tiếng Hàn trong nhiều tình huống khác nhau' },
    { value: 'topik5', label: 'TOPIK II - Level 5', description: 'Cao cấp - Có thể sử dụng tiếng Hàn một cách tương đối thành thạo' },
    { value: 'topik6', label: 'TOPIK II - Level 6', description: 'Cao cấp - Có thể sử dụng tiếng Hàn thành thạo trong mọi lĩnh vực' }
  ];

  constructor(private router: Router) {}

  onLevelChange(): void {
    // Additional validation or side effects can be added here
    console.log('Selected TOPIK level:', this.selectedLevel());
  }

  goToRoadmap(): void {
    const level = this.selectedLevel();
    if (level) {
      // Navigate to roadmap page with selected level
      this.router.navigate(['/roadmap'], { 
        queryParams: { level: level } 
      });
    }
  }

  startTest(): void {
    // Navigate to test-ready page
    this.router.navigate(['/home-user/test-ready']);
  }

  getLevelDescription(level: string): string {
    const found = this.topikLevels.find(l => l.value === level);
    return found?.description || '';
  }
}