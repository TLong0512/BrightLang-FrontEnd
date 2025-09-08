import { Component, OnInit } from '@angular/core';
import { PricingPlan, RoadMap } from '../../../models/road-map.model';
import { SharedService } from '../../../services/shared.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-road-map-element',
  templateUrl: './road-map-element.html',
  styleUrls: ['./road-map-element.css']
})
export class RoadMapElementComponent implements OnInit {
  roadMaps: RoadMap[] | null = []
  pricingPlans: PricingPlan[] = []
  constructor(private shareService: SharedService<RoadMap[]>,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.shareService.currentData$.subscribe({
      next: (data) => {
        if (data) {
          this.roadMaps = [...data].sort((a, b) => a.timeRequired! - b.timeRequired!);
          this.pricingPlans = [
            {
              id: this.roadMaps![0].id,
              title: 'Ngắn hạn',
              price: this.roadMaps![0].questionPerDay,
              period: '/câu',
              features: [
                `Tổng thời gian: ${this.roadMaps![0].timeRequired}/ngày`,
                'Lượt đăng ký: 300',
                'Lên bảng sau khi học: 70',
                'Hiệu suất: 20%',
                'Đánh giá: Thấp'
              ],
              buttonText: 'Chọn gói'
            },
            {
              id: this.roadMaps![1].id,
              title: 'Trung hạn',
              price: this.roadMaps![1].questionPerDay,
              period: '/câu',
              features: [
                `Tổng thời gian: ${this.roadMaps![1].timeRequired}/ngày`,
                'Lượt đăng ký: 300',
                'Lên bảng sau khi học: 70',
                'Hiệu suất: 20%',
                'Đánh giá: Thấp'
              ],
              buttonText: 'Chọn gói',
              isPopular: true
            },
            {
              id: this.roadMaps![2].id,
              title: 'Dài hạn',
              price: this.roadMaps![2].questionPerDay,
              period: '/câu',
              features: [
                `Tổng thời gian: ${this.roadMaps![2].timeRequired}/ngày`,
                'Lượt đăng ký: 300',
                'Lên bảng sau khi học: 70',
                'Hiệu suất: 20%',
                'Đánh giá: Thấp'
              ],
              buttonText: 'Chọn gói'
            }
          ];
        }

      }
    })
  }



  onSelectPlan(id: string): void {
    this.router.navigate(['/admin/road-map-detail', id])
    // Xử lý logic khi chọn gói
  }
}