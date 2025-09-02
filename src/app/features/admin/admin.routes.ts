import { Route, Routes } from "@angular/router";
import { AdminComponent } from "./admin.component";
import { DefaultComponent } from "./pages/demo/dashboard/default/default.component";
import { RoadMapComponent } from "./pages/roadmap/roadmap";
import { RoadMapDetailComponent } from "./pages/roadmap-detail/roadmap-detail";
import { QuestionComponent } from "./pages/question/question";
import { ExamQuestionTypeComponent } from "./pages/question-type/question-type";
import { QuestionListComponent } from "./pages/question/question-list/question-list";
import { AddQuestionComponent } from "./pages/question/add-question/add-question";
import { UpdateQuestionComponent } from "./pages/question/update-question/update-question";

export const adminRoutes: Routes = [
    {
        path: '',
        component: AdminComponent,
        // canActivate: [AuthGuard],   
        children: [
          { path: '', component: DefaultComponent },
          { path: 'roadmap', component: RoadMapComponent },
          { path: 'roadmap-detail', component: RoadMapDetailComponent },
          {path: 'question-type', component: ExamQuestionTypeComponent},
          {path: 'question-list', component: QuestionListComponent},
          {path: 'update-question', component: UpdateQuestionComponent},
          {path: 'question', component: QuestionComponent,
            children: [
              {path: 'add', component: AddQuestionComponent}
            ]
          }
        ]
      }
]

