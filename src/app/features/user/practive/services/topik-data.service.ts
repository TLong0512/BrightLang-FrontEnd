import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { TopikLevel, Skill, QuestionType, PracticeSession, Context, Question } from '../../../../models/topik.model';

@Injectable({
  providedIn: 'root'
})
export class TopikDataService {
  
  private topikLevels: TopikLevel[] = [
    {
      id: 'topik1',
      name: 'TOPIK I',
      description: 'Dành cho người mới bắt đầu - Cấp độ 1-2',
      level: 'topik1'
    },
    {
      id: 'topik2',
      name: 'TOPIK II',
      description: 'Dành cho người trung cấp và nâng cao - Cấp độ 3-6',
      level: 'topik2'
    }
  ];

  private skills: Skill[] = [
    {
      id: 'listening',
      name: 'Nghe',
      icon: '🎧',
      description: 'Luyện tập kỹ năng nghe hiểu'
    },
    {
      id: 'reading',
      name: 'Đọc',
      icon: '📖',
      description: 'Luyện tập kỹ năng đọc hiểu'
    }
  ];

  private questionTypes: QuestionType[] = [
    // TOPIK I - Listening
    {
      id: 'basic-conversation',
      name: 'Hội thoại cơ bản',
      description: 'Nghe và chọn đáp án đúng',
      skillId: 'listening',
      topikLevel: 'topik1'
    },
    {
      id: 'short-dialogue',
      name: 'Đối thoại ngắn',
      description: 'Hiểu nội dung cuộc trò chuyện',
      skillId: 'listening',
      topikLevel: 'topik1'
    },
    {
      id: 'announcement',
      name: 'Thông báo',
      description: 'Nghe thông báo và trả lời câu hỏi',
      skillId: 'listening',
      topikLevel: 'topik1'
    },
    // TOPIK II - Listening
    {
      id: 'interview',
      name: 'Phỏng vấn',
      description: 'Nghe phỏng vấn và trả lời câu hỏi',
      skillId: 'listening',
      topikLevel: 'topik2'
    },
    {
      id: 'lecture',
      name: 'Bài giảng',
      description: 'Nghe bài giảng và hiểu nội dung',
      skillId: 'listening',
      topikLevel: 'topik2'
    },
    // TOPIK I - Reading
    {
      id: 'short-text',
      name: 'Đoạn văn ngắn',
      description: 'Đọc hiểu đoạn văn ngắn',
      skillId: 'reading',
      topikLevel: 'topik1'
    },
    {
      id: 'notice',
      name: 'Thông báo',
      description: 'Đọc thông báo và trả lời câu hỏi',
      skillId: 'reading',
      topikLevel: 'topik1'
    },
    {
      id: 'short-text1',
      name: 'Đoạn văn dài',
      description: 'Đọc hiểu đoạn văn ngắn',
      skillId: 'reading',
      topikLevel: 'topik1'
    },
    {
      id: 'notice1',
      name: 'Thông báo 2',
      description: 'Đọc thông báo và trả lời câu hỏi',
      skillId: 'reading',
      topikLevel: 'topik1'
    },
    {
      id: 'short-text2',
      name: 'Đoạn văn dài',
      description: 'Đọc hiểu đoạn văn ngắn',
      skillId: 'reading',
      topikLevel: 'topik1'
    },
    {
      id: 'notice2',
      name: 'Thông báo 2',
      description: 'Đọc thông báo và trả lời câu hỏi',
      skillId: 'reading',
      topikLevel: 'topik1'
    },
    {
      id: 'short-text3',
      name: 'Đoạn văn dài',
      description: 'Đọc hiểu đoạn văn ngắn',
      skillId: 'reading',
      topikLevel: 'topik1'
    },
    {
      id: 'notice3',
      name: 'Thông báo 2',
      description: 'Đọc thông báo và trả lời câu hỏi',
      skillId: 'reading',
      topikLevel: 'topik1'
    },
    // TOPIK II - Reading
    {
      id: 'essay',
      name: 'Bài luận',
      description: 'Đọc hiểu bài luận dài',
      skillId: 'reading',
      topikLevel: 'topik2'
    },
    {
      id: 'article',
      name: 'Bài báo',
      description: 'Phân tích bài báo chuyên sâu',
      skillId: 'reading',
      topikLevel: 'topik2'
    }
  ];

