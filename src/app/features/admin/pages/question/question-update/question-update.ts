import { ChangeDetectorRef, Component, DOCUMENT, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import { Context, ExamType, Question, QuestionAdd, QuestionDto, QuestionUpdate, SkillLevel } from "../../../models/question-bank.model";
import { QuestionBankApiService } from "../../../services/question-bank-api.service";
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from "@angular/router";
import Swal from "sweetalert2";
import { EditorComponent } from "@tinymce/tinymce-angular";
import { FormsModule } from "@angular/forms";

@Component({
    selector: 'app-question-update',
    templateUrl: './question-update.html',
    styles: [`
        .section-header {
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 8px;
            border-radius: 8px;
            user-select: none;
        }
        
        .section-header:hover {
            background-color: rgba(0, 123, 255, 0.1);
        }
        
        .section-header.active {
            background-color: rgba(0, 123, 255, 0.15);
        }
        
        .toggle-icon {
            transition: transform 0.3s ease;
            font-size: 0.9em;
        }
        
        .context-content, .question-content {
            font-size: 1.05em;
            line-height: 1.6;
        }
        
        .answer-card {
            border: 2px solid #e9ecef;
            border-radius: 12px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            background: white;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .answer-card:hover {
            border-color: #007bff;
            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
            transform: translateY(-2px);
        }
        
        .answer-card.correct-answer {
            border-color: #28a745;
            background: linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%);
        }
        
        .answer-card.correct-answer:hover {
            border-color: #1e7e34;
            box-shadow: 0 6px 16px rgba(40, 167, 69, 0.25);
        }
        
        .answer-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        
        .answer-label {
            display: flex;
            align-items: center;
        }
        
        .answer-content {
            font-size: 1.05em;
            line-height: 1.5;
            flex-grow: 1;
        }
        
        .toggle-info {
            opacity: 0.6;
            transition: opacity 0.3s ease;
        }
        
        .answer-card:hover .toggle-info {
            opacity: 1;
        }
        
        .slide-down {
            animation: slideDown 0.4s ease-out;
            overflow: hidden;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                max-height: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                max-height: 200px;
                transform: translateY(0);
            }
        }
        
        .explanation-box {
            margin-top: 15px;
        }
        
        .answer-explanation {
            margin-top: 10px;
        }
        
        .explanation-content {
            background: rgba(108, 117, 125, 0.1);
            border-radius: 8px;
            padding: 12px;
        }
        
        .explanation-text {
            color: #495057;
            font-size: 0.95em;
            line-height: 1.5;
        }
        
        .card {
            border: none;
            border-radius: 16px;
        }
        
        .card-header {
            border-radius: 16px 16px 0 0 !important;
            padding: 20px 24px;
        }
        
        .card-body {
            padding: 24px;
        }
        
        .badge {
            font-size: 0.8em;
            padding: 6px 10px;
        }
        
        .alert {
            border: none;
            border-radius: 10px;
        }
        
        .spinner-border {
            width: 3rem;
            height: 3rem;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .card-body {
                padding: 16px;
            }
            
            .col-md-6 {
                margin-bottom: 16px;
            }
        }
    `],
    standalone: true,
    imports: [FormsModule, CommonModule, EditorComponent],
})

export class UpdateQuestionComponent implements OnInit {

    questionTextNumber!: string
    questionDto!: QuestionDto
    context!: Context

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

    passage: string = '';
    passageExplanation: string = '';


    constructor(private adminService: QuestionBankApiService,
        private cd: ChangeDetectorRef,
        private route: ActivatedRoute,
        @Inject(DOCUMENT) private document: Document,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        // if (isPlatformBrowser(this.platformId)) {
        //     window.location.reload();
        // }
        let id = this.route.snapshot.paramMap.get('id')!;
        this.adminService.getQuestionById(id).subscribe({
            next: (res) => {
                this.questionDto = res
                this.cd.detectChanges()
                console.log(res)

            },
            error: (err) => {
                console.log(err)
            }
        })

    }

    setCorrectAnswer(answerIndex: number): void {


        // Reset tất cả đáp án về false
        this.questionDto.answerDetails!.forEach(answer => answer.isCorrect = false);

        // Đặt đáp án được chọn là đúng
        if (this.questionDto.answerDetails![answerIndex]) {
            this.questionDto.answerDetails![answerIndex].isCorrect = true;
        }
    }

    updateQuestion(): void {
        let questionUpdate: QuestionUpdate = {
            questionNumber: this.questionDto.questionInformation!.questionNumber || 0,
            content: this.questionDto.questionInformation!.content || '',
            explain: this.questionDto.questionInformation!.explain || '',
            contextUpdate: {
                content: this.questionDto.contextInformation?.content,
                explain: this.questionDto.contextInformation?.explain,
                isBelongTest: this.questionDto.contextInformation?.isBelongTest
            },
            listAnswers: this.questionDto.answerDetails?.map(a => {
                return {
                    value: a.value,
                    explain: a.explain,
                    isCorrect: a.isCorrect
                };
            }) || []
        }
        console.log(283, questionUpdate);
        this.adminService.updateQuestion(this.questionDto.questionInformation!.id || '', questionUpdate).subscribe({
            next: () => {
                Swal.fire({
                    title: 'Thành công!',
                    text: 'Cập nhật câu hỏi thành công.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            },
            error: err => {
                console.log(err)
            }
        })
    }
}