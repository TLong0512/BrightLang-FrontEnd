import { Route, Routes } from "@angular/router";
import { AdminComponent } from "./admin.component";
import { DefaultComponent } from "./pages/demo/dashboard/default/default.component";
import { RoadMapComponent } from "./pages/roadmap/roadmap";
import { RoadMapDetailComponent } from "./pages/roadmap-detail/roadmap-detail";
import { QuestionComponent } from "./pages/question/question";
import { ExamQuestionTypeComponent } from "./pages/question-type/question-type";
import { QuestionListComponent } from "./pages/question/question-list/question-list";
import { AddQuestionComponent } from "./pages/question/question-add/question-add";
import { UpdateQuestionComponent } from "./pages/question/question-update/question-update";
import { RoadMapElementComponent } from "./pages/road-map-element/road-map-element";
import { ExamTypeComponent } from "./pages/exam-type/exam-type";

export const adminRoutes: Routes = [
    {
        path: '',
        component: AdminComponent,
        children: [
          { path: '', component: DefaultComponent },
          { path: 'roadmap', component: RoadMapComponent },
          { path: 'road-map-detail/:id', component: RoadMapDetailComponent },
          {path: 'question-type', component: ExamQuestionTypeComponent},
          {path: 'question-list', component: QuestionListComponent},
          {path: 'road-map-element', component: RoadMapElementComponent},
          {path: 'question-update/:id', component: UpdateQuestionComponent},
          {path: 'question-add', component: AddQuestionComponent},
          {path: 'question', component: QuestionComponent,
            children: [
              
            ]
          },
          {path: 'exam-type', component: ExamTypeComponent},


        ]
      }
]