  private mockContexts: Context[] = [
    {
      id: 'context-1',
      title: 'Hội thoại tại cửa hàng',
      type: 'audio',
      audioUrl: '/assets/audio/conversation1.mp3'
    },
    {
      id: 'context-2',
      title: 'Thông báo tại sân bay',
      type: 'audio',
      audioUrl: '/assets/audio/announcement1.mp3'
    },
    {
      id: 'context-3',
      title: 'Đoạn văn về gia đình',
      type: 'text',
      textContent: `안녕하세요. 저는 김민수입니다. 우리 가족은 네 명입니다. 아버지, 어머니, 누나 그리고 저입니다. 아버지는 회사원이고 어머니는 선생님입니다. 누나는 대학생입니다. 저는 고등학생입니다.`
    },
    {
      id: 'context-4',
      title: 'Phỏng vấn việc làm',
      type: 'mixed',
      textContent: '다음 대화를 듣고 질문에 답하십시오.',
      audioUrl: '/assets/audio/interview1.mp3',
      imageUrl: '/assets/images/interview.jpg'
    }
  ];

  private mockQuestions: Question[] = [
    {
      id: 'q1',
      contextId: 'context-1',
      questionText: '남자는 무엇을 사고 싶어합니까?',
      options: [
        '사과를 사고 싶어합니다.',
        '바나나를 사고 싶어합니다.',
        '오렌지를 사고 싶어합니다.',
        '포도를 사고 싶어합니다.'
      ],
      correctAnswer: 0,
      explanation: '남자가 "사과 얼마예요?"라고 물어봤습니다.',
      order: 1
    },
    {
      id: 'q2',
      contextId: 'context-1',
      questionText: '사과 가격은 얼마입니까?',
      options: [
        '1000원입니다.',
        '2000원입니다.',
        '3000원입니다.',
        '4000원입니다.'
      ],
      correctAnswer: 1,
      explanation: '여자가 "한 개에 2000원입니다"라고 답했습니다.',
      order: 2
    },
    {
      id: 'q3',
      contextId: 'context-3',
      questionText: '김민수의 가족은 몇 명입니까?',
      options: [
        '세 명입니다.',
        '네 명입니다.',
        '다섯 명입니다.',
        '여섯 명입니다.'
      ],
      correctAnswer: 1,
      explanation: '본문에서 "우리 가족은 네 명입니다"라고 했습니다.',
      order: 1
    },
    {
      id: 'q4',
      contextId: 'context-3',
      questionText: '김민수의 가족은 몇 명입니까?',
      options: [
        '세 명입니다.',
        '네 명입니다.',
        '다섯 명입니다.',
        '여섯 명입니다.'
      ],
      correctAnswer: 1,
      explanation: '본문에서 "우리 가족은 네 명입니다"라고 했습니다.',
      order: 1
    },
    {
      id: 'q5',
      contextId: 'context-3',
      questionText: '김민수의 가족은 몇 명입니까?',
      options: [
        '세 명입니다.',
        '네 명입니다.',
        '다섯 명입니다.',
        '여섯 명입니다.'
      ],
      correctAnswer: 1,
      explanation: '본문에서 "우리 가족은 네 명입니다"라고 했습니다.',
      order: 1
    }
  ];

  getTopikLevels(): Observable<TopikLevel[]> {
    return of(this.topikLevels).pipe(delay(300));
  }

  getSkills(): Observable<Skill[]> {
    return of(this.skills).pipe(delay(300));
  }

  getQuestionTypes(topikLevel: 'topik1' | 'topik2', skillId: string): Observable<QuestionType[]> {
    const filtered = this.questionTypes.filter(
      qt => qt.topikLevel === topikLevel && qt.skillId === skillId
    );
    return of(filtered).pipe(delay(300));
  }

  generatePracticeSession(
    topikLevel: 'topik1' | 'topik2',
    skillId: string,
    questionTypeId: string,
    questionCount: number,
    difficulty: 'easy' | 'medium' | 'hard'
  ): Observable<PracticeSession> {
    // Mock generation - in real app, this would call API
    const sessionId = 'session-' + Date.now();
    
    // Select contexts and questions based on parameters
    const selectedContexts = this.mockContexts.slice(0, Math.ceil(questionCount / 2));
    const selectedQuestions = this.mockQuestions.slice(0, questionCount);

    const session: PracticeSession = {
      id: sessionId,
      topikLevel,
      skillId,
      questionTypeId,
      contexts: selectedContexts,
      questions: selectedQuestions,
      difficulty,
      totalQuestions: questionCount
    };

    return of(session).pipe(delay(500));
  }
}