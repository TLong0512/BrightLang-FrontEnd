import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoadMapApiService } from '../../services/road-map-api.service';
import { RoadMap } from '../../models/road-map.model';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'roadmap',
  templateUrl: './roadmap.html',
  styleUrl: './roadmap.css',
  imports: [RouterLink]
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



}
