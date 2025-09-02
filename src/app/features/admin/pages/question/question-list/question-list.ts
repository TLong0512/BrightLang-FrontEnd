// question-list.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface Question {
  id: string;
  questionNumber: number;
  content: string;
  explain: string;
}

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.html',
  standalone: true,
  imports: [FormsModule, CommonModule],
  styles: `
  /* question-list.component.css */
.question-list-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem 0;
  margin-bottom: 2rem;
  border-radius: 0 0 30px 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.question-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  margin-bottom: 2rem;
}

.question-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.question-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.question-content {
  font-size: 1.2rem;
  color: #2d3748;
  font-weight: 600;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.explanation-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px;
  padding: 1.5rem;
  margin-top: 1rem;
  border-left: 4px solid #667eea;
}

.explanation-text {
  color: #6c757d;
  font-style: italic;
}

.explanation-text.no-explanation {
  color: #adb5bd;
}

.stats-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.stats-card:hover {
  transform: scale(1.05);
}

.stats-number {
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { 
    transform: scale(1); 
  }
  50% { 
    transform: scale(1.05); 
  }
  100% { 
    transform: scale(1); 
  }
}

.fade-in {
  animation: fadeIn 0.8s ease-in forwards;
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(30px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

.search-box {
  border-radius: 25px;
  border: 2px solid #e9ecef;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;
}

.search-box:focus {
  border-color: #667eea;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.2);
  outline: none;
}

.btn {
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.badge {
  font-size: 0.85rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-section {
    padding: 2rem 0;
    text-align: center;
  }
  
  .stats-card {
    margin-top: 1rem;
  }
  
  .question-number {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
  
  .question-content {
    font-size: 1.1rem;
  }
  
  .explanation-section {
    padding: 1rem;
  }
}

@media (max-width: 576px) {
  .question-card {
    margin-bottom: 1rem;
  }
  
  .card-body {
    padding: 1rem !important;
  }
  
  .explanation-section {
    padding: 0.75rem;
  }
  
  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }
}
  `
})
export class QuestionListComponent implements OnInit {
  questionsData: Question[] = [
    {
      id: "77eef27e-b896-4cbe-d3d9-08dde98ea73d",
      questionNumber: 5,
      content: "cau hoi aaaaaaaaaaaaaaaaaaaaaaaaa  aaaaaaa aaaaa aaaaaaa aaaaaaaaa aaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      explain: "giai thich cau hoi"
    },
    {
      id: "7d313f98-306c-4bf6-feab-08ddea0086c4",
      questionNumber: 1,
      content: "cau hoi",
      explain: ""
    },
    {
      id: "ef879672-d105-4428-726e-08ddea33b106",
      questionNumber: 2,
      content: "aaa",
      explain: ""
    }
  ];

  filteredQuestions: Question[] = [];
  searchTerm: string = '';
  sortBy: string = 'number';

  ngOnInit(): void {
    this.filterQuestions();
  }

  filterQuestions(): void {
    let filtered = this.questionsData.filter(q => 
      q.content.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      q.explain.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      q.questionNumber.toString().includes(this.searchTerm)
    );

    // Sort data
    filtered.sort((a, b) => {
      if (this.sortBy === 'number') {
        return a.questionNumber - b.questionNumber;
      } else if (this.sortBy === 'content') {
        return a.content.localeCompare(b.content);
      }
      return 0;
    });

    this.filteredQuestions = filtered;
  }

  onSearchChange(): void {
    this.filterQuestions();
  }

  onSortChange(): void {
    this.filterQuestions();
  }

  editQuestion(question: Question): void {
    console.log('Edit question:', question);
    // Implement edit functionality
  }

  deleteQuestion(question: Question): void {
    console.log('Delete question:', question);
    // Implement delete functionality
    const index = this.questionsData.findIndex(q => q.id === question.id);
    if (index > -1) {
      this.questionsData.splice(index, 1);
      this.filterQuestions();
    }
  }

  getShortId(id: string): string {
    return id.substring(0, 8) + '...';
  }
}





/*
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { QuestionListComponent } from './question-list/question-list.component';

@NgModule({
  declarations: [
    AppComponent,
    QuestionListComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
*/

/*
// angular.json - Add Bootstrap and FontAwesome to styles array:
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "node_modules/@fortawesome/fontawesome-free/css/all.min.css",
  "src/styles.css"
],
"scripts": [
  "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
]
*/

/*
// package.json dependencies to install:
npm install bootstrap@5.3.0 @fortawesome/fontawesome-free
*/

/*
// Usage in app.component.html:
<app-question-list></app-question-list>
*/