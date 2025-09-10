import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoadMapApiService } from '../../services/road-map-api.service';
import { RoadMap } from '../../models/road-map.model';
import { SharedService } from '../../services/shared.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'roadmap',
  template: `
    <div class="main-content">
      <!-- Top Bar -->
      <div class="top-bar">
        <h1 class="page-title">Danh sách các lộ trình</h1>
      </div>

      <!-- Content Area -->
      <div class="content-area">
        <div class="course-grid">
          <div class="course-card" 
               *ngFor="let roadMap of roadMaps; trackBy: trackByFn; let i = index"
               (click)="onSelectRoadMap(roadMap.name!)"
               [style.animation-delay]="(i * 0.1) + 's'">
            <div class="course-icon" [ngClass]="getIconClass(roadMap.name!)">
              <span>{{ getIconEmoji(roadMap.name!) }}</span>
            </div>
            <div class="course-number">{{ roadMap.name }}</div>
            <div class="course-title">{{ getTitle(roadMap.name!) }}</div>
            <div class="course-description">{{ getDescription(roadMap.name!) }}</div>
            <div class="progress-container">
              <div class="progress-bar" [style.width]="getProgress(roadMap.name!) + '%'"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :host {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      display: block;
      min-height: 100vh;
    }

    .main-content {
      background: linear-gradient(135deg, #E8F8F5 0%, #D1F2EB 50%, #A3E4DB 100%);
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }

    /* Animated Background */
    .main-content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 20%, rgba(128, 208, 199, 0.2) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(164, 231, 221, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(195, 243, 237, 0.2) 0%, transparent 50%);
      animation: backgroundMove 12s ease-in-out infinite alternate;
      pointer-events: none;
    }

    @keyframes backgroundMove {
      0% { transform: translateX(-10px) translateY(-5px); }
      100% { transform: translateX(10px) translateY(5px); }
    }

    /* Top Bar */
    .top-bar {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(128, 208, 199, 0.2);
      padding: 40px 0;
      position: relative;
      z-index: 10;
    }

    .top-bar::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 80px;
      height: 3px;
      background: linear-gradient(90deg, transparent, #80D0C7, transparent);
      transform: translateX(-50%);
      border-radius: 2px;
    }

    .page-title {
      text-align: center;
      font-size: clamp(2.2rem, 5vw, 3.5rem);
      font-weight: 700;
      background: linear-gradient(135deg, #2C3E50, #80D0C7, #48A999);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      position: relative;
      text-shadow: 0 2px 10px rgba(128, 208, 199, 0.3);
      animation: titleGlow 4s ease-in-out infinite alternate;
    }

    @keyframes titleGlow {
      0% { filter: brightness(1); }
      100% { filter: brightness(1.1) saturate(1.2); }
    }

    /* Content Area */
    .content-area {
      padding: 60px 30px;
      max-width: 1400px;
      margin: 0 auto;
      position: relative;
      z-index: 5;
    }

    .course-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 35px;
      perspective: 1200px;
    }

    /* Course Cards */
    .course-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(25px);
      border-radius: 28px;
      padding: 45px 35px;
      text-align: center;
      position: relative;
      cursor: pointer;
      transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.2);
      box-shadow: 
        0 25px 50px rgba(128, 208, 199, 0.15),
        0 8px 30px rgba(0, 0, 0, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      border: 2px solid rgba(255, 255, 255, 0.6);
      transform: translateY(0) rotateX(0);
      opacity: 0;
      animation: cardEnter 0.8s ease forwards;
      overflow: hidden;
    }

    @keyframes cardEnter {
      from {
        opacity: 0;
        transform: translateY(80px) rotateX(-10deg);
      }
      to {
        opacity: 1;
        transform: translateY(0) rotateX(0);
      }
    }

    /* Floating decoration */
    .course-card::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(128, 208, 199, 0.05) 0%, transparent 70%);
      transform: rotate(0deg);
      transition: transform 8s linear infinite;
      pointer-events: none;
      z-index: 1;
    }

    .course-card:hover::after {
      animation: decorationRotate 8s linear infinite;
    }

    @keyframes decorationRotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Hover Effects */
    .course-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(128, 208, 199, 0.08), rgba(164, 231, 221, 0.08));
      border-radius: 28px;
      opacity: 0;
      transition: opacity 0.4s ease;
      z-index: 2;
    }

    .course-card:hover::before {
      opacity: 1;
    }

    .course-card:hover {
      transform: translateY(-25px) rotateX(3deg) rotateY(1deg) scale(1.03);
      box-shadow: 
        0 50px 100px rgba(128, 208, 199, 0.25),
        0 20px 60px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
      border-color: rgba(128, 208, 199, 0.4);
    }

    /* Course Icons */
    .course-icon {
      width: 90px;
      height: 90px;
      margin: 0 auto 25px;
      background: linear-gradient(135deg, #80D0C7 0%, #A4E7DD 50%, #C3F3ED 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      color: white;
      position: relative;
      box-shadow: 
        0 15px 40px rgba(128, 208, 199, 0.3),
        0 5px 15px rgba(0, 0, 0, 0.1);
      transition: all 0.4s ease;
      z-index: 3;
    }

    .course-card:hover .course-icon {
      transform: rotateY(180deg) scale(1.15);
      box-shadow: 
        0 20px 50px rgba(128, 208, 199, 0.4),
        0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .course-icon::after {
      content: '';
      position: absolute;
      inset: -3px;
      background: linear-gradient(135deg, #80D0C7, #A4E7DD, #80D0C7);
      border-radius: 50%;
      z-index: -1;
      animation: iconPulse 6s ease-in-out infinite alternate;
    }

    @keyframes iconPulse {
      0% { 
        transform: scale(1);
        opacity: 0.8;
      }
      100% { 
        transform: scale(1.1);
        opacity: 1;
      }
    }

    /* Course Number/Badge */
    .course-number {
      background: linear-gradient(135deg, #80D0C7, #A4E7DD);
      color: white;
      padding: 14px 28px;
      border-radius: 35px;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 25px;
      display: inline-block;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(128, 208, 199, 0.3);
      transition: all 0.3s ease;
      z-index: 3;
    }

    .course-number::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      transition: left 0.6s ease;
    }

    .course-card:hover .course-number::before {
      left: 100%;
    }

    /* Course Title */
    .course-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2D3748;
      margin-bottom: 18px;
      position: relative;
      z-index: 3;
    }

    /* Course Description */
    .course-description {
      color: #4A5568;
      font-size: 1rem;
      line-height: 1.7;
      margin-bottom: 25px;
      position: relative;
      z-index: 3;
    }

    /* Progress Bar */
    .progress-container {
      background: rgba(128, 208, 199, 0.2);
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 25px;
      position: relative;
      z-index: 3;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #80D0C7, #A4E7DD);
      border-radius: 4px;
      transition: width 1s ease;
      position: relative;
      box-shadow: 0 2px 8px rgba(128, 208, 199, 0.3);
    }

    .progress-bar::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
      animation: progressShine 2.5s ease-in-out infinite;
    }

    @keyframes progressShine {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .course-grid {
        grid-template-columns: 1fr;
        gap: 25px;
      }
      
      .content-area {
        padding: 40px 20px;
      }
      
      .course-card {
        padding: 35px 25px;
      }
      
      .page-title {
        font-size: 2rem;
      }
    }

    @media (max-width: 480px) {
      .course-card {
        padding: 30px 20px;
      }
      
      .course-icon {
        width: 70px;
        height: 70px;
        font-size: 2.5rem;
      }
    }
  `],
  imports: [RouterLink, CommonModule]
})
export class RoadMapComponent implements OnInit {
  data: RoadMap[] = []
  roadMaps: RoadMap[] = []
  private roadMapApiService = inject(RoadMapApiService)
  private router = inject(Router)
  private shareService = inject(SharedService<RoadMap[]>)
  private cd = inject(ChangeDetectorRef)

