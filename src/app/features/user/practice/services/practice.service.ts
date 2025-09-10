import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TopikLevel, SubLevel, Skill, PracticeSession, Question, PracticeResult } from '../../../../models/practice.model';

@Injectable({
    providedIn: 'root'
})
export class PracticeService {
    private readonly STORAGE_KEY_LEVEL = 'selectedLevel';
    private readonly STORAGE_KEY_SUBLEVEL = 'selectedSubLevel';
    private readonly STORAGE_KEY_SKILL = 'selectedSkill';
    private result: PracticeResult | null = null;

    setResult(res: PracticeResult) {
        this.result = res;
    }

    getResult(): PracticeResult | null {
        return this.result;
    }

    clearResult() {
        this.result = null;
    }

    // ===== TopikLevel =====
    private selectedLevelSource = new BehaviorSubject<TopikLevel | null>(
        this.getSessionItem<TopikLevel>(this.STORAGE_KEY_LEVEL)
    );
    selectedLevel$ = this.selectedLevelSource.asObservable();

    // ===== SubLevel =====
    private selectedSubLevelSource = new BehaviorSubject<SubLevel | null>(
        this.getSessionItem<SubLevel>(this.STORAGE_KEY_SUBLEVEL)
    );
    selectedSubLevel$ = this.selectedSubLevelSource.asObservable();

    // ===== Skill =====
    private selectedSkillSource = new BehaviorSubject<Skill | null>(
        this.getSessionItem<Skill>(this.STORAGE_KEY_SKILL)
    );
    selectedSkill$ = this.selectedSkillSource.asObservable();

    // ===== practice session =====
    private currentSession = new BehaviorSubject<PracticeSession | null>(null);
    public currentSession$ = this.currentSession.asObservable();




    // ===== TopikLevel =====
    getLevel(): TopikLevel | null {
        return this.selectedLevelSource.value;
    }
    setLevel(level: TopikLevel): void {
        this.selectedLevelSource.next(level);
        this.setSessionItem(this.STORAGE_KEY_LEVEL, level);
    }
    clearLevel(): void {
        this.selectedLevelSource.next(null);
        this.removeSessionItem(this.STORAGE_KEY_LEVEL);
    }

    // ===== SubLevel =====
    getSubLevel(): SubLevel | null {
        return this.selectedSubLevelSource.value;
    }
    setSubLevel(subLevel: SubLevel): void {
        this.selectedSubLevelSource.next(subLevel);
        this.setSessionItem(this.STORAGE_KEY_SUBLEVEL, subLevel);
    }
    clearSubLevel(): void {
        this.selectedSubLevelSource.next(null);
        this.removeSessionItem(this.STORAGE_KEY_SUBLEVEL);
    }

    // ===== Skill =====
    getSkill(): Skill | null {
        return this.selectedSkillSource.value;
    }
    setSkill(skill: Skill): void {
        this.selectedSkillSource.next(skill);
        this.setSessionItem(this.STORAGE_KEY_SKILL, skill);
    }
    clearSkill(): void {
        this.selectedSkillSource.next(null);
        this.removeSessionItem(this.STORAGE_KEY_SKILL);
    }

    // ===== Helpers cho sessionStorage =====
    private getSessionItem<T>(key: string): T | null {
        if (typeof window === 'undefined') return null;
        const saved = sessionStorage.getItem(key);
        return saved ? (JSON.parse(saved) as T) : null;
    }

    private setSessionItem<T>(key: string, value: T): void {
        if (typeof window === 'undefined') return;
        sessionStorage.setItem(key, JSON.stringify(value));
    }

    private removeSessionItem(key: string): void {
        if (typeof window === 'undefined') return;
        sessionStorage.removeItem(key);
    }

    /**
       * Create a new practice session
    */
    createPracticeSession(rangeId: string, questions: Question[]): PracticeSession {
        const session: PracticeSession = {
            id: this.generateSessionId(),
            rangeId: rangeId,
            questions: questions,
            userAnswers: questions.map(q => ({
                questionId: q.questionInformation.id,
                selectedAnswerId: null,
                isCorrect: false
            })),
            status: 'active'
        };

        this.currentSession.next(session);
        this.saveSessionToStorage(session);
        return session;
    }

