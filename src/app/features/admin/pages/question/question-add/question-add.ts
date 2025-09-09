import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Answer, ExamType, Level, Question, QuestionAdd, SkillLevel } from '../../../models/question-bank.model';
import { ChangeDetectorRef, Component, DOCUMENT, Inject, Input, OnInit } from '@angular/core';
import { QuestionBankApiService } from '../../../services/question-bank-api.service';
import { Context } from 'vm';
import { EditorComponent } from '@tinymce/tinymce-angular';
import { map, Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { OnlyDigitsDirective } from '../../../directive/only-number';
import { MaxNumberDirective } from '../../../directive/max-number';
import { MinNumberDirective } from '../../../directive/min-number';

@Component({
  selector: 'app-add-question',
  imports: [FormsModule, CommonModule, EditorComponent, OnlyDigitsDirective, MaxNumberDirective, MinNumberDirective],
  standalone: true,
  templateUrl: './question-add.html',
  styles: [`
    .bg-gradient-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .form-control:focus, .form-select:focus, .form-check-input:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }
    
    .card {
      transition: all 0.3s ease;
    }
    
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    
    .border-start {
      border-left-width: 4px !important;
    }
    
    .form-check-input:checked {
      background-color: #667eea;
      border-color: #667eea;
    }
    
    .btn:hover {
      transform: translateY(-1px);
    }
    
    .img-thumbnail {
      transition: transform 0.3s ease;
    }
    
    .img-thumbnail:hover {
      transform: scale(1.05);
    }
    
    .form-switch .form-check-input {
      width: 3em;
      height: 1.5em;
    }
    
    .form-check-lg .form-check-input {
      transform: scale(1.2);
    }
    
    audio {
      border-radius: 0.375rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .question-form-appear {
      animation: slideIn 0.5s ease-out;
    }
  `]
})

export class AddQuestionComponent {
  // two way binding
  selectedExamType: string = '';
  selectedLevel: string = '';
  selectedSkillLevel: string = '';
  selectedRange: string = ''

  // list
  examTypes$!: Observable<ExamType[]>
  levels$!: Observable<Level[]>
  skillLevels!: SkillLevel[]
  ranges$!: Observable<Range[]>;
  content: string = '';
  init = {
    height: 500,
    menubar: true,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount'
    ],
    toolbar:
      'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | removeformat | help | image media',

    // Cho phép paste ảnh dạng base64
    automatic_uploads: true,
    file_picker_types: 'image media',

    // Custom file picker (chọn file từ local)
    file_picker_callback: (callback: any, value: any, meta: any) => {
      if (meta.filetype === 'image' || meta.filetype === 'media') {
        const input = this.document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', meta.filetype === 'image' ? 'image/*' : 'audio/*,video/*');

        input.onchange = function () {
          const file = (this as HTMLInputElement).files![0];
          const reader = new FileReader();
          reader.onload = function () {
            const base64 = reader.result as string;
            callback(base64, { title: file.name });
          };
          reader.readAsDataURL(file);
        };
        input.click();
      }
    }
  };

  // context infor
  isForExam: boolean = false;
  passage: string = '';
  passageExplanation: string = '';
  contextMessage = ''

  questions: QuestionAdd[] = [];
  imageUrl: string = '';
  audioUrl: string = '';
  nextQuestionId: number = 1;
  rangeId: string | null = ''
  constructor(private adminService: QuestionBankApiService,
    private cd: ChangeDetectorRef,

    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    // this.sharedService.values$.subscribe((data) => {

    // });
    this.getExamTypes()
    this.addQuestion()
  }

  addQuestion(): void {
    const newQuestion: QuestionAdd = {
      content: '',
      questionNumberMessage: '',
      explain: '',
      questionNumber: 0,
      answerList: [
        { value: '', explain: '', isCorrect: true, answerMessage: '' },
        { value: '', explain: '', isCorrect: false, answerMessage: '' },
        { value: '', explain: '', isCorrect: false, answerMessage: '' },
        { value: '', explain: '', isCorrect: false, answerMessage: '' }
      ]
    };

    this.questions.push(newQuestion);
    this.cd.detectChanges()
  }

  removeQuestion(index: number): void {
    Swal.fire({
      title: 'Bạn có chắc muốn xoá?',
      text: 'Dữ liệu sẽ không thể khôi phục!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xoá',
      cancelButtonText: 'Huỷ'
    }).then((result) => {
      if (result.isConfirmed) {
        this.questions.splice(index, 1);
        this.cd.detectChanges()
      }
    });

  }

  isValid(): boolean {
    let isValid = true
    let skillLevel = this.skillLevels.find(s => s.id == this.selectedSkillLevel)
    if (skillLevel?.skillName == 'Nghe') {
      if (!this.passage.includes('audio')) {
        this.contextMessage = 'Vui lòng nhập audio'
        isValid = false
      }
    }
    this.questions.forEach(q => {
      console.log(210, q)
      if (q.questionNumber?.toString() == '' || q.questionNumber == 0) {
        q.questionNumberMessage = 'Vui lòng nhập số'
        isValid = false
      }
      q.answerList?.forEach(a => {
        if (a.value?.trim() == '') {
          a.answerMessage = 'Vui lòng nhập câu trả lời'
          isValid = false
        }
      })
      // 2. Kiểm tra trùng nhau (chỉ khi không rỗng)
      const normalizedValues = q.answerList
        ?.map(a => a.value?.trim().toLowerCase())
        .filter(v => v); // bỏ null/empty

      if (normalizedValues) {
        q.answerList?.forEach((a, idx) => {
          const val = a.value?.trim().toLowerCase();
          if (val && normalizedValues.filter(v => v === val).length > 1) {
            a.answerMessage = 'Câu trả lời này bị trùng';
            isValid = false;
          }
        });
      }
    })
    return isValid
  }

  saveQuestions(): void {
    if (!this.isValid()) {
      return;
    }


    const context: Context = {
      content: this.content,
      explain: this.passageExplanation,
      isBelongTest: this.isForExam,
      rangeId: this.rangeId
    }
    this.questions.forEach(q => q.context = context)

    let skillLevel = this.skillLevels.find(s => s.id == this.selectedSkillLevel)

    this.adminService.postQuestion(this.selectedExamType, skillLevel!.skillId || '', this.questions).subscribe({
      next: () => {
        Swal.fire({
          title: 'Thành công!',
          text: 'Thêm câu hỏi thành công.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.isForExam = false
          this.passage = ''
          this.passageExplanation = ''
          this.questions = []
          this.cd.detectChanges()
          this.addQuestion()
        });
      },
      error: (error) => {
        console.log(error)
      }
    })
  }

  getExamTypes() {
    this.examTypes$ = this.adminService.getExamTypes();
  }

  getLevels() {
    if (this.selectedExamType) {
      this.levels$ = this.adminService.getLevelsByExamTypeId(this.selectedExamType).pipe(
        map((levels: Level[]) => levels.sort((a, b) => a.name.localeCompare(b.name))) // sort theo name
      );
    }
  }

  getSkillLevels() {
    if (this.selectedLevel) {
      this.adminService.getSkillLevelsByLevelId(this.selectedLevel).subscribe({
        next: (data) => {

          // FIX: Đảm bảo data clean và không có duplicate
          this.skillLevels = data.filter((skill, index, self) =>
            index === self.findIndex((s) => s.id === skill.id)
          );
          console.log('Loaded skillLevels:', this.skillLevels);
          this.cd.detectChanges();
        },
        error: (error) => {
          console.error('Error loading skill levels:', error);
          this.skillLevels = [];
          this.cd.detectChanges();
        }
      });
    }
  }

  // Xử lý khi thay đổi exam type
  onExamTypeChange(): void {
    this.getLevels();
    // FIX: Reset tất cả các selection phía sau
    this.selectedLevel = '';
    this.selectedSkillLevel = '';

    this.skillLevels = [];

    // FIX: Force change detection
    this.cd.detectChanges();
  }

  /** Xử lý khi thay đổi level */
  onLevelChange(): void {
    this.getSkillLevels();
    // FIX: Reset tất cả các selection phía sau
    this.selectedSkillLevel = '';
    this.selectedRange = '';

    // FIX: Force change detection
    this.cd.detectChanges();
  }

  /** Xử lý khi thay đổi skill level */
  onSkillLevelChange(): void {

    // FIX: Reset range selection
    this.selectedRange = '';

    // FIX: Force change detection
    this.cd.detectChanges();
  }

  setCorrectAnswer(question: Question, answerIndex: number): void {
    if (!question.answerList) return;

    // Reset tất cả đáp án về false
    question.answerList.forEach(answer => answer.isCorrect = false);

    // Đặt đáp án được chọn là đúng
    if (question.answerList[answerIndex]) {
      question.answerList[answerIndex].isCorrect = true;
    }
  }

  onFocus(input: string, questionIndex?: number, answerIndex?: number) {
    console.log(input)
    if (input == 'passage') {
      this.contextMessage = ''
    } else if (input == 'questionNumber') {
      this.questions![questionIndex!].questionNumberMessage = ''
    } else if (input == 'answer') {
      console.log(questionIndex, answerIndex)
      this.questions![questionIndex!]!.answerList![answerIndex!].answerMessage = ''
    }
  }
}