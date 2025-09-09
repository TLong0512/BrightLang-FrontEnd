import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface RoadmapGeneralDto {
  id: string;
  name: string;
  questionPerDay: number;
  timeRequired: number;
  signupCount: number;
  levelStart: {
    id: string;
    name: string;
    examTypeName: string;
  };
  levelEnd: {
    id: string;
    name: string;
    examTypeName: string;
  };
}

export interface UserRoadmapPostDto {
  roadmapId: string;
}

export interface UserRoadmapDetailDto {
  id: string;
  roadmap: {
    id: string;
    name: string;
  };
  processs: Array<{
    roadmapElementId: string;
    questionPerDay: number;
    rangeId: string;
    isFinished: boolean;
    isOpened: boolean;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class RoadmapService {
  private baseUrl = `${environment.apiUrlRoadMap}`

  constructor(private http: HttpClient) {}

  getRoadmapsByName(roadmapName: string): Observable<RoadmapGeneralDto[]> {
    const params = new HttpParams().set('roadmapName', roadmapName);
    return this.http.get<RoadmapGeneralDto[]>(`${this.baseUrl}/roadmaps/by-roadmap-name`, { params });
  }

  createUserRoadmap(userRoadmapDto: UserRoadmapPostDto): Observable<UserRoadmapDetailDto> {
    return this.http.post<UserRoadmapDetailDto>(`${this.baseUrl}/userroadmaps`, userRoadmapDto);
  }
}