    /**
     * Update current practice session
     */
    updatePracticeSession(session: PracticeSession): void {
        this.currentSession.next(session);
        this.saveSessionToStorage(session);
    }

    /**
     * Complete practice session and return result
     */
    completePracticeSession(session: PracticeSession): PracticeResult {
        session.status = 'completed';

        const correctAnswers = session.userAnswers.filter(answer => answer.isCorrect).length;
        const wrongAnswers = session.userAnswers.filter(answer =>
            answer.selectedAnswerId !== null && !answer.isCorrect
        ).length;
        const unanswered = session.userAnswers.filter(answer =>
            answer.selectedAnswerId === null
        ).length;

        const result: PracticeResult = {
            totalQuestions: session.questions.length,
            correctAnswers,
            wrongAnswers,
            unanswered,
            score: Math.round((correctAnswers / session.questions.length) * 100),
            userAnswers: session.userAnswers,
            questions: session.questions
        };

        this.updatePracticeSession(session);
        this.saveResultToHistory(result);

        return result;
    }

    /**
     * Get current practice session from storage
     */
    getCurrentSession(): PracticeSession | null {
        try {
            const stored = localStorage.getItem('currentPracticeSession');
            if (stored) {
                const session = JSON.parse(stored);
                session.startTime = new Date(session.startTime);
                if (session.endTime) {
                    session.endTime = new Date(session.endTime);
                }
                return session;
            }
        } catch (error) {
            console.error('Error loading session from storage:', error);
        }
        return null;
    }

    /**
     * Clear current practice session
     */
    clearCurrentSession(): void {
        this.currentSession.next(null);
        localStorage.removeItem('currentPracticeSession');
    }

    /**
     * Get practice history
     */
    getPracticeHistory(): PracticeResult[] {
        try {
            const stored = localStorage.getItem('practiceHistory');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading practice history:', error);
            return [];
        }
    }

    /**
     * Clear practice history
     */
    clearPracticeHistory(): void {
        localStorage.removeItem('practiceHistory');
    }

    /**
     * Export practice result to JSON
     */
    exportResult(result: PracticeResult): string {
        const exportData = {
            date: new Date().toISOString(),
            ...result,
            questions: result.questions.map((q, index) => ({
                questionNumber: q.questionInformation.questionNumber,
                skill: q.skillName,
                level: q.levelName,
                range: q.rangeName,
                question: q.questionInformation.content,
                context: q.contextInformation.content,
                options: q.answerDetails.map(a => ({
                    option: a.value,
                    isCorrect: a.isCorrect,
                    explanation: a.explain
                })),
                userAnswer: result.userAnswers[index].selectedAnswerId ?
                    q.answerDetails.find(a => a.id === result.userAnswers[index].selectedAnswerId)?.value : 'Không trả lời',
                correctAnswer: q.answerDetails.find(a => a.isCorrect)?.value,
                isCorrect: result.userAnswers[index].isCorrect,
                questionExplanation: q.questionInformation.explain
            }))
        };

        return JSON.stringify(exportData, null, 2);
    }

    private generateSessionId(): string {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    }

    private saveSessionToStorage(session: PracticeSession): void {
        try {
            localStorage.setItem('currentPracticeSession', JSON.stringify(session));
        } catch (error) {
            console.error('Error saving session to storage:', error);
        }
    }

    private saveResultToHistory(result: PracticeResult): void {
        try {
            const history = this.getPracticeHistory();
            history.unshift(result); // Add to beginning of array

            // Keep only last 50 results
            if (history.length > 50) {
                history.splice(50);
            }

            localStorage.setItem('practiceHistory', JSON.stringify(history));
        } catch (error) {
            console.error('Error saving result to history:', error);
        }
    }
}