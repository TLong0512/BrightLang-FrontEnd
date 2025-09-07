import { Component, OnInit } from "@angular/core";
import { Context, Question } from "../../../models/question-bank.model";
import { AdminService } from "../../../services/admin.service";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-question-update',
    templateUrl: './update-question.html' ,
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
    imports: [CommonModule],
})

export class UpdateQuestionComponent implements OnInit {
    context!: Context;
    question!: Question;
    questionId: string = '';


    // State for showing explanations
    showContextExplanation: boolean = false;
    showQuestionExplanation: boolean = false;
    selectedAnswerId: string | null = null;

    constructor(private adminService: AdminService) { }

    ngOnInit(): void {
        this.question = {
            id: "1",
            content: "학생 수 감소로 폐교가 될 뻔한 산골 초등학교가 위기에서 벗어나 화제이다. 이 학교 선생님들은 (" +
                "그러다 찾은 것이 '음악 특성화 학교'였다. 선생님들은 예술대학교에 협조를" +
                "요청해 학생들에게 다양한 악기를 가르칠 전문가를 구했다. 또 기업의 기부를" +
                "받아 유명 음악가와 함께하는 음악회도 개최했다. 이런 소문을 듣고 음악을" +
                "배우러 오는 학생들이 생기면서 이 학교는 폐교 위기에서 벗어났다.",
            explain: "Đoạn văn nói là bạn ăn cơm chưa",
            questionNumber: 20,
            contextId: '',
            answerList: [
                { value: "1", explain: "Hai câu này", isCorrect: true },
                { value: "2", explain: "Hai câu này", isCorrect: true },
                { value: "3", explain: "Hai câu này", isCorrect: true },
                { value: "4", explain: "Hai câu này", isCorrect: true },
            ]
        }
        this.context = {
            id: "10",
            content: `
    {
            text: 'This is text',
            imageUrl: 'http/localhost',
            auidoUrl: 'http/localhost',
    }
  `,
            explain: "ok this is question"
        }
        // this.adminService.getQuestionById(this.questionId).subscribe({
        //     next: (data) => {
        //         this.question = data;

        //         if (this.question.contextId) {
        //             this.adminService.getContextById(this.question.contextId).subscribe((data) => {
        //                 this.context = data;
        //             });
        //         }

        //         if (this.question.id) {
        //             this.adminService.getAnswersByQuestionId(this.question.id).subscribe((data) => {
        //                 this.question.answerList = data;
        //             });
        //         }
        //     },
        // });
    }

    getValue(): void {
        
        let {text, imageUrl, auidoUrl } = JSON.parse(`
    {
            text: 'This is text',
            imageUrl: 'http/localhost',
            auidoUrl: 'http/localhost',
    }`)
    }
    toggleContextExplanation(): void {
        this.showContextExplanation = !this.showContextExplanation;
    }

    toggleQuestionExplanation(): void {
        this.showQuestionExplanation = !this.showQuestionExplanation;
    }

    toggleAnswerExplanation(answerId: string): void {
        this.selectedAnswerId = this.selectedAnswerId === answerId ? null : answerId;
    }

    getAnswerLabel(index: number): string {
        return String.fromCharCode(65 + index); // A, B, C, D...
    }
}