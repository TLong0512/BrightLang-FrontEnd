import { PracticeResult, PracticeSession } from "../../../../models/practice.model";

export class PracticeUtils {
    /**
     * Format time in seconds to MM:SS format
     */
    static formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Calculate accuracy percentage
     */
    static calculateAccuracy(correct: number, total: number): number {
        if (total === 0) return 0;
        return Math.round((correct / total) * 100);
    }

    /**
     * Get performance level based on score
     */
    static getPerformanceLevel(score: number): {
        level: string;
        color: string;
        icon: string;
        message: string;
    } {
        if (score >= 90) {
            return {
                level: 'Xuất sắc',
                color: '#28a745',
                icon: 'bi-trophy-fill',
                message: 'Chúc mừng! Bạn đã hoàn thành xuất sắc!'
            };
        } else if (score >= 80) {
            return {
                level: 'Tốt',
                color: '#20c997',
                icon: 'bi-award-fill',
                message: 'Kết quả rất tốt! Tiếp tục phát huy!'
            };
        } else if (score >= 70) {
            return {
                level: 'Khá',
                color: '#17a2b8',
                icon: 'bi-bookmark-fill',
                message: 'Kết quả khá tốt, hãy cố gắng hơn nữa!'
            };
        } else if (score >= 60) {
            return {
                level: 'Trung bình',
                color: '#ffc107',
                icon: 'bi-bookmark-fill',
                message: 'Cần cải thiện một chút nữa!'
            };
        } else {
            return {
                level: 'Cần cải thiện',
                color: '#dc3545',
                icon: 'bi-bookmark',
                message: 'Đừng nản lòng! Hãy xem lại và luyện tập thêm!'
            };
        }
    }

    /**
     * Extract media URLs from content
     */
    static extractMediaUrls(content: string): {
        audioUrls: string[];
        imageUrls: string[];
        textContent: string;
    } {
        if (!content) {
            return { audioUrls: [], imageUrls: [], textContent: '' };
        }

        const audioExtensions = ['.mp3', '.wav', '.m4a', '.ogg'];
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

        const audioUrls: string[] = [];
        const imageUrls: string[] = [];
        let textContent = content;

        // Find audio URLs
        for (const ext of audioExtensions) {
            const regex = new RegExp(`\\S*${ext.replace('.', '\\.')}\\S*`, 'gi');
            const matches = content.match(regex);
            if (matches) {
                audioUrls.push(...matches);
                textContent = textContent.replace(regex, '').trim();
            }
        }

        // Find image URLs
        for (const ext of imageExtensions) {
            const regex = new RegExp(`\\S*${ext.replace('.', '\\.')}\\S*`, 'gi');
            const matches = content.match(regex);
            if (matches) {
                imageUrls.push(...matches);
                textContent = textContent.replace(regex, '').trim();
            }
        }

        return {
            audioUrls,
            imageUrls,
            textContent: textContent.replace(/\s+/g, ' ').trim()
        };
    }

    /**
     * Validate practice session data
     */
    static validateSession(session: any): session is PracticeSession {
        return session &&
            typeof session.id === 'string' &&
            typeof session.rangeId === 'string' &&
            session.startTime &&
            Array.isArray(session.questions) &&
            Array.isArray(session.userAnswers) &&
            ['active', 'completed', 'paused'].includes(session.status);
    }

    /**
     * Generate practice statistics
     */
    static generateStatistics(results: PracticeResult[]): {
        totalSessions: number;
        averageScore: number;
        bestScore: number;
        worstScore: number;
        skillBreakdown: { [skill: string]: { attempts: number; averageScore: number } };
        levelBreakdown: { [level: string]: { attempts: number; averageScore: number } };
        recentTrend: number[]; // Last 10 scores
    } {
        if (results.length === 0) {
            return {
                totalSessions: 0,
                averageScore: 0,
                bestScore: 0,
                worstScore: 0,
                skillBreakdown: {},
                levelBreakdown: {},
                recentTrend: []
            };
        }

        const scores = results.map(r => r.score);


        // Skill breakdown
        const skillBreakdown: { [skill: string]: { attempts: number; scores: number[] } } = {};
        const levelBreakdown: { [level: string]: { attempts: number; scores: number[] } } = {};

        results.forEach(result => {
            result.questions.forEach(question => {
                // Skill breakdown
                if (!skillBreakdown[question.skillName]) {
                    skillBreakdown[question.skillName] = { attempts: 0, scores: [] };
                }
                skillBreakdown[question.skillName].attempts++;
                skillBreakdown[question.skillName].scores.push(result.score);

                // Level breakdown
                if (!levelBreakdown[question.levelName]) {
                    levelBreakdown[question.levelName] = { attempts: 0, scores: [] };
                }
                levelBreakdown[question.levelName].attempts++;
                levelBreakdown[question.levelName].scores.push(result.score);
            });
        });

        // Calculate averages
        const skillStats: { [skill: string]: { attempts: number; averageScore: number } } = {};
        Object.keys(skillBreakdown).forEach(skill => {
            const data = skillBreakdown[skill];
            skillStats[skill] = {
                attempts: data.attempts,
                averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
            };
        });

        const levelStats: { [level: string]: { attempts: number; averageScore: number } } = {};
        Object.keys(levelBreakdown).forEach(level => {
            const data = levelBreakdown[level];
            levelStats[level] = {
                attempts: data.attempts,
                averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
            };
        });

        return {
            totalSessions: results.length,
            averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
            bestScore: Math.max(...scores),
            worstScore: Math.min(...scores),
            skillBreakdown: skillStats,
            levelBreakdown: levelStats,
            recentTrend: scores.slice(0, 10).reverse() // Most recent 10 scores
        };
    }
}