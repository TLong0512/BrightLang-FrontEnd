import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { RoadMap, RoadMapElement } from "../../models/road-map.model";
import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RoadMapApiService } from "../../services/road-map-api.service";

@Component({
  selector: 'roadmap-detail',
  templateUrl: './roadmap-detail.html',
  styleUrls: ['./roadmap-detail.css'],
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
})
export class RoadMapDetailComponent implements OnInit {

  roadMapElements!: RoadMapElement[];

  formGroups: { [key: string]: FormGroup } = {};

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private apiService: RoadMapApiService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.apiService.getRoadMapElementsByRoadMapId(id).subscribe({
      next: (res) => {
        this.roadMapElements = res;
        

        // Tạo form group cho từng range duy nhất
        this.roadMapElements.forEach(r => {
          this.formGroups[r.range!.id!] = this.fb.group({
            days: [r.repeatDays ?? 50],
            sentences: [r.questionPerDay ?? 30]
          });
        });

        this.cd.detectChanges();
      }
    });
  }

  getData() {
    const data = this.roadMapElements.map(el => {
      const fg = this.formGroups[el.range!.id!];
      return {
        id: el.range!.id!,
        name: el.range!.name,
        days: fg.get('days')?.value,
        sentences: fg.get('sentences')?.value
      };
    });
    console.log('Dữ liệu:', data);
  }

  getControl(rangeId: string, controlName: 'days' | 'sentences'): FormControl {
    return this.formGroups[rangeId].get(controlName) as FormControl;
  }
}
