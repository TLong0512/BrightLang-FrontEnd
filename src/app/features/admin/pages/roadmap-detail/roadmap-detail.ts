import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { RoadMap, RoadMapElement } from "../../models/road-map.model";
import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RoadMapApiService } from "../../services/road-map-api.service";
import Swal from "sweetalert2";

@Component({
  selector: 'roadmap-detail',
  templateUrl: './roadmap-detail.html',
  styleUrls: ['./roadmap-detail.css'],
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
})
export class RoadMapDetailComponent implements OnInit {

  roadMapElements!: RoadMapElement[];
  roadMapId!: string
  formGroups: { [key: string]: FormGroup } = {};

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private apiService: RoadMapApiService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.roadMapId = this.route.snapshot.paramMap.get('id') || '';
    this.apiService.getRoadMapElementsByRoadMapId(this.roadMapId).subscribe({
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

  saveData() {
    Swal.fire({
      title: 'Bạn có chắc muốn lưu thay đổi?',
      text: ``,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Có, lưu lại',
      cancelButtonText: 'Hủy'
    }).then(result => {
      if (result.isConfirmed) {
        const changed = this.roadMapElements
          .map((el, index) => {
            const fg = this.formGroups[el.range!.id!];
            return {
              index, // thêm vị trí dòng
              repeatDays: fg.get('days')?.value,
              questionPerDay: fg.get('sentences')?.value,
              dirty: fg.dirty
            };
          })
          .filter(x => x.dirty); // chỉ lấy những formGroup có thay đổi


        let isSuccess = true
        if (changed.length > 0) {
          changed.forEach((r, index) => {
            this.apiService.updateRoadMapElement(this.roadMapId, index, {
              repeatDays: r.repeatDays,
              questionPerDay: r.questionPerDay
            }).subscribe({
              next: () => { },
              error: (err) => {
                console.log(err)
                isSuccess = false
                console.log(isSuccess)
                console.log(index)
              }

            })
          })
          if (isSuccess) {
            Swal.fire({
              title: 'Thành công!',
              text: 'Cập nhật dữ liệu thành công.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }

        } else {
          Swal.fire({
            title: 'Không có thay đổi',
            text: 'Bạn chưa chỉnh sửa gì.',
            icon: 'info',
            timer: 1500,
            showConfirmButton: false
          });
        }

      }
    });
  }
  getControl(rangeId: string, controlName: 'days' | 'sentences'): FormControl {
    return this.formGroups[rangeId].get(controlName) as FormControl;
  }
}