  ngOnInit(): void {
    this.roadMapApiService.getRoadmaps().subscribe({
      next: (response) => {
        this.data = response
        const seen = new Set<string>();
        
        for (const item of response) {
          if (!seen.has(item.name!)) {
            seen.add(item.name!);
            this.roadMaps.push({
              id: item.id,
              name: item.name,
            });
          }
        }
        this.cd.detectChanges()
        console.log(this.data)
      }
    })
  }

  onSelectRoadMap(name: string) {
    this.shareService.setData(this.data.filter(d => d.name == name))
    this.router.navigate(['/admin/road-map-element'])
  }

  trackByFn(index: number, item: RoadMap): any {
    return item.id || index;
  }

  getIconClass(name: string): string {
    const classMap: { [key: string]: string } = {
      'Frontend Development': 'icon-web',
      'Backend Development': 'icon-code',
      'UI/UX Design': 'icon-design',
      'Data Science': 'icon-data',
      'Mobile Development': 'icon-mobile',
      'AI & Machine Learning': 'icon-ai',
      'DevOps': 'icon-devops',
      'Full Stack': 'icon-fullstack'
    };
    return classMap[name] || 'icon-default';
  }

  getIconEmoji(name: string): string {
    const emojiMap: { [key: string]: string } = {
      'Frontend Development': '🌐',
      'Backend Development': '💻',
      'UI/UX Design': '🎨',
      'Data Science': '📊',
      'Mobile Development': '📱',
      'AI & Machine Learning': '🤖',
      'DevOps': '⚙️',
      'Full Stack': '🚀',
      'Web Development': '💻',
      'Database': '🗃️',
      'Cloud Computing': '☁️',
      'Cybersecurity': '🔒'
    };
    return emojiMap[name] || '📚';
  }

