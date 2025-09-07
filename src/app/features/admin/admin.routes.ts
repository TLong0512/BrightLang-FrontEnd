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
import { RoleGuard } from "../../guards/auth.guard";
import { RoadMapElementComponent } from "./pages/question/road-map-element/road-map-element";

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
          {path: 'update-question/:id', component: UpdateQuestionComponent},
          {path: 'question', component: QuestionComponent,
            children: [
              {path: 'add', component: AddQuestionComponent}
            ]
          }
        ]
      }
]

