import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Answer, Question, QuestionAdd } from '../../../models/question-bank.model';
import { Component, Input, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { Context } from 'vm';
import { QuestionAddService } from '../services/question-add.service';
@Component({
  selector: 'app-add-question',
  imports: [FormsModule, CommonModule],
  standalone: true,
  templateUrl: './add-question.html',
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


export class AddQuestionComponent{
  
  isForExam: boolean = false;
  passage: string = '';
  passageExplanation: string = '';
  questions: QuestionAdd[] = [];
  imageUrl: string = '';
  audioUrl: string = '';
  nextQuestionId: number = 1;
  rangeId: string | null = ''
  constructor(private adminService: AdminService, private sharedService: QuestionAddService) { }

  // ngOnInit(): void {
  //   this.sharedService.values$.subscribe((data) => {
      
  //   });
  // }
  addQuestion(): void {
    const newQuestion: QuestionAdd = {
      content: '',
      explain: '',
      questionNumber: 0,
      answerList: [
        { value: '', explain: '', isCorrect: false },
        { value: '', explain: '', isCorrect: false },
        { value: '', explain: '', isCorrect: false },
        { value: '', explain: '', isCorrect: false }
      ]
    };

    this.questions.push(newQuestion);
  }

  removeQuestion(index: number): void {
    if (confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
      this.questions.splice(index, 1);
    }
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
  onImageUrlChange(question: Question): void {
    // You can add image validation logic here
    console.log('Image URL changed:', this.imageUrl);
  }

  onImageError(question: Question): void {
    console.error('Failed to load image:', this.imageUrl);
    // You could show an error message or reset the URL
  }

  isFormValid(): boolean {
    if (!this.passage.trim()) {
      return false;
    }

    if (this.questions.length === 0) {
      return false;
    }

    return true
    // Check if all questions have required fields
    // return this.questions.every(question => {
    //   const hasQuestionText = question.content.trim().length > 0;
    //   const hasCorrectAnswer = question.answers.some(answer => answer.isCorrect);
    //   const hasAnswerTexts = question.answers.every(answer => answer.text.trim().length > 0);

    //   return hasQuestionText && hasCorrectAnswer && hasAnswerTexts;
    // });
  }

  saveQuestions(): void {
    if (!this.isFormValid()) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    const context: Context = {
      content: this.createContextContent(this.passage, this.imageUrl, this.audioUrl),
      explain: this.passageExplanation,
      isBelongTest: this.isForExam,
      rangeId: this.rangeId
    }
    this.questions.forEach(q => q.context = context)
    let examTypeId, skillId
    this.sharedService.values$.subscribe(data => {
      examTypeId = data.examTypeId,
      skillId = data.skillId
    })
    
    this.adminService.postQuestion(examTypeId!, skillId!, this.questions).subscribe({
      next: () => {
        console.log('ok')
      },
      error: () => {
        console.log('fail')
      }
    })
  }

  createContextContent(text: string, imageUrl?: string, audioUrl?: string): string {
    return `
    <div class="question-content">
      <p class="question-text">${text}</p>
      ${imageUrl ? `<div class="question-image"><img src="${imageUrl}" alt="Question Image" style="max-width: 300px; height: auto;" /></div>` : ""}
      ${audioUrl ? `<div class="question-audio"><audio controls><source src="${audioUrl}" type="audio/mpeg">Trình duyệt không hỗ trợ audio</audio></div>` : ""}
    </div>
  `;
  }
}