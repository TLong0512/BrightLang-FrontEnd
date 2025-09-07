// result.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PracticeResult, Question, UserAnswer } from '../../../../../models/practice.model';
import { CommonModule } from '@angular/common';
import { PracticeService } from '../../services/practice.service';

@Component({
    selector: 'app-result',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './result-screen.html',
    styleUrls: ['./result-screen.css']
})
export class ResultComponent implements OnInit {
    practiceResult!: PracticeResult;
    showExplanations = false;
    selectedQuestionIndex = 0;
    private practiceResultService = inject(PracticeService);

    // Animation states
    animateScore = true;
    animateStats = true;

    constructor(private router: Router) { }

    ngOnInit() {
        this.practiceResult = this.practiceResultService.getResult()!;

        if (!this.practiceResult) {
            // Nếu không có dữ liệu thì redirect về practice
            this.router.navigate(['/practice/default']);
        } else {
            // Trigger animations
            setTimeout(() => { this.animateScore = true; }, 500);
            setTimeout(() => { this.animateStats = true; }, 1000);
        }
    }

    get scoreColor(): string {
        if (this.practiceResult.score >= 80) return '#28a745';
        if (this.practiceResult.score >= 60) return '#ffc107';
        return '#dc3545';
    }

    get performanceText(): string {
        if (this.practiceResult.score >= 90) return 'Xuất sắc';
        if (this.practiceResult.score >= 80) return 'Tốt';
        if (this.practiceResult.score >= 70) return 'Khá';
        if (this.practiceResult.score >= 60) return 'Trung bình';
        return 'Cần cải thiện';
    }

    get performanceMessage(): string {
        if (this.practiceResult.score >= 80) return 'Chúc mừng! Bạn đã hoàn thành xuất sắc bài luyện tập này.';
        if (this.practiceResult.score >= 60) return 'Kết quả khá tốt! Hãy tiếp tục luyện tập để đạt điểm cao hơn.';
        return 'Đừng nản lòng! Hãy xem lại các câu hỏi và luyện tập thêm.';
    }

    get scoreIcon(): string {
        if (this.practiceResult.score >= 80) return 'bi-trophy-fill';
        if (this.practiceResult.score >= 60) return 'bi-award-fill';
        return 'bi-bookmark-fill';
    }

    toggleExplanations() {
        this.showExplanations = !this.showExplanations;
        if (this.showExplanations) {
            // Scroll to explanations section
            setTimeout(() => {
                const element = document.querySelector('.detailed-results');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }

    selectQuestion(index: number) {
        this.selectedQuestionIndex = index;
    }

    get selectedQuestion(): Question {
        return this.practiceResult.questions[this.selectedQuestionIndex];
    }

    get selectedUserAnswer(): UserAnswer {
        return this.practiceResult.userAnswers[this.selectedQuestionIndex];
    }

    getSelectedAnswer() {
        if (!this.selectedUserAnswer.selectedAnswerId) return null;
        return this.selectedQuestion.answerDetails.find(
            answer => answer.id === this.selectedUserAnswer.selectedAnswerId
        );
    }

    getCorrectAnswer() {
        return this.selectedQuestion.answerDetails.find(answer => answer.isCorrect);
    }

    getAnswerClass(answerId: string): string {
        const userAnswer = this.selectedUserAnswer;
        const isSelected = userAnswer.selectedAnswerId === answerId;
        const isCorrect = this.selectedQuestion.answerDetails.find(a => a.id === answerId)?.isCorrect;

        if (isCorrect) return 'correct-answer';
        if (isSelected && !isCorrect) return 'wrong-answer';
        return 'default-answer';
    }

    getQuestionNavClass(index: number): string {
        const userAnswer = this.practiceResult.userAnswers[index];

        if (index === this.selectedQuestionIndex) return 'active';
        if (!userAnswer.selectedAnswerId) return 'unanswered';
        if (userAnswer.isCorrect) return 'correct';
        return 'wrong';
    }

    goHome() {
        this.router.navigate(['/home-user']);
    }

    retryPractice() {
        // Extract rangeId from the first question if available
        const rangeId = 'default'; // You might want to store this in the result
        this.router.navigate(['/practice', rangeId]);
    }

    startNewPractice() {
        this.router.navigate(['/home-user/topik-selection']);
    }

    hasAudioContent(content: string): boolean {
        if (!content) return false;
        return content.toLowerCase().includes('.mp3') ||
            content.toLowerCase().includes('.wav') ||
            content.toLowerCase().includes('.m4a') ||
            content.toLowerCase().includes('audio');
    }

    hasImageContent(content: string): boolean {
        if (!content) return false;
        return content.toLowerCase().includes('.jpg') ||
            content.toLowerCase().includes('.png') ||
            content.toLowerCase().includes('.jpeg') ||
            content.toLowerCase().includes('.gif') ||
            content.toLowerCase().includes('image');
    }

    getAudioUrl(content: string): string {
        const audioExtensions = ['.mp3', '.wav', '.m4a'];
        for (const ext of audioExtensions) {
            const index = content.toLowerCase().indexOf(ext);
            if (index !== -1) {
                const start = content.lastIndexOf(' ', index) + 1;
                const end = content.indexOf(' ', index + ext.length);
                return content.substring(start, end === -1 ? undefined : end).trim();
            }
        }
        return content;
    }

    getImageUrl(content: string): string {
        const imageExtensions = ['.jpg', '.png', '.jpeg', '.gif'];
        for (const ext of imageExtensions) {
            const index = content.toLowerCase().indexOf(ext);
            if (index !== -1) {
                const start = content.lastIndexOf(' ', index) + 1;
                const end = content.indexOf(' ', index + ext.length);
                return content.substring(start, end === -1 ? undefined : end).trim();
            }
        }
        return content;
    }

    getTextContent(content: string): string {
        if (!content) return '';

        if (this.hasAudioContent(content) || this.hasImageContent(content)) {
            const extensions = ['.mp3', '.wav', '.m4a', '.jpg', '.png', '.jpeg', '.gif'];
            let textContent = content;

            for (const ext of extensions) {
                const regex = new RegExp(`\\S*${ext.replace('.', '\\.')}\\S*`, 'gi');
                textContent = textContent.replace(regex, '').trim();
            }

            return textContent;
        }

        return content;
    }

    shareResult() {
        const text = `Tôi vừa hoàn thành bài luyện tập tiếng Hàn với kết quả ${this.practiceResult.score}% (${this.practiceResult.correctAnswers}/${this.practiceResult.totalQuestions} câu đúng)! 🎯`;

        if (navigator.share) {
            navigator.share({
                title: 'Kết quả luyện tập tiếng Hàn',
                text: text,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(text).then(() => {
                alert('Đã sao chép kết quả vào clipboard!');
            });
        }
    }

    downloadResult() {
        const resultData = {
            date: new Date().toISOString(),
            score: this.practiceResult.score,
            totalQuestions: this.practiceResult.totalQuestions,
            correctAnswers: this.practiceResult.correctAnswers,
            wrongAnswers: this.practiceResult.wrongAnswers,
            unanswered: this.practiceResult.unanswered,
            details: this.practiceResult.questions.map((q, index) => ({
                questionNumber: q.questionInformation.questionNumber,
                question: q.questionInformation.content,
                selectedAnswer: this.getSelectedAnswer()?.value,
                correctAnswer: this.getCorrectAnswer()?.value,
                isCorrect: this.practiceResult.userAnswers[index].isCorrect
            }))
        };

        const dataStr = JSON.stringify(resultData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `korean-practice-result-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
}