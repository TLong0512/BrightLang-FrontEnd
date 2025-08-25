import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ExamData, ExamContext, Question, ExamLevel, ExamResult, ExamSubmission } from '../../../../models/exam.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  private mockExamData: ExamData = {
    id: 'topik-practice-1',
    title: 'TOPIK Practice Test - Level 1',
    level: 'beginner',
    duration: 3600, // 1 hour
    contexts: [
      // Reading Context 1
      {
        id: 1,
        type: 'reading',
        title: '학교 공지문',
        content: `
공지: 도서관 휴관 안내

학생 여러분께,
이번 주 토요일은 전기 점검으로 인해 도서관을 이용할 수 없습니다.
일요일부터 정상 운영하니 이용에 참고하시기 바랍니다.

감사합니다.
도서관 관리자
        `,
        questions: [
          {
            id: 1,
            type: 'single',
            question: '이 공지문의 내용은 무엇입니까?',
            options: [
              '도서관 개관 시간 변경',
              '도서관 휴관 안내',
              '도서관 행사 안내',
              '도서관 위치 변경'
            ],
            correctAnswers: [1]
          },
          {
            id: 2,
            type: 'single',
            question: '도서관은 언제 다시 이용할 수 있습니까?',
            options: [
              '토요일',
              '일요일',
              '월요일',
              '금요일'
            ],
            correctAnswers: [1]
          }
        ]
      },
      // Listening Context 1
      {
        id: 2,
        type: 'listening',
        title: '전화 대화',
        audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // mẫu audio
        questions: [
          {
            id: 3,
            type: 'single',
            question: '여자는 지금 어디에 있습니까?',
            options: [
              '학교',
              '병원',
              '은행',
              '식당'
            ],
            correctAnswers: [0]
          },
          {
            id: 4,
            type: 'single',
            question: '남자는 무엇을 부탁합니까?',
            options: [
              '책을 빌려 달라고',
              '숙제를 도와 달라고',
              '시간을 알려 달라고',
              '돈을 빌려 달라고'
            ],
            correctAnswers: [1]
          }
        ]
      },
      // Reading Context 2 with Image
      {
        id: 3,
        type: 'reading',
        title: '식당 광고',
        imageUrl: 'https://via.placeholder.com/600x400/FF7043/ffffff?text=%EC%8B%9D%EB%8B%B9+%EA%B4%91%EA%B3%A0',
        content: `
맛있는 김치찌개 6,000원
불고기 정식 8,000원
냉면 5,500원
*모든 메뉴 포장 가능합니다.
        `,
        questions: [
          {
            id: 5,
            type: 'single',
            question: '불고기 정식 가격은 얼마입니까?',
            options: [
              '5,500원',
              '6,000원',
              '8,000원',
              '9,000원'
            ],
            correctAnswers: [2]
          },
          {
            id: 6,
            type: 'single',
            question: '이 광고의 내용은 무엇입니까?',
            options: [
              '식당 메뉴 안내',
              '학교 식당 규칙',
              '회사 회식 공지',
              '시장 할인 행사'
            ],
            correctAnswers: [0]
          }
        ]
      },
      // Listening Context 2
      {
        id: 4,
        type: 'listening',
        title: '일기 예보',
        audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        questions: [
          {
            id: 7,
            type: 'single',
            question: '내일 날씨는 어떻습니까?',
            options: [
              '맑습니다',
              '비가 옵니다',
              '눈이 옵니다',
              '흐리고 바람이 붑니다'
            ],
            correctAnswers: [1]
          },
          {
            id: 8,
            type: 'single',
            question: '기온은 어떻게 됩니까?',
            options: [
              '영하 5도',
              '영상 5도',
              '영상 15도',
              '영상 25도'
            ],
            correctAnswers: [2]
          }
        ]
      },
      // Mixed Context
      {
        id: 5,
        type: 'mixed',
        title: '지하철 안내',
        imageUrl: 'https://via.placeholder.com/500x600/2196F3/ffffff?text=%EC%A7%80%ED%95%98%EC%B2%A0+%EC%95%88%EB%82%B4',
        content: `
서울역 → 시청역 → 종각역 → 종로3가역
첫차: 05:30 / 막차: 23:30
배차 간격: 5분
        `,
        questions: [
          {
            id: 9,
            type: 'single',
            question: '지하철 첫차는 몇 시입니까?',
            options: [
              '05:30',
              '06:00',
              '23:00',
              '23:30'
            ],
            correctAnswers: [0]
          },
          {
            id: 10,
            type: 'multiple',
            question: '안내문에 있는 역은 어디입니까? (모두 고르시오)',
            options: [
              '서울역',
              '시청역',
              '강남역',
              '종각역'
            ],
            correctAnswers: [0, 1, 3]
          }
        ]
      }
    ]
  };

  private mockLevels: ExamLevel[] = [
    { value: 'beginner', label: 'TOPIK I - Level 1', description: 'Sơ cấp - có thể hiểu từ vựng, câu cơ bản' },
    { value: 'intermediate', label: 'TOPIK I - Level 2', description: 'Sơ cấp - có thể giao tiếp đơn giản' },
    { value: 'advanced', label: 'TOPIK II - Level 3', description: 'Trung cấp - có thể sử dụng trong sinh hoạt hàng ngày' }
  ];

  getExamByLevel(level: string): Observable<ExamData> {
    return of(this.mockExamData).pipe(delay(1000));
  }

  getExamLevels(): Observable<ExamLevel[]> {
    return of(this.mockLevels).pipe(delay(500));
  }

  submitExam(submission: ExamSubmission): Observable<ExamResult> {
    const mockResult: ExamResult = {
      examId: submission.examId,
      correct: Math.floor(Math.random() * 10) + 3,
      total: 10,
      percentage: 70,
      listeningScore: 75,
      readingScore: 65,
      timeSpent: submission.timeSpent,
      level: submission.level
    };

    return of(mockResult).pipe(delay(1500));
  }

  getExamSettings(examId: string): Observable<any> {
    const mockSettings = {
      allowPause: true,
      showTimer: true,
      shuffleQuestions: false,
      shuffleAnswers: false
    };

    return of(mockSettings).pipe(delay(300));
  }

  saveProgress(examId: string, progress: any): Observable<void> {
    console.log('Progress saved:', progress);
    return of(void 0).pipe(delay(200));
  }
}
