import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoadmapService, RoadmapGeneralDto, UserRoadmapPostDto } from '../../services/roadmap.service';

export interface PricingPlan {
  id: string;
  title: string;
  price: number;
  period: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
}

@Component({
  selector: 'app-roadmap-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roadmap-selection.html',
  styleUrls: ['./roadmap-selection.css']
})
export class RoadmapSelectionComponent implements OnInit {
  roadMaps: RoadmapGeneralDto[] = [];
  pricingPlans: PricingPlan[] = [];
  isLoading = false;

  constructor(
    public router: Router,
    private roadmapService: RoadmapService
  ) {}

  ngOnInit(): void {
    // Lấy dữ liệu từ navigation state
    // const navigation = this.router.currentNavigation();
    // if (navigation?.extras.state) {
    //   this.roadMaps = navigation.extras.state['roadmaps'] || [];
    //   this.setupPricingPlans();
    // } 
    // else {
    //   // Fallback: redirect về trang chọn level nếu không có data
    //   this.router.navigate(['/home-user/level-test']);
    // }
    this.roadMaps = window.history.state.roadmaps;
    this.setupPricingPlans()
    console.log(this.roadMaps)
  }

  private setupPricingPlans(): void {
    console.log(this.roadMaps.length)
    if (this.roadMaps.length >= 3) {
      // Sắp xếp theo timeRequired tăng dần
      this.roadMaps.sort((a, b) => a.timeRequired - b.timeRequired);

      this.pricingPlans = [
        {
          id: this.roadMaps[0].id,
          title: 'Ngắn hạn',
          price: this.roadMaps[0].questionPerDay,
          period: 'câu/ngày',
          features: [
            `Tổng thời gian: ${this.roadMaps[0].timeRequired} ngày`,
            `Lượt đăng ký: ${this.roadMaps[0].signupCount}`,
            'Lên bảng sau khi học: 70',
            'Hiệu suất: 20%',
            'Đánh giá: Thấp'
          ],
          buttonText: 'Chọn gói'
        },
        {
          id: this.roadMaps[1].id,
          title: 'Trung hạn',
          price: this.roadMaps[1].questionPerDay,
          period: 'câu/ngày',
          features: [
            `Tổng thời gian: ${this.roadMaps[1].timeRequired} ngày`,
            `Lượt đăng ký: ${this.roadMaps[1].signupCount}`,
            'Lên bảng sau khi học: 85',
            'Hiệu suất: 60%',
            'Đánh giá: Trung bình'
          ],
          buttonText: 'Chọn gói',
          isPopular: true
        },
        {
          id: this.roadMaps[2].id,
          title: 'Dài hạn',
          price: this.roadMaps[2].questionPerDay,
          period: 'câu/ngày',
          features: [
            `Tổng thời gian: ${this.roadMaps[2].timeRequired} ngày`,
            `Lượt đăng ký: ${this.roadMaps[2].signupCount}`,
            'Lên bảng sau khi học: 95',
            'Hiệu suất: 90%',
            'Đánh giá: Cao'
          ],
          buttonText: 'Chọn gói'
        }
      ];
    }
  }

  onSelectPlan(roadmapId: string): void {
    this.isLoading = true;
    
    const userRoadmapDto: UserRoadmapPostDto = {
      roadmapId: roadmapId
    };

    this.roadmapService.createUserRoadmap(userRoadmapDto).subscribe({
      next: (result) => {
        console.log('Roadmap created successfully:', result);
        // Chuyển hướng đến trang roadmap của user
        this.router.navigate(['/home-user/roadmap']);
      },
      error: (error) => {
        console.error('Error creating roadmap:', error);
        this.isLoading = false;
        // Có thể hiển thị thông báo lỗi
        alert('Có lỗi xảy ra khi tạo lộ trình. Vui lòng thử lại!');
      }
    });
  }
}