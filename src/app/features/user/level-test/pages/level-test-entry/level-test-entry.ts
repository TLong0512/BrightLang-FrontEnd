import { Component, signal, output } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoadmapService, RoadmapGeneralDto } from '../../../roadmap/services/roadmap.service';

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
    { value: 'topik1', label: 'TOPIK I - Level 1', description: 'Sơ cấp - Có thể hiểu và sử dụng từ vựng, cụm từ cơ bản', roadmapName: 'Lộ trình TOPIK 0 -> 1' },
    { value: 'topik2', label: 'TOPIK I - Level 2', description: 'Sơ cấp - Có thể giao tiếp trong các tình huống đơn giản', roadmapName: 'Lộ trình TOPIK 1 -> 2' },
    { value: 'topik3', label: 'TOPIK II - Level 3', description: 'Trung cấp - Có thể thực hiện các chức năng cơ bản trong cuộc sống hàng ngày', roadmapName: 'Lộ trình TOPIK 2 -> 3' },
    { value: 'topik4', label: 'TOPIK II - Level 4', description: 'Trung cấp - Có thể sử dụng tiếng Hàn trong nhiều tình huống khác nhau', roadmapName: 'Lộ trình TOPIK 3 -> 4' },
    { value: 'topik5', label: 'TOPIK II - Level 5', description: 'Cao cấp - Có thể sử dụng tiếng Hàn một cách tương đối thành thạo', roadmapName: 'Lộ trình TOPIK 4 -> 5' },
    { value: 'topik6', label: 'TOPIK II - Level 6', description: 'Cao cấp - Có thể sử dụng tiếng Hàn thành thạo trong mọi lĩnh vực', roadmapName: 'Lộ trình TOPIK 5 -> 6' }
  ];

  constructor(
    private router: Router,
    private roadmapService: RoadmapService
  ) {}

  onLevelChange(): void {
    console.log('Selected TOPIK level:', this.selectedLevel());
  }

  goToRoadmap(): void {
    const level = this.selectedLevel();
    if (level) {
      const selectedTopikLevel = this.topikLevels.find(l => l.value === level);
      if (selectedTopikLevel) {
        // Gọi API để lấy danh sách roadmap theo tên
        this.roadmapService.getRoadmapsByName(selectedTopikLevel.roadmapName).subscribe({
          next: (roadmaps: RoadmapGeneralDto[]) => {
            // Navigate to roadmap selection page với data
            this.router.navigate(['/roadmap-selection'], {
              state: { roadmaps: roadmaps }
            });
          },
          error: (error) => {
            console.error('Error fetching roadmaps:', error);
            // Có thể hiển thị thông báo lỗi cho user
          }
        });
      }
    }
  }

  startTest(): void {
    this.router.navigate(['/home-user/test-ready']);
  }

  getLevelDescription(level: string): string {
    const found = this.topikLevels.find(l => l.value === level);
    return found?.description || '';
  }
}