  getTitle(name: string): string {
    const titleMap: { [key: string]: string } = {
      'Frontend Development': 'Phát triển giao diện người dùng',
      'Backend Development': 'Phát triển hệ thống backend',
      'UI/UX Design': 'Thiết kế trải nghiệm người dùng',
      'Data Science': 'Khoa học dữ liệu',
      'Mobile Development': 'Phát triển ứng dụng di động',
      'AI & Machine Learning': 'Trí tuệ nhân tạo',
      'DevOps': 'Vận hành và phát triển',
      'Full Stack': 'Phát triển toàn diện'
    };
    return titleMap[name] || name;
  }

  getDescription(name: string): string {
    const descMap: { [key: string]: string } = {
      'Frontend Development': 'HTML, CSS, JavaScript và các framework hiện đại như React, Vue',
      'Backend Development': 'API, Database, Server và kiến trúc hệ thống backend',
      'UI/UX Design': 'Figma, Adobe XD và nguyên lý thiết kế trải nghiệm người dùng',
      'Data Science': 'Python, Machine Learning và phân tích dữ liệu chuyên sâu',
      'Mobile Development': 'React Native, Flutter và phát triển ứng dụng native',
      'AI & Machine Learning': 'Deep Learning, Neural Networks và ứng dụng AI thực tế',
      'DevOps': 'CI/CD, Docker, Kubernetes và cloud infrastructure',
      'Full Stack': 'Kết hợp frontend và backend để xây dựng ứng dụng hoàn chỉnh'
    };
    return descMap[name] || 'Tìm hiểu và phát triển kỹ năng chuyên môn trong lĩnh vực này';
  }

  getProgress(name: string): number {
    const progressMap: { [key: string]: number } = {
      'Frontend Development': 75,
      'Backend Development': 45,
      'UI/UX Design': 60,
      'Data Science': 30,
      'Mobile Development': 55,
      'AI & Machine Learning': 20,
      'DevOps': 65,
      'Full Stack': 40
    };
    return progressMap[name] || Math.floor(Math.random() * 80) + 10;
  }